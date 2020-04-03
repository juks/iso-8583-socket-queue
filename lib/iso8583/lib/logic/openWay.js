//
// This file contains basic logic for sending the system-specific (openway) auto-reversal messages
//
var iso8583Packet    = require('../../../../lib/iso8583-packet');
var moment           = require('moment');

var maxRetry = 10;

function Iso8583Logic(upstream) {
  this.upstream = upstream;
  this.name = 'Iso8583.Logic';
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
    // TODO: Implement auto-reversal for MTI 200
  // Auto-Reverse 400
  } else if (qe.packet.messageTypeId == 400 && qe.isSystemSender) {
    // TODO: Implement repeating auto-reversal for MTI 400
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

module.exports = Iso8583Logic;
