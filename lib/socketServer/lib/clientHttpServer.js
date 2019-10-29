var helpers     = require('../../../lib/helpers');
var http        = require('http');

var maxConnections = 100;
// Todo: proper initialization with no hardcode
var hexFields = [52,55];

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

      if (!req.isRawMode) {
        msg = JSON.stringify({result: msg, errors: errors});
        msg += '\n';
      }

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
      if (this.isRawMode) {
        var msg = p.getRawMessage().toString('hex');
      } else {
        var msg = prepareObjectDataOut(p.getFields());
      }

      this.sendReply(msg);

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
          // We Handle JSON at / EG: { "0": "800", "3": "0", "7": "0607161700", "11": "123456", "24": "0", "41": "00123456", "42": "123567890124567" }
          if (req.url == '/') {
            var data = null;
            try {
              var data = JSON.parse(body);
              data = prepareObjectDataIn(data);
            } catch (ex) {
              this.sendReply('', 400, [ex.toString()]);
              return;
            }
          // We handle raw hex data at /raw. EG: 30383030303132333435363030303030313233343536313233353637383930313234353637 (0800...)
          } else if (req.url == '/raw') {
            var data = Buffer.from(body, 'hex');
            req.isRawMode = true;
          } else {
            this.sendReply('', 404, 'Not Found');
          }
          
          var errReturn = [];

          if (!upstream.sendData(req, data, null, errReturn)) {
            if (!errReturn.length) {
              this.sendReply('', 500, 'Failed to queue message');
            } else {
              this.sendReply('', 500, errReturn);
            }
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

function prepareObjectDataIn(data) {
  for (var i in hexFields) {
    if (data.hasOwnProperty(hexFields[i])) {
      data[hexFields[i]] = Buffer.from(data[hexFields[i]], "hex");
    }
  }

  return data;
}

// Do data transition before sending out
function prepareObjectDataOut(data) {
  for (var i in hexFields) {
    if (data.hasOwnProperty(hexFields[i])) {
      if (typeof data[hexFields[i]] == 'object' && data[hexFields[i]] instanceof Buffer) {
        data[hexFields[i]] = data[hexFields[i]].toString('hex');
      } else {
        data[hexFields[i]] = Buffer.from(data[hexFields[i]], 'binary').toString('hex');
      }

    }
  }

  return data;
}

module.exports = clientHttpServer;
