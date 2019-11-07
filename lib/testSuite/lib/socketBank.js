var helpers = require("../../../lib/helpers");
var iso8583Packet = require('../../../lib/iso8583-packet');
var moment = require("moment");

var startAmount = 100000;

function testBank() {
  this.transactions = {};
  this.accounts = {};
}

// Return reply packet
testBank.prototype.replyPacket = function(sourcePacket, responseCode) {
  if (!responseCode) responseCode = 0;

  if (sourcePacket.messageTypeIdShort == '800') {
    return this.reply800(sourcePacket, responseCode);
  } else if (sourcePacket.messageTypeIdShort == '200') {
    return this.reply200(sourcePacket, responseCode);
  } else if (sourcePacket.messageTypeIdShort == '400') {
    return this.reply400(sourcePacket, responseCode);
  } else {
    return null;
  }
};

// Echo packet reply
testBank.prototype.reply800 = function(sourcePacket, responseCode) {
  p = new iso8583Packet(sourcePacket.fields);
  var now = moment(new Date());

  if (!responseCode) responseCode = 0;

  p.setFields({
    0: sourcePacket.messageTypeVersion + '810',
    7:  now.format("MMDDHHmmss"),
    37: this.genRrn(),
    39: responseCode
  });

  p.unsetFields([24, 42]);

  return p;
};

// Purchase packet reply
testBank.prototype.reply200 = function(sourcePacket, responseCode) {
  p = new iso8583Packet(sourcePacket.fields);
  var now = moment(new Date());

  if (!responseCode) responseCode = 0;
  var tr = 0;
  var amount = sourcePacket.getField(4);
  var pan = this.getPan(sourcePacket.getField(35));

  var ending = amount.toString().slice(-3);

  if (sourcePacket.hasErrors()) {
    responseCode = '120';
  } else {
    // Magic amount that starts with YYY777 gives us an option to get the YYY SV error
    if (!responseCode && ending == '777') {
      var errCode = parseInt(amount.toString().substring(0, amount.toString().length - 3));
      if (sourcePacket.isValidError(errCode)) {
        responseCode = errCode;
      }
      // Magic amount that starts with YYY888 gives an option set the account amount
    } else if (!responseCode && ending == '888') {
      this.setBalance(pan, parseInt(amount.toString().substring(0, amount.toString().length - 3)));
    } else {
      if (pan && amount) {
        var account = this.getAccount(pan);
        if (!account) this.addAccount(pan, startAmount);

        var result = this.purchase(pan, amount);

        if (result > 0) {
          p.setFields({2: pan});
          tr = this.addTransaction(p);
        } else if (result == -1) {
          responseCode = 125;
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
    39: responseCode
  });

  if (tr) p.setFields({
              37: tr.rrn,
              38: tr.ac
            });

  return p;
};


// Reversal packet reply
testBank.prototype.reply400 = function(sourcePacket, responseCode) {
  p = new iso8583Packet(sourcePacket.fields);
  var now = moment(new Date());

  if (!responseCode) responseCode = 0;

  if (sourcePacket.hasErrors()) {
    responseCode = '120';
  } else {
    tr = this.reverseTransaction(p);
    if (!tr) {
      responseCode = 914;
    } else {
      var amount = tr['amount'];
      var pan = tr['pan'];

      this.addAmount(pan, amount);
    }

  }

  p.setFields({
    0: sourcePacket.messageTypeVersion + '410',
    7: now.format("MMDDHHmmss"),
    39: responseCode
  });

  return p;
};

// Creates new transaction
testBank.prototype.addTransaction = function(p) {
  var now = moment(new Date());

  var transaction = {
    created_at: new Date().getTime(),
    rrn: this.genRrn(),
    ac: this.genAc(),
    pan: p.getField(2),
    amount: p.getField(4)
  };

  this.transactions[transaction.rrn] = transaction;

  return transaction;
};

// Reverse the transaction
testBank.prototype.reverseTransaction = function(p) {
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
testBank.prototype.genRrn = function() {
  return helpers.randomString(12, 1);
};

// Generates transaction approval code
testBank.prototype.genAc = function() {
  return helpers.randomString(6);
};

// Gets pan from track data
testBank.prototype.getPan = function(data) {
  var regex = /^([0-9]+)/;

  if (typeof data != 'string') data = data.toString();

  var found = data && data.match(regex);

  if (found) {
    return parseInt(found[1]);
  } else {
    return null;
  }
};

// Accounts stuff
function bankAccount() {
  this.accounts = {};
}

// Checks if bank account exists
testBank.prototype.getAccount = function(pan) {
  if (!this.accounts.hasOwnProperty(pan)) return false;

  return this.accounts[pan];
};

// Creates new account
testBank.prototype.addAccount = function(pan, amount) {
  if (!amount) balance = 0;
  this.accounts[pan] = {balance: amount, pan: pan};
};

// Checks account balance
testBank.prototype.getBalance = function(pan) {
  var acct = this.getAccount(pan);
  if (!acct) return false;

  return acct.amount;
};

// Purchase operation
testBank.prototype.purchase = function(pan, amount) {
  var acct = this.getAccount(pan);
  if (!acct) return -1;
  if (acct.balance - amount < 0) return -2;

  this.setBalance(pan, acct.balance - amount);
  return true;
};

// Sets account balance
testBank.prototype.setBalance = function(pan, amount) {
  if (!this.getAccount(pan)) return false;

  this.accounts[pan]['balance'] = amount;
};

// Adds funds to account balance
testBank.prototype.addAmount = function(pan, amount) {
  var acct = this.getAccount(pan);
  if (!acct) return false;

  this.setBalance(pan, acct['balance'] + amount);
};

module.exports = testBank;
