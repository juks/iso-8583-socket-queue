exports.help = function() {
    return 'Fixed numeric value, zero padded, with leading C or D to indicate credit or debit';
  };

  exports.unpack = function(msg, packager) {
    var cred_or_deb = msg.charAt(0);
    let multiplier = 1;
    if (cred_or_deb.toUpperCase() == 'D') {
      multiplier = -1;
    }
    return {
      data: (multiplier * parseInt(msg.slice(1, packager.length)).toString('ascii')),
      restData: msg.slice(packager.length)
    };
  };

  exports.pack = function(row, packager) {
    var row_as_int = parseInt(row);
    let lead_char;
    if (row_as_int < 0) {
      lead_char = 'D';
    } else {
      lead_char = 'C';
    }
    return {
      msg: lead_char + ("00000000000000000000000000000000" + row).slice(-packager.length)
    };
  };
