var iso8583Packet    = require('../../../lib/iso8583-packet');
var net              = require('net');
var moment           = require("moment");

function testClient() {

}

testClient.prototype.start = function (c, terminalId) {
  var parent = this;
  var packets = [200, 400, 800];

  var socket = net.createConnection({host: c.testTargetHost, port: c.testTargetPort}, function() {
    //var p = parent.getPacket(packets[Math.floor(Math.random() * (2 - 0))]);
    var p = parent.getPacket(packets[2]);

    this.sourcePacket = p;
    this.write(p.getMessage());
    this.isWaiting = true;
    this.isTrying = false;
  });

  parent.terminalId  = terminalId;
  socket.isWaiting   = true;
  socket.isTrying    = true;

  socket.on('data', function (data) {
    if (!this.isWaiting) {
      dd(('Test failed: test client ' + parent.terminalId + ' got unexpected message. WTF?!').red);
    } else {
      this.isWaiting = false;
    }

    //
    try {
      var rp = new iso8583Packet(data);

      if (rp.messageTypeGroup != this.sourcePacket.messageTypeGroup) {
        dd(('Test failed: test client ' + parent.terminalId + ' got packet ' + rp.messageTypeId + ' but sent ' + this.sourcePacket.messageTypeId).red);
      } else if (rp.getField(41) == parent.terminalId) {
        dd('Test client ' + parent.terminalId + ' got correct response');
      } else {
        dd(('Test failed: test client ' + parent.terminalId + ' got echo response with incorrect Terminal Id ' + rp.getField(41)).red);
      }
    } catch (ex) {
      dd(('Test failed: test client ' + parent.terminalId + 'failed to parse iso8583 packet.' + ex).red);
    }

    this.end();
  });

  socket.on('timeout', function(data) {
    dd(('Test failed: test client ' + parent.terminalId + ' got timeout'));
  });

  socket.on('error', function(err) {
    dd(('Test client socket error ' + err).red);

    this.end();
  });

  socket.on('end', function() {

  });

  socket.on('close', function () {
    if (this.isWaiting) {
      dd('Test failed. Connection closed with no response.'.red);
    } else if (this.isTrying) {
      dd('Test failed. Unable to connect.'.red);
    }

    setTimeout(function() {
      socket = parent.start(c, terminalId);
    }.bind(parent), Math.floor(Math.random() * (8000 - 1000) + 1000));
  });

  return socket;
};

testClient.prototype.getPacket = function (type) {
  var p = {};
  var now = moment(new Date());

  // Echo
  if (type == 800) {
    p[0]  = '0800';                                     // Message Type
    p[3]  = '990000';                                   // Processing code
    p[7]  = now.format("MMDDHHmmss");            // Data & Time, Transmission
    p[11] = '000001';                                   // System Trace Audit Number
    p[24] = '831';                                      // Function Code
    p[41] = this.terminalId;                            // Terminal Id
  // Purchase
  } else if (type == 200) {
    p[0]  = '0200';                                     // Message type
    p[3]  = 0;                                          // Processing Code
    p[4]  = 30000;                                      // Amount, Transaction
    p[7]  = now.format("MMDDHHmmss");            // Data & Time, Transmission
    p[11] = '000001';                                   // System Trace Audit Number
    p[12] = now.format("YYMMDDHHmmss");          // Time, Local Transaction
    p[14] = 170331;                                     // Date, Expiration
    p[22] = 56;                                         // Pos Entry Mode
    p[24] = 200;                                        // Function Code
    p[25] = '00';                                       // Pos Condition Code
    p[35] = '4276777777775205=17032267777777777700';    // Track 2 Data
    p[41] = this.terminalId;                            // Card Acceptor Terminal Identification
    p[42] = 123456;                                     // Merchant Id
    p[49] = 810;                                        // Currency code, transaction
    p[55] = Buffer.from('9f2608fd19d0f54d38dfb99f2701809f10120110a04000220000000000000000000000ff9f370437ed4d4d9f360201ca950500000010009a031504089c01009f02060000000005005f2a020643820239009f1a0206439f03060000000000009f3303e0e1c89f34035e03009f3501229f1e0835313130303836338407a00000000410109f41030002425f340101', 'hex');
  // Reverse
  } else if (type == 400) {
    p[0]  = '0400';                                     // Message type
    p[2]  = '4276777777775205'                          // Primary Account Number
    p[3]  = 0;                                          // Processing Code
    p[4]  = 3000;                                       // Amount, Transaction
    p[7]  = now.format("MMDDHHmmss");            // Data & Time, Transmission
    p[11] = '000001';                                   // System Trace Audit Number
    p[12] = now.format("YYMMDDHHmmss");          // Time, Local Transaction
    p[14] = 170331;                                     // Date, Expiration
    p[22] = 56;                                         // Pos Entry Mode
    p[24] = 400;                                        // Function Code
    p[25] = '00';                                       // Pos Condition Code
    p[35] = '4276777777775205=17032267777777777700';    // Track 2 Data
    p[37] = '319385112168';                             // Retrieval Reference Number
    p[41] = this.terminalId;                            // Card Acceptor Terminal Identification
    p[42] = 123456;                                     // Merchant Id
    p[49] = 810;                                        // Currency code, transaction
  }

  return new iso8583Packet(p);
};

testClient.prototype.restart = function() {
  this.client.end
};

module.exports = testClient;