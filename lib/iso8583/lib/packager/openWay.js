//
// This is NOT an universal solution for given system type. Some parameters or their representation may
// appear different on different system installations/configurations. You might need to tweak and modify this file
// to fit the exact system you try to talk to.
//

exports.options = {
  // Packets older than given amount of time will be treated as outdated. This is to prevent some virtualization systems freeze problems
  expirationLimitSeconds: 30,

  // TODO: missing data to be researched
  // The following errors should be treated as system or critical
  sysErrors: [],

  // The values of the following fields should be padded automatically
  padFields: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 40, 49, 50, 51, 53, 57],

  // Reference of obligatory fields for different MTIs
  obligatoryFields: {
    '0800': [0, 1, 3, 7, 11, 41, 63]
  },

  // TODO: missing data to be researched
  cardDataInputModes: {
  },

  // TODO: missing data to be researched
  cardholderAuthMethods: {
  },

  // System error messages reference by code
  errors: {
    '00': 'Approved',
    '01': 'Refer to card issuer',
    '02': 'Refer to card issuer\'s special condition',
    '03': 'Invalid merchant or service provider',
    '04': 'Pick up card',
    '05': 'Do not honor',
    '06': 'Error',
    '07': 'Pick up card, special condition',
    '08': 'Honour with identification',
    '09': 'Request in progress',
    '10': 'Approved for partial amount',
    '11': 'Approved (VIP)',
    '12': 'Invalid transaction',
    '13': 'Invalid amount',
    '14': 'No such card',
    '15': 'No such issuer',
    '16': 'Approved, update track 3',
    '17': 'Customer cancellation',
    '18': 'Customer dispute',
    '19': 'Re-enter transaction',
    '20': 'Invalid response',
    '21': 'No action taken',
    '22': 'Suspected malfunction',
    '23': 'Unacceptable transaction fee',
    '24': 'File update not supported by receiver',
    '25': 'No such record',
    '26': 'Duplicate record update, old record replaced',
    '27': 'File update field edit error',
    '28': 'File locked out while update',
    '29': 'File update error, contact acquirer',
    '30': 'Format error',
    '31': 'Issuer signed-off',
    '32': 'Completed partially',
    '33': 'Expired card',
    '34': 'Suspect Fraud',
    '35': 'Pick-up, card acceptor contact acquirer',
    '36': 'Pick up, card restricted',
    '37': 'Pick up, call acquirer',
    '38': 'Pick up, Allowable PIN tries exceed',
    '39': 'No credit account (Visa ePay)',
    '40': 'Requested function not supported',
    '41': 'Pick up, lost card',
    '42': 'No universal account',
    '43': 'Pick up, stolen card',
    '44': 'No investment account',
    '45': 'Reserved for ISO use',
    '46': 'Reserved for ISO use2',
    '47': 'Reserved for ISO use3',
    '48': 'Reserved for ISO use4',
    '49': 'Reserved for ISO use5',
    '50': 'Do not renew',
    '51': 'Not sufficient funds',
    '52': 'No checking account',
    '53': 'No savings account',
    '54': 'Expired Card',
    '55': 'Incorrect PIN',
    '56': 'No card record',
    '57': 'Not permitted to client',
    '58': 'Not permitted to POS',
    '59': 'Suspected fraud',
    '60': 'Card acceptor contact acquirer',
    '61': 'Exceeds amount limit',
    '62': 'Restricted card',
    '63': 'Security violation',
    '64': 'Wrong original amount',
    '65': 'Exceeds frequency limit',
    '66': 'Acceptor call acquirer',
    '67': 'Card to be picked up at ATM',
    '68': 'Response received too late',
    '69': 'Reserved',
    '70': 'Invalid transaction; contact card issuer',
    '71': 'Decline PIN not changed',
    '72': 'Reserved2',
    '73': 'Reserved3',
    '74': 'Reserved4',
    '75': 'PIN tries exceeded',
    '76': 'Wrong PIN, tries exceeded',
    '77': 'Wrong Reference No.',
    '78': 'Record Not Found',
    '79': 'Already reversed',
    '80': 'Network error',
    '81': 'Foreign network error',
    '82': 'Time-out at issuer',
    '83': 'Transaction failed',
    '84': 'Pre-authorization timed out',
    '85': 'No reason to decline',
    '86': 'Unable to verify PIN',
    '87': 'Purchase Approval Only',
    '88': 'Cryptographic failure',
    '89': 'Authentication failure',
    '90': 'Cutoff is in progress',
    '91': 'Issuer unavailable',
    '92': 'Router unavailable',
    '93': 'Transaction cannot be completed',
    '94': 'Duplicate Transmission',
    '95': 'Reconcile error / Auth Not found',
    '96': 'System malfunction'
  }
};

exports.format = {
  '0': {
    length: 2,
    name:   'Message Type Indicator',
    type:   'b',
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
    type:   'b',
    alias:  ''
  },
  '2': {
    length: 19,
    name:   'Primary Account Number',
    type:   'll-bin-hn',
    alias:  ''
  },
  '3': { 
    length: 3,
    name:   'Processing Code',
    type:   'b',
    alias:  ''
  },
  '4': {
    length: 6,
    name:   'Amount, Transaction',
    type:   'b',
    alias:  ''
  },
  '5': {
    length: 6,
    name:   'Amount, Settlement',
    type:   'b',
    alias:  ''
  },
  '6': {
    length: 6,
    name:   'Amount, Cardholder Billing',
    type:   'b',
    alias:  ''
  },
  '7': {
    length: 5,
    name:   'Transmission Date and Time',
    type:   'b',
    alias:  ''
  },
  '8': {
    length: 4,
    name:   'Amount, Cardholder Billing Fee',
    type:   'b',
    alias:  ''
  },
  '9': {
    length: 4,
    name:   'Conversion Rate, Settlement',
    type:   'b',
    alias:  ''
  },
  '10': {
    length: 4,
    name:   'Conversion Rate, Cardholder Billing',
    type:   'b',
    alias:  ''
  },
  '11': {
    length: 3,
    name:   'System Trace Audit Number',
    type:   'b',
    alias:  ''
  },
  '12': {
    length: 3,
    name:   'Processing Time',
    type:   'bn',
    alias:  ''
  },
  '13': {
    length: 2,
    name:   'Processing Date',
    type:   'b',
    alias:  ''
  },
  '14': {
    length: 2,
    name:   'Date, Expiration',
    type:   'b',
    alias:  ''
  },
  '15': {
    length: 3,
    name:   'Date, Settlement',
    type:   'b',
    alias:  ''
  },
  '16': {
    length: 2,
    name:   'Conversion',
    type:   'b',
    alias:  ''
  },
  '17': {
    length: 2,
    name:   'Date, Capture',
    type:   'b',
    alias:  ''
  },
  '18': {
    length: 2,
    name:   'Merchant Category Code',
    type:   'b',
    alias:  ''
  },
  '19': {
    length: 2,
    name:   'Acquirer Institution Country Code',
    type:   'b',
    alias:  ''
  },
  '20': {
    length: 2,
    name:   'PAN. Country Code',
    type:   'b',
    alias:  ''
  },
  '21': {
    length: 2,
    name:   'Forwarding Country Code',
    type:   'b',
    alias:  ''
  },
  '22': {
    length: 2,
    name:   'POS Entry Mode',
    type:   'b',
    alias:  ''
  },
  '23': {
    length: 2,
    name:   'Card Sequence Number',
    type:   'b',
    alias:  ''
  },
  '24': {
    length: 2,
    name:   'Function Code',
    type:   'b',
    alias:  ''
  },
  '25': {
    length: 1,
    name:   'Pos Condition Code',
    type:   'b',
    alias:  ''
  },
  '26': {
    length: 1,
    name:   'PIN Capture Code',
    type:   'b',
    alias:  ''
  },
  '27': {
    length: 1,
    name:   'Authorisation Identification Response length',
    type:   'b',
    alias:  ''
  },
  '28': {
    length: 9,
    name:   'Amount Transaction Fee',
    type:   'ans',
    alias:  ''
  },
  '29': {
    length: 2,
    name:   'Reconciliation Indicator',
    type:   'b',
    alias:  ''
  },
  '30': {
    length: 12,
    name:   'Amounts Original',
    type:   'b',
    alias:  ''
  },
  '31': {
    length: 999,
    name:   'Security Additional Data – private',
    type:   'll-bin-char',
    alias:  ''
  },
  '32': {
    length: 11,
    name:   'Acquiring Institution ID',
    type:   'll-n',
    alias:  ''
  },
  '33': {
    length: 11,
    name:   'Forwarding Institution ID',
    type:   'll-n',
    alias:  ''
  },
  '34': {
    length: 11,
    name:   'PAN extended',
    type:   'll-bin-char',
    alias:  ''
  },
  '35': {
    length: 37,
    name:   'Track 2 Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '36': {
    length: 104,
    name:   'Track 3 Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '37': {
    length: 12,
    name:   'Retrieval Reference Number',
    type:   'ans',
    alias:  ''
  },
  '38': {
    length: 6,
    name:   'Authorisation Identification Response',
    type:   'ans',
    alias:  ''
  },
  '39': {
    length: 2,
    name:   'Response code',
    type:   'ans',
    alias:  ''
  },
  '40': {
    length: 1,
    name:   'Service Restriction Code',
    type:   'b',
    alias:  ''
  },
  '41': {
    length: 8,
    name:   'Card Acceptor Terminal Identification',
    type:   'ans',
    alias:  ''
  },
  '42': {
    length: 15,
    name:   'Card Acceptor ID',
    type:   'ans',
    alias:  ''
  },
  '43': {
    length: 40,
    name:   'Card Acceptor Name',
    type:   'ans',
    alias:  ''
  },
  '44': {
    length: 99,
    name:   'Additional Response Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '45': {
    length: 75,
    name:   'Track-1 Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '46': {
    length: 206,
    name:   'Amount, Fees',
    type:   'll-bin-char',
    alias:  ''
  },
  '47': {
    length: 999,
    name:   'Additional Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '48': {
    length: 999,
    name:   'Additional Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '49': {
    length: 2,
    name:   'Currency code, transaction',
    type:   'b',
    alias:  ''
  },
  '50': {
    length: 2,
    name:   'Currency Code, Settlement',
    type:   'b',
    alias:  ''
  },
  '51': {
    length: 2,
    name:   'Currency Code, Cardholder billing',
    type:   'b',
    alias:  ''
  },
  '52': {
    length: 8,
    name:   'PIN Block Data',
    type:   'b',
    alias:  ''
  },
  '53': {
    length: 8,
    name:   'Security Related Control Information',
    type:   'b',
    alias:  ''
  },        
  '54': {
    length: 120,
    name:   'Additional amounts',
    type:   'll-bin-char',
    alias:  ''
  },
  '55': {
    length: 255,
    name:   'ICC Related Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '56': {
    length: 35,
    name:   'Original Data Elements',
    type:   'll-n',
    alias:  ''
  },
  '57': {
    length: 2,
    name:   'Authorisation Life Cycle Code',
    type:   'b',
    alias:  ''
  },
  '58': {
    length: 11,
    name:   'Authorizing Agent Institution ID',
    type:   'll-n',
    alias:  ''
  },
  '59': {
    length: 999,
    name:   'Additional Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '60': {
    length: 999,
    name:   'Original Data Elements',
    type:   'll-bin-char',
    alias:  ''
  },
  '61': {
    length: 255,
    name:   'Reserved',
    type:   'll-bin-char',
    alias:  ''
  },
  '62': {
    length: 999,
    name:   'Reserved',
    type:   'll-bin-char',
    alias:  ''
  },
  '63': {
    length: 999,
    name:   'Additional Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '64': {
    length: 4,
    name:   'MAC',
    type:   'b',
    alias:  ''
  }
};

exports.validators = {
  isValidMessage: function(data) {
    return data.length > 16;
  },

  // TODO: not implemented for this configuration yet
  isExpiredPacket: function(packet, expirationLimitSeconds) {
    return false;
  }
};

exports.generators = {
  getHeader: function(lengthVal) {
    var b = Buffer.from(2);

    b.writeUIntBE(lengthVal, 0, 2);

    return b;
  }
};

exports.processors = {
  splitByHeader: function(message) {
    var result = [];
    var index = 0;

    while (1) {
      var length = message.slice(index, index + 2).readUIntBE(0,2);
      if (!length) break;

      index += 2;
      result.push(message.slice(index, index + length));
      index += length;
      if (index >= message.length) break;
    }

    return result;
  },

  // This method is triggered for every packet before it is being packed
  beforePack: function(data) {
    return data;
  }
};
