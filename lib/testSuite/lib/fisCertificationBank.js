var helpers = require("../../../lib/helpers");
var iso8583Packet = require('../../../lib/iso8583-packet');
var moment = require("moment");

var startAmount = 10000; // start with $100

function fisCertificationBank() {
  this.transactions = [];
  this.accounts = {};
}

// Return reply packet
fisCertificationBank.prototype.replyPacket = function(sourcePacket, responseCode) {
  if (!responseCode) responseCode = 0;

  if (sourcePacket.messageTypeIdShort == '800') {
    return this.reply800(sourcePacket, responseCode);
  } else if (sourcePacket.messageTypeIdShort == '200') {
    return this.reply200(sourcePacket, responseCode);
  } else if (sourcePacket.messageTypeIdShort == '420') {
    return this.reply420(sourcePacket, responseCode);
  } else {
    return null;
  }
};

// Echo packet reply
fisCertificationBank.prototype.reply800 = function(sourcePacket, responseCode) {
  p = new iso8583Packet(sourcePacket.fields);
  var now = moment(new Date());

  if (!responseCode) responseCode = 0;

  p.setFields({
    0: sourcePacket.messageTypeVersion + '810',
    7:  now.format("MMDDHHmmss"),
    39: responseCode
  });

  return p;
};

// Purchase packet reply
fisCertificationBank.prototype.reply200 = function(sourcePacket, responseCode) {
  p = new iso8583Packet(sourcePacket.fields);
  var now = moment(new Date());

  if (!responseCode) responseCode = 0;
  var tr = 0;
  var amount = sourcePacket.getField(4);
  var pan = this.getPan(sourcePacket.getField(2));
  var proc_code = sourcePacket.getField(3);

  if (sourcePacket.hasErrors()) {
    responseCode = 96;
  } else {
    // Magic processing codes allow us to set starting SNAP and Cash balances for test cards. This way django runs the show
    if (proc_code == 909909) {
        this.setSnapBalance(pan, amount);
    } else if (proc_code == 909901) {
        this.setCashBalance(pan, amount);
      // repurpose processing code field if we want to override in testing. Skip purchase logic in this case
    } else if (sourcePacket.fields.hasOwnProperty(39)){
      responseCode = sourcePacket.getField(39);
    } else {
      if (pan && amount) {
        var account = this.getAccount(pan);
        if (!account) this.addAccount(pan, startAmount);

        var result;

        if (proc_code == 9600) {
          result = this.purchaseCash(pan, amount);
        } else if (proc_code == 9800) {
          result = this.purchaseSnap(pan, amount);
        } else if (proc_code == 209600) {
          result = this.purchaseCash(pan, -amount); // use negative amount for refund
        } else if (proc_code == 209800) {
          result = this.purchaseSnap(pan, -amount); // use negative amount for refund
        } else {
          result = -3;
        }

        if (result > 0) {
          tr = this.addTransaction(p);
        } else if (result == -1) {
          responseCode = 125;
        } else if (result == -2) {
          responseCode = 6;
        } else if (result == -2) {
          responseCode = 116;
        } else {
          responseCode = 5;
        }
      } else {
        responseCode = 5;
      }
    }
  }

  p.setFields({
    0: sourcePacket.messageTypeVersion + '210',
    7:  now.format("MMDDHHmmss"),
    39: responseCode,
    54: responseCode == 0 ? this.getFormattedBalanceInfo(pan) : '',
  });

  return p;
};


// Reversal packet reply
fisCertificationBank.prototype.reply420 = function(sourcePacket, responseCode) {
  p = new iso8583Packet(sourcePacket.fields);
  var now = moment(new Date());

  if (!responseCode) responseCode = 0;
  var tr = 0;
  var amount = sourcePacket.getField(4);
  var pan = this.getPan(sourcePacket.getField(2));
  var proc_code = sourcePacket.getField(3);

  if (sourcePacket.hasErrors()) {
    responseCode = 96;
  } else {
    if (pan && amount) {
      var account = this.getAccount(pan);
      if (!account) this.addAccount(pan, startAmount, startAmount);

      var result;

      if (proc_code == 9600) {
        result = this.purchaseCash(pan, -amount); // use negative amount for refund
      } else if (proc_code == 9800) {
        result = this.purchaseSnap(pan, -amount); // use negative amount for refund
      } else if (proc_code == 209600) {
        result = this.purchaseCash(pan, amount);
      } else if (proc_code == 209800) {
        result = this.purchaseSnap(pan, amount);
      } else {
        result = -3;
      }

      if (result > 0) {
        tr = this.addTransaction(p);
      } else if (result == -1) {
        responseCode = 125;
      } else if (result == -2) {
        responseCode = 6;
      } else if (result == -2) {
        responseCode = 116;
      } else {
        responseCode = 5;
      }
    } else {
      responseCode = 5;
    }
  }

  p.setFields({
    0: sourcePacket.messageTypeVersion + '430',
    7:  now.format("MMDDHHmmss"),
    39: responseCode,
    54: responseCode == 0 ? this.getFormattedBalanceInfo(pan) : '',
  });

  return p;
};

// Creates new transaction
fisCertificationBank.prototype.addTransaction = function(p) {
  var now = moment(new Date());

  var transaction = {
    created_at: now,
    pan: p.getField(2),
    stan: p.getField(11),
    type: p.messageTypeIdShort,
    processing_code: p.getField(3),
    amount: p.getField(4),
  };

  this.transactions.push(transaction);

  return transaction;
};

// Reverse the transaction
fisCertificationBank.prototype.reverseTransaction = function(p) {
  if (this.transactions.hasOwnProperty(p.getField(37)) && this.transactions[p.getField(37)]['pan'] == p.getField(2)) {
    var tr = {}
    var str = this.transactions[p.getField(37)];
    for (var name in str) tr[name] = str[name];

    delete this.transactions[p.getField(37)];

    return tr;
  } else {
    return false;
  }
};

// Generates transaction rrn
fisCertificationBank.prototype.genRrn = function() {
  return helpers.randomString(12, 1);
};

// Generates transaction approval code
fisCertificationBank.prototype.genAc = function() {
  return helpers.randomString(6);
};

// Gets pan from track data
fisCertificationBank.prototype.getPan = function(data) {
  var regex = /^([0-9]+)/;

  if (typeof data != 'string') data = data.toString();

  var found = data && data.match(regex);

  if (found) {
    return parseInt(found[1]);
  } else {
    return null;
  }
};

// Checks if bank account exists
fisCertificationBank.prototype.getAccount = function(pan) {
  if (!this.accounts.hasOwnProperty(pan)) return false;

  return this.accounts[pan];
};

// Creates new account
fisCertificationBank.prototype.addAccount = function(pan, snap_amount, cash_amount) {
  if (!amount) balance = 0;
  this.accounts[pan] = {snap_balance: snap_amount, cash_balance: cash_amount, pan: pan};
};

// Checks account balance
fisCertificationBank.prototype.getSnapBalance = function(pan) {
  var acct = this.getAccount(pan);
  if (!acct) return false;

  return acct.snap_balance;
};

fisCertificationBank.prototype.getCashBalance = function(pan) {
  var acct = this.getAccount(pan);
  if (!acct) return false;

  return acct.cash_balance;
};

fisCertificationBank.prototype.getFormattedBalanceInfo = function(pan) {
  snap_balance = this.getSnapBalance(pan);
  cash_balance = this.getCashBalance(pan);

  cash_info = '9602840C' + ("00000000000000000000000000000000" + cash_balance.toString()).slice(-12);
  snap_info = '9802840C' + ("00000000000000000000000000000000" + snap_balance.toString()).slice(-12);
  full_info = cash_info + snap_info;

  return full_info;
};

// Purchase operation
fisCertificationBank.prototype.purchaseSnap = function(pan, amount) {
  var acct = this.getAccount(pan);
  if (!acct) return -1;
  if (acct.snap_balance - amount < 0) return -2;

  this.setSnapBalance(pan, acct.snap_balance - amount);
  return true;
};

fisCertificationBank.prototype.purchaseCash = function(pan, amount) {
  var acct = this.getAccount(pan);
  if (!acct) return -1;
  if (acct.cash_balance - amount < 0) return -2;

  this.setCashBalance(pan, acct.cash_balance - amount);
  return true;
};

// Sets account balance
fisCertificationBank.prototype.setSnapBalance = function(pan, amount) {
  var account = this.getAccount(pan);
  if (!account) {
    this.addAccount(pan, amount, amount);
  } else {
    this.accounts[pan]['snap_balance'] = amount;
  }
};

fisCertificationBank.prototype.setCashBalance = function(pan, amount) {
  var account = this.getAccount(pan);
  if (!account) {
    this.addAccount(pan, amount, amount);
  } else {
    this.accounts[pan]['cash_balance'] = amount;
  }
};


// Adds funds to account balance
fisCertificationBank.prototype.addSnapAmount = function(pan, amount) {
  var acct = this.getAccount(pan);
  if (!acct) return false;

  this.setSnapBalance(pan, acct['snap_balance'] + amount);
};

fisCertificationBank.prototype.addCashAmount = function(pan, amount) {
  var acct = this.getAccount(pan);
  if (!acct) return false;

  this.setCashBalance(pan, acct['cash_balance'] + amount);
};

module.exports = fisCertificationBank;
