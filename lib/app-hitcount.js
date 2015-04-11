
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

function handleError(res, error) {
   log.error('error', error);
   if (error instanceof Error) {
      log.error('error stack', error.stack);
   }
   res.status(500).send(error);
}

function handleHit(req, res) {
   try {
      var certName = req.params.certName;
      var redisKey = 'cert:' + certName;
      var user = req.peerCN;
      var pem = req.body.toString('utf8');
      var cert = x509.parseCert(pem);
      var resData = {
         cn: cert.subject.commonName,
         fingerprint: cert.fingerPrint
      };
      log.info('handlePostCert', user, certName, resData);
      log.debug('cert', Object.keys(cert), cert);
      redisClient.exists(redisKey, function (err, exists) {
         if (err) {
            handleError(res, err);
         } else if (exists) {
            handleError(res, {message: 'already exists'});
         } else {
            var multi = redisClient.multi();
            multi.hset(redisKey, 'pem', pem);
            multi.hset(redisKey, 'cert', JSON.stringify(cert));
            multi.hset(redisKey, 'publicKey', cert.publicKey.n);
            multi.hset(redisKey, 'fingerprint', cert.fingerPrint);
            multi.exec(function (err) {
               if (err) {
                  handleError(res, err);
               } else {
                  res.json(resData);
               }
            });
         }
      });
   } catch (error) {
      handleError(res, error);
   }
}

function handlePostAuth(req, res) {
   try {
      var certName = req.params.certName;
      var redisKey = 'cert:' + certName;
      var user = req.peerCN;
      var pem = req.body.toString('utf8');
      var cert = x509.parseCert(pem);
      var resData = {
         cn: cert.subject.commonName,
         fingerprint: cert.fingerPrint
      };
      log.info('handlePostAuth', user, certName, resData);
      redisClient.sismember('cert:revoked', certName, function (err, ismember) {
         if (err) {
            handleError(res, err);
         } else if (ismember) {
            res.status(500).json({error: 'revoked'});
         } else {
            redisClient.hget(redisKey, 'publicKey', function (err, publicKeyReply) {
               if (err) {
                  handleError(res, err);
                  return;
               } else if (!publicKeyReply) {
                  res.status(500).json({error: 'not found'});
               } else if (cert.publicKey.n !== publicKeyReply) {
                  res.status(500).json({error: 'invalid public key'});
               } else {
                  res.json({message: 'public key matches'});
               }
            });
         }
      });
   } catch (error) {
      handleError(res, error);
   }
}

function handleGetAuth(req, res) {
   try {
      var certName = req.params.certName;
      var fingerprint = req.params.fingerprint;
      var publicKey = req.params.publicKey;
      var redisKey = 'cert:' + certName;
      var user = req.peerCN;
      log.info('handleGetAuth', user, certName, fingerprint, publicKey);
      redisClient.sismember('cert:revoked', certName, function (err, ismember) {
         if (err) {
            handleError(res, err);
         } else if (ismember) {
            res.status(500).json({error: 'revoked'});
         } else {
            redisClient.hget(redisKey, 'fingerprint', function (err, fingerprintReply) {
               if (err) {
                  handleError(res, err);
               } else if (!fingerprintReply) {
                  res.status(500).json({error: 'not found'});
               } else if (fingerprintReply !== fingerprint) {
                  res.status(500).json({error: 'invalid fingerprint'});
               } else if (publicKey) {
                  redisClient.hget(redisKey, 'publicKey', function (err, publicKeyReply) {
                     if (err) {
                        handleError(res, err);
                     } else if (publicKeyReply !== publicKey) {
                        res.status(500).json({error: 'invalid public key'});
                     } else {
                        res.json({message: 'public key matches'});
                     }
                  });
               } else {
                  res.json({message: 'fingerprint matches'});
               }
            });
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
   exports.isProduction = (env.ENV_TYPE.toLowerCase().indexOf('prod') === 0);
   exports.monitorIntervalSeconds = 60;
   if (env.MONITOR_INTERVAL_SECONDS) {
      exports.monitorIntervalSeconds = parseInt(env.MONITOR_INTERVAL_SECONDS);
   }
   app.use(appLogger);
   app.get('/help', handleHelp);
   https.createServer(options, app).listen(env.APP_PORT);
   log.info('start', env.APP_PORT, env.ENV_TYPE);
   setInterval(monitor, exports.monitorIntervalSeconds * 1000);
}

start(process.env);
