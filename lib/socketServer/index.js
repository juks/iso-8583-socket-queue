var clientHttpServerModule = require('./lib/clientHttpServer');

module.exports.clientSocket = require('./lib/clientSocket');
module.exports.clientHttpServer = clientHttpServerModule.clientHttpServer;
module.exports.prepareObjectDataOut = clientHttpServerModule.prepareObjectDataOut;
module.exports.upstream = require('./lib/upstream');
module.exports.upstreamListen = require('./lib/upstreamListen');
