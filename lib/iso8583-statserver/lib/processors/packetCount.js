exports.messageTypes = ['*'];

exports.process = function(p) {
  if (!this.mtiTable.hasOwnProperty(p.messageTypeId)) {
    this.mtiTable[p.messageTypeId] = 1;
  } else {
    this.mtiTable[p.messageTypeId]++;
  }

  this.mtiTable['total'] ++;
}

exports.getValue = function() {
  return this.mtiTable;
}

exports.setValue = function(data) {
  this.mtiTable = data;
}

// Resets the stats
exports.reset = function() {
  this.mtiTable = {total: 0};
}

exports.reset();