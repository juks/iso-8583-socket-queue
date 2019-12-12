exports.help = function() {
    return 'Alphabetic-numeric symbols, space padded';
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
    	msg: ('                                                      ' + row).slice(-packager.length)
    };
};