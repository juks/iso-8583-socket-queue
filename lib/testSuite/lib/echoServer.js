var iso8583Packet   = require('../../../lib/iso8583-packet');
var testSuite       = require('../../../lib/testSuite');
var helpers         = require('../../../lib/helpers');
var net             = require('net');

var cnt = 0;

function echoServer(c) {
  var parent = this;

  this.bank = new testSuite.socketBank();

  this.server = net.createServer(function (socket) {
    // 'Data' event is triggered when some client sends us data
    socket.on('data', function (data) {
      dd('Echo server got data');

      var rp = null;

      // Abrupt connection close test
      if (c.testRealLife > 1 && randomCase(10)) {
        dd('Echo server random abrupt connection close test'.magenta);
        this.end();

        return;
      }

      if (global.c['useLengthHeader']) {
        packetData = helpers.splitByHeader(data);
      } else {
        packetData = [data];
      }

      for (var index in packetData) {
        var p = new iso8583Packet(packetData[index]);

        if (!p.parseError) {
          dd('Replying to client ' + p.getField(41));

          rp = parent.bank.replyPacket(p);
          if (rp) this.write(rp.getMessage({lengthHeader: global.c['useLengthHeader']}));
          dd('Echo server sent response');

          cnt++;
          /*} else {
            setTimeout(function() {
              this.write(rp.getMessage({lengthHeader: global.c['useLengthHeader']}));
              dd('Echo server sent delayed response');
            }.bind(this), Math.floor(Math.random() * (5 - 0)) * 1000);
          }*/
        } else {
          dd('Echo server got bad packet ' + p.parseError);
        }
      }

      // Repeating message test
      if (rp && !rp.parseError && c.testRealLife > 1 && randomCase(5)) {
        dd('Echo server random garbage message test'.magenta);
        setTimeout(function() { this.write(rp.getMessage({lengthHeader: global.c['useLengthHeader']})) }.bind(this), 500);
      }
    });

    // 'End' event is triggered when the socket is about to close
    socket.on('end', function () {
      dd('Echo server <end>');
    });

    // 'Close' event is triggered when the socket was closed
    socket.on('close', function() {
      dd('Echo server <close>');
    });

    // 'Error' event is triggered on socket errors
    socket.on('error', function() {

    });
  });
};

echoServer.prototype.listen = function(port) {
  this.server.listen(port);
}

function randomCase(v) {
  return Math.floor(Math.random() * (v - 0)) == 1;
}

module.exports = echoServer;
