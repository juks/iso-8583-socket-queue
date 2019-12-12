// Represent binary as hex e.g. 222000000A800000
exports.unpack = function(msg, packager) {
  let chunk = null;
  let data = '', bitmap = '';
  let step = 8;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
  for (let i = 0; i < (packager.length / step) * 2; i++) {
    chunk = msg.slice(i * step, i * step + step).toString();

    let chunkBitmap = parseInt(chunk, 16).toString(2);

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
  if (!data.constructor !== Buffer) data = Buffer.from(data);

  return {
    msg: data.toString('hex')
  };
};
