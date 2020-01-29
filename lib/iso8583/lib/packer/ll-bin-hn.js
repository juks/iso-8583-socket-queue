exports.help = function() {
  return 'Hex string string with length field (1-2 bytes, binary value)';
};;

exports.isHex = function() {
  return true;
}

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

  let result = '';

  for (let i = lOffset; i < length / 2 + lOffset; i++) {
    var item = msg.readUInt8(i).toString(16);
    if (item.length < 2) item = '0' + item;
    result += item;
  }

  return {
    data: parseInt(result),
    restData: msg.slice(length / 2 + 1)
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

  row = '' + row;
  let data = [];

  if (row.length % 2) row = '0' + row;

  let length = row.length;

  if (length > packager.length) {
    length = packager.length;
    row = row.slice(0, packager.length - 1);
  }

  for (let i = 0; i < length; i+=2) {
      data.push('0x' + row.slice(i, i + 2));
  }

  var ll = ('0000' + length / 2).slice(-lOffset);
  var lb = Buffer.from(ll, 'hex');

  return {
    msg: Buffer.concat([lb, Buffer.from(data)], length / 2 + lb.length)
  }
};