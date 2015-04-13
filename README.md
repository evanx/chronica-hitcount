
## chronica-hitcount

Minimal analytics service in Node.js, using Redis for storage.


### Client

On the client, JavaScript is used to HTTP GET e.g. the following URL of the analytics server.

```
http://analytics.server.com/hc/thesite.com/123456
```

where `analytics.server.com` is your analytics server running this app, `thesite.com` is the host the client is hitting, and `123456` is the page ID.

The service returns a 1x1 transparent GIF image, so that can be used as follows.

```html
<img src="http://analytics.server.com/hc/thesite.com/123456"/>
```


### Installing

```shell
git clone https://github.com/evanx/chronica-hitcount.git
cd chronica-hitcount
npm install
bash scripts/test.sh
```

You may need to `apt-get install` various devel libraries for the <a href="https://github.com/Automattic/node-canvas">node-canvas</a> dependency, e.g. Cairo, pango, libjpeg.


### Test script

The `test.sh` script sets the configuration environment variables, and runs the `entry-hitcount.js` entry point.

```shell
export APP_PORT=8080
export APP_LOCATION=/hc/
export MONITOR_INTERVAL_SECONDS=120
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

nodejs lib/entry-hitcount.js | ./node_modules/bunyan/bin/bunyan
```

Incidently `entry-hitcount.js` registers `babel` to support ES6, and then runs <a href="https://github.com/evanx/chronica-hitcount/blob/master/lib/server.js">server.js</a>

```javascript
require('babel/register');
require('./server');
```

### Testing

For example, open the following in your browser
```
http://localhost:8080/hc/thesite.com/123456
```
where the `thesite.com` is the host, and `123456` is the page ID.


### Redis

You can use the `redis.sh` script to see the Redis entries created by the app as follows.
```shell
$ sh scripts/redis.sh

redis-cli hgetall hitcount:thesite.com
1) "123456"
2) "15"

redis-cli hgetall hitcount:thesite.com:15:4:12:18
1) "123456"
2) "3"
```
where the all-time count is 15, and 3 for the hour starting 2015-04-12 18h00.

<!--img src="http://hc.richie.ngena.com/hc/github.com/hitcount"/-->
