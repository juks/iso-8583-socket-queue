var net = require('net');
var UpstreamChannel = require('./upstreamChannel');

function UpstreamChannelServer(options) {
  UpstreamChannel.call(this, options);
  this.socket = initSocket(options, this);
  this.socket.upstreamConnection = null;
}

UpstreamChannelServer.prototype = Object.create(UpstreamChannel.prototype);
UpstreamChannelServer.prototype.constructor = UpstreamChannelServer;

function initSocket(options, parent) {
  dd(('Listening for upstream connection on port ' + options.upstreamListenPort).green);

  var socket = net.createServer(function (connection) {
    if (socket.upstreamConnection) {
      dd('Dropping concurrent upstream connection!'.red);
      connection.end();
      return;
    }

    if (options.upstreamTimeout) connection.setTimeout(options.upstreamTimeout * 1000);

    connection.on('data', function (data) {
      parent.processHostData(socket, data, { replyEcho: true, stopOnUnmatchedPacket: true });
    });

    connection.on('end', function () {
      dd('Upstream <end>'.red);

      parent.setFlags({ isShuttingDown: Date.now() });
      socket.upstreamConnection = null;
    });

    connection.on('close', function () {
      if (this.terminateTimer) {
        clearTimeout(this.terminateTimer);
      }

      dd('Upstream <close>'.red);
      dd('Dropping all active clients');

      parent.dropAllActiveClients(socket);
      socket.resetState();
      socket.upstreamConnection = null;
    });

    connection.on('error', function (err) {
      socket.retryDelay = (err && err.code === 'ECONNREFUSED') ? UpstreamChannel.defaults.timeoutErrorRefused : UpstreamChannel.defaults.timeoutError;

      dd(('Upstream socket error ' + err).red);
      this.end();
    });

    connection.on('timeout', function () {
      dd('Upstream timeout!'.yellow);

      parent.setFlags({ isShuttingDown: Date.now() });
      connection.end();
      connection.terminateTimer = setTimeout(function () {
        dd('Forcing upstream socket termination'.red);
        this.destroy();
      }.bind(connection), UpstreamChannel.defaults.timeoutSocketTerminate);

      parent.dropAllActiveClients(socket);
      socket.processQueue();
    });

    dd('Upstream connected'.green);
    socket.resetState({ isConnected: Date.now() });
    socket.upstreamConnection = connection;
    socket.processQueue();
  });

  socket.listen(options.upstreamListenPort);

  socket.resetState = function (values) {
    parent.resetSocketState(socket, values, false);
  };

  socket.resetState();
  socket.options = options;

  socket.processQueue = function () {
    parent.processQueue(socket, function (buffer) {
      socket.upstreamConnection.write(buffer);
    });
  };

  socket.dropClient = function (client) {
    parent.dropClient(client);
  };

  return socket;
}

module.exports = UpstreamChannelServer;
