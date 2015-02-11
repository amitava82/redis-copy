"use strict";
var redis = require("redis");
var async = require("async");
var _ = require("underscore");
var program = require('commander');

var config = require("./config");

program
  .version('0.0.1')
  .option('-s, --source [value]', 'Source key to copy')
  .option('-t, --target [value]', 'Target key name')
  .option('-r, --replace', 'Replace if target exists')
  .parse(process.argv);

var sourceKey = program.source,
    destKey = program.target,
    replace = program.replace;

if(!sourceKey || !destKey){
  handleError(new Error("Invalid arguments. Please run redis-copy -h for options"));
}

var sourceClient = redis.createClient(config.source.port, config.source.host);
if(config.source.key){
  sourceClient.auth(config.source.key);
}
var destClient = redis.createClient(config.destination.port, config.destination.host);
if(config.destination.key){
  destClient.auth(config.destination.key);
}

async.parallel([
  function (done) {
    sourceClient.select(config.source.db, done);
  },
  function(done){
    destClient.select(config.destination.db, done);
  }
], function (err) {
  if(err){
    handleError(err);
  }else{
    destClient.exists(destKey, function(err, resp){
      if(err){
        handleError(err);
      }else{
        if(resp == 1 && replace !== true){
          handleError(new Error("Key already exists, use -r to overwrite"));
        }else{
          copyHash(sourceClient, sourceKey, destClient, destKey);
        }
      }
    });
  }
});

function handleError(err){
  console.log(err.message);
  process.exit();
}

function copyHash(sourceClient, sourceKey, destClient, destKey){
  console.log("source: ", sourceKey);
  console.log("destination: ", destKey);
  sourceClient.hgetall(sourceKey, function (err, resp) {
    if(err){
      handleError(err);
    }else if(!_.isObject(resp)){
      handleError(new Error("Source hash: "+ sourceKey +" is empty"));
    } else {
      var keys = Object.keys(resp);
      console.log(keys.length, " keys found");
      async.eachSeries(keys, function(key, callback){
        destClient.hset(destKey, key, resp[key], callback);
      }, function(err){
        if(err)
          handleError(err);
        else{
          console.log("done");
          process.exit();
        }
      });
    }
  });

}