exports.format = {
  '0': {
    length: 4,
    name:   'Message Type Indicator',
    type:   'fixed-n',
    alias:  ''
  },
  '1': {
    length: 8,
    name:   'Bitmap',
    type:   'fixed-b',
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
    type:   'fixed-n',
    alias:  ''
  },
  '4': {
    length: 12,
    name:   'Amount, Transaction',
    type:   'fixed-n',
    alias:  ''
  },
  '5': {
    length: 12,
    name:   'Amount, Settlement',
    type:   'fixed-n',
    alias:  ''
  },
  '6': {
    length: 12,
    name:   'Amount, Cardholder Billing',
    type:   'fixed-n',
    alias:  ''
  },
  '7': {
    length: 10,
    name:   'Transmission Date and Time',
    type:   'fixed-n',
    alias:  ''
  },
  '8': {
    length: 8,
    name:   'Amount, Cardholder Billing Fee',
    type:   'fixed-n',
    alias:  ''
  },
  '9': {
    length: 8,
    name:   'Conversion Rate, Settlement',
    type:   'fixed-n',
    alias:  ''
  },
  '10': {
    length: 8,
    name:   'Conversion Rate, Cardholder Billing',
    type:   'fixed-n',
    alias:  ''
  },
  '11': {
    length: 6,
    name:   'System Trace Audit Number',
    type:   'fixed-n',
    alias:  'stan'
  },
  '12': {
    length: 12,
    name:   'Time, Local Transaction',
    type:   'fixed-n',
    alias:  ''
  },
  '13': {
    length: 4,
    name:   'Date, Local Transaction',
    type:   'fixed-n',
    alias:  ''
  },
  '14': {
    length: 6,
    name:   'Date, Expiration',
    type:   'fixed-n',
    alias:  ''
  },
  '15': {
    length: 4,
    name:   'Date, Settlement',
    type:   'fixed-n',
    alias:  ''
  },
  '22': {
    length: 3,
    name:   'Pos Entry Mode',
    type:   'fixed-n',
    alias:  ''
  },
  '24': {
    length: 3,
    name:   'Function Code',
    type:   'fixed-n',
    alias:  ''
  },
  '25': {
    length: 2,
    name:   'Pos Condition Code',
    type:   'fixed-n',
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
    type:   'll-char',
    alias:  ''
  },
  '37': {
    length: 12,
    name:   'Retrieval Reference Number',
    type:   'fixed-char',
    alias:  ''
  },
  '38': {
    length: 6,
    name:   'Approval code',
    type:   'fixed-char',
    alias:  ''
  },
  '39': {
    length: 3,
    name:   'Response code',
    type:   'fixed-n',
    alias:  ''
  },
  '41': {
    length: 8,
    name:   'Card Acceptor Terminal Identification',
    type:   'fixed-n',
    alias:  'tarminalId'
  },
  '42': {
    length: 15,
    name:   'Merchant Id',
    type:   'fixed-n',
    alias:  ''
  },
  '46': {
    length: 999,
    name:   'Amount, Fees',
    type:   'll-char',
    alias:  ''
  },
  '49': {
    length: 3,
    name:   'Currency code, transaction',
    type:   'fixed-n',
    alias:  ''
  }, 
  '54': {
    length: 120,
    name:   'Additional amounts',
    type:   'll-char',
    alias:  ''
  },
  '55': {
    length: 255,
    name:   'EMV Data',
    type:   'll-bin-char',
    alias:  ''
  },
  '62': {
    length: 999,
    name:   'Customer Defined Response',
    type:   'll-char',
    alias:  ''
  },
  '64': {
    length:  8,
    name:   'Primary MAC Data',
    type:   'fixed-char',
    alias:  ''
  },
  '70': {
    length: 3,
    name:   'Network Management Information Code',
    type:   'fixed-n',
    alias:  ''
  }
}