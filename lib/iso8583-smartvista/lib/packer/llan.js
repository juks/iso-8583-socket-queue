exports.unpack = function(msg, packager) {
    var length = parseInt(msg.slice(0, 2).toString('ascii'));

    if(length > packager.length) {
        length = packager.length;
    }

    var result = {
        data: msg.slice(2, length + 2).toString('ascii'),
        chunk: msg.slice(0, length + 2),
        restData: msg.slice(length + 2)
    };

    return result;
};

exports.pack = function(row, packager) {
    var length = row.length;
    if (length > packager.length) {
        length = packager.length;
    }

    var msg = '' + ("0000" + length).slice(-2);

    return {
        msg: msg + row.substr(0, length)
    }
};