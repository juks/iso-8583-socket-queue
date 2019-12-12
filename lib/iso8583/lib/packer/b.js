exports.unpack = function(msg, packager) {
  let chunk = null; //msg;
  let data = '', bitmap = '';
  let step = 4;

  // Need to do it by parts because of console.log(0x723000000e848200.toString(2));
  for (let i = 0; i < packager.length * 2 / (step * 2); i++) {
    chunk = msg.slice(i * step, i * step + step).toString('hex');

    let chunkBitmap = parseInt(chunk, 16).toString(2);

    while (chunkBitmap.length < (step * 8)) {
      chunkBitmap = '0' + chunkBitmap;
    }

    data += chunk;
    bitmap += chunkBitmap;
  }

  msg = msg.slice(packager.length);

  var fieldIds = [];
  for(i in bitmap) {
    if (i > 0 && bitmap[i] == 1) {
      fieldIds.push(parseInt(i) + 1);
    }
  }

  return {
    data: data,
    bitmap: bitmap,
    fieldIds: fieldIds,
    restData: msg
  };
};

exports.pack = function(data, packager) {
  let bitmap = '';
  let lastIndex = 0;

  for (let i in data) {
    if (i > 1) {
      let offset = i - lastIndex - 1;
      for(let j = 0; j < offset; j++) {
        bitmap += '0';
      }
      bitmap += '1';
      lastIndex = i;
    }
  }
  
  let length = Math.ceil(bitmap.length / (packager.length * 4)) * (packager.length * 4);
  let blength = bitmap.length;
  for(let i = 0; i < length - blength; i++) {
    bitmap += '0';
  }
  
  let msg = parseInt(bitmap,2).toString(16).toUpperCase();

  return {
    msg: msg,
    bitmap: bitmap
  };
};
