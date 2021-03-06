#!/bin/bash

cpm2() {
  APP_PORT=8001 \
  APP_LOCATION=/hc/ \
  MONITOR_INTERVAL_SECONDS=120 \
  REDIS_HOST=127.0.0.1 \
  REDIS_PORT=6379 \
  pm2 $@ 
}

c0start() {
  cpm2 start lib/entry-hitcount.js --name hitcount
}

c0tailf() {
  tail -f | ./node_modules/bunyan/bin/bunyan
}

if [ $1 = 'start' ]
then
  c0start
elif [ $# -eq 1 ]
then
  pm2 $1 hitcount
else
  pm2 l 
  pm2 show hitcount
fi


