exports.help = function() {
  return 'Fixed numeric value, zero padded';
};

exports.unpack = function(msg, packager) {
  return {
    data: parseInt(msg.slice(0, packager.length).toString('ascii')),
    restData: msg.slice(packager.length)
  };
};

exports.pack = function(row, packager) {
  return {
    msg: ("00000000000000000000000000000000" + row).slice(-packager.length)
  };
};
