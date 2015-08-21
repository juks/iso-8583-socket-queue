exports.messageTypes = ['0200'];

exports.process = function(p) {
  this.value += p.getField(4) / 100;
}

exports.getValue = function() {
  return this.value;
}

exports.setValue = function(data) {
  this.value = data;
}

// Resets the stats
exports.reset = function() {
  this.value = 0;
}

exports.reset();