var ISOLIB      = require('../../../lib/iso8583-smartvista');
var helpers     = require('../../../lib/helpers');
var ISO         = ISOLIB.ISO8583;
var packager    = ISOLIB.defaultPackager;
var iso         = new ISO(packager);
var moment      = require("moment");

var errors = require('./errorsSmartVista.js');

var padFields = [0, 7, 11, 12, 22, 41, 42];

var obligatoryFields = {
              '0800': [0, 1, 3, 7, 11, 24, 41],
              '0200': [0, 1, 3, 4, 7, 11, 12, 22, 24, 25, 41, 42, 49],
              '0400': [0, 1, 3, 4, 7, 11, 12, 22, 24, 25, 41, 42, 49]
}

// treat the packet as expired after this amoount of seconds passed since it was created by other systems
var expirationLimitSeconds = 30;

var cardDataInputModes = {
  '01': 'Manual',
  '06': 'Manual',
  '02': 'Magnetic stripe read',
  '05': 'Integrated circuit card read; CVV data reliable',
  '07': 'Proximity transaction originated using ICC data rules',
  '08': 'Magnetic stripe even though it is ICC capable',
  '91': 'Proximity transaction originated using magnetic stripe data rules; CVV check is possible'
};

var cardholderAuthMethods = {
  0: 'Not Authenticated',
  1: 'PIN',
  2: 'Signature Based',
  6: 'Signature Based',
  9: 'Terminal accept Off-line PINs (for EMV cards)'
}

// The constructor
function Iso8583Packet(data, options) {
  this.messageTypeId     = null;
  this.messageTypeGroup  = null;
  this.annotation        = null;
  this.fields            = {};
  this.parseError        = null;
  this.isExpired         = false;
  this.checkErrors       = [];
  this.rawData           = '';

  if (data) {
    // Creating from string
    if (typeof data == 'string' || typeof data == 'object' && data instanceof Buffer) {
      this.rawData = data;

      if (data.length < 16 || !data.toString().match(/^0[0-9]{3}/)) {
        this.parseError = 'Invalid message!';

        return null;
      }

      try {
        this.fields = iso.unpack(data);
      } catch (ex) {
        this.parseError = ex;

        return null;
      }
    // Creating from other packet
    } else if (typeof data == 'object' && data.constructor.name == 'Iso8583Packet') {
      this.fields = data.fields;
      if(!this.fields.hasOwnProperty(1)) {
        this.updateBitMask();
      }
    // Creating from object
    } else if (typeof data == 'object') {
      this.fields = data;
      if(!this.fields.hasOwnProperty(1)) {
        this.updateBitMask();
      }
    } else {
      this.parseError = 'Incorrect data';

      return null;
    }
  }

  this.setMessageTypeIdGroup();

  if (!this.messageTypeId) {
    this.parseError = 'Incorrect MTI';

    return null;
  }

  this.pad();
  this.validate();
};

// Updates packet message type group
Iso8583Packet.prototype.setMessageTypeIdGroup = function() {
  if (this.fields[0]) {
    this.messageTypeId = this.fields[0];
    if (this.messageTypeId && this.messageTypeId.length == 4) {
      this.messageTypeGroup = parseInt(this.messageTypeId.substr(1, 1));
    }
  }
}

// Validates packet fields
Iso8583Packet.prototype.validate = function(errorMessage) {
  this.checkErrors    = [];

  var regNumeric = /^[0-9]+$/;

  if (!this.hasOwnProperty('messageTypeId')) return null;

  // Presence check
  if (obligatoryFields.hasOwnProperty(this.messageTypeId)) {
    for (var index in obligatoryFields[this.messageTypeId]) {
      if (!this.fields.hasOwnProperty(obligatoryFields[this.messageTypeId][index]) || (!this.fields[obligatoryFields[this.messageTypeId][index]] && this.fields[obligatoryFields[this.messageTypeId][index]] !== 0)) {
        this.checkErrors.push('No field ' + obligatoryFields[this.messageTypeId][index]);
      }
    }
  }

  // Format check
  for (var index in this.fields) {
    if (packager.hasOwnProperty(index) && packager[index].hasOwnProperty('type')) {
      if (typeof this.fields[index] == 'string') {
        var checkVal = this.fields[index];
      } else if(typeof this.fields[index] == 'number') {
        var checkVal = this.fields[index].toString();
      } else {
        checkVal = null;
      }

      if (checkVal && packager[index]['type'] == 'n' && !checkVal.match(regNumeric)) {
        this.checkErrors.push('Field ' + index + ' expected to be numeric');
      }
    }
  }

  // Expiration check
  // 150630200039 
  // YYMMDDHHmmss
  var transactionTime = this.getField(12);
  if (transactionTime) {
    var now = moment(new Date());
    var then = moment(transactionTime, "YYMMDDHHmmss");

    var diff = now.diff(then, 'seconds');
    if (Math.abs(diff) > expirationLimitSeconds) this.isExpired = true; 
  }

  // Get packet annotation
  this.annotation = this.getAnnotation();

  return null;
}

// Returns packet annotation string
Iso8583Packet.prototype.getAnnotation = function() {
  var mti     = this.messageTypeId;
  var rc      = this.getField(39);
  var result  = '';

  // Purchase / Refund
  if (this.messageTypeGroup == 2) {
    if (this.getField(3) == 0) {
      result = mti == 200 ? 'Purchase Request' : 'Purchase Response';
    } else if (this.getField(3) == 20000) {
      result = mti == 200 ? 'Refund Request' : 'Refund Response';
    }
  // Reversal / Auto-Reversal
  } else if (this.messageTypeGroup == 4) {
    if (this.getField(37)) {
      result = mti == 400 ? 'Reversal Request' : 'Reversal Response';
    } else {
      result = mti == 400 ? 'Auto-Reversal Request' : 'Auto-Reversal Response';
    }
  // Echo / Response
  } else if (this.messageTypeGroup == 8) {
    result = mti == 800 ? 'Echo Request' : 'Echo Response';
  }

  if (rc) result += ' <faulty>';
  if (this.isExpired) result += ' <expired>';

  return result;
}

// Pad some packet values
Iso8583Packet.prototype.pad = function() {
  for (var i in padFields) {
    if (packager.hasOwnProperty(padFields[i]) && packager[padFields[i]].hasOwnProperty('length')) {
      var val = this.getField(padFields[i]);
      if (val != null) {
        val = this.zeroPad(val, padFields[i]);
        var update = {};
        update[padFields[i]] = val;
        this.setFields(update);
      }
    }
  }
}

Iso8583Packet.prototype.zeroPad = function(val, i) {
  return ('00000000000000000000000000000000' + val).slice(-packager[i]['length']);
}

// Checks if if there are packet consistency errors
Iso8583Packet.prototype.hasErrors = function() {
  return this.checkErrors.length > 0;
}

// Returns the packet field value
Iso8583Packet.prototype.getField = function(id) {
  if (this.fields.hasOwnProperty(id)) {
    return this.fields[id];
  } else {
    return null;
  }
}

// Returns all packet fields
Iso8583Packet.prototype.getFields = function() {
  return this.fields;
}

// Updates the current packet bitmask
Iso8583Packet.prototype.updateBitMask = function() {
  this.fields[1] = iso.hexMask(iso.getBinMask(this.fields));
}

// Sets packet field value
Iso8583Packet.prototype.setFields = function(values, error) {
  var newFieldAdded = false;

  for (var k in values) {
    if (k == 0) values[k] = this.zeroPad(values[k], 0);

    if (!this.fields.hasOwnProperty(k)) newFieldAdded = true;
    this.fields[k] = values[k];

    if (k == 0) this.setMessageTypeIdGroup();
  }

  if (newFieldAdded) this.updateBitMask();
  this.validate();
}

// Clears packet fields
Iso8583Packet.prototype.unsetFields = function(values, error) {
  if (k == 0) return;

  for (var k in values) {
    delete this.fields[values[k]];
  }

  this.updateBitMask();
  this.validate();
}

// Generate string message
Iso8583Packet.prototype.getMessage = function(options) {
  if (!options) options = {};

  var message = iso.packWithBinMask(this.fields);
  var lengthHeader = options.lengthHeader ? this.getLengthHeader(message.length) : new Buffer('');

  return Buffer.concat([lengthHeader, message]);
}

// Return source raw message
Iso8583Packet.prototype.getRawMessage = function(options) {
  // No raw -- return syntetic message
  if (!this.rawData) return this.getMessage(options);

  if (!options) options = {};
  var lengthHeader = options.lengthHeader ? this.getLengthHeader(this.rawData.length) : new Buffer('');

  if (typeof this.rawData == 'object' && this.rawData instanceof Buffer) {
    return Buffer.concat([lengthHeader, this.rawData]);
  } else {
    return lengthHeader.toString() + this.rawData;
  }
}

// Returns the length header
Iso8583Packet.prototype.getLengthHeader = function(lengthVal) {
  var s = ('0000' + lengthVal).slice(-4);

  return new Buffer(s);
}

// Return pretty-formatted values
Iso8583Packet.prototype.pretty = function() {
  var drop = '\n================================================================================================\n';

  if (this.annotation) drop += '\n     [' + this.annotation + ']\n\n';

  for (var key in this.fields) {
    if (this.fields.hasOwnProperty(key)) {
      var val = this.fields[key];
      var title = packager[key]['name'] + ' [' + key + ']';

      if (['2', '19'].indexOf(key) >= 0) {
        val = helpers.safeLog(val, ['number']);
      } else if (['35'].indexOf(key) >= 0) {
        val = helpers.safeLog(val, ['pan']);
      } else if (['55'].indexOf(key) >= 0) {
        if (typeof val == 'object' && val instanceof Buffer) {
          val = helpers.safeLog(val.toString('hex'), ['field55']);
        } else {
          val = helpers.safeLog((new Buffer(val, 'binary')).toString('hex'), ['field55']);
        }
      }

      var caption = this.getFieldCaption(key, val);
      if (caption) val = val + ' (' + caption + ')';

      drop += ('     ' + title + Array(50 - title.length).join('.') + val + '\n');
    }
  }

  drop += '\n================================================================================================\n';

  // If there are packet errors -- list them
  if (this.hasErrors()) {
    drop += 'Errors:\n';

    for (var error in this.checkErrors) {
      drop += '     ' + this.checkErrors[error] + '\n';
    }

    drop += '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n';
  }

  drop += '\n';

  return drop;
}

// Returns caption that describes given field value
Iso8583Packet.prototype.getFieldCaption = function(id, val) {
  var result = '';

  // POS Entry Mode
  if (id == 22) {
    var part1 = val.substring(0,2);
    var part2 = val.slice(-1);

    if (cardDataInputModes.hasOwnProperty(part1)) {
      result = 'Card Data Input Mode: <' + cardDataInputModes[part1] + '>';
    }

    if (cardholderAuthMethods.hasOwnProperty(part2)) {
      if (result) result += '; ';
      result += 'Cardholder Auth Method: <' + cardholderAuthMethods[part2] + '>';
    }
  // Response Code
  } else if (id == 39) {
    if (errors.byCode.hasOwnProperty(parseInt(val))) {
      result = errors.byCode[parseInt(val)];
    }
  }

  return result;
}

module.exports = Iso8583Packet;
module.exports.errors = errors;
