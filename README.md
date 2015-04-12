
## chronica-hitcount

Simple analytics service in Node.js, using Redis for storage.

```
http://localhost:8080/c/thesite.com/1234567/article
```

### Installing and running

```shell
git clone https://github.com/evanx/certserver.git
cd chronica-hitcount
npm install
bash scripts/run.sh
```

### Run script

```shell
#!/bin/bash

# enviroment

export APP_PORT=8080
export MONITOR_INTERVAL_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

nodejs lib/entry-hitcount.js | ./node_modules/bunyan/bin/bunyan
```
