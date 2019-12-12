exports.unpack = function(msg, packager) {
  let length = parseInt(msg[0] + "" + msg[1]);

  if(length > packager.length) {
    length = packager.length;
  }

  return {
    data:       msg.slice(2, length + 2),
    chunk:      msg.slice(0, length + 2),
    restData:   msg.slice(length + 2)
  };
};

exports.pack = function(row, packager) {
  let length = row.length;

  if (typeof row == 'object' && row instanceof Buffer) {
    if (length > packager.length) {
      length = packager.length;
      row = row.slice(0, packager.length - 1);
    }

    let ll = ('0000' + length).slice(-4);
    let lb = Buffer.from(ll, 'hex');

    return {
      msg: Buffer.concat([lb, row], row.length + lb.length)
    }
  } else {
    if (length > packager.length) {
      length = packager.length;
      row = row.substring(0, packager.length - 1);
    }

    let ll = ('0000' + length).slice(-4);
    let lb = Buffer.from(ll, 'hex');

    return {
      msg: lb.toString('ascii') + row
    }
  }
};