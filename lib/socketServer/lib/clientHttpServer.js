var helpers = require('../../../lib/helpers');
var http = require('http');

var maxConnections = 100;
// Todo: proper initialization with no hardcode
var hexFields = [52, 55];

function clientHttpServer(upstream, config) {
    this.noMore = false;

    var parent = this;

    var server = http.createServer(function (request, response) {
        // This method sends client reply
        request.sendReply = function (message, code, errors) {
            if (!errors) {
                errors = [];
            } else {
                if (!Array.isArray(errors)) errors = [errors];
            }

            if (!code) code = 200;

            if (!request.isRawMode) {
                message = JSON.stringify({result: message, errors: errors});
                message += '\n';
            }

            response.writeHead(code, {
                "Content-Type": "application/json",
                'Content-Length': message.length
            });

            response.write(message);
            response.end();
            request.client.end();
        }

        // This method is triggered by upstream to reply to the sender
        request.reply = function (packet) {
            var message = null;
            if (this.isRawMode) {
                message = packet.getRawMessage().toString('hex');
            } else {
                message = prepareObjectDataOut(packet.getFields());
            }

            this.sendReply(message);

            return true;
        };

        // This method is triggered on queue timeout
        request.queueTimeout = function () {
            dd('Client ' + request.name + ' gateway timeout');
            request.sendReply('', 504, 'Gateway timeout');
        };

        // This method is triggered to say client goodbye
        request.end = function () {
            request.client.end();
        }

        // Checks if request was already closed
        request.isClosed = function () {
            return !this.client.writable;
        };

        request.name = 'http:' + request.connection.remoteAddress + ':' + request.connection.remotePort;
        dd(('Client ' + request.name + ' connected').yellow);

        // If deny mode is on
        if (parent.noMore) {
            request.sendReply('', 503, 'Service Temporarily Unavailable');
            return;
        }

        if (request.method !== 'POST') {
            request.sendReply('', 405, 'Method Not Allowed');
            return;
        }
        var chunks = [];
        request.on('data', function (chunk) {
            dd(('Client ' + request.name + ' sent data').yellow);

            chunks.push(chunk);

            var bodyLength = chunks.reduce(function (sum, item) {
                return sum + item.length;
            }, 0);

            if (bodyLength > 1e6) {
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            var bodyBuffer = Buffer.concat(chunks);
            var expectedLength = parseInt(request.headers['content-length']);
            if (!isNaN(expectedLength) && bodyBuffer.length !== expectedLength) {
                request.sendReply('', 400, 'Bad request');
                return;
            }
            var body = bodyBuffer.toString();
            // We Handle JSON at / EG: { "0": "800", "3": "0", "7": "0607161700", "11": "123456", "24": "0", "41": "00123456", "42": "123567890124567" }
            if (request.url == '/') {
                var data = null;
                try {
                    data = JSON.parse(body);
                    data = prepareObjectDataIn(data);
                } catch (ex) {
                    this.sendReply('', 400, [ex.toString()]);
                    return;
                }
                // We handle raw hex data at /raw. EG: 30383030303132333435363030303030313233343536313233353637383930313234353637 (0800...)
            } else if (request.url == '/raw') {
                data = Buffer.from(body, 'hex');
                request.isRawMode = true;
            } else {
                this.sendReply('', 404, 'Not Found');
                return;
            }

            var errReturn = [];
            if (upstream.sendData(request, data, null, errReturn)) {
                return;
            }
            if (!errReturn.length) {
                this.sendReply('', 500, 'Failed to queue message');
            } else {
                this.sendReply('', 500, errReturn);
            }
        });

        // 'Close' event is triggered on connection close
        request.client.on('close', function () {
            dd(('Client ' + request.name + ' <close> event').yellow);

            if (request.queueMessageId !== undefined && request.queueMessageId !== null) {
                upstream.hasGone(request.queueMessageId);
            }
        });

        // 'Error' event is triggered on request errors
        request.on('error', function (error) {
            dd('Client <error> ' + error);
        });

        response.on('error', function (error) {
            dd('Client response <error> ' + error);
        });

        request.client.on('error', function (error) {
            dd('Client socket <error> ' + error);
        });

        // 'Timeout' event is triggered on request timeout
        request.on('timeout', function (error) {
            request.sendReply('', 408, 'Request timeout');
        });

        // 'Timeout' event is triggered on request timeout
        response.on('timeout', function (error) {
            request.sendReply('', 504, 'Gateway timeout');
        });
    });

    server.deny = function () {
        parent.noMore = true;
    }

    if (config.clientTimeout) {
        server.setTimeout(config.clientTimeout * 1000);
    }

    server.on('connection', function () {
        dd('New HTTP socket');
    });

    server.on('clientError', function (exception, socket) {
        dd('HTTP client error emitted at server object: ' + exception);
    });

    return server;
}

function prepareObjectDataIn(data) {
    for (var i in hexFields) {
        if (data.hasOwnProperty(hexFields[i])) {
            data[hexFields[i]] = Buffer.from(data[hexFields[i]], "hex");
        }
    }

    return data;
}

// Do data transition before sending out
function prepareObjectDataOut(data) {
    for (var i in hexFields) {
        if (data.hasOwnProperty(hexFields[i])) {
            if (typeof data[hexFields[i]] == 'object' && data[hexFields[i]] instanceof Buffer) {
                data[hexFields[i]] = data[hexFields[i]].toString('hex');
            } else {
                data[hexFields[i]] = Buffer.from(data[hexFields[i]], 'binary').toString('hex');
            }

        }
    }

    return data;
}

module.exports = clientHttpServer;
