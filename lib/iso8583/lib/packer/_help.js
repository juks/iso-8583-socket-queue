var fs = require('fs');
var files = fs.readdirSync('.');

var val = '123';

console.log("Available types reference:");
console.log("--------------------------\n");
console.log("Input value: " + val + "\n");
console.log("Output:\n");

files.forEach(function(fileName) {
    if (fileName == '_help.js') return;
    var packager = {'length': val.length};

    result = require('./' + fileName).pack(val, packager);

    process.stdout.write(fileName + ':' + ' '.repeat(20 - fileName.length));
    console.log(result.msg);
});