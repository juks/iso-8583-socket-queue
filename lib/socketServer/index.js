module.exports.clientSocket = require('./lib/clientSocket');
module.exports.clientHttpServer = require('./lib/clientHttpServer');
module.exports.upstreamChannel = require('./lib/upstreamChannel');
module.exports.upstreamChannelClient = require('./lib/upstreamChannelClient');
module.exports.upstreamChannelServer = require('./lib/upstreamChannelServer');

// Backwards-compatible aliases for older integrations.
module.exports.upstream = module.exports.upstreamChannelClient;
module.exports.upstreamListen = module.exports.upstreamChannelServer;