var iso8583 = require('../../../lib/iso8583');
var packager = new iso8583('smartVista');

var msg = Buffer.from('303830302220010000800000393930303030303832333135313731363030303030313833313030303030303031', 'hex');

console.log('Original message: ');
console.log(msg);
console.log();

console.log('Parsed message fields: ');
var parsed = packager.unpack(msg);
console.log(parsed);
console.log();

console.log('Repacked message: ');
var msg = packager.packWithBinMask(parsed);
console.log(msg);

