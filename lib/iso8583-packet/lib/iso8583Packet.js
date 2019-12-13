var iso8583     = require('../../../lib/iso8583');
var helpers     = require('../../../lib/helpers');
var fs          = require('fs');

// The constructor
function Iso8583Packet(data, options) {
  this.messageTypeId      = null;
  this.messageTypeIdShort = null;
  this.messageTypeGroup   = null;
  this.messageVersion     = null;
  this.annotation         = null;
  this.fields             = {};
  this.parseError         = null;
  this.isFaulty           = false;
  this.isSystemFaulty     = false;
  this.isExpired          = false;
  this.checkErrors        = [];
  this.rawData            = '';

  if (!options) options = {};

  if (!options.hasOwnProperty('packager')) {
    var packagerName = global.defaultSyntax;
  } else {
    var packagerName = options.packager;
  }

  this.packager = new iso8583(packagerName);

  // Fetch system-specific opotions
  this.systemConfig = this.packager.getOptions();

  if (data) {
    // Creating from string
    if (typeof data == 'string' || typeof data == 'object' && data instanceof Buffer) {
      this.rawData = data;

      if (!this.packager.config.validators.isValidMessage(data)) {
        this.parseError = 'Invalid message!';

        return null;
      }

      try {
        this.fields = this.packager.unpack(data);
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
}

// Updates packet message type group
Iso8583Packet.prototype.setMessageTypeIdGroup = function() {
  if (this.fields[0]) {
    this.messageTypeId = this.fields[0];
    if (this.messageTypeId && this.messageTypeId.length == 4) {
      this.messageTypeVersion = parseInt(this.messageTypeId.substr(0, 1));
      this.messageTypeIdShort = parseInt(this.messageTypeId.substr(1, 3));
      this.messageTypeGroup = parseInt(this.messageTypeId.substr(1, 1));
    }
  }
};

// Validates packet fields
Iso8583Packet.prototype.validate = function(errorMessage) {
  this.checkErrors    = [];

  var regNumeric = /^[0-9]+$/;

  if (!this.hasOwnProperty('messageTypeId')) return null;

  // Presence check
  if (this.systemConfig.obligatoryFields.hasOwnProperty(this.messageTypeId)) {
    for (var index in this.systemConfig.obligatoryFields[this.messageTypeId]) {
      if (!this.fields.hasOwnProperty(this.systemConfig.obligatoryFields[this.messageTypeId][index]) || (!this.fields[this.systemConfig.obligatoryFields[this.messageTypeId][index]] && this.fields[this.systemConfig.obligatoryFields[this.messageTypeId][index]] !== 0)) {
        this.checkErrors.push('No field ' + this.systemConfig.obligatoryFields[this.messageTypeId][index]);
      }
    }
  }

  // Format check
  for (var index in this.fields) {
    if (this.packager.format.hasOwnProperty(index) && this.packager.format[index].hasOwnProperty('type')) {
      if (typeof this.fields[index] == 'string') {
        var checkVal = this.fields[index];
      } else if(typeof this.fields[index] == 'number') {
        var checkVal = this.fields[index].toString();
      } else {
        checkVal = null;
      }

      if (checkVal && this.packager.format[index]['type'] == 'n' && !checkVal.match(regNumeric)) {
        this.checkErrors.push('Field ' + index + ' expected to be numeric');
      }
    }
  }

  this.checkExpired();
  this.checkFaulty();

  // Get packet annotation
  this.annotation = this.getAnnotation();

  return null;
};

// Expiration check
Iso8583Packet.prototype.checkExpired = function() {
  this.isExpired = this.packager.config.validators.isExpiredPacket(this, this.systemConfig.expirationLimitSeconds);
};

// Faulty status ckeck
Iso8583Packet.prototype.checkFaulty = function() {
  var rc = this.getField(39);

  this.isFaulty       = parseInt(rc) ? true : false;
  this.isSystemFaulty = this.systemConfig.sysErrors.indexOf(rc) >= 0 ? true : false;
};

// Returns packet annotation string
Iso8583Packet.prototype.getAnnotation = function() {
  var mti     = this.messageTypeIdShort;
  var result  = '';

  // Purchase / Refund
  if (this.messageTypeGroup == 2) {
    if (this.getField(3) == 0) {
      result = mti == 200 ? 'Purchase Request' : 'Purchase Response';
    } else if (this.getField(3) == 200000) {
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

  if (this.isFaulty) result += ' <faulty>';
  if (this.isExpired) result += ' <expired>';

  return result;
};

// Pad the packet values that has to be padded
Iso8583Packet.prototype.pad = function() {
  for (var i in this.systemConfig.padFields) {
    if (this.packager.format.hasOwnProperty(this.systemConfig.padFields[i]) && this.packager.format[this.systemConfig.padFields[i]].hasOwnProperty('length')) {
      var val = this.getField(this.systemConfig.padFields[i]);
      if (val != null) {
        let packer = require('../../iso8583/lib/packer/' + this.packager.format[this.systemConfig.padFields[i]]['type'] + '.js');
        let padLength = this.packager.format[this.systemConfig.padFields[i]]['length'];
        if (packer.hasOwnProperty('isHex') && packer.isHex()) padLength *= 2;

        val = this.zeroPad(val, padLength);
        var update = {};
        update[this.systemConfig.padFields[i]] = val;
        this.setFields(update);
      }
    }
  }
};

// Pads given value with zeroes on the left
Iso8583Packet.prototype.zeroPad = function(val, padLength) {
  return ('00000000000000000000000000000000' + val).slice(-padLength);
};

// Checks if if there are packet consistency errors
Iso8583Packet.prototype.hasErrors = function() {
  return this.checkErrors.length > 0;
};

// Returns the packet field value
Iso8583Packet.prototype.getField = function(id) {
  if (this.fields.hasOwnProperty(id)) {
    return this.fields[id];
  } else {
    return null;
  }
};

// Returns all packet fields
Iso8583Packet.prototype.getFields = function() {
  return this.fields;
};

// Updates the current packet bitmask
Iso8583Packet.prototype.updateBitMask = function() {
  this.fields[1] = this.packager.hexMask(this.packager.getBinMask(this.fields));
};

// Sets packet field value
Iso8583Packet.prototype.setFields = function(values, error) {
  var newFieldAdded = false;

  for (var k in values) {
    if (!this.fields.hasOwnProperty(k)) newFieldAdded = true;
    this.fields[k] = values[k];

    if (k == 0) this.setMessageTypeIdGroup();
  }

  if (newFieldAdded) this.updateBitMask();
  this.validate();
};

// Clears packet fields
Iso8583Packet.prototype.unsetFields = function(values, error) {
  if (k == 0) return;

  for (var k in values) {
    delete this.fields[values[k]];
  }

  this.updateBitMask();
  this.validate();
};

// Generate string message
Iso8583Packet.prototype.getMessage = function(options) {
  if (!options) options = {};

  var message = this.packager.packWithBinMask(this.fields);
  var header = options.header ? this.getHeader(message.length) : Buffer.from('');

  return Buffer.concat([header, message]);
};

// Return source raw message
Iso8583Packet.prototype.getRawMessage = function(options) {
  // No raw -- return syntetic message
  if (!this.rawData) return this.getMessage(options);
  if (!options) options = {};

  var header = options.header ? this.getHeader(this.rawData.length) : Buffer.from('');

  if (typeof this.rawData == 'object' && this.rawData instanceof Buffer) {
    return Buffer.concat([header, this.rawData]);
  } else {
    return header.toString() + this.rawData;
  }
};

// Returns the length header
Iso8583Packet.prototype.getHeader = function(lengthVal) {
  return this.packager.config.generators.getHeader(lengthVal);
};

// Return pretty-formatted values
Iso8583Packet.prototype.pretty = function() {
  var drop = '\n================================================================================================\n';

  if (this.annotation) drop += '\n     [' + this.annotation + ']\n\n';

  for (var key in this.fields) {
    if (this.fields.hasOwnProperty(key)) {
      var val = this.fields[key];
      var fieldName = this.packager.format[key] && this.packager.format[key].hasOwnProperty('name') ? this.packager.format[key]['name'] : 'Unknown field';
      var fieldType = this.packager.format[key] && this.packager.format[key].hasOwnProperty('type') ? this.packager.format[key]['type'] : '';

      var title = fieldName + ' [' + key + ']';

      if (['2', '19'].indexOf(key) >= 0) {
        val = helpers.safeLog(val, ['number']);
      } else if (['35'].indexOf(key) >= 0) {
        val = helpers.safeLog(val, ['pan']);
      } else if (['ll-bin-an'].indexOf(fieldType) >= 0) {
        var strictMode = (['55'].indexOf(key) >= 0) ? ['field55'] : null;

        if (typeof val == 'object' && val instanceof Buffer) {
          val = helpers.safeLog(val.toString('hex'), strictMode);
        } else {
          val = helpers.safeLog((Buffer.from(val, 'binary')).toString('hex'), strictMode);
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
};

// Returns caption that describes given field value
Iso8583Packet.prototype.getFieldCaption = function(id, val) {
  var result = '';

  // POS Entry Mode
  if (id == 22) {
    var part1 = val.substring(0,2);
    var part2 = val.slice(-1);

    if (this.systemConfig.cardDataInputModes.hasOwnProperty(part1)) {
      result = 'Card Data Input Mode: <' + this.systemConfig.cardDataInputModes[part1] + '>';
    }

    if (this.systemConfig.cardholderAuthMethods.hasOwnProperty(part2)) {
      if (result) result += '; ';
      result += 'Cardholder Auth Method: <' + this.systemConfig.cardholderAuthMethods[part2] + '>';
    }
  // Response Code
  } else if (id == 39) {
    if (this.systemConfig.errors.hasOwnProperty(parseInt(val))) {
      result = this.systemConfig.errors[parseInt(val)];
    }
  }

  return result;
};

// Checks if the given error code is valid for the current system
Iso8583Packet.prototype.isValidError = function(code) {
  return this.systemConfig.errors.hasOwnProperty(parseInt(code));
};

module.exports = Iso8583Packet;
