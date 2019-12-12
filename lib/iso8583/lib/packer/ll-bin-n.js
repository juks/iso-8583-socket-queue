exports.help = function() {
  return 'Numeric value with bytes of length field (1-2 bytes, binary value)';
};

exports.unpack = function(msg, packager) {
  let lOffset;
  let length;

  // LL mode
  if (packager.length <= 99) {
    lOffset = 1;
    length = parseInt(msg.readUInt8(0).toString(16));
  // LLL mode
  } else {
    lOffset = 2;
    length = parseInt(msg.readUInt16BE(0).toString(16));
  }

  if(length > packager.length) {
    length = packager.length;
  }

  return {
    data:       msg.slice(2, length + lOffset),
    chunk:      msg.slice(0, length + lOffset),
    restData:   msg.slice(length + lOffset)
  };
};

exports.pack = function(row, packager) {
  let lOffset;

  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
  // LLL mode
  } else {
    lOffset = 4;
  }

  if (typeof row != 'object') {
    row = Buffer.from('' + row);
  }

  var length      = row.length;

  if (length > packager.length) {
    length = packager.length;
    row = row.slice(0, packager.length - 1);
  }

  let ll = ('0000' + length).slice(-lOffset);
  let lb = Buffer.from(ll, 'hex');

  return {
    msg: Buffer.concat([lb, row], row.length + lb.length)
  }
};