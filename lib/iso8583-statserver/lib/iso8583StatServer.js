var net = require('net');

function statServer(port) {
  var parent = this;
  this.server = net.createServer(function (socket) {

    // 'Error' event is triggered on socket errors
    socket.on('error', function(err) {
      dd('Stat server socket <error> ' + err);
    });

    socket.write(parent.getScore() + '\n');
    socket.end();
  }).listen(port);

  this.server.on('error', function(err) {
    dd('Stat server <error> ' + err);
  });

  dd('Stat server is now runnig on port ' + port);

  this.reports = {
            securedAmount:      require('./processors/securedAmount.js'),
            processedAmount:    require('./processors/processedAmount.js'),
            refundAmount:       require('./processors/refundAmount.js'),
            reversalAmount:     require('./processors/reversalAmount.js'),
            faultStat:          require('./processors/faultStat.js'),
            packetCount:        require('./processors/packetCount.js')
          };
}

// Adds message to queue
statServer.prototype.process = function(p) {
  var mti = p.messageTypeId;
  if (!mti) return false;

  for (var reportName in this.reports) {
    if (this.reports[reportName]['messageTypes'].indexOf(mti) >= 0 || this.reports[reportName]['messageTypes'].indexOf('*') >= 0) {
      this.reports[reportName].process(p);
    }
  }
}

// Returns the score board
statServer.prototype.getScore = function() {
  var result = {};

  for (var reportName in this.reports) {
    result[reportName] = this.reports[reportName].getValue();
  }

  return JSON.stringify(result);
}

// Resets the score board
statServer.prototype.reset = function() {
  for (var reportName in this.reports) {
    if (this.reports[reportName].hasOwnProperty('reset')) {
      this.reports[reportName].reset();
    }
  }
}

// Dump the statistics
statServer.prototype.dump = function() {
  var result = {};

  for (var reportName in this.reports) {
    result[reportName] = this.reports[reportName].getValue();
  }

  return result;
}

// Restore the statistics
statServer.prototype.restore = function(data) {
  if (!data) return;
  
  for (var reportName in this.reports) {
    if (data.hasOwnProperty(reportName)) this.reports[reportName].setValue(data[reportName])
  }

}

module.exports = statServer;
