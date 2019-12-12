exports.help = function() {
  return 'Alphabetic-numeric value with length field (2 chars, zero-padded [1-99])';
};

exports.unpack = function(msg, packager) {
  let length = parseInt(msg.slice(0, 2));
  
  if(length > packager.length) {
    length = packager.length;
  }
  
  return {
    data: msg.slice(2, length + 2).toString('ascii'),
    chunk: msg.slice(0, length + 2),
    restData: msg.slice(length + 2)
  };
};

exports.pack = function(row, packager) {
  let length = row.length;
  if (length > packager.length) {
    length = packager.length;
  }

  let msg = '' + ("0000" + length).slice(-2);
  
  return {
    msg: msg + row.substr(0, length)
  }
};
