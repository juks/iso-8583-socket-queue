exports.format = {
  '0': {
    length: 4,
    name:   'Message Type Indicator',
    type:   'n',
    alias:  ''
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
    type:   'lln',
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
    type:   'lln',
    alias:  ''
  },
  '35': {
    length: 37,
    name:   'Track 2 Data',
    type:   'llan',
    alias:  ''
  },
  '37': {
    length: 12,
    name:   'Retrieval Reference Number',
    type:   'an',
    alias:  ''
  },
  '38': {
    length: 6,
    name:   'Approval code',
    type:   'an',
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
    type:   'lllan',
    alias:  ''
  },
  '49': {
    length: 3,
    name:   'Currency code, transaction',
    type:   'n',
    alias:  ''
  }, 
  '54': {
    length: 120,
    name:   'Additional amounts',
    type:   'lllan',
    alias:  ''
  },
  '55': {
    length: 255,
    name:   'EMV Data',
    type:   'lll-bin-an',
    alias:  ''
  },
  '62': {
    length: 999,
    name:   'Customer Defined Response',
    type:   'lllan',
    alias:  ''
  },
  '64': {
    length:  8,
    name:   'Primary MAC Data',
    type:   'an',
    alias:  ''
  },
  '70': {
    length: 3,
    name:   'Network Management Information Code',
    type:   'n',
    alias:  ''
  }
}