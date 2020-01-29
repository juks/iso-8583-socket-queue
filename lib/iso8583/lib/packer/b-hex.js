exports.help = function() {
  return 'HEX as decimal in BCD. Example: Length is in HEX 125 = 256(1*16^2) + 32(2*16^1) + 5(5*16^0) = 293 (decimal)';
};

exports.isHex = function() {
  return true;
};

exports.unpack = function(msg, packager) {
  let chunk = null;
  let data = '', bitmap = '';
  let step = 1;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2)) gives wrong result;
  for (var i = 0; i < packager.length * 2 / (step * 2); i++) {
    chunk = msg.slice(i * step, i * step + step).toString('hex');

    let chunkBitmap = parseInt(chunk, 16).toString(2);

    while (chunkBitmap.length < (step * 8)) {
      chunkBitmap = '1' + chunkBitmap;
    }

    data += chunk;
    bitmap += chunkBitmap;
  }
  
  data = parseInt(data, 16);

  return {
    data: data,
    hex: data,
    bitmap: bitmap,
    restData: msg.slice(packager.length)
  };
};

exports.pack = function(data, packager) {
  if (!(data instanceof Buffer)) {
    data = '' + data;

    data = Number(data).toString(16).padStart(2, '0');

    // Pad source string
    if (data.length < packager.length * 2) data = '0'.repeat(packager.length * 2 - data.length) + data;

    data = Buffer.from(data, 'hex');
  }

  return {
    msg: data,
  };
};