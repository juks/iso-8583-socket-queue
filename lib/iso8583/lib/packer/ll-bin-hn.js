exports.unpack = function(msg, packager) {
  // LL mode
  if (packager.length <= 99) {
    var lOffset = 1; 
    var length = parseInt(msg.readUInt8(0).toString(16));
  // LLL mode
  } else {
    var lOffset = 2; 
    var length = parseInt(msg.readUInt16BE(0).toString(16));
  }

  if(length > packager.length) {
    length = packager.length;
  }

  var result = '';

  for (var i = lOffset; i < length / 2 + lOffset; i++) {
    var item = msg.readUInt8(i).toString(16);
    if (item.length < 2) item = '0' + item;
    result += item;
  }

  return {
    data: parseInt(result),
    restData: msg.slice(length / 2 + 1)
  };
};

exports.pack = function(row, packager) {
  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
  // LLL mode
  } else {
    lOffset = 4;
  }

  row = '' + row;
  var data = new Array();

  if (row.length % 2) row = '0' + row;

  var length = row.length;

  if (length > packager.length) {
    length = packager.length;
    row = row.slice(0, packager.length - 1);
  }

  for (var i = 0; i < length; i+=2) {
      data.push('0x' + row.slice(i, i + 2));
  }

  var ll = ('0000' + length).slice(-lOffset);
  var lb = new Buffer(ll, 'hex');

  return {
    msg: Buffer.concat([lb, new Buffer(data)], length / 2 + lb.length)
  }
};