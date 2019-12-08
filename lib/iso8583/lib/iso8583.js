var util = require('util');
var fs   = require('fs');

var ISO8583 = function(packagerName) {
  // Loading the proper packager
  var packagerConfigFile = './packager/' + packagerName + '.js';

  if (fs.existsSync(packagerConfigFile)) {
    console.log('File not found: ' + packagerConfigFile);
    console.log(('Invalid packager name: ' + packagerName).red);
    process.exit(1);
  }

  this.config = require(packagerConfigFile);
  this.format = this.config.format;

  this.fields = {};
  
  this._unpack = function(msg, id) {
    var result;
    try {
      var packager = this.format[id];
      if (!packager) throw new Error('Unknown packager ' + id);

      if (global.hasOwnProperty('overrides') && global.overrides.hasOwnProperty(id)) {
        packager.type = global.overrides[id].type;
        if (global.overrides[id].hasOwnProperty('length')) packager.length = global.overrides[id].length;
      }

      result = require('./packer/' + packager.type).unpack(msg, packager);

      // For the binary mask we take hex value
      if (id != 1) {
        this.fields[id] = result.data;
      } else {
        this.fields[id] = result.hex.toUpperCase();
      }
    } catch(e) {
      var errMsg = 'Error unpacking data from bit ' + id + '\nPackager: ' + util.inspect(packager);

      throw new Error(errMsg + ': ' + e.message + " " + e.stack);
    }
    
    return result;
  };
  
  this._pack = function(row, id) {
    var result;
    try {
      var packager = this.format[id];

      if (global.hasOwnProperty('overrides') && global.overrides.hasOwnProperty(id)) {
        packager.type = global.overrides[id].type;
      }

      var packagerFile = require('./packer/' + packager.type);
      if (this.format[id].hasOwnProperty('beforePack')) row = this.format[id].beforePack(row);

      result = packagerFile.pack(row, packager);
    } catch(e) {
      var errMsg = 'Error packing data from bit ' + id + '\nPackager: ' + util.inspect(packager);
      throw new Error(errMsg + ': ' + e.message + " " + e.stack);
    }

    return result;
  };
  
  this.unpack = function(msg) {
    var result;
    var fields = {};
    this.fields = {};

    result = this._unpack(msg, 0);
    fields['0'] = result.data;
    result = this._unpack(result.restData, 1);

    var fieldIds = [];
    for(var i in result.bitmap) {
      if (i > 0 && result.bitmap[i] == 1) {
        fieldIds.push(parseInt(i) + 1);
      }
    }

    for(var i in fieldIds) {
      if (fieldIds[i] == 1) continue;

      try {
        result = this._unpack(result.restData, fieldIds[i]);
      } catch(e) {
        console.log('Exception: ' + e.message);
      }
    }

    return this.fields;
  };
  
  this._sort = function(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
      if (o.hasOwnProperty(key)) {
          a.push(key);
      }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
    }

    return sorted;
  };

  this.packWithBinMask = function(data) {
    data = this._sort(data);
    var retArr = [];
    var totalLength = 0;

    // Preprocess data if necessary
    if (this.config.processors.hasOwnProperty('beforePack')) {
      data = this.config.processors.beforePack(data);
    }

    data = this._sort(data);

    for(var i in data) {
      if (i == 1) {
        var result = this._pack(this.getBinMask(data), i);
      } else {
        var result = this._pack(data[i], i);
      }

      var length = typeof result.msg == 'number' ? result.msg.toString().length : result.msg.length;
      totalLength += length;

      if (typeof result.msg != 'object' && result.msg instanceof Buffer) {
        retArr.push(result.msg);
      } else {
        retArr.push(Buffer.from(result.msg));
      }
    }

    return Buffer.concat(retArr, totalLength);
  };

  this.getBinMask = function(data) {
    var data = this._sort(data);
    var maxKey = Object.keys(data)[Object.keys(data).length - 1];
    var bitmapCount = Math.ceil(maxKey / 64);
    var currentMaskNumber = 1;

    var dummy = Buffer.alloc(8);
    dummy.fill(0);
    var maskBuf = Buffer.alloc(8);

    dummy.copy(maskBuf);

    for (var c = 0; c < bitmapCount - 1; c++) {
      maskBuf[0] |= 0x80;
      maskBuf = Buffer.concat([maskBuf, dummy])
    }

    for (var i in data) {
      if (Math.ceil(i / 64) > currentMaskNumber) currentMaskNumber ++;
      if (i == 1) continue;

      var bIdx = Math.ceil(i / 8) - 1;
      if (!i % 8 || i == 0) bIdx++;
      if (i != 0) maskBuf[bIdx] |= (1 << (8 - (i - bIdx * 8)));
    }

    return maskBuf;
  };

  this.hexMask = function(data) {
    return data.toString('hex')
  }
};

ISO8583.prototype.getOptions = function() {
  return this.config.hasOwnProperty('options') ? this.config.options : {};
};

ISO8583.prototype.getOption = function(optionName) {
  if (this.config.hasOwnProperty('options') && this.config.options.hasOwnProperty('optionName')) {
    return this.config.options.optionName;
  } else {
    return null;
  }
};

module.exports = ISO8583;