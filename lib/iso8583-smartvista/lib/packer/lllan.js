exports.unpack = function(msg, packager) {
    var length = parseInt(msg.slice(0, 3).toString('ascii'), 10);

    if(length > packager.length) {
        length = packager.length;
    }

    var result = {
        data:       msg.slice(2, length + 3).toString('ascii'),
        chunk:      msg.slice(0, length + 3),
        restData:   msg.slice(length + 3)
    };

    return result;
};

exports.pack = function(row, packager) {
    var length = row.length;

    if (length > packager.length) {
        length = packager.length;
    }
    
    var msg = '' + ("0000" + length).slice(-3);
    
    if (length < 10) {
        msg = '00' + msg;
    } else if (length < 100) {
        msg = '0' + msg;
    }
    
    return {
        msg: msg + row.substr(0, length)
    }
};