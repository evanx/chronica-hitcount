
## chronica-hitcount

Simple analytics service in Node.js, using Redis for storage.

```
http://localhost:8080/c/thesite.com/1234567/article
```

### `scripts/run.sh`

```shell
~/chronica-hitcount$ cat scripts/run.sh
#!/bin/bash

# enviroment

export APP_PORT=8080
export MONITOR_INTERVAL_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

nodejs lib/entry-hitcount.js | ./node_modules/bunyan/bin/bunyan
```
