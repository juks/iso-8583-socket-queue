exports.unpack = function(msg, packager) {
  // LL mode
  if (packager.length <= 99) {
    var lOffset = 1; 
    var length = parseInt(msg.readUInt8(0).toString(16));
  // LLL mode
  } else {
    var lOffset = 2; 
    var length = parseInt(msg.readUInt16BE(0).toString(16));
  }

  if(length > packager.length) {
    length = packager.length;
  }

  var result = {
    data:       msg.slice(2, length + lOffset),
    chunk:      msg.slice(0, length + lOffset),
    restData:   msg.slice(length + lOffset)
  };

  return result;
};

exports.pack = function(row, packager) {
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

  var ll = ('0000' + length).slice(-lOffset);
  var lb = Buffer.from(ll, 'hex');

  return {
    msg: Buffer.concat([lb, row], row.length + lb.length)
  }
};