// BCD format
exports.unpack = function(msg, packager) {
  let chunk = null;
  let data = '', bitmap = '';
  let step = 4;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
  for (var i = 0; i < packager.length * 2 / (step * 2); i++) {
    chunk = msg.slice(i * step, i * step + step).toString('hex');

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
    restData: msg.slice(packager.length)
  };
};

exports.pack = function(data, packager) {
  if (data.constructor !== Buffer) {
    data = '' + data;
    // Pad source string
    if (data.length < packager.length * 2) data = '0'.repeat(packager.length * 2 - data.length) + data;

    data = Buffer.from(data, 'hex');
  }

  return {
    msg: data,
  };
};
