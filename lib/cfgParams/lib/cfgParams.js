module.exports.read = function(name, value, isCommandLine) {
  if (!isCommandLine) isCommandLine = false;

  if (!validParams.hasOwnProperty(name)) {
    return null;
  } else {
    if (validParams[name]['type'] == 's') {
      return value;
    } else if (validParams[name]['type'] == 'n') {
      return parseInt(value);
    } else if (validParams[name]['type'] == 'j') {
      return isCommandLine ? JSON.parse(value) : value;
    } else {
      return value == true ? true : false;
    }
  }
}

module.exports.showHelp = function() {
  console.log("\nSocketQueue is a socket queue (many-to-many-many-to-one connection demultiplexer) with extra toots (ISO8583 host emulator, IS08583 host load tests)");
  console.log("\nAvailable parameters:\n");

  for (var name in validParams) {
    var left = validParams[name].hasOwnProperty('replaced') ? '(DEPRECATED. Use "' + validParams[name]['replaced'] + '" instead)' : '';
    left += '--' + name;
    if (validParams[name]['sample']) left += '=' + validParams[name]['sample'];
    left += ':';

    console.log(left + ' '.repeat(50 - left.length) + validParams[name]['title']);
  }

  console.log("\nExample: node socketQueue.js --upstreamHost=10.1.15.146 --upstreamPort=2013 --listenPort=2014 --vv --logFile=log.txt\n");
}

module.exports.showHelpJSON = function() {
  var i = 0; var cnt = Object.keys(validParams).length;
  console.log('{');
  for (var name in validParams) {
    var msg = '"' + name + '": ';
    if (validParams[name]['default']) {
      msg += validParams[name]['type'] == 's' ? '"' + validParams[name]['default'] + '"' : validParams[name]['default'];
    } else if (validParams[name]['type'] == 's') {
      msg += '""';
    } else if (validParams[name]['type'] == 'b') {
      msg += 'false'
    } else {
      msg += '';
    }
    console.log('    ' + msg + (i == cnt - 1 ? '' : ','));
    i++;
  }

  console.log('}');
}