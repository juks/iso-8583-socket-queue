exports.help = function() {
  return 'HEX encoded integer, length in bytes: when 800 goes as 0x08, 0x00 (two bytes) with binary representation and length field (1-2 bytes, binary value)';
};

exports.isHex = function() {
  return true;
};

exports.unpack = function(msg, packager) {
  let chunk = null;
  let data = '', bitmap = '';
  let step = 1;
  let lOffset;
  let length;

  // LL mode
  if (Math.ceil(packager.length / 2) <= 99) {
    lOffset = 1;
    length = parseInt(msg.readUInt8(0).toString(16));
    // LLL mode
  } else {
    lOffset = 2;
    length = parseInt(msg.readUInt16BE(0).toString(16));
  }

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2)) gives wrong result;
  for (let i = 0; i < length * 2 / (step * 2); i++) {
    chunk = msg.slice(i * step + lOffset, i * step + step + lOffset).toString('hex');

    let chunkBitmap = parseInt(chunk, 16).toString(2);

    while (chunkBitmap.length < (step * 8)) {
      chunkBitmap = '0' + chunkBitmap;
    }

    data += chunk;
    bitmap += chunkBitmap;
  }

  return {
    data: data,
    hex: data,
    bitmap: bitmap,
    restData: msg.slice(length + lOffset)
  };
};

exports.pack = function(data, packager) {
  let lOffset;

  // LL mode
  if (Math.ceil(packager.length / 2) <= 99) {
    lOffset = 2;
    // LLL mode
  } else {
    lOffset = 4;
  }

  if (data.length % 2) data = '0' + data;

  data = '0'.repeat(lOffset - (Math.ceil(data.length / 2) + '').length) + Math.ceil(data.length / 2) + data;
  data = Buffer.from(data, 'hex');

  return {
    msg: data
  };
};
