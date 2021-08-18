var iso8583Packet   = require('../../iso8583-packet')
var net             = require('net')
var moment          = require("moment")

function getSocketReadyHandler (socket) {
  return function () {
    dd(('Inbound request tester: sending echo to ISO proxy server every 10 seconds').green)
    socket.echoInterval = setTimeout(function () {
      var now = moment(new Date())
      var packet = new iso8583Packet({
        0: '0800',
        7: now.format("MMDDHHmmss"),
        11: '000001',
        70: 301
      })

      dd(('Inbound request tester: triggering echo request').green)
      dd(packet.pretty(), 'verbose')

      socket.write(
        packet.getMessage(
          {header: global.c['useHeader']}
        )
      )
    }, 0)
  }
}

function getSocketErrorHandler (socket) {
  return function (error) {
    dd(('Inbound request tester: socket error ' + error).red)
    if (error.code != 'ECONNREFUSED') {
      socket.retryDelay = 5000
    }

    socket.retry = true
    dd(('Inbound request tester: connection retry in ' + socket.retryDelay + ' ms').yellow)
  }
}

function getSocketCloseHandler (socket) {
  return function () {
    clearInterval(socket.echoInterval)
    if (socket.retry) {
      setTimeout(function () {
        socket = socket.recover()
      }, socket.retryDelay)
    }
  }
}

function initSocket (config, retry) {
  var retry = retry || 1
  var socket = net.createConnection({
    port: config.testTargetPort,
    host: config.testTargetHost,
  }, function () {
    dd(('Inbound request tester: connected to ISO proxy ' + socket.remoteAddress + ':' + socket.remotePort + '!').green)
  })

  socket.config = config
  socket.retry = false
  socket.retryDelay = 10000
  socket.recover = function () {
    if (retry > 5) {
      dd(('Inbound request tester: max connection retries reached').red)
      dd(('Inbound request tester: shutting down tester').red)
      return
    }

    dd(('Inbound request tester: try #' + retry + ' to connect to ISO proxy server').green)
    socket = initSocket(config, ++retry)
  }

  socket.on('ready', getSocketReadyHandler(socket))
  socket.on('error', getSocketErrorHandler(socket))
  socket.on('close', getSocketCloseHandler(socket))
  socket.on('data', function (data) {
    var packet = new iso8583Packet(data)
    dd(packet.pretty(), 'verbose')
  })

  return socket
}

function inboundRequestTester(config) {
  var socket = initSocket(config)
  this.socket = socket
}


module.exports = inboundRequestTester

