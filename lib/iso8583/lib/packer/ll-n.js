exports.help = function() {
  return 'Numeric value with length field (2 chars)';
};

exports.unpack = function(msg, packager) {
  let lOffset;
  let length;

  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
    length = parseInt(msg.slice(0, 2).toString('ascii'));
  // LLL mode
  } else {
    lOffset = 3;
    length = parseInt(msg.slice(0, 3).toString('ascii'));
  }

  if(length > packager.length) {
    length = packager.length;
  }

  return {
    data: msg.slice(lOffset, length + lOffset).toString('ascii'),
    chunk: msg.slice(0, length + lOffset),
    restData: msg.slice(length + lOffset)
  };
};

exports.pack = function(row, packager) {
  let lOffset;

  // LL mode
  if (packager.length <= 99) {
    lOffset = 2;
  // LLL mode
  } else {
    lOffset = 3;
  }

  if (typeof row == 'number') row = row.toString();

  let length = row.length;

  if (length > packager.length) {
    length = packager.length;
  }

  let msg = '' + ("0000" + length).slice(-lOffset);

  return {
    msg: msg + row.substring(0, length)
  }
};