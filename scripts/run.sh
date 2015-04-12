#!/bin/bash

# enviroment

export APP_PORT=8080
export MONITOR_INTERVAL_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

  nodejs lib/entry-hitcount.js | ./node_modules/bunyan/bin/bunyan

