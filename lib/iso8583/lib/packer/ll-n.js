exports.unpack = function(msg, packager) {
  // LL mode
  if (packager.length <= 99) {
    var lOffset = 2; 
    var length = parseInt(msg.slice(0, 2).toString('ascii'));
  // LLL mode
  } else {
    var lOffset = 3; 
    var length = parseInt(msg.slice(0, 3).toString('ascii'));
  }

  if(length > packager.length) {
    length = packager.length;
  }

  var result = {
    data: msg.slice(lOffset, length + lOffset).toString('ascii'),
    chunk: msg.slice(0, length + lOffset),
    restData: msg.slice(length + lOffset)
  };

  return result;
};

exports.pack = function(row, packager) {
  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
  // LLL mode
  } else {
    lOffset = 3;
  }

  if (typeof row == 'number') row = row.toString();

  var length = row.length;

  if (length > packager.length) {
    length = packager.length;
  }

  var msg = '' + ("0000" + length).slice(-lOffset);

  return {
    msg: msg + row.substring(0, length)
  }
};