exports.messageTypes = ['0410'];

exports.process = function(p) {
  // In case of non zero response code -- do nothing
  if (parseInt(p.getField(39))) return;

  var amount = parseInt(p.getField(4)) / 100;
  this.value += amount;
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