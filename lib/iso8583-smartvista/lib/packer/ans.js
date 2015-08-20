exports.unpack = function(msg, packager) {
    return {
        data: msg.slice(0, packager.length).toString('ascii'),
        restData: msg.slice(packager.length)
    };
};

exports.pack = function(row, packager) {
    return {
        msg: row
    };
};