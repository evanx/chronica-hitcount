
var fs = require('fs');
var async = require('async');
var lodash = require('lodash');
var express = require('express');
var app = express();
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "hitcount", level: 'debug'});
var marked = require('marked');

var redis = require('redis');
var redisClient = redis.createClient();

global.log = log;
global.redisClient = redisClient;

global.redisClient.on('error', function (err) {
   log.error('error', err);
});

var types = [
   'article'
];

function handleError(res, error) {
   log.error('error', error);
   if (error instanceof Error) {
      log.error('error stack', error.stack);
   }
   res.status(500).send(error);
}

function handleCount(req, res) {
   try {
      var source = req.params.source;
      var name = req.params.name;
      var type = req.params.type;
      if (types.indexOf(type) < 0) {
         throw new Error('Invalid type: ' + type);
      }
      let time = new Date();
      let date = [time.getYear() - 100, time.getMonth() + 1, time.getDate(), time.getHours()];
      log.info('handleCount', source, name, type, date);
      var multi = redisClient.multi();
      multi.hincrby(['hitcount', source, type].join(':'), name, 1);
      multi.hincrby(['hitcount', source, type].concat(date).join(':'), name, 1);
      multi.exec(function (err, replies) {
         if (err) {
            handleError(res, err);
         } else {
            let count = replies[0];
            res.json({source, type, name, date, count});
         }
      });
   } catch (error) {
      handleError(res, error);
   }
}

function handleHelp(req, res) {
   try {
      res.set('Content-Type', "text/html");
      fs.readFile('README.md', function (err, content) {
         if (content) {
            res.send(marked(content.toString()));
         } else {
            res.send('no help');
         }
      });
   } catch (error) {
      handleError(res, error);
   }
}

function appLogger(req, res, next) {
   log.info('app', req.url);
   next();
}

function monitor() {
   log.debug('monitor');
}

function start(env) {
   app.use(appLogger);
   app.get('/help', handleHelp);
   app.get('/c/:source/:name/:type', handleCount);
   app.listen(env.APP_PORT);
   log.info('start', {port: env.APP_PORT, envType: env.ENV_TYPE, monitorSeconds: env.MONITOR_INTERVAL_SECONDS});
   if (env.MONITOR_INTERVAL_SECONDS) {
      setInterval(monitor, parseInt(env.MONITOR_INTERVAL_SECONDS) * 1000);
   }
}

start(process.env);
