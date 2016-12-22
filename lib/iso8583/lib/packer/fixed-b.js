// Raw binary mode
exports.unpack = function(msg, packager) {
  var chunk = null;
  var data = '', bitmap = '';
  var step = 4;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
  for (var i = 0; i < packager.length * 2 / (step * 2); i++) {
    chunk = msg.slice(i * step, i * step + step).toString('hex');

    chunkBitmap = parseInt(chunk, 16).toString(2);

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
  return {
    msg: data,
  };
};
