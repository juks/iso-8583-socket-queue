var net = require('net');
var UpstreamChannel = require('./upstreamChannel');

function UpstreamChannelClient(options) {
  UpstreamChannel.call(this, options);
  this.socket = initSocket(options, this);
}

UpstreamChannelClient.prototype = Object.create(UpstreamChannel.prototype);
UpstreamChannelClient.prototype.constructor = UpstreamChannelClient;

function initSocket(options, parent) {
  dd(('Connecting to upstream server ' + options.upstreamHost + ':' + options.upstreamPort).green);

  var socket = net.createConnection({
    host: options.upstreamHost,
    port: options.upstreamPort
  }, function () {
    dd(('Connected to upstream ' + socket.remoteAddress + ':' + socket.remotePort + '!').green);

    if (typeof parent.logic.onConnect == 'function') parent.logic.onConnect();

    socket.setNoDelay(true);
    socket.resetState({ isConnected: Date.now() });
    socket.processQueue();

    if (socket.options.upstreamTimeout) socket.setTimeout(socket.options.upstreamTimeout * 1000);
  });

  socket.resetState = function (values) {
    parent.resetSocketState(socket, values, true);
  };

  socket.resetState();
  socket.options = options;

  socket.processQueue = function () {
    socket.retryDelay = 0;
    parent.processQueue(socket, function (buffer) {
      socket.write(buffer);
    });
  };

  socket.dropClient = function (client) {
    parent.dropClient(client);
  };

  socket.on('data', function (data) {
    parent.processHostData(socket, data, { replyEcho: true });
  });

  socket.on('end', function () {
    dd('Upstream <end>'.red);
    parent.setFlags({ isShuttingDown: Date.now() });
  });

  socket.on('close', function () {
    if (this.terminateTimer) {
      clearTimeout(this.terminateTimer);
    }

    dd('Upstream <close>'.red);
    dd('Dropping all active clients');
    parent.dropAllActiveClients(socket);

    var recover = function () {
      parent.socket = initSocket(options, parent);
      parent.socket.processQueue();
    };

    socket.resetState({ retryDelay: socket.retryDelay });

    if (!socket.retryDelay) {
      recover();
    } else {
      setTimeout(recover, socket.retryDelay);
    }

    parent.setFlags({ isShuttingDown: 0 });
  });

  socket.on('error', function (err) {
    socket.retryDelay = (err && err.code === 'ECONNREFUSED') ? UpstreamChannel.defaults.timeoutErrorRefused : UpstreamChannel.defaults.timeoutError;

    dd(('Upstream socket error ' + err).red);
    this.end();
  });

  socket.on('timeout', function () {
    dd('Upstream timeout!'.yellow);

    parent.setFlags({ isShuttingDown: Date.now() });
    socket.end();
    socket.terminateTimer = setTimeout(function () {
      dd('Forcing upstream socket termination'.red);
      this.destroy();
    }.bind(socket), UpstreamChannel.defaults.timeoutSocketTerminate);

    parent.dropAllActiveClients(socket);
    socket.processQueue();
  });

  return socket;
}

module.exports = UpstreamChannelClient;
