exports.help = function() {
  return 'Alphabetic symbols';
};

exports.unpack = function(msg, packager) {
  return {
    data: msg.slice(0, packager.length).toSting('ascii'),
    restData: msg.slice(packager.length)
  };
};

exports.pack = function(row, packager) {
  return {
    msg: row
  };
};