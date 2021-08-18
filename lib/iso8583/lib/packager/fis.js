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
  expirationLimitSeconds: 60,

  // The following errors should be treated as system or critical
  sysErrors: [],

  // The values of the following fields should be padded automatically
  padFields: [0, 11],

  // Reference of obligatory fields for different MTIs
  obligatoryFields: {
    '0800': [0, 1, 7, 11, 70],
    '0810': [0, 1, 7, 11, 39, 70],
    '0200': [0, 2, 3, 4, 7, 11, 12, 13, 18, 22, 32, 37, 41, 42, 43, 48, 49, 58],
    '0210': [0, 2, 3, 4, 7, 11, 12, 13, 15, 18, 22, 32, 37, 39, 41, 42, 43, 48, 49, 58],
    '0420': [0, 2, 3, 4, 7, 11, 12, 13, 18, 22, 32, 37, 39, 41, 42, 43, 48, 49, 58, 90],
    '0430': [0, 2, 3, 4, 7, 11, 12, 13, 15, 18, 22, 32, 37, 39, 49, 90],
  },

  cardDataInputModes: {
    '00' : 'Unspecified',
    '01' : 'Manual (key entry)',
    '02' : 'Magnetic stripe (prior to 2007)',
    '03' : 'Bar code',
    '04' : 'Magnetic stripe (after 2007)',
    '05' : 'ICC (Integrated Circuit Card)',
    '06' : 'Account Data on File',
    '70' : 'Information not from card',
    '90' : 'Full and unaltered contents of Track II data',
  },

  cardholderAuthMethods: {
    0 : 'Unspecified',
    1 : 'PIN entry',
    2 : 'No PIN entry capability',
    3 : 'Online PIN',
    4 : 'Offline PIN in clear',
    5 : 'Offline PIN encrypted',
    6 : 'PIN pad inoperative',
    7 : 'Offline biometrics',
    8 : 'Other offline verifications (passport, DL, etc)',
    9 : 'Offline biographic',
  },

  // System error messages reference by code
  errors: {
    'A1' : 'Invalid Voucher ID',
    'A2' : 'Invalid authorization number (approval code does not match voice approval code)',
    'A3' : 'Amount greater than original voice authorization',
    'A4' : 'Original voice authorization not found for cardholder',
    'A5' : 'FNS number does not match original voice authorization',
    'A6' : 'Item already cleared',
    '00' : 'Approved',
    '02' : 'Bad FNS status for merchant',
    '03' : 'Invalid merchant',
    '05' : 'General denial',
    '06' : 'Invalid transaction',
    '10' : 'Partial approval',
    '12' : 'Invalid transaction type',
    '13' : 'Invalid amount field',
    '14' : 'Invalid card number',
    '19' : 'Re-enter transaction',
    '23' : 'Unacceptable transaction fee',
    '30' : 'Format error',
    '31' : 'Card has invalid ISO prefix',
    '40' : 'Function not available',
    '41' : 'Lost Card',
    '42' : 'No account',
    '43' : 'Lost/stolen card',
    '51' : 'Insufficient funds',
    '52' : 'No account on file',
    '54' : 'Expired card',
    '55' : 'Invalid PIN or PIN not selected',
    '56' : 'Card number not found',
    '57' : 'Transaction not permitted to cardholder',
    '58' : 'Invalid transaction',
    '59' : 'Fraud (return card)',
    '61' : 'Return exceeds benefit authorization',
    '62' : 'Restricted card',
    '75' : 'PIN tries exceeded',
    '76' : 'Key synchronization error',
    '80' : 'Voucher expired',
    '86' : 'Invalid security code',
    '89' : 'Card verification value (CVV) Verification failed - No pick up',
    '90' : 'Processor not logged on',
    '91' : 'Authorizer not available (time-out)',
    '92' : 'Transaction destination cannot be found for routing',
    '96' : 'System malfunction',
    'S5' : 'PIN not selected',
    'S6' : 'PIN already selected',
    'S7' : 'Unmatched voucher information',
    'FF' : 'Invalid HIP Amount',
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
  '7': {
    length: 10,
    name:   'Transmission Date and Time',
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
    length: 6,
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
    length: 4,
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
  '17': {
    length: 4,
    name:   'Date, Capture',
    type:   'n',
    alias:  ''
  },
  '18': {
    length: 4,
    name:   'Merchant Type',
    type:   'n',
    alias:  ''
  },
  '22': {
    length: 3,
    name:   'POS Entry Mode',
    type:   'n',
    alias:  ''
  },
  '23': {
    length: 3,
    name:   'Card Sequence Number',
    type:   'n',
    alias:  ''
  },
  '26': {
    length: 2,
    name:   'POS PIN Capture Code',
    type:   'n',
    alias:  ''
  },
  '28': {
    length: 8,
    name:   'Amount, Transaction Fee',
    type:   'xn',
    alias:  ''
  },
  '30': {
    length: 8,
    name:   'Amount, Transaction Processing Fee',
    type:   'xn',
    alias:  ''
  },
  '32': {
    length: 11,
    name:   'Acquiring Institution Idententification Code',
    type:   'll-n',
    alias:  ''
  },
  '33': {
    length: 11,
    name:   'Forwarding Institution Idententification Code',
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
    name:   'Authorization Identification Response',
    type:   'ans',
    alias:  ''
  },
  '39': {
    length: 2,
    name:   'Response code',
    type:   'ans',
    alias:  ''
  },
  '41': {
    length: 8,
    name:   'Card Acceptor Terminal Identification',
    type:   'ans',
    alias:  'terminalId'
  },
  '42': {
    length: 15,
    name:   'Merchant Id',
    type:   'ans',
    alias:  ''
  },
  '43': {
    length: 49,
    name:   'Merchant Location',
    type:   'ans',
    alias:  ''
  },
  '44': {
    length: 25,
    name:   'Additional Response Data',
    type:   'll-an',
    alias:  ''
  },
  '48': {
    length: 100,
    name:   'Merchant Name',
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
    length: 16,
    name:   'Personal Identification Number Data',
    type:   'ans',
    alias:  ''
  },
  '54': {
    length: 120,
    name:   'Additional amounts',
    type:   'll-an',
    alias:  ''
  },
  '57': {
    length: 100,
    name:   'Authorization Life Cycle',
    type:   'll-an',
    alias:  '',
  },
  '58': {
    length: 100,
    name:   'National POS Condition Code',
    type:   'll-an',
    alias:  '',
  },
  '59': {
    length: 100,
    name:   'National POS Geographic Data',
    type:   'll-an',
    alias:  '',
  },
  '60': {
    length: 100,
    name:   'Advice/Reversal Reason Code',
    type:   'll-an',
    alias:  '',
  },
  '66': {
    length:  1,
    name:   'Settlement Code',
    type:   'n',
    alias:  ''
  },
  '70': {
    length: 3,
    name:   'Network Management Information Code',
    type:   'n',
    alias:  ''
  },
  '74': {
    length: 10,
    name:   'Credits, Number',
    type:   'n',
    alias:  ''
  },
  '75': {
    length: 10,
    name:   'Credits, Reversal Number',
    type:   'n',
    alias:  ''
  },
  '76': {
    length: 10,
    name:   'Debits, Number',
    type:   'n',
    alias:  ''
  },
  '77': {
    length: 10,
    name:   'Debits, Reversal Number',
    type:   'n',
    alias:  ''
  },
  '80': {
    length: 10,
    name:   'Inquiry, Number',
    type:   'n',
    alias:  ''
  },
  '81': {
    length: 10,
    name:   'Authorization, Number',
    type:   'n',
    alias:  ''
  },
  '83': {
    length: 12,
    name:   'Credits, Transaction Fee Amount',
    type:   'n',
    alias:  ''
  },
  '84': {
    length: 12,
    name:   'Debits, Processing Fee Amount',
    type:   'n',
    alias:  ''
  },
  '85': {
    length: 12,
    name:   'Debits, Transaction Fee Amount',
    type:   'n',
    alias:  ''
  },
  '86': {
    length: 16,
    name:   'Credits, Amount',
    type:   'n',
    alias:  ''
  },
  '87': {
    length: 16,
    name:   'Credits, Reversal Amount',
    type:   'n',
    alias:  ''
  },
  '88': {
    length: 16,
    name:   'Debits, Amount',
    type:   'n',
    alias:  ''
  },
  '89': {
    length: 16,
    name:   'Debits, Reversal Amount',
    type:   'n',
    alias:  ''
  },
  '90': {
    length: 42,
    name:   'Original Data Elements',
    type:   'n',
    alias:  ''
  },
  '95': {
    length: 42,
    name:   'Replacement Amounts',
    type:   'n',
    alias:  ''
  },
  '96': {
    length: 8,
    name:   'Message Security Code',
    type:   'ans',
    alias:  ''
  },
  '97': {
    length: 16,
    name:   'Amount Net Settlement',
    type:   'xn',
    alias:  ''
  },
  '99': {
    length: 11,
    name:   'Settlement Institution Identification Code',
    type:   'll-an',
    alias:  '',
  },
  '111': {
    length: 255,
    name:   'Additional Data, Private Acquirer',
    type:   'll-an',
    alias:  '',
  },
  '113': {
    length: 100,
    name:   'Authorizing Agent Institution ID Code',
    type:   'll-an',
    alias:  '',
  },
  '124': {
    length: 255,
    name:   'Info, Text',
    type:   'll-an',
    alias:  '',
  },
  '125': {
    length: 999,
    name:   'Network Management Information',
    type:   'll-an',
    alias:  '',
  },
  '126': {
    length: 999,
    name:   'Issuer Trace Data',
    type:   'll-an',
    alias:  '',
  },
  '127': {
    length: 999,
    name:   'Acquirer Trace Data',
    type:   'll-an',
    alias:  '',
  },
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

  // This method is triggered for every packet before it is being packed
  beforePack: function(data) {
    return data;
  },
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
