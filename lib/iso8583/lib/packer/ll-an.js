exports.help = function() {
  return 'Alphabetic-numeric string with length field (2 chars)';
};

exports.unpack = function(msg, packager) {
  let lOffset;
  let length;

  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
    length = parseInt(msg.slice(0, 2).toString('ascii'));
  // LLL mode
  } else {
    lOffset = 3;
    length = parseInt(msg.slice(0, 3).toString('ascii'));
  }

  if(length > packager.length) {
    length = packager.length;
  }

  return {
    data: msg.slice(lOffset, length + lOffset).toString('ascii'),
    chunk: msg.slice(0, length + lOffset),
    restData: msg.slice(length + lOffset)
  };
};

exports.pack = function(row, packager) {
  var lOffset;

  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
  // LLL mode
  } else {
    lOffset = 3;
  }

  var length = row.length;

  if (length > packager.length) {
    length = packager.length;
  }

  var msg = '' + ("0000" + length).slice(-lOffset);
  
  return {
    msg: Buffer.from(msg + row.substr(0, length))
  }
};