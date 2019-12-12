exports.help = function() {
  return 'Binary mask (hex-encoded, e.g. 222000000A800000)';
};

exports.isHex = function() {
  return true;
}

exports.unpack = function(msg, packager) {
  let chunk = null;
  let data = '', bitmap = '';
  let step = 8;
  let hasMoreChunks = true;
  let chunkNumber = 0;

  while (hasMoreChunks) {
    // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
    for (let i = 0; i < (packager.length / step) * 2; i++) {
      chunk = msg.slice(i * step + chunkNumber * 16, i * step + step + chunkNumber * 16).toString();

      let chunkBitmap = parseInt(chunk, 16).toString(2);

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
