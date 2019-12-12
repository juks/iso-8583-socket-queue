var fs = require('fs');
var files = fs.readdirSync('.');

var val = '123';
var valHex = '010203';

console.log("Available types reference:");
console.log("--------------------------\n");
console.log("Input value: " + val);
console.log("Input hex value: " + valHex + "\n");
console.log("Output:\n");

files.forEach(function(fileName) {
    if (fileName == '_help.js') return;

    let lib = require('./' + fileName);
    let result;
    let isHex = false;

    if (lib.hasOwnProperty('isHex') && lib.isHex()) {
      let packager = {'length': valHex.length};
      isHex = true;
      result = lib.pack(valHex, packager);
    } else {
      let packager = {'length': val.length};
      isHex = false;
      result = lib.pack(val, packager);
    }

    //process.stdout.write(fileName + (isHex ? ' (hex)' : '') + (lib.hasOwnProperty('help') ? ));
    var helpText = (isHex ? ' (hex)' : '') + (lib.hasOwnProperty('help') ? ' ' + lib.help() + ' ' : '')
    process.stdout.write("[" + fileName + "]" + ' '.repeat(15 - fileName.length) + helpText + ' '.repeat(120 - helpText.length));
    console.log(result.msg);
});