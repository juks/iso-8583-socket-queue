exports.unpack = function(msg, packager) {
  let length = parseInt(msg.slice(0, 3).toString('ascii'), 10);

  if(length > packager.length) {
    length = packager.length;
  }

  return {
    data:       msg.slice(3).toString('ascii'),
    chunk:      msg.slice(0),
    restData:   msg.slice(length)
  };
};

exports.pack = function(row, packager) {
  let length = row.length;

  if (length > packager.length) {
    length = packager.length;
  }

  let msg = '' + ("0000" + length).slice(-3);

  return {
    msg: msg + row.substr(0, length)
  }
};