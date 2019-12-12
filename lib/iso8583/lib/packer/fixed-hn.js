// HEX encoded integer: when 800 goes as 0x08, 0x00
exports.unpack = function(msg, packager) {
  if (packager.length % 2) packager.length++;

  let result = '';

  for (let i = 0; i < packager.length; i++) {
    let item = msg.readUInt8(i).toString(16);

    if (item.length < 2) item = '0' + item;
    result += item;
  }

  return {
    data: parseInt(result),
    restData: msg.slice(packager.length / 2)
  };
};

exports.pack = function(row, packager) {
  if (packager.length % 2) packager.length++;

  row = '' + row;
  let data = [];

  // Padding to be even
  if (row.length % 2) row = '0' + row;

  // Padding left side with zeroes
  if (row.length < packager.length * 2) {
    for (let i = 0; i < packager.length - row.length / 2; i++) {
      data.push(0);
    }
  }

  for (let i = 0; i < packager.length; i+=2) {
      data.push('0x' + row.slice(i, i + 2));
  }

  return {
    msg: Buffer.from(data)
  }
};