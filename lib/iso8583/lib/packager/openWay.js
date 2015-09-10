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
    alias:  ''
  },
  '12': {
    length: 6,
    name:   'Processing Time',
    type:   'n',
    alias:  ''
  },
  '13': {
    length: 4,
    name:   'Processing Date',
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
    length: 6,
    name:   'Date, Settlement',
    type:   'n',
    alias:  ''
  },
  '16': {
    length: 4,
    name:   'Conversion',
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
    name:   'Merchant Category Code',
    type:   'n',
    alias:  ''
  },
  '19': {
    length: 3,
    name:   'Acquirer Institution Country Code',
    type:   'n',
    alias:  ''
  },
  '20': {
    length: 3,
    name:   'PAN. Country Code',
    type:   'n',
    alias:  ''
  },
  '21': {
    length: 3,
    name:   'Forwarding Country Code',
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
  '26': {
    length: 2,
    name:   'PIN Capture Code',
    type:   'n',
    alias:  ''
  },
  '27': {
    length: 1,
    name:   'Authorisation Identification Response length',
    type:   'n',
    alias:  ''
  },
  '28': {
    length: 9,
    name:   'Amount Transaction Fee',
    type:   'an',
    alias:  ''
  },
  '29': {
    length: 3,
    name:   'Reconciliation Indicator',
    type:   'n',
    alias:  ''
  },
  '30': {
    length: 24,
    name:   'Amounts Original',
    type:   'n',
    alias:  ''
  },
  '31': {
    length: 999,
    name:   'Security Additional Data – private',
    type:   'lllan',
    alias:  ''
  },
  '32': {
    length: 11,
    name:   'Acquiring Institution ID',
    type:   'lln',
    alias:  ''
  },
  '33': {
    length: 11,
    name:   'Forwarding Institution ID',
    type:   'lln',
    alias:  ''
  },
  '34': {
    length: 11,
    name:   'PAN extended',
    type:   'llns',
    alias:  ''
  },
  '35': {
    length: 37,
    name:   'Track 2 Data',
    type:   'llans',
    alias:  ''
  },
  '36': {
    length: 104,
    name:   'Track 3 Data',
    type:   'lllans',
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
    name:   'Authorisation Identification Response',
    type:   'anp',
    alias:  ''
  },
  '39': {
    length: 2,
    name:   'Response code',
    type:   'an',
    alias:  ''
  },
  '40': {
    length: 2,
    name:   'Service Restriction Code',
    type:   'n',
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
    type:   'llans',
    alias:  ''
  },
  '45': {
    length: 75,
    name:   'Track-1 Data',
    type:   'llans',
    alias:  ''
  },
  '46': {
    length: 206,
    name:   'Amount, Fees',
    type:   'lllans',
    alias:  ''
  },
  '47': {
    length: 999,
    name:   'Additional Data',
    type:   'lll-bin-an',
    alias:  ''
  },
  '48': {
    length: 999,
    name:   'Additional Data',
    type:   'lll-bin-an',
    alias:  ''
  },
  '49': {
    length: 3,
    name:   'Currency code, transaction',
    type:   'n',
    alias:  ''
  },
  '50': {
    length: 3,
    name:   'Currency Code, Settlement',
    type:   'n',
    alias:  ''
  },
  '51': {
    length: 3,
    name:   'Currency Code, Cardholder billing',
    type:   'n',
    alias:  ''
  },
  '52': {
    length: 8,
    name:   'PIN Block Data',
    type:   'b',
    alias:  ''
  },
  '53': {
    length: 16,
    name:   'Security Related Control Information',
    type:   'n',
    alias:  ''
  },        
  '54': {
    length: 120,
    name:   'Additional amounts',
    type:   'lllans',
    alias:  ''
  },
  '55': {
    length: 255,
    name:   'ICC Related Data',
    type:   'lll-bin-an',
    alias:  ''
  },
  '56': {
    length: 35,
    name:   'Original Data Elements',
    type:   'llvar',
    alias:  ''
  },
  '57': {
    length: 3,
    name:   'Authorisation Life Cycle Code',
    type:   'n',
    alias:  ''
  },
  '58': {
    length: 11,
    name:   'Authorizing Agent Institution ID',
    type:   'lln',
    alias:  ''
  },
  '59': {
    length: 999,
    name:   'Additional Data',
    type:   'lll-bin-an',
    alias:  ''
  },
  '60': {
    length: 999,
    name:   'Original Data Elements',
    type:   'lllans',
    alias:  ''
  },
  '61': {
    length: 255,
    name:   'Reserved',
    type:   'lllan',
    alias:  ''
  },
  '62': {
    length: 999,
    name:   'Reserved',
    type:   'lllan',
    alias:  ''
  },
  '63': {
    length: 999,
    name:   'Additional Data',
    type:   'lllan',
    alias:  ''
  },
  '64': {
    length: 4,
    name:   'MAC',
    type:   'b',
    alias:  ''
  }
}