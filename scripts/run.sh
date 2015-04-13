#!/bin/bash

# enviroment

export APP_PORT=8001
export APP_LOCATION=/hc/
export MONITOR_INTERVAL_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

nodejs lib/entry-hitcount.js | ./node_modules/bunyan/bin/bunyan
