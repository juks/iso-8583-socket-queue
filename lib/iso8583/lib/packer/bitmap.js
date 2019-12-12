exports.help = function() {
  return 'Binary mask (binary encoded)';
};

exports.unpack = function(msg, packager) {
  let chunk = null;
  let data = '', bitmap = '';
  let step = 4;
  let hasMoreChunks = true;
  let chunkNumber = 0;

  while (hasMoreChunks) {
    for (let i = 0; i < packager.length * 2 / (step * 2); i++) {
      chunk = msg.slice(i * step + chunkNumber * 8, i * step + step + chunkNumber * 8).toString('hex');

      chunkBitmap = parseInt(chunk, 16).toString(2);

      while (chunkBitmap.length < (step * 8)) {
        chunkBitmap = '0' + chunkBitmap;
      }

      data += chunk;
      bitmap += chunkBitmap;
    }

    if (bitmap.substr(0 + chunkNumber * 8, 1) != 1 || chunkNumber == 2) hasMoreChunks = false;
    chunkNumber ++;
  }

  return {
    data: data,
    hex: data,
    bitmap: bitmap,
    restData: msg.slice(chunkNumber * 8)
  };
};

exports.pack = function(data, packager) {
  return {
    msg: data,
  };
};
