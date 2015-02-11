### Redis copy tool
Simple tool to copy redis hash within or between different servers/db Change `config.json` file with appropriate source and destination server information.

####Usage
```
npm install
node redis-copy -h //for help
node redis-copy -s source:key -t target:key  //Copy source key to destination key.
node redis-copy -s source:key -t target:key -r //Copy source key to destination key, replace if key already exists
```

Please create issues for bugs/feature requests etc.

####License
The MIT License