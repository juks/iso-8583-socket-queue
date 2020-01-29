//
// This is NOT an universal solution for given system type. Some parameters or their representation may
// appear different on different system installations/configurations. You might need to tweak and modify this file
// to fit the exact system you try to talk to.
//

var moment  = require('moment');

exports.headerLength;
exports.lengthHeaderLength;
exports.lengthHeaderType;

exports.options = {
  // Packets older than given amount of time will be treated as outdated. This is to prevent some virtualization systems freeze problems
  expirationLimitSeconds: 30,

  // The following errors should be treated as system or critical
  sysErrors: [5, 120, 902, 903, 907, 910, 912],

  // The values of the following fields should be padded automatically
  padFields: [0, 7, 11, 12, 22, 41, 42, 49],

  // Reference of obligatory fields for different MTIs
  obligatoryFields: {
    '0800': [0, 1, 3, 7, 11, 24, 41],
    '0200': [0, 1, 3, 4, 7, 11, 12, 22, 24, 25, 41, 42, 49],
    '0400': [0, 1, 3, 4, 7, 11, 12, 22, 24, 25, 41, 42, 49]
  },
  
  cardDataInputModes: {
    '01': 'Manual',
    '06': 'Manual',
    '02': 'Magnetic stripe read',
    '05': 'Integrated circuit card read; CVV data reliable',
    '07': 'Proximity transaction originated using ICC data rules',
    '08': 'Magnetic stripe even though it is ICC capable',
    '91': 'Proximity transaction originated using magnetic stripe data rules; CVV check is possible'
  },
  
  cardholderAuthMethods: {
    0: 'Not Authenticated',
    1: 'PIN',
    2: 'Signature Based',
    6: 'Signature Based',
    9: 'Terminal accept Off-line PINs (for EMV cards)'
  },

  // System error messages reference by code
  errors: {
    '000': 'Successful Transaction',
    '001': 'Approve with ID. If transaction was Success, but MCC these is in next list  6010, 4829, 6051, 7995, 7511 – then reason code changes on 001',
    '002': 'ATM performed a partial dispense',
    '003': 'Successful Transaction',
    '005': 'System Error',
    '020': 'Successful transaction; used to indicate a negative balance in Field 4 on a Balance Inquiry',
    '095': 'Reconcile Error',
    '100': 'Do Not Honor Transaction',
    '101': 'Expired Card',
    '103': 'Call Issuer',
    '104': 'Card is Restricted',
    '105': 'Call Security',
    '106': 'Excessive Pin Failures',
    '107': 'Call Issuer',
    '109': 'Invalid Merchant ID',
    '110': 'Cannot Process Amount',
    '111': 'Invalid Account - Retry',
    '116': 'Insufficient Funds - Retry',
    '117': 'Incorrect Pin',
    '118': 'Forced Post, no Account on File',
    '119': 'Transaction Not Permitted by Law',
    '120': 'Not Permitted',
    '121': 'Withdrawal Limit Exceeded - Retry',
    '123': 'Limit Reached for Total Number of Transactions in Cycle',
    '125': 'Bad Card',
    '126': 'Pin Processing Error',
    '127': 'Pin Processing Error',
    '128': 'Pin Processing Error',
    '200': 'Invalid Сard',
    '201': 'Card Expired',
    '202': 'Invalid Card',
    '203': 'Call Security',
    '204': 'Account Restricted',
    '205': 'Call Security',
    '206': 'Invalid Pin',
    '208': 'Lost Card',
    '209': 'Stolen Card',
    '902': 'Invalid Transaction - Retry',
    '903': 'Transaction Needs to Be Entered Again',
    '904': 'The Message Received Was not Within Standards',
    '905': 'Issuing Institution is Unknown',
    '907': 'Issuer inoperative',
    '908': 'Issuing Institution is Unknown',
    '909': 'System Malfunction',
    '910': 'Issuer Inoperative',
    '911': 'SmartVista FE Has Knowledge of Any Attempt to Either Authorize or Deny the Transaction',
    '912': 'Timeout Waiting for Response',
    '913': 'Duplicate Transaction Received',
    '914': 'Could not Find the Original Transaction',
    '915': 'Amount Being Reversed is Greater than Original, or no Amount Being Reversed',
    '920': 'Pin Processing Error',
    '923': 'Request in Progress'
  }
};

exports.format = {
  '0': {
    length: 4,
    name:   'Message Type Indicator',
    type:   'n',
    alias:  ''
    /*
    To have any field-specific logic of your own executed before packing the message, use 'beforePack method

    beforePack: function(fieldValue) {
      return fieldValue;
    }*/
  },
  '1': {
    length: 8,
    name:   'Bitmap',
    type:   'bitmap',
    alias:  ''
  },
  '2': {
    length: 19,
    name:   'Primary Account Number',
    type:   'll-n',
    alias:  ''
  },
  '3': {
    length: 6,
    name:   'Processing Code',
    type:   'n',
    alias:  ''
  },
  '4': {
    length: 12,
    name:   'Amount, Transaction',
    type:   'n',
    alias:  ''
  },
  '5': {
    length: 12,
    name:   'Amount, Settlement',
    type:   'n',
    alias:  ''
  },
  '6': {
    length: 12,
    name:   'Amount, Cardholder Billing',
    type:   'n',
    alias:  ''
  },
  '7': {
    length: 10,
    name:   'Transmission Date and Time',
    type:   'n',
    alias:  ''
  },
  '8': {
    length: 8,
    name:   'Amount, Cardholder Billing Fee',
    type:   'n',
    alias:  ''
  },
  '9': {
    length: 8,
    name:   'Conversion Rate, Settlement',
    type:   'n',
    alias:  ''
  },
  '10': {
    length: 8,
    name:   'Conversion Rate, Cardholder Billing',
    type:   'n',
    alias:  ''
  },
  '11': {
    length: 6,
    name:   'System Trace Audit Number',
    type:   'n',
    alias:  'stan'
  },
  '12': {
    length: 12,
    name:   'Time, Local Transaction',
    type:   'n',
    alias:  ''
  },
  '13': {
    length: 4,
    name:   'Date, Local Transaction',
    type:   'n',
    alias:  ''
  },
  '14': {
    length: 6,
    name:   'Date, Expiration',
    type:   'n',
    alias:  ''
  },
  '15': {
    length: 4,
    name:   'Date, Settlement',
    type:   'n',
    alias:  ''
  },
  '22': {
    length: 3,
    name:   'Pos Entry Mode',
    type:   'n',
    alias:  ''
  },
  '24': {
    length: 3,
    name:   'Function Code',
    type:   'n',
    alias:  ''
  },
  '25': {
    length: 2,
    name:   'Pos Condition Code',
    type:   'n',
    alias:  ''
  },
  '32': {
    length: 11,
    name:   'Acquiring Institution Ident Code',
    type:   'll-n',
    alias:  ''
  },
  '35': {
    length: 37,
    name:   'Track 2 Data',
    type:   'll-an',
    alias:  ''
  },
  '37': {
    length: 12,
    name:   'Retrieval Reference Number',
    type:   'ans',
    alias:  '',
  },
  '38': {
    length: 6,
    name:   'Approval code',
    type:   'ans',
    alias:  ''
  },
  '39': {
    length: 3,
    name:   'Response code',
    type:   'n',
    alias:  ''
  },
  '41': {
    length: 8,
    name:   'Card Acceptor Terminal Identification',
    type:   'n',
    alias:  'tarminalId'
  },
  '42': {
    length: 15,
    name:   'Merchant Id',
    type:   'n',
    alias:  ''
  },
  '46': {
    length: 999,
    name:   'Amount, Fees',
    type:   'll-an',
    alias:  ''
  },
  '49': {
    length: 3,
    name:   'Currency code, transaction',
    type:   'n',
    alias:  ''
  },
  '52': {
    length: 8,
    name:   'Personal Identification Data',
    type:   'll-bin-an',
    alias:  ''
  },
  '54': {
    length: 120,
    name:   'Additional amounts',
    type:   'll-an',
    alias:  ''
  },
  '55': {
    length: 255,
    name:   'EMV Data',
    type:   'll-bin-an',
    alias:  '',
  },
  '62': {
    length: 999,
    name:   'Customer Defined Response',
    type:   'll-an',
    alias:  ''
  },
  '64': {
    length:  8,
    name:   'Primary MAC Data',
    type:   'ans',
    alias:  ''
  },
  '70': {
    length: 3,
    name:   'Network Management Information Code',
    type:   'n',
    alias:  ''
  }
};

exports.validators = {
  isValidMessage: function(data) {
    return data.length > 16;
  },

  isExpiredPacket: function(packet, expirationLimitSeconds) {
    // 150630200039
    // YYMMDDHHmmss
    var transactionTime = packet.getField(12);
    if (!transactionTime) return false;

    var now = moment(new Date());
    var then = moment(transactionTime, "YYMMDDHHmmss");

    var diff = now.diff(then, 'seconds');
    if (Math.abs(diff) > expirationLimitSeconds) {
      return true;
    } else {
      return false;
    }
  }
};

// Here we read header values
exports.headerReaders = {
  'default': function(message, headerType, headerIndex, headerLength) {
    return this.unpack(message, headerType, headerIndex, headerLength);
  },

  'unpack': function(message, type, index, length) {
    return require('../packer/' + type).unpack(message.slice(index, index + length), {length: length}).data;
  }
};

// Here we generate header values
exports.headerGenerators = {
  'length': function(headerValue, headerType, headerLength, context) {
    return this.pack(context.length, headerType, headerLength);
  },

  'headerLength': function(headerValue, headerType, headerLength, context) {
    return this.pack(context.headerLength, headerType, headerLength);
  },

  'default': function(headerValue, headerType, headerLength) {
    return this.pack(headerValue, headerType, headerLength);
  },

  'pack': function(value, type, length) {
    return Buffer.from(require('../packer/' + type).pack(value, {length: length}).msg);
  }
};

exports.processors = {
  splitByHeader: function(message) {
    var result = [];
    var index = 0;
    var length = 0;
    var headersData = {};

    while (1) {
      global.headerFormat.forEach(function(header) {
        if (exports.headerReaders.hasOwnProperty(header.name)) {
          headersData[header.name] = exports.headerReaders[header.name](message, header.type, index, header.length);
          index += header.length;
        } else if (exports.headerReaders.hasOwnProperty('default')) {
          headersData[header.name] = exports.headerReaders.default(message, header.type, index, header.length);
          index += header.length;
        }
      }.bind(this));

      if (!headersData['length']) break;

      result.push(message.slice(index, index + headersData['length']));
      index += headersData['length'];

      if (index >= message.length) break;
    }

    return result;
  },

  readHeaderOptions: function() {
    length = 0;

    global.headerFormat.forEach(function(header) {
      if (header.name == 'length') {
        exports.lengthHeaderType = header.type;
        exports.lengthHeaderLength = header.length;
      }

      length += header.length;
    });

    exports.headerLength = length;
  },

  getHeaderLength: function() {
    if (typeof exports.headerLength == 'undefined') {
      this.readHeaderOptions();
    }

    return exports.headerLength;
  },

  getLengthHeaderType: function() {
    if (typeof exports.lengthHeaderType == 'undefined') {
      this.readHeaderOptions();
    }

    return exports.lengthHeaderType;
  },

  getLengthHeaderLength: function() {
    if (typeof exports.lengthHeaderLength == 'undefined') {
      this.readHeaderOptions();
    }

    return exports.lengthHeaderLength;
  },

  // This method is triggered for every packet before it is being packed
  beforePack: function(data) {
    return data;
  }
};

exports.generators = {
  getHeader: function(lengthVal) {
    var result = Buffer.from('');
    var headerLength = exports.processors.getHeaderLength();

    if (global.c.lengthIncludeHeader) lengthVal += headerLength;

    var context = {length: lengthVal, headerLength: headerLength};

    global.headerFormat.forEach(function(header) {
      if (exports.headerGenerators.hasOwnProperty(header.name)) {
        val = exports.headerGenerators[header.name]('', header.type, header.length, context);
      } else if (exports.headerGenerators.hasOwnProperty('default')) {
        val = exports.headerGenerators.default(header.default, header.type, header.length, context);
      }

      result = Buffer.concat([result, val]);
    }.bind(this));

    return result;
  }
};
