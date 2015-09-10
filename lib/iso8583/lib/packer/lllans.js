exports.unpack = function(msg, packager) {
  var length = parseInt(msg.slice(0, 3).toString('ascii'), 10);

  if(length > packager.length) {
    length = packager.length;
  }

  var result = {
    data:       msg.slice(3).toString('ascii'),
    chunk:      msg.slice(0),
    restData:   msg.slice(length)
  };

  return result;
};

exports.pack = function(row, packager) {
  var length = row.length;

  if (length > packager.length) {
    length = packager.length;
  }
  
  var msg = '' + ("0000" + length).slice(-3);

  return {
    msg: msg + row.substr(0, length)
  }
};