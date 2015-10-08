exports.format = {
  '0': {
    length: 4,
    name:   'Message Type Indicator',
    type:   'fixed-hn',
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
    type:   'll-bin-hn',
    alias:  ''
  },
  '3': { 
    length: 6,
    name:   'Processing Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '4': {
    length: 12,
    name:   'Amount, Transaction',
    type:   'fixed-hn',
    alias:  ''
  },
  '5': {
    length: 12,
    name:   'Amount, Settlement',
    type:   'fixed-hn',
    alias:  ''
  },
  '6': {
    length: 12,
    name:   'Amount, Cardholder Billing',
    type:   'fixed-hn',
    alias:  ''
  },
  '7': {
    length: 10,
    name:   'Transmission Date and Time',
    type:   'fixed-hn',
    alias:  ''
  },
  '8': {
    length: 8,
    name:   'Amount, Cardholder Billing Fee',
    type:   'fixed-hn',
    alias:  ''
  },
  '9': {
    length: 8,
    name:   'Conversion Rate, Settlement',
    type:   'fixed-hn',
    alias:  ''
  },
  '10': {
    length: 8,
    name:   'Conversion Rate, Cardholder Billing',
    type:   'fixed-hn',
    alias:  ''
  },
  '11': {
    length: 6,
    name:   'System Trace Audit Number',
    type:   'fixed-hn',
    alias:  ''
  },
  '12': {
    length: 6,
    name:   'Processing Time',
    type:   'fixed-hn',
    alias:  ''
  },
  '13': {
    length: 4,
    name:   'Processing Date',
    type:   'fixed-hn',
    alias:  ''
  },
  '14': {
    length: 4,
    name:   'Date, Expiration',
    type:   'fixed-hn',
    alias:  ''
  },
  '15': {
    length: 6,
    name:   'Date, Settlement',
    type:   'fixed-hn',
    alias:  ''
  },
  '16': {
    length: 4,
    name:   'Conversion',
    type:   'fixed-hn',
    alias:  ''
  },
  '17': {
    length: 4,
    name:   'Date, Capture',
    type:   'fixed-hn',
    alias:  ''
  },
  '18': {
    length: 4,
    name:   'Merchant Category Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '19': {
    length: 3,
    name:   'Acquirer Institution Country Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '20': {
    length: 3,
    name:   'PAN. Country Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '21': {
    length: 3,
    name:   'Forwarding Country Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '22': {
    length: 3,
    name:   'POS Entry Mode',
    type:   'fixed-hn',
    alias:  ''
  },
  '23': {
    length: 3,
    name:   'Card Sequence Number',
    type:   'fixed-hn',
    alias:  ''
  },
  '24': {
    length: 3,
    name:   'Function Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '25': {
    length: 2,
    name:   'Pos Condition Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '26': {
    length: 2,
    name:   'PIN Capture Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '27': {
    length: 1,
    name:   'Authorisation Identification Response length',
    type:   'fixed-hn',
    alias:  ''
  },
  '28': {
    length: 9,
    name:   'Amount Transaction Fee',
    type:   'fixed-char',
    alias:  ''
  },
  '29': {
    length: 3,
    name:   'Reconciliation Indicator',
    type:   'fixed-hn',
    alias:  ''
  },
  '30': {
    length: 24,
    name:   'Amounts Original',
    type:   'fixed-hn',
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
    type:   'fixed-char',
    alias:  ''
  },
  '38': {
    length: 6,
    name:   'Authorisation Identification Response',
    type:   'fixed-char',
    alias:  ''
  },
  '39': {
    length: 2,
    name:   'Response code',
    type:   'fixed-char',
    alias:  ''
  },
  '40': {
    length: 2,
    name:   'Service Restriction Code',
    type:   'fixed-hn',
    alias:  ''
  },
  '41': {
    length: 8,
    name:   'Card Acceptor Terminal Identification',
    type:   'fixed-char',
    alias:  ''
  },
  '42': {
    length: 15,
    name:   'Card Acceptor ID',
    type:   'fixed-char',
    alias:  ''
  },
  '43': {
    length: 40,
    name:   'Card Acceptor Name',
    type:   'fixed-char',
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
    length: 3,
    name:   'Currency code, transaction',
    type:   'fixed-hn',
    alias:  ''
  },
  '50': {
    length: 3,
    name:   'Currency Code, Settlement',
    type:   'fixed-hn',
    alias:  ''
  },
  '51': {
    length: 3,
    name:   'Currency Code, Cardholder billing',
    type:   'fixed-hn',
    alias:  ''
  },
  '52': {
    length: 8,
    name:   'PIN Block Data',
    type:   'fixed-b',
    alias:  ''
  },
  '53': {
    length: 16,
    name:   'Security Related Control Information',
    type:   'fixed-hn',
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
    length: 3,
    name:   'Authorisation Life Cycle Code',
    type:   'fixed-hn',
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
    type:   'fixed-b',
    alias:  ''
  }
}