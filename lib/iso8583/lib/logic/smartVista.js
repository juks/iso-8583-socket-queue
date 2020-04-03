//
// This file contains basic logic for sending the system-specific (smartvista) auto-reversal messages
//
var iso8583Packet    = require('../../../../lib/iso8583-packet');
var moment           = require('moment');
var helpers          = require("../../../../lib/helpers");

var maxRetry = 10;

function Iso8583Logic(upstream) {
  this.upstream = upstream;
  this.name = 'Iso8583.Logic';
  this.queueMessageId = null;
}

Iso8583Logic.prototype.hasGone = function(qe) {
  if (!qe.isSystemSender && !qe.isProcessed) {
    return;
  }

  var now = moment(new Date());
  this.name = 'Iso8583.Logic #' + qe.id;

  if (qe.retryCount == maxRetry) {
    dd(('Warning: reached max retry count for ' + qe.senderName + '. Giving up!\n' + qe.packet.pretty()).yellow);

    return;
  }

  if (qe.packet.hasErrors()) {
    dd('Iso8583.Logic: message contains check errors. Will not process');

    return;
  }

  // Purchase 200
  if (qe.packet.messageTypeId == 200) {
    if (qe.packet.getField(37)) {
      dd('Error: unconfirmed 200 messages has no track2 data. Will not do auto-reversal');

      return;
    }

    dd('Sending auto-reversal message. Merchant: ' + qe.packet.getField(42) + '; terminal: ' +  qe.packet.getField(41) + '; stan: ' + qe.packet.getField(11));

    var p = new iso8583Packet(qe.packet);
    p.setFields({
       0:   400,
       7:   now.format("MMDDHHmmss"),                    // Data & Time, Transmission
       24:  400
    });

    this.upstream.sendData(this, p);
  // Auto-Reverse 400
  } else if (qe.packet.messageTypeId == 400 && qe.isSystemSender) {
    if (!qe.retryCount) {
      var timeout = 0
    } else if (qe.retryCount == 1) {
      var timeout = 2000;
    } else if (qe.retryCount < 8) {
      var timeout = 10000;
    } else {
      var timeout = 300000;
    }

    var p = new iso8583Packet(qe.packet);
    p.setFields({
      7: now.format("MMDDHHmmss")                    // Data & Time, Transmission
    });

    this.upstream.sendData(this, p, {
                      parent:     qe,
                      delayTime: timeout,
                      comment: 'Repeating auto-reversal message. Merchant: ' + qe.packet.getField(42) + '; terminal: ' +  qe.packet.getField(41) + '; stan: ' + qe.packet.getField(11) + '. Attempt ' + (qe.retryCount + 1),
                      updateQueueMessageId: true
                    });
  }
};

// Use this method to send a message each time the upstream connection is being established
Iso8583Logic.prototype.onConnect = function() {
  /*let now = moment(new Date());

  let p = new iso8583Packet();
  p.setFields({
    0:   800,
    3:   '9900000',
    7:   now.format("MMDDHHmmss"),                    // Data & Time, Transmission
    11:  '000001',
    24:  '831',
    41: '12345678'
  });

  dd('OnConnect message:');
  dd(('[' + helpers.safeLog(p.getMessage(), ['isoMessage']) + ']').cyan, 'verbose');

  this.upstream.sendData(this, p);*/

  return true;
};

Iso8583Logic.prototype.queueTimeout = function() {
  this.upstream.hasGone(this.queueMessageId);
};

Iso8583Logic.prototype.isClosed = function() {
  return false;
};

Iso8583Logic.prototype.end = function() {

};

Iso8583Logic.prototype.reply = function(p, qe) {
  if (!p.isSystemFaulty) {
    dd(this.name + ' got proper reply');
  } else {
    dd('Warning: ' + this.name + ' got system faulty reply');
    this.hasGone(qe);
  }
  
  return true;
};

Iso8583Logic.prototype.replyUpstreamEcho = function(p) {
  var now = moment(new Date());

  p.setFields({
    0: '0810',
    7:  now.format("MMDDHHmmss"),
    37: helpers.randomString(12, 1),
    39: 0
  });

  p.unsetFields([24, 42]);

  return p;
};

module.exports = Iso8583Logic;
