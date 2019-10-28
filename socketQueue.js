var socketServer    = require('./lib/socketServer');
var helpers         = require('./lib/helpers');
var argv            = require('optimist').argv;
var cfgParams       = require('./lib/cfgParams');
var winston         = require('winston');
                      require('winston-logstash');
var fs              = require('fs');
var logger          = false;
var fileTransport   = null;

// Available runtime parameters configuration
global.validParams = require('./parameters.js').params;

// This one displays configuration help
String.prototype.repeat = function(num)  {
  return new Array( num + 1 ).join( this );
}

var c = {};
var defaults = {};

// Loading command line parameters
for (var name in argv) {
  if (name == '_' || name.substring(0,1) == '$') continue;

  var val = cfgParams.read(name, argv[name]);

  if (val !== null) {
    c[name] = val;
  } else {
    console.log("Configuration error: invalid parameter " + name + ". See node socketQueue.js --help to see available parameters\n");
    process.exit(0);
  }
}

// Read file config
if (c.c) {
  if (!fs.existsSync(c.c)) {
    console.log("Configuration file " + c.c + " does not exist!");
    process.exit(0);
  }

  var cfgData = JSON.parse(fs.readFileSync(c.c, 'utf8'));

  for (var name in cfgData) {
    var val = cfgParams.read(name, cfgData[name]);

    if (val !== null) {
      c[name] = val;
    } else {
      console.log("Configuration file: invalid parameter " + name + ". See node socketQueue.js --help to see available parameters\n");
      process.exit(0);
    }
  }
}

// Applying defaults
for (var name in validParams) {
  if (validParams[name]['default'] && !c.hasOwnProperty(name)) {
    c[name] = cfgParams.read(name, validParams[name]['default']);
    defaults[name] = true;
  }
}

global.c = c;
global.dd = dd;
global.defaultSyntax = c.hostConfig;

// Display help screen
if (c.help) {
  cfgParams.showHelp();

  process.exit(0);
}

// Display help in JSON format
if (c.helpJson) {
  cfgParams.showHelpJSON();

  process.exit(0);
}

// Checking parameters
if ((!c.upstreamHost && !c.upstreamListenPort && !c.testClients && !c.echoServerPort) || c.upstreamHost && (!c.upstreamPort || (!c.listenPort && !c.listenHttpPort))) {
  console.log("Usage socketQueue.js [options]");
  console.log("Run socketQueue.js --help to see help");

  process.exit(0);
} else if (c.testClients && !c.testTargetHost) {
  console.log("No test target host specified. Aborting");

  process.exit(0);
} else if (c.testClients && !c.testTargetPort) {
  console.log("No test target port specified. Aborting");

  process.exit(0);
} else if (c.logstashHost && !c.logstashPort) {
  console.log("No Logstash port specified. Aborting");

  process.exit(0);
}

// Overrides
if (c.overrides) {
  params = c.overrides.split(',');
  global.overrides = {};

  for (var i in params) {
    var parts = params[i].split(':');
    var item = {type: parts[1]};
    if (parts[2] !== 'undefined') item['length'] = parseInt(parts[2]);
    global.overrides[parts[0]] = item;
  }
}

// Header format
if (c.headerFormat) {
  params = c.headerFormat.split(',');
  global.headerFormat = [];

  for (var i in params) {
    var parts = params[i].split(':');
    var item = {name: parts[0], type: parts[1], length: parseInt(parts[2])};
    if (parts[3] !== 'undefined') item['default'] = parts[3];

    global.headerFormat.push(item);
  }
}

// Setting up Winston debug
if (c.v) c.debugLevel = 'info';
if (c.vv) c.debugLevel = 'verbose';

if (c.debugLevel) {
  var customLevels = {
    common: 0,
    private: 1
  };

  var transports = [];
  var dateFunc = function() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).substr(-2) + '-' + ('0' + d.getDate()).substr(-2) + ' ' + ('0' + d.getHours()).substr(-2) + ':' + ('0' + d.getMinutes()).substr(-2) + ':' + ('0' + d.getSeconds()).substr(-2)}

  // Set up console logging
  if (!c.silent) {
    transports.push(new (winston.transports.Console)(
      {
        timestamp:  dateFunc,
        level:      c.debugLevel
      }));
  }

  winston.level = c.debugLevel;
  winston.showLevel = false;

  // Set up logging into file
  if (c.logFile) {
    fileTransport = new (winston.transports.File) (
      {
        filename:       c.logFile,
        json:           false,
        showLevel:      false,
        colorize:       false,
        timestamp:      dateFunc,
        level:          c.debugLevel
      });

    transports.push(fileTransport);
  }

  // Logstash
  if (c.logstashHost) {
    ls = new (winston.transports.Logstash)(
      {
        host:           c.logstashHost,
        port:           c.logstashPort,
        node_name:      c.logstashNode,
        level:          c.debugLevel
      });

    ls.on('error', function (error) {
      dd('Winston Logstash error: ' + error);
    });

    transports.push(ls);
  }

  logger = new (winston.Logger) ({
    transports: transports
  });

  logger.exitOnError = false;
}

// c.debugLevel output
function dd(msg, level)  {
  if (!logger) return;
  if (!msg) return;
  if (!level) level = 'info';

  msg = helpers.safeLog(msg);

  // Here goes a sort of hidden multiline message delimiter
  msg += "                         ";

  logger.log(level, msg);
}

dd('Important: starting...'.green);
dd('Remote host configuration name: ' + c.hostConfig);

// Start the upstream server
if (c.upstreamHost || c.upstreamListenPort) {
  if (!c.upstreamListenPort) {
    var upstreamServer = new socketServer.upstream(c);
  } else {
    var upstreamServer = new socketServer.upstreamListen(c);
  }

  if (c.listenPort) {
    var serverSocket = new socketServer.clientSocket(upstreamServer, c).listen(c.listenPort);
    dd("Relay raw ISO-8583 server is now running on port " + c.listenPort);
  }

  if (c.listenHttpPort) {
    var serverHttp = new socketServer.clientHttpServer(upstreamServer, c).listen(c.listenHttpPort);
    dd("Relay HTTP server is now running on port " + c.listenHttpPort);
  }

  if (upstreamServer.statServer && c.statDumpFile && fs.existsSync(c.statDumpFile)) {
    upstreamServer.statServer.restore(JSON.parse(fs.readFileSync(c.statDumpFile)));
  }
} else {
  var upstreamServer  = null;
  var serverSocket    = null;
  var serverHttp      = null;
}

if (c.echoServerPort || c.testClients) var testSuite = require('./lib/testSuite');

// Start test server and perform tests
if (c.echoServerPort) {
  // Run local echo server
  var echoServer = new testSuite.echoServer(c, dd).listen(c.echoServerPort);
  dd("Echo server is now running on port " + c.echoServerPort);
}

// Run local clients
if (c.testClients) {
  setTimeout(function () {
    var testClients = [];
    for (var i = 1; i < c.testClients + 1; i++) {
      testClients.push(new testSuite.testClient(dd).start(c, i));
    }
  }, 1000);
}

// Pidfile
if (c.pidFile) {
  fs.writeFile(c.pidFile, process.pid, function (err) {
    if (err) dd(err);
  });
}

// Signals
process.on('SIGINT', function() {
  dd('Warning: got SIGINT.');
  gracefulQuit();
});

process.on('SIGTERM', function() {
  dd('Warning: got SIGTERM.');

  gracefulQuit();
});

process.on('SIGHUP', function() {
   dd('Warning: got SIGHUP.');

  if (upstreamServer.statServer) upstreamServer.statServer.reset();
  if (fileTransport) helpers.winstonRotate(fileTransport);
});

// On Exit
process.on('exit', function(code) {
  if (c.pidFile) {
    // Clear pid file
    fs.writeFile(c.pidFile, '', function (err) {
      if (err) dd(err);
    });
  }

  // Dump stats
  if (upstreamServer && upstreamServer.statServer && c.statDumpFile) {
    fs.writeFileSync(c.statDumpFile, JSON.stringify(upstreamServer.statServer.dump()));
  }
});

function gracefulQuit() {
  // If no upstream server running -- just quit
  if (!upstreamServer) {
    dd('Quitting...');
    global.flushAndQuit();
  // If there is upstream server -- let it pick a proper moment then quit
  } else {
    if (serverSocket) serverSocket.deny();
    if (serverHttp) serverHttp.deny();

    upstreamServer.emit('terminate');
  }
}

global.flushAndQuit = function() {
  if (fileTransport) {
    helpers.winstonFlushAndQuit(fileTransport);
  } else {
    process.exit(0);
  }
}
