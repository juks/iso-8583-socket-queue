// Represent binary as hex e.g. 222000000A800000
exports.unpack = function(msg, packager) {
  var chunk = null;
  var data = '', bitmap = '';
  var step = 8;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
  for (var i = 0; i < (packager.length / step) * 2; i++) {
    chunk = msg.slice(i * step, i * step + step).toString();

    chunkBitmap = parseInt(chunk, 16).toString(2);

    while (chunkBitmap.length < step * 4) {
      chunkBitmap = '0' + chunkBitmap;
    }

    data += chunk;
    bitmap += chunkBitmap;
  }

  return {
    data: msg.slice(0, packager.length * 2),
    bitmap: bitmap,
    hex: data,
    restData: msg.slice(packager.length * 2)
  };
};

exports.pack = function(data, packager) {
  return {
    msg: data.toString('hex')
  };
};
