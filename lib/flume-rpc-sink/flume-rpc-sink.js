var sys = require('sys'),
    thrift = require('thrift'),
    FlumeProcessor = require('./ThriftFlumeEventServer').Processor,
    ttypes = require('./flume_types'),
    EventEmitter = require("events").EventEmitter;

// Depending upon npm version, it seems that one or the other is required
var ttransport;
try {
    ttransport = require('thrift/lib/thrift/transport');
} catch (e) {
    ttransport = require('thrift/transport');
}

var Sink = exports.Sink = function () {
    var self = this;
    EventEmitter.call(this);

    var handler = {
        append: function (event) {
            self.init("message", event);
        },
        close: function(callWhenFinished) {
            self.init("close", callWhenFinished);
        }
    };

    this.server = thrift.createServer(FlumeProcessor, handler,
                                      { transport: ttransport.TBufferedTransport });
};

sys.inherits(Sink, EventEmitter);

Sink.prototype.listen = function(hostname, port) {
    server.listen(hostname, port);
};

Sink.prototype.close = function(hostname, port) {
    server.close();
};

