// This is 'pass trough packer for dealing with binary masks sent in raw mode
exports.unpack = function(msg, packager) {
  var chunk = null;
  var data = '', bitmap = '';
  var step = 8;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
  for (var i = 0; i < (packager.length / step) * 2; i++) {
    chunk = msg.slice(i * step, i * step + step).toString();
console.log(chunk);
    chunkBitmap = parseInt(chunk, 16).toString(2);

    while (chunkBitmap.length < (step * 8)) {
      chunkBitmap = '0' + chunkBitmap;
    }
console.log(chunkBitmap);
    data += chunk;
    bitmap += chunkBitmap;
  }
console.log(bitmap);
process.exit(1);
  return {
    data: msg.slice(0, packager.length),
    bitmap: bitmap,
    hex: data,
    restData: msg.slice(packager.length)
  };
};

exports.pack = function(data, packager) {
  return {
    msg: data.toString('hex'),
  };
};
