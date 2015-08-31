var helpers     = require('../../../lib/helpers');
var net         = require('net');

function clientSocket(upstream, c) {
  // Stop accepting connections
  this.noMore = false;

  var parent = this;

  var server = net.createServer(function (socket) {
    if (parent.noMore) {
      socket.end();
      return;
    }

    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    if (c.clientTimeout) socket.setTimeout(c.clientTimeout * 1000);
    dd(('Client ' + socket.name + ' connected').yellow);

    // This method is triggered by upstream to reply to the sender
    socket.reply = function(p) {
      this.write(p.getRawMessage());

      return true;
    }

    // This method is triggered on queue timeout
    socket.queueTimeout = function() {
      this.end();
    }

    // Checks if socket was already closed
    socket.isClosed = function() {
      return !this.writable;
    }

    // 'Data' event is triggered when some client sends us data
    socket.on('data', function (data) {
      dd(('Client ' + socket.name + ' sent data (' + data.length + 'b)').yellow);

      if (global.c['dangerous']) {
        dd(('[' + helpers.safeLog(data, ['isoMessage']) + ']').cyan, 'verbose');
      } else {
        dd(('[' + (helpers.safeLog(data, ['isoMessage'])).substring(0,8) + '...]').cyan, 'verbose');
      }

      if (!upstream.sendData(socket, data)) this.end();
    });

    // 'End' event is triggered when the socket is about to close
    socket.on('end', function () {
      dd(('Client ' + socket.name + ' <end> event').yellow);
    });

    // 'Close' event is triggered when the socket was closed
    socket.on('close', function() {
      dd(('Client ' + socket.name + ' <close> event').yellow);

      if (socket.queueMessageId) {
        upstream.hasGone(socket.queueMessageId);
      }
    });

    // 'Error' event is triggered on socket errors
    socket.on('error', function(err) {
      dd('Client <error> ' + err);
    });

    // 'Timeout' event is triggered on socket timeout
    socket.on('timeout', function(err) {
      dd('Client ' + socket.name + ' <socket timeout>');
      this.end();
    });
  });

  server.on('error', function(err) {
    dd('Socket server <error> ' + err);
  });

  server.deny = function() {
    parent.noMore = true;
  }

  return server;
};

module.exports = clientSocket;
