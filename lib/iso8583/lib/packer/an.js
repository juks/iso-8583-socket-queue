exports.help = function() {
  return 'Alphabetic-numeric symbols, zero padded';
};

exports.unpack = function(msg, packager) {
  return {
    data: msg.slice(0, packager.length).toString('ascii'),
    restData: msg.slice(packager.length)
  };
};

exports.pack = function(row, packager) {
  if (typeof row == 'number') row = row.toString();

  return {
    msg: ('000000000000000000000000000000000000000000000000000000' + row).slice(-packager.length)
  }
};