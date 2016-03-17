var helpers     = require('../../../lib/helpers');
var http        = require('http');

var maxConnections = 100;

function clientHttpServer(upstream, c) {
  this.noMore = false;

  var parent = this;

  var server = http.createServer(function (req, res) {
    // This method sends client reply
    req.sendReply = function(msg, code, errors) {
      if (!errors) {
        errors = [];
      } else {
        if (!Array.isArray(errors)) errors = [errors];
      }

      if (!code) code = 200;

      msg = JSON.stringify({result: msg, errors: errors});
      msg += '\n';

      res.writeHead(code, {
        "Content-Type": "application/json",
        'Content-Length': msg.length
      });

      res.write(msg);
      res.end();
      req.client.end();
    }

    // This method is triggered by upstream to reply to the sender
    req.reply = function(p) {
      this.sendReply(prepareDataOut(p.getFields()));

      return true;
    };

    // This method is triggered on queue timeout
    req.queueTimeout = function() {
      dd('Client ' + req.name + ' gateway timeout');
      req.sendReply('', 504, 'Gateway timeout');
    };

    // This method is triggered to say client goodbye
    req.end = function() {
      req.client.end();
    }

    // Checks if req was already closed
    req.isClosed = function() {
      return !this.client.writable;
    };

    req.name = 'http:' + req.connection.remoteAddress + ':' + req.connection.remotePort;
    dd(('Client ' + req.name + ' connected').yellow);

    if (req.method == 'POST') {
      var body = "";
      req.on('data', function (chunk) {
        dd(('Client ' + req.name + ' sent data').yellow);

        body += chunk;

        if (!req.headers.hasOwnProperty('content-length')) {
          this.sendReply('', 400, 'Bad request');
        }

        if (body.length > 1e6) req.connection.destroy();

        if (body.length >= parseInt(req.headers['content-length'])) {
          var obj = null;
          try {
            var obj = JSON.parse(body);
          } catch (ex) {
            this.sendReply('', 400, [ex.toString()]);
            return;
          }

          if (!upstream.sendData(req, prepareDataIn(obj))) {
            this.sendReply('', 500, 'Failed to queue message');
          }
        } else {
          this.sendReply('', 400, 'Bad request');
        }
      });
    } else {
      req.sendReply('', 405, 'Method Not Allowed');
    }

    // 'Close' event is triggered on connection close
    req.client.on('close', function() {
      dd(('Client ' + req.name + ' <close> event').yellow);

      if (req.queueMessageId) {
        upstream.hasGone(req.queueMessageId);
      }
    });

    // 'Error' event is triggered on req errors
    req.on('error', function(err) {
      dd('Client <error> ' + err);
    });

    res.on('error', function(err) {
      dd('Client res <error> ' + err);
    });

    req.client.on('error', function(err) {
      dd('Client socket <error> ' + err);
    });

    // 'Timeout' event is triggered on req timeout
    req.on('timeout', function(err) {
      req.sendReply('', 408, 'Request timeout');
    });

    // 'Timeout' event is triggered on req timeout
    res.on('timeout', function(err) {
      req.sendReply('', 504, 'Gateway timeout');
    });

    // If deny mode is on
    if (parent.noMore) {
      req.sendReply('', 503, 'Service Temporarily Unavailable');
    }
  });

  server.deny = function() {
    parent.noMore = true;
  }

  if (c.clientTimeout) {
    server.setTimeout(c.clientTimeout * 1000);
  }

  server.on('connection', function() {
    dd('New HTTP socket');  
  });

  server.on('clientError', function(exception, socket) {
    dd('HTTP client error emitted at server object: ' + exception);
  });

  return server;
};

function prepareDataIn(obj) {
  if (obj.hasOwnProperty(55)) {
    obj[55] = new Buffer(obj[55], "hex");
  }

  return obj;
}

// Do data transition before sending out
function prepareDataOut(obj) {
  if (obj.hasOwnProperty(55)) {
    if (typeof obj[55] == 'object' && obj[55] instanceof Buffer) {
      obj[55] = helpers.safeLog(obj[55].toString('hex'), ['field55']);
    } else {
      obj[55] = helpers.safeLog((new Buffer(obj[55], 'binary')).toString('hex'), ['field55']);
    }
  }

  return obj;
}

module.exports = clientHttpServer;
