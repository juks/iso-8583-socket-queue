// Represent binary mask as hex e.g. 222000000A800000
exports.unpack = function(msg, packager) {
  var chunk = null;
  var data = '', bitmap = '';
  var step = 8;
  var hasMoreChunks = true;
  var chunkNumber = 0;

  while (hasMoreChunks) {
    // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
    for (var i = 0; i < (packager.length / step) * 2; i++) {
      chunk = msg.slice(i * step + chunkNumber * 16, i * step + step + chunkNumber * 16).toString();

      chunkBitmap = parseInt(chunk, 16).toString(2);

      while (chunkBitmap.length < step * 4) {
        chunkBitmap = '0' + chunkBitmap;
      }

      data += chunk;
      bitmap += chunkBitmap;
    }

    if (bitmap.substr(0 + chunkNumber * 8, 1) != 1 || chunkNumber == 2) hasMoreChunks = false;
    chunkNumber ++;
  }

  return {
    data: msg.slice(0, chunkNumber * 16),
    bitmap: bitmap,
    hex: data,
    restData: msg.slice(chunkNumber * 16)
  };
};

exports.pack = function(data, packager) {
  return {
    msg: data.toString('hex')
  };
};
