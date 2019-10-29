var path        = require('path');
var fs          = require('fs');

//module.exports = helpers;
module.exports.safeLog = function(msg, modes) {
  if (!modes) modes = ['pan'];
  
  // In dangerous mode hex dump is available
  if (global.c.dangerous && modes.indexOf('hex') >=0) {
    var result = msg.toString('hex');

    len = result.length;
    for (var i = 0; i < len; i += 2) {
      if (i) {
        result = result.slice(0,i) + ' ' + result.slice(i);
        len++;
        i++;
      }
    }
    return result;
  }

  if (msg instanceof Buffer) msg = msg.toString();
  else if (typeof msg == 'number') msg = msg.toString();

  // Whole Message
  if (modes.indexOf('isoMessage') >= 0) {
    // Replace non-printable
    var regexp = /[^a-z0-9=]/gmi;
    msg = msg.replace(regexp, '.');
  }

  // In dangerous mode -- do nothing
  if (!global.c.dangerous) {
    // Card Pan
    if (modes.indexOf('pan') >= 0) {
      if (typeof msg == 'string') {
        var regexp = /(.*)(\d{6})(\d{4})\=(\d{4})(.*)/gm;
        var panPart = '';
        msg = msg.replace(regexp, function (complete, a, b, c, d, f) {
          panPart = b;
          return a + new Array(b.length + 1).join("*") + c + '=' + d + f;
        });

        // Need to swipe away the detected part of pan from entire message
        if (panPart) {
          var regexp = /(\.\.)(\d{16,18})/gm;
          msg = msg.replace(regexp, function (complete, a,b) {
            return a + new Array(b.length + 1).join("*");
          });
        }
      } else if (typeof msg == 'object') {
        for (var k in msg) {
          if (msg.hasOwnProperty(k)) msg[k] = this.safeLog(msg[k]);
        }
      }
    }

    // Card Number
    if (modes.indexOf('number') >= 0) {
      var regexp = /(\d{6})(\d{6})(\d{4})/gm;
      msg = msg.replace(regexp, function (complete, a, b, c) {
        return a + new Array(b.length + 1).join("*") + c;
      });
    }

    // Field 55 (what to do?)
    if (modes.indexOf('field55') >= 0) {

    }
  }

  return msg;
};

// Random string generator
module.exports.randomString = function(length, mode) {
  var charsNumbers = '0123456789';
  var charsLower   = 'abcdefghijklmnopqrstuvwxyz';
  var charsUpper   = charsLower.toUpperCase();

  var chars = '';
  if (!mode || mode == 1) chars += charsNumbers;
  if (!mode || mode == 2) chars += charsLower + charsUpper;
  if (!length) length = 32;

  var string = '';

  for (var i = 0; i < length; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNumber, randomNumber + 1);
  }

  return string;
}

// Rotate winston logs
module.exports.winstonRotate = function(fileTransport) {
  var fullname = path.join(fileTransport.dirname, fileTransport._getFile(false));

  function reopen() {
    if (fileTransport._stream) {
      fileTransport._stream.end();
      fileTransport._stream.destroySoon();
    }

    var stream = fs.createWriteStream(fullname, fileTransport.options);
    stream.setMaxListeners(Infinity);

    fileTransport._size = 0;
    fileTransport._stream = stream;

    fileTransport.once('flush', function () {
      fileTransport.opening = false;
      fileTransport.emit('open', fullname);
    });

    fileTransport.flush();
  }

  return reopen();
}

// Flush winston file transport then quit
module.exports.winstonFlushAndQuit = function(fileTransport) {
  function fq() {
    fileTransport._stream.on('close', function () {
      process.exit(0);
    });

    fileTransport.close();
  }

  return fq();
}

module.exports.randomCase = function(v) {
  return Math.floor(Math.random() * (v - 0)) == 1;
}

module.exports.chunkString = function(str) {
  var _size = Math.ceil(str.length/2), _ret  = new Array(_size), _offset;

  for (var _i=0; _i<_size; _i++) {
      _offset = _i * 2;
      _ret[_i] = "0x" + str.substring(_offset, _offset + 2);
  }

  return _ret;
}