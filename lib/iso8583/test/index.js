var ISOLIB = require('../');
var ISO = ISOLIB.ISO8583;
var packager = ISOLIB.defaultPackager;

/*
var msg = '080020200000008000000000000000013239313130303031';
var iso = new ISO(packager);
var parsed = iso.unpack(msg);

var msg = '0800A02000000080001004000000000000000000000000013239313130303031001054455354204D455353470301';
var iso = new ISO(packager);
var parsed = iso.unpack(msg);
*/

var msg = '0210723A00010A80840018593600141001099999011000000010000000100702153300000119153310061007065656561006090102240000000901360020100236C0102240000000';
console.log(msg);
var iso = new ISO(packager);
var parsed = iso.unpack(msg);
console.log(parsed);
var iso = new ISO(packager);
var msg = iso.pack(parsed);
console.log(msg);

