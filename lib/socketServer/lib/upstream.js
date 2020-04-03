var iso8583         = require('../../../lib/iso8583');
var iso8583Queue    = require('../../../lib/iso8583-queue');
var helpers         = require('../../../lib/helpers');
var iso8583Packet   = require('../../../lib/iso8583-packet');
var net             = require('net');
var colors          = require('colors');
var EventEmitter    = require('events').EventEmitter;

var flags = {};
var queue = null;

var uOptions = {
  // Delay time before reconnect after timeout socket error
  timeoutError:               3000,

  // Delay time before reconnect after connection refused socket error
  timeoutErrorRefused:        10000,

  // Delay before forsed connection close
  timeoutSocketTerminate:     5000,

  // Timeout for ISO-host reply
  timeoutHostReply:           35000
};

// Sets flags values
function setFlags (values) {
  for (var key in values) {
    flags[key] = values[key];
  }
}

// Get flag value
function getFlag (key) {
  var value = flags.hasOwnProperty(key) ? flags[key] : null;

  return value;
}

function Upstream (options) {
  this.socket = initSocket(options, this);

  var iso8583Logic = require('../../iso8583/lib/logic/' + global.defaultSyntax + '.js');
  this.logic = new iso8583Logic(this);

  queue = new iso8583Queue(options);
  queue.parent = this;

  if (options.statServerPort) {
    var iso8583StatServer = require('../../../lib/iso8583-statserver');
    this.statServer = new iso8583StatServer(options.statServerPort);
  }

  // Notifies the upstream queue of some client that desired to leave
  this.hasGone = function (queueMessageId) {
    var qe = queue.confirm(queueMessageId);

    // Client queue item exists - critical
    if (qe) {
      dd(('Warning: client ' + qe.senderName + ' [queue id ' + queueMessageId + '] terminated activity').yellow);
      if (!global.c.noAutoReversal) {
        this.logic.hasGone(qe);
      }
    // Client queue item does not exist
    } else {
      dd(('Client with queue id ' + queueMessageId + ' terminated activity. No queue item was found').yellow);
    }

    this.socket.processQueue();
  }

  // Receiving data for the queue
  this.sendData = function (sender, data, params, errReturn) {
    if (!params) params = {};

    try {
      var item = queue.addMessage(sender, data, params, errReturn);
      if (!item) return false;
      dd('New queue item ' + item['id']);

      if (!sender.hasOwnProperty('queueMessageId') || !sender.queueMessageId || params.hasOwnProperty('updateQueueMessageId')) sender.queueMessageId = item['id'];
    } catch (ex) {
      dd(('Error adding message to queue: ' + ex + '\n' + ex.stack).red);
      sender.end();
    }

    // Pass through stat server
    if (this.statServer) this.statServer.process(item.packet);

    if (params.hasOwnProperty('delayTime') && params.delayTime) {
      setTimeout(function() { this.socket.processQueue() }.bind(this), params.delayTime);
    } else {
      this.socket.processQueue();
    }

    return true;
  }

  // Adding queue termination event listener
  this.on('terminate', function() {
    if (queue.isEmpty()) {
      dd('Warning: quitting...');
      global.flushAndQuit();
    } else {
      dd('Waiting for the queue to empty');

      this.on('emptyQueue', function() {
        dd('Warning: quitting...');
        global.flushAndQuit();
      });
    }
  }.bind(this));
}

function initSocket(options, parent) {
  dd(('Connecting to upstream server ' + options.upstreamHost + ':' + options.upstreamPort).green);

  socket = net.createConnection({
    host: options.upstreamHost,
    port: options.upstreamPort
  },

  function () {
    dd(('Connected to upstream ' + socket.remoteAddress + ':' + socket.remotePort + '!').green);

    if (typeof parent.logic.onConnect == 'function') parent.logic.onConnect();

    socket.setNoDelay(true);
    socket.resetState({'isConnected': Date.now()});
    socket.processQueue();

    if (socket.options.upstreamTimeout) socket.setTimeout(socket.options.upstreamTimeout * 1000);
  });
  
  // Resetting upsteam socket status variables
  socket.resetState = function (values) {
    if (!values) values = {};

    // 'Connected' flag is set when upstream socket is connected
    if(!values.hasOwnProperty('isConnected')) values['isConnected'] = 0;

    // 'Shutting down' flag is set when upstream socket is closing the connection
    if(!values.hasOwnProperty('isShuttingDown')) values['isShuttingDown'] = 0;

    // 'retryDelay' counter reflects the amount of seconds before reconnect
    if(!values.hasOwnProperty('retryDelay')) values['retryDelay'] = 0;

    setFlags(values);
  }

  socket.resetState();
  socket.options = options;

  // Queue processor
  socket.processQueue = function () {
    socket.retryDelay = 0;

    var countPending = queue.getPendingCount();
    var countTotal = queue.getCount();

    dd('Processing queue [pending ' + countPending + ' / total ' + countTotal + ']');
    if (countTotal > 0) dd('Queue keys dump: ' + queue.getKeys().join(), 'verbose');

    if (!countTotal) {
      dd('The queue is empty');
      parent.emit('emptyQueue');

      return;
    }

    if (!getFlag('isConnected')) {
      dd('Socket is not connected yet...'.yellow);
      return;
    }

    if (socket._connecting) {
      dd('Waiting for upstream to connect...');
      return;
    }

    if (getFlag('isShuttingDown')) {
      dd('Shutting down the connection. Stay tuned...');
      return;
    }

    var messages = queue.fetchToProcess();

    // We use application buffering together with Nagle disabled
    var buf = [];

    for (var i in messages) {
      var message = messages[i];
      if (message.comment) dd(message.comment);
      dd('Upstreaming data for ' + message.senderName);

      if (global.c['dangerous']) {
        dd(('[' + helpers.safeLog(message.packet.getRawMessage({
                                                                  header: global.c['useHeader']
                                                              }), ['isoMessage']) + ']'), 'verbose');
        dd(('[' + helpers.safeLog(message.packet.getRawMessage({
                                                                  header: global.c['useHeader']
                                                              }), ['hex']) + ']'), 'verbose');
      } else {
        dd(('[' + helpers.safeLog(message.packet.getRawMessage({
                                                                  header: global.c['useHeader']
                                                              }), ['isoMessage']).substring(0,8) + '...]'), 'verbose');
      }     

      buf.push(message.packet.getRawMessage({
                                              header: global.c['useHeader']
                                            }));
    }

    socket.write(Buffer.concat(buf));
  }

  // This function releases the client from the queue and drops his connection
  socket.dropClient = function (client) {
    client.end();
  }

  // 'Data' event is triggered when upstream sends us data
  socket.on('data', function (data) {
    dd('Got data from ISO-host (' + data.length + 'b)');

    if (global.c['dangerous']) {
      dd(('[' + helpers.safeLog(data, ['isoMessage']) + ']').cyan, 'verbose');
      dd(('[' + helpers.safeLog(data, ['hex']) + ']').cyan, 'verbose');
    } else {
      dd(('[' + (helpers.safeLog(data, ['isoMessage'])).substring(0,8) + '...]').cyan, 'verbose');
    }

    var multiMessage = false;

    if (global.c['useHeader']) {
      var packager = new iso8583(global.defaultSyntax);
      packetData = packager.config.processors.splitByHeader(data);

      if (packetData.length > 1) multiMessage = true;
    } else {
      packetData = [data];
    }

    for (var index in packetData) {
      var p = new iso8583Packet(packetData[index]);
      if (multiMessage) dd(('[' + helpers.safeLog(packetData[index], ['isoMessage']) + ']'), 'verbose');

      var qe = null;

      if (!p.parseError) {
        // Upstream echo
        if (p.messageTypeId == 800) {
          dd('Upstream echo request');
          dd('\n\n' + 'ISO host says ' + p.pretty(), 'verbose');

          if (typeof parent.logic.replyUpstreamEcho === 'function') {
            var rp = parent.logic.replyUpstreamEcho(p);
            this.write(rp.getMessage({
              header: global.c['useHeader']
            }));

            dd('Upstream echo response' + rp.pretty(), 'verbose');
          }

          continue;
        }

        var qe = queue.getActiveByPacket(p);

        // No active queue item found
        if (!qe) {
          let lookupFieldsString = global.c['queueMessageKeyFields'].join(',');
          let message = 'Upstream error: ISO host sent data with no proper client connected (client lookup fields: ' + lookupFieldsString + ')! Ignoring...';
          message += '\n\n' + 'ISO host says' + p.pretty();
          dd(message.red);

          continue;
        // Found item with dead sender
        } else if (qe.sender.destroyed) {
          message = 'Upstream error: ISO host sent data for closed socket! Ignoring...';
          message += '\n\n' + 'ISO host says' + p.pretty();
          dd(message.red);

          continue;
        // Confirm queue message
        } else {
          var cResult = queue.confirm(qe.id);
          if (!cResult) dd('Warning: queue::confirm() failed to locate the queue message #' + qe.id);
        }

        dd(('Parsed data for ' + qe.senderName).green);
        dd('\n\n' + 'ISO host to ' + qe.senderName + p.pretty(), 'verbose');

        // Pass through stat server
        if (parent.statServer) parent.statServer.process(p);

        qe.sender.reply(p, qe);
      } else {
        dd(('ISO host: failed to parse ISO host iso8583 packet').red);
        dd(p.parseError, 'verbose');
      }

      if (qe) socket.dropClient(qe.sender);
    }

    socket.processQueue();
  });

  // 'End' event is triggered when the socket is about to close
  socket.on('end', function () {
    dd('Upstream <end>'.red);

    setFlags({'isShuttingDown': Date.now()});
  });

  // 'Close' event is triggered when the socket was closed
  socket.on('close', function () {    
    // Removing termination timer
    if (this.terminateTimer) {
      clearTimeout(this.terminateTimer);
    }

    dd('Upstream <close>'.red);
    dd('Dropping all active clients');

    var senders = queue.getActiveSenders();
    for (var i in senders) {
      socket.dropClient(senders[i]['sender']);
    }

    var recover = function() {
      socket = initSocket(options, parent);
      socket.processQueue();
    }

    socket.resetState({'retryDelay': socket.retryDelay});

    // Refreshing socket object
    if (!socket.retryDelay) {
      recover();
    } else {
      setTimeout(recover, socket.retryDelay);
    }

    setFlags({'isShuttingDown': 0});
  });

  // 'Error' event is triggered on socket errors
  socket.on('error', function (err) {
    if (err = 'ECONNREFUSED') {
      socket.retryDelay = uOptions.timeoutErrorRefused;
    } else {
      socket.retryDelay = uOptions.timeoutError;
    }

    dd(('Upstream socket error ' + err).red);
    this.end();
  });

  // 'Timeout' event is triggered on connection timeout (no data sent or recieved for a given period of time)
  socket.on('timeout', function () {
    dd('Upstream timeout!'.yellow);

    setFlags({'isShuttingDown': Date.now()});
    socket.end();
    socket.terminateTimer = setTimeout(function() {
      dd('Forcing upstream socket termination'.red);
      this.destroy();
    }.bind(socket), uOptions.timeoutSocketTemrinate);

    var senders = queue.getActiveSenders();
    for (var i in senders) {
      socket.dropClient(senders[i]['sender']);
    }

    socket.processQueue();
  });

  return socket;
}

// Returns a warning captions if there has been LIMIT seconds passed since timestamp
function delayWarning(timestamp, limit) {
  if ((typeof timestamp == 'undefined') || !timestamp) return false;
  if (!limit) limit = 120;
  limit *= 1000;

  return Date.now() - timestamp > limit;
}

Upstream.prototype.__proto__ = EventEmitter.prototype;

module.exports = Upstream;
