var iso8583Packet    = require('../../../lib/iso8583-packet');
var helpers          = require('../../../lib/helpers');
var net              = require('net');

var maxQueue                = 100;
var queueTimeout            = 35000;
var queueShortTimeout       = 5000;

function queue(c) {
  this.q = {};
  this.busyTerminals = {};

  var queueMemory = require('./storage/queueMemory.js');

  this.q = new queueMemory();

  if (c) {
    maxQueue =          c.maxQueue;
    queueTimeout =      c.queueTimeout * 1000;
    queueShortTimeout = c.queueShortTimeout * 1000;
  }
}

// Adds message to queue
queue.prototype.addMessage = function(sender, msg, params, errReturn) {
  var isSystemSender = false;
  if (!params) params = {};

  var parentQueueItem = params.hasOwnProperty('parent') ? params['parent'] : null;
  var delayTime = params.hasOwnProperty('delayTime') && params['delayTime'] ? params['delayTime'] : 0;
  var comment = params.hasOwnProperty('comment') && params['comment'] ? params['comment'] : null;

  if (!sender) {
    throw new Error('Queue addMessage no sender');
  }

  if (this.getCount() >= maxQueue) {
    throw new Error('Reached max queue length ');
  }

  if (typeof sender == 'object' && sender.constructor.name == 'Socket') {
    var senderName = sender.name;
  } else if (typeof sender == 'object' && sender.constructor.name == 'IncomingMessage') {
    var senderName = sender.name;
  } else if (typeof sender == 'object' && sender.constructor.name == 'Iso8583Logic') {
    var senderName = sender.name;
    isSystemSender = true;
  }

  var p = new iso8583Packet(msg);

  if (!p.parseError && !p.checkErrors.length && !(p.isExpired && !isSystemSender)) {
    dd('\n\n' + senderName + p.pretty(), 'verbose');
    var stan = p.getField(11);
    var terminalId = p.getField(41);
  } else if (p.isExpired) {
    dd((senderName + ': Warning! Iso8583 packet is expired. Won\'t queue!' + p.pretty()).red, 'verbose');

    if (Array.isArray(errReturn)) errReturn.push('Packet is expired!');

    return false;
  } else if (p.parseError) {
    dd((senderName + ': Warning! Failed to parse iso8583 packet. Won\'t queue!').red);

    if (Array.isArray(errReturn)) errReturn.push('Failed to parse packet!');

    return false;
  } else {
    dd((senderName + ': Warning! Iso8583 packet contains errors. Won\'t queue!' + p.pretty()).red, 'verbose');

    if (Array.isArray(errReturn)) p.checkErrors.forEach(function(item) { errReturn.push(item); });

    return false;
  }

  var item = {
      isProcessed:        0,
      delayUntil:         delayTime ? Date.now() + delayTime : 0,
      createdAt:          Date.now(),
      retryCount:         parentQueueItem && parentQueueItem.hasOwnProperty('retryCount') ? parentQueueItem['retryCount'] + 1 : 0,
      stan:               stan,
      terminalId:         terminalId,
      messageTypeGroup:   p.messageTypeGroup,
      sender:             sender,
      senderName:         senderName,
      isSystemSender:     isSystemSender,
      packet:             p,
      comment:            comment
  };

  dd('Writing to queue ' + senderName + ' [' + this.getCount() + ']');

  item['id'] = this.q.addMessage(item);

  var timeout = parentQueueItem ? queueShortTimeout : queueTimeout;

  item.timeoutTimer = setTimeout(function() {
    this.queueTimeout(item['id'])
  }.bind(this), timeout + delayTime);

  return item;
}

// Handles queue timeout
queue.prototype.queueTimeout = function(itemId) {
  var item = this.getById(itemId);

  dd(('Queue notice: ' + item.senderName + ' reached queue timeout').yellow);
  if (item && !item.sender.isClosed()) {
    this.confirm(itemId);
    dd('Dropping the client ' + item.senderName);
    item.sender.queueTimeout();
  } else {
    this.confirm(itemId);
    dd('The client ' + item.senderName + ' is already gone');
    this.parent.socket.processQueue();
  }
};

// Get queue item by id
queue.prototype.getById = function(id) {
  return this.q.getById(id);
};

// Returns messagess, ready to process
queue.prototype.fetchToProcess = function() {
  result = [];

  var elements = this.q.getMessages();
  for (var i in elements) {
    var qe = elements[i];

    if (!qe.isProcessed && Date.now() >= qe.delayUntil && (!global.c['queueLockTerminal'] || !this.checkTerminalIsBusy(qe.terminalId))) {
      qe.isProcessed = 1;
      if (global.c['queueLockTerminal']) this.takeTerminal(qe.terminalId, qe['id']);

      result.push(qe);
    }
  }

  return result;
};

// Checks of currenlty there is no message with given terminal id in active state
queue.prototype.checkTerminalIsBusy = function(terminalId) {
  return this.busyTerminals.hasOwnProperty(terminalId);
};

// Marks given terminal id as busy
queue.prototype.takeTerminal = function (terminalId, key) {
  this.busyTerminals[terminalId] = key;
};

// Marks given terminal id as available
queue.prototype.releaseTerminal = function(terminalId, key) {
  dd('Releasing terminal ' + terminalId + ' with the key ' + key, 'verbose');

  // If terminal was takey by someone else -- do nothing
  if (key && this.busyTerminals.hasOwnProperty(terminalId) && this.busyTerminals[terminalId] != key) {
    dd('Terminal ' + terminalId + ' is assigned to key ' + this.busyTerminals[terminalId] + '. Nothing to do.', 'verbose');

    return false;
  } else if (!this.busyTerminals.hasOwnProperty(terminalId)) {
    dd('Terminal ' + terminalId + ' is not assigned', 'verbose');

    return false;
  } else {
    delete this.busyTerminals[terminalId];

    return true;
  }
};

queue.prototype.confirm = function(id) {
  var item = this.getById(id);

  if (item) {
    var qe = {};

    if (item.timeoutTimer) clearTimeout(item.timeoutTimer);

    for (var key in item) qe[key] = item[key];

    if (global.c['queueLockTerminal']) this.releaseTerminal(qe['terminalId'], qe['id']);

    this.q.confirm(id);

    return qe;
  } else {
    return null;
  }
};

// Return the list of client currently waiting for result
queue.prototype.getActiveSenders = function() {
  return this.q.getActiveSenders();
};

// Retrieves an item with corresponding stan and terminalId from the list of active items in queue
queue.prototype.getActiveByPacket = function(p) {
  var pretenders = [];

  var elements = this.q.getMessages();
  for (var i in elements) {
    var qe = elements[i];

    var messageIdentified = true;

    // Checking the key fields in the message queue
    for (var i in global.c['queueMessageKeyFields']) {
      var id = global.c['queueMessageKeyFields'][i];
      if (!p.getField(id) || p.getField(id) != qe.packet.getField(id)) {
        messageIdentified = false;
        break;
      }
    }

    if (messageIdentified && qe.isProcessed) {
      // Not system senders does not care of original packet mti group
      if (!qe.isSystemSender) {
        pretenders.push(qe);
      // System senders do care
      } else if (qe.messageTypeGroup == p.messageTypeGroup) {
        pretenders.push(qe);
      }
    }
  }

  // We have one correct sender -- good news
  if (pretenders.length == 1) {
    return pretenders[0];
  // We have more than one senders, pretending to be the recipient -- need to solve problem
  } else if (pretenders.length > 1) {
    pretenders = this.solveConflict(p, pretenders);

    if (pretenders[0]['score'] != pretenders[1]['score']) var solveResult = 'success'; else var solveResult = 'failed';
    dd(('Queue warning: solving queue conflict with ' + pretenders.length + ' pretenders [' + solveResult + ']').red);

    return pretenders[0]
  // There is nobody to get the response
  } else {
    return null;
  }
};

// Solves conflict and tries to return the most corresponding pretender
queue.prototype.solveConflict = function(p, pretenders) {
  for (var i in pretenders) {
    if (!pretenders[i].hasOwnProperty('score')) pretenders[i]['score'] = 0;

    // Score by message type group
    if (pretenders[i]['packet']['messageTypeGroup'] == p.messageTypeGroup) {
      pretenders[i]['score'] += 10;
    }

    // Score by transaction amount
    if (p.messageTypeGroup == 2) {
      if (pretenders[i]['packet'].getField(4) == p.getField(4)) {
        pretenders[i]['score'] += 1;
      }
    }

    // Score by pan
    if (pretenders[i]['packet']['messageTypeGroup'] == 2 && p.messageTypeId == '0210') {
      var pan = p.getField(2);
      var srcTrack = pretenders[i]['packet'].getField(35);

      if (pan && srcTrack) {
        var reg = new RegExp('^' + pan);
        if (srcTrack.match(pan)) {
          pretenders[i]['score'] += 5;
        }
      }
    }
  }

  pretenders.sort(function (a, b) {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });

  return pretenders;
};


// Get total queue messages count
queue.prototype.getCount = function() {
  return this.q.getCount();
};

// Check if the queue is empty
queue.prototype.isEmpty = function() {
  return this.q.isEmpty();
};

// Returns queue keys
queue.prototype.getKeys = function() {
  return this.q.getKeys();
};

// Get pending messages count
queue.prototype.getPendingCount = function() {
  return this.q.getPendingCount();
};

module.exports = queue;
