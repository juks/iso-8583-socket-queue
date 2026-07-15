var spawn = require('child_process').spawn;
var path = require('path');

var REQUIRED_RESPONSES = 50;
var TEST_CLIENTS = 5;
var RESPONSE_TIMEOUT_MS = 120000;
var READY_TIMEOUT_MS = 10000;

var successPattern = /Test client \d+ got correct response/;
var readyPattern = /Connected to upstream/;

var socketQueuePath = path.join(__dirname, '..', 'socketQueue.js');
var args = [
  socketQueuePath,
  '--upstreamHost=localhost',
  '--upstreamPort=5000',
  '--listenPort=2014',
  '--echoServerPort=5000',
  '--testTargetHost=localhost',
  '--testTargetPort=2014',
  '--testClients=' + TEST_CLIENTS,
  '--vv'
];

var child = spawn(process.execPath, args, {
  cwd: path.join(__dirname, '..'),
  stdio: ['ignore', 'pipe', 'pipe']
});

var successCount = 0;
var ready = false;
var finished = false;
var readyTimer;
var responseTimer;

function finish(code, message) {
  if (finished) return;
  finished = true;

  clearTimeout(readyTimer);
  clearTimeout(responseTimer);

  if (message) {
    if (code === 0) {
      console.log(message);
    } else {
      console.error(message);
    }
  }

  if (child.exitCode === null && !child.killed) {
    child.kill('SIGTERM');
    setTimeout(function () {
      if (child.exitCode === null && !child.killed) {
        child.kill('SIGKILL');
      }
    }, 3000).unref();
  }

  setTimeout(function () {
    process.exit(code);
  }, 500).unref();
}

function onLine(line) {
  if (!ready && readyPattern.test(line)) {
    ready = true;
    clearTimeout(readyTimer);
    responseTimer = setTimeout(function () {
      finish(1, 'Smoke test failed: got ' + successCount + '/' + REQUIRED_RESPONSES + ' responses within ' + RESPONSE_TIMEOUT_MS + 'ms');
    }, RESPONSE_TIMEOUT_MS);
  }

  if (successPattern.test(line)) {
    successCount++;
    if (successCount >= REQUIRED_RESPONSES) {
      finish(0, 'Smoke test passed: ' + successCount + ' successful responses from ' + TEST_CLIENTS + ' test clients');
    }
  }
}

function handleChunk(chunk) {
  chunk.toString().split(/\r?\n/).forEach(function (line) {
    if (line) onLine(line);
  });
}

child.stdout.on('data', handleChunk);
child.stderr.on('data', handleChunk);

child.on('error', function (err) {
  finish(1, 'Smoke test failed: ' + err.message);
});

child.on('exit', function (code, signal) {
  if (finished) return;

  if (successCount >= REQUIRED_RESPONSES) {
    finish(0, 'Smoke test passed: ' + successCount + ' successful responses from ' + TEST_CLIENTS + ' test clients');
    return;
  }

  var reason = signal ? 'signal ' + signal : 'exit code ' + code;
  finish(1, 'Smoke test failed: process exited with ' + reason + ' after ' + successCount + '/' + REQUIRED_RESPONSES + ' responses');
});

readyTimer = setTimeout(function () {
  finish(1, 'Smoke test failed: upstream not ready within ' + READY_TIMEOUT_MS + 'ms');
}, READY_TIMEOUT_MS);
