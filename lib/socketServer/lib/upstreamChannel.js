var iso8583 = require('../../../lib/iso8583');
var iso8583Queue = require('../../../lib/iso8583-queue');
var helpers = require('../../../lib/helpers');
var iso8583Packet = require('../../../lib/iso8583-packet');
var EventEmitter = require('events').EventEmitter;
require('colors');

var defaults = {
  timeoutError: 3000,
  timeoutErrorRefused: 10000,
  timeoutSocketTerminate: 5000
};

function UpstreamChannel(options) {
  this.options = options;
  this.flags = {};

  var iso8583Logic = require('../../iso8583/lib/logic/' + global.defaultSyntax + '.js');
  this.logic = new iso8583Logic(this);

  this.queue = new iso8583Queue(options);
  this.queue.parent = this;

  if (options.statServerPort) {
    var iso8583StatServer = require('../../../lib/iso8583-statserver');
    this.statServer = new iso8583StatServer(options.statServerPort);
  }

  this.on('terminate', function () {
    if (this.queue.isEmpty()) {
      dd('Warning: quitting...');
      global.flushAndQuit();
      return;
    }

    dd('Waiting for the queue to empty');
    this.on('emptyQueue', function () {
      dd('Warning: quitting...');
      global.flushAndQuit();
    });
  }.bind(this));
}

UpstreamChannel.prototype = Object.create(EventEmitter.prototype);
UpstreamChannel.prototype.constructor = UpstreamChannel;

UpstreamChannel.prototype.setFlags = function (values) {
  for (var key in values) {
    this.flags[key] = values[key];
  }
};

UpstreamChannel.prototype.getFlag = function (key) {
  return this.flags.hasOwnProperty(key) ? this.flags[key] : null;
};

UpstreamChannel.prototype.resetSocketState = function (socket, values, withRetryDelay) {
  if (!values) values = {};

  if (!values.hasOwnProperty('isConnected')) values.isConnected = 0;
  if (!values.hasOwnProperty('isShuttingDown')) values.isShuttingDown = 0;
  if (withRetryDelay && !values.hasOwnProperty('retryDelay')) values.retryDelay = 0;

  this.setFlags(values);
};

UpstreamChannel.prototype.hasGone = function (queueMessageId) {
  var qe = this.queue.confirm(queueMessageId);

  if (qe) {
    dd(('Warning: client ' + qe.senderName + ' [queue id ' + queueMessageId + '] terminated activity').yellow);
    if (!global.c.noAutoReversal) {
      this.logic.hasGone(qe);
    }
  } else {
    dd(('Client with queue id ' + queueMessageId + ' terminated activity. No queue item was found').yellow);
  }

  this.socket.processQueue();
};

UpstreamChannel.prototype.sendData = function (sender, data, params, errReturn) {
  if (!params) params = {};

  var item = null;
  try {
    item = this.queue.addMessage(sender, data, params, errReturn);
    if (!item) return false;
    dd('New queue item ' + item.id);

    if (!sender.hasOwnProperty('queueMessageId') || !sender.queueMessageId || params.hasOwnProperty('updateQueueMessageId')) {
      sender.queueMessageId = item.id;
    }
  } catch (ex) {
    dd(('Error adding message to queue: ' + ex + '\n' + ex.stack).red);
    sender.end();
    return false;
  }

  if (this.statServer) this.statServer.process(item.packet);

  if (params.hasOwnProperty('delayTime') && params.delayTime) {
    setTimeout(function () { this.socket.processQueue(); }.bind(this), params.delayTime);
  } else {
    this.socket.processQueue();
  }

  return true;
};

UpstreamChannel.prototype.processQueue = function (socket, writeMessages) {
  var countPending = this.queue.getPendingCount();
  var countTotal = this.queue.getCount();

  dd('Processing queue [pending ' + countPending + ' / total ' + countTotal + ']');
  if (countTotal > 0) dd('Queue keys dump: ' + this.queue.getKeys().join(), 'verbose');

  if (!countTotal) {
    dd('The queue is empty');
    this.emit('emptyQueue');
    return;
  }

  if (!this.getFlag('isConnected')) {
    dd('Socket is not connected yet...'.yellow);
    return;
  }

  if (socket._connecting) {
    dd('Waiting for upstream to connect...');
    return;
  }

  if (this.getFlag('isShuttingDown')) {
    dd('Shutting down the connection. Stay tuned...');
    return;
  }

  var messages = this.queue.fetchToProcess();
  var buffers = [];

  for (var i in messages) {
    var message = messages[i];
    if (message.comment) dd(message.comment);
    dd('Upstreaming data for ' + message.senderName);

    this.logPacket(message.packet.getRawMessage({ header: global.c.useHeader }));
    buffers.push(message.packet.getRawMessage({ header: global.c.useHeader }));
  }

  writeMessages(Buffer.concat(buffers));
};

UpstreamChannel.prototype.processHostData = function (socket, data, options) {
  options = options || {};

  dd('Got data from ISO-host (' + data.length + 'b)');
  this.logHostData(data);

  var packetData = null;
  var multiMessage = false;

  if (global.c.useHeader) {
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
      if (options.replyEcho && p.messageTypeId == 800) {
        dd('Upstream echo request');
        dd('\n\n' + 'ISO host says ' + p.pretty(), 'verbose');

        if (typeof this.logic.replyUpstreamEcho === 'function') {
          var rp = this.logic.replyUpstreamEcho(p);
          socket.write(rp.getMessage({ header: global.c.useHeader }));
          dd('Upstream echo response' + rp.pretty(), 'verbose');
        }

        continue;
      }

      qe = this.queue.getActiveByPacket(p);

      if (!qe) {
        var lookupFieldsString = global.c.queueMessageKeyFields.join(',');
        var message = 'Upstream error: ISO host sent data with no proper client connected (client lookup fields: ' + lookupFieldsString + ')! Ignoring...';
        message += '\n\n' + 'ISO host says' + p.pretty();
        dd(message.red);

        if (options.stopOnUnmatchedPacket) return false;
        continue;
      } else if (qe.sender.destroyed) {
        message = 'Upstream error: ISO host sent data for closed socket! Ignoring...';
        message += '\n\n' + 'ISO host says' + p.pretty();
        dd(message.red);

        if (options.stopOnUnmatchedPacket) return false;
        continue;
      } else {
        var cResult = this.queue.confirm(qe.id);
        if (!cResult) dd('Warning: queue::confirm() failed to locate the queue message #' + qe.id);
      }

      dd(('Parsed data for ' + qe.senderName).green);
      dd('\n\n' + 'ISO host to ' + qe.senderName + p.pretty(), 'verbose');

      if (this.statServer) this.statServer.process(p);
      qe.sender.reply(p, qe);
    } else {
      dd(('ISO host: failed to parse ISO host iso8583 packet').red);
      dd(p.parseError, 'verbose');
    }

    if (qe) socket.dropClient(qe.sender);
  }

  socket.processQueue();
  return true;
};

UpstreamChannel.prototype.dropAllActiveClients = function (socket) {
  var senders = this.queue.getActiveSenders();
  for (var i in senders) {
    socket.dropClient(senders[i].sender);
  }
};

UpstreamChannel.prototype.dropClient = function (client) {
  client.end();
};

UpstreamChannel.prototype.logPacket = function (packet) {
  if (global.c.dangerous) {
    dd(('[' + helpers.safeLog(packet, ['isoMessage']) + ']'), 'verbose');
    dd(('[' + helpers.safeLog(packet, ['hex']) + ']'), 'verbose');
    return;
  }

  dd(('[' + helpers.safeLog(packet, ['isoMessage']).substring(0, 8) + '...]'), 'verbose');
};

UpstreamChannel.prototype.logHostData = function (data) {
  if (global.c.dangerous) {
    dd(('[' + helpers.safeLog(data, ['isoMessage']) + ']').cyan, 'verbose');
    dd(('[' + helpers.safeLog(data, ['hex']) + ']').cyan, 'verbose');
    return;
  }

  dd(('[' + helpers.safeLog(data, ['isoMessage']).substring(0, 8) + '...]').cyan, 'verbose');
};

UpstreamChannel.defaults = defaults;

module.exports = UpstreamChannel;
