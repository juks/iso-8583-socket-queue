exports.messageTypes = ['0210', '410'];

exports.process = function(p) {
  // In case of non zero response code -- do nothing
  var errCode = parseInt(p.getField(39));
  if (!errCode) return;

  if (!this.errorTable.hasOwnProperty(errCode)) {
    this.errorTable[errCode] = 1;
  } else{
    this.errorTable[errCode]++;
  }
}

exports.getValue = function() {
  return this.errorTable;
}

exports.setValue = function(data) {
  this.errorTable = data;
}

// Resets the stats
exports.reset = function() {
  this.errorTable = {};
}

exports.reset();