
## chronica-hitcount

Minimal analytics service in Node.js, using Redis for storage.

### Client

On the client, JavaScript is used to HTTP GET e.g. the following URL of the analytics server.

```
http://analytics.server.com/c/thesite.com/1234567/article
```

where `analytics.server.com` is your analytics server running this app, and `thesite.com` is the host the client is hitting.

In the above example, `1234567` is the page ID, and `article` is the page categorisation.

The service returns an empty HTTP 200 response.


### Installing and running

```shell
git clone https://github.com/evanx/certserver.git
cd chronica-hitcount
npm install
bash scripts/run.sh
```

### Run script

The `run.sh` script sets the configuration environment variables, and runs the `entry-hitcount.js` entry point.

```shell
export APP_PORT=8080
export MONITOR_INTERVAL_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

nodejs lib/entry-hitcount.js | ./node_modules/bunyan/bin/bunyan
```

The `entry-hitcount.js` registers `babel` to support ES6, and then runs <a href="https://github.com/evanx/chronica-hitcount/blob/master/lib/server.js">server.js</a>

For example, open the following in your browser
```
http://localhost:8080/c/thesite.com/1234567/article
```
where the `thesite.com` is the domain, `1234567` is the page ID, and `article` is the page categorisation.

### Redis

You can use the `redis.sh` script to see the Redis entries created by the app as follows.
```shell
$ sh scripts/redis.sh
redis-cli hgetall hitcount:thesite.com:article:15:4:12:18
1) "1234567"
2) "1"
```
