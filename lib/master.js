'use strict';
var log = require('./log');
module.exports = function (workers, options) {
  var DEBUG = options.debug;
  var CONCURRENCY = options.concurrency;
  var PORT = options.port;
  var serverInstance;

  function serverCreate () {
    var hash = require('string-hash');
    return require('net')
      .createServer({ pauseOnConnect: true }, function (connection) {
        var index = hash(connection.remoteAddress || '') % CONCURRENCY;
        workers.entrust(index, connection);
      });
  }

  function serverStart (callback) {
    serverInstance = serverCreate();
    serverInstance.listen(PORT, callback);
  }

  function serverStop (callback) {
    serverInstance.close(function (err) {
      if (err) console.log(err);
      else return callback();
    });
  }

  function stop () {

    // stop proxy server
    if (DEBUG) log('MASTER  stop..');
    serverStop(function () {
      if (DEBUG) log('MASTER  ..stopped');

      // stop nodes
      if (DEBUG) log('WORKERS  stop..');
      workers.stop();
    });
  }

  function start () {
    
    // start proxy server
    if (DEBUG) log('MASTER  start..');
    serverStart(function () {
      if (DEBUG) log('MASTER  ..started at port %d', PORT);

      // start nodes
      if (DEBUG) log('WORKERS  start..');
      workers.start();

      // stop everything when requested
      process.once('SIGINT', stop);
    });
  }

  return {
    start: start,
    stop: stop
  };
};
