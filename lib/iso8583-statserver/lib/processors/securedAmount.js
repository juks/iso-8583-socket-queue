exports.messageTypes = ['0210', '0410'];

exports.process = function(p) {
  // In case of non zero response code -- do nothing
  if (parseInt(p.getField(39))) return;

  var amount = parseInt(p.getField(4)) / 100;

  if (p.messageTypeId == '0210') {
    if (p.getField(3) != '200000') {
      this.value += amount;
    } else {
      this.value -= amount;
    }
  } else if(p.messageTypeId == '0410') {
    this.value -= amount;
  }
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