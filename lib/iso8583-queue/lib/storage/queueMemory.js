
function queueMemory() {
  this.index = 0;
  this.q = {};
}

// Get message by id
queueMemory.prototype.getById = function(id) {
  return this.q.hasOwnProperty(id) ? this.q[id] : null;
}

// Get all messages in queue
queueMemory.prototype.getMessages = function() {
  return this.q;
}

// Queue new message
queueMemory.prototype.addMessage = function(item) {
  if (!item.hasOwnProperty('id')) item['id'] = this.index;

  this.q[this.index] = item;
  this.index++;

  return item['id'];
}

// Get total message count
queueMemory.prototype.getCount = function() {
  return Object.keys(this.q).length;
}

// Get pending message count
queueMemory.prototype.getPendingCount = function() {
  cnt = 0;
  for (var i in this.q) {
    if (!this.q[i].isProcessed) cnt++;
  }

  return cnt;
}

// Check if queue is empty
queueMemory.prototype.isEmpty = function() {
  return this.getCount() == 0;
}

// Get queue messages id list
queueMemory.prototype.getKeys = function() {
  return Object.keys(this.q);
}

// Get processed messages list
queueMemory.prototype.getActiveSenders = function () {
  result = [];

  for (var i in this.q) {
    var qe = this.q[i];
    if (qe.isProcessed) {
      result.push(qe);
    }
  }

  return result;
}

// Confirm queued message
queueMemory.prototype.confirm = function(id) {
  delete this.q[id];
}

module.exports = queueMemory;