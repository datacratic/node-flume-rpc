var sys = require('sys'),
    os = require('os'),
    thrift = require('thrift'),
    flume = require('./ThriftFlumeEventServer'),
    FlumeProcessor = flume.Processor,
    FlumeClient = flume.Client,
    ttypes = require('./flume_types'),
    EventEmitter = require("events").EventEmitter;

console.log(sys.inspect(ttypes));

exports.Priority = ttypes.Priority;
exports.EventStatus = ttypes.EventStatus;

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
            self.emit("message", event);
        },
        close: function(callWhenFinished) {
            self.emit("close", callWhenFinished);
        }
    };

    this.server = thrift.createServer(FlumeProcessor, handler,
                                      { transport: ttransport.TBufferedTransport });

    this.server.on('listening', function () { self.emit('listening'); });
};

sys.inherits(Sink, EventEmitter);

Sink.prototype.listen = function(hostname, port, cb) {
    this.server.listen(hostname, port, cb);
};

Sink.prototype.close = function(hostname, port) {
    this.server.close();
};

var Source = exports.Source = function (hostname, port) {
    var self = this;
    EventEmitter.call(this);

    this.conn = thrift.createConnection(hostname, port,
                                        {transport: ttransport.TBufferedTransport});
    this.client = thrift.createClient(FlumeClient, this.conn);

    this.conn.on('error', function onError(e) { self.emit('error', e); });
    this.conn.on('close', function onClose() { self.emit('close'); });
    this.conn.on('timeout', function onTimeout() { self.emit('timeout'); });
    this.conn.on('connect', function onConnect() { self.emit('connect'); });

    this.hostname = os.hostname();
};

sys.inherits(Source, EventEmitter);

Source.prototype.log = function(str, priority, fields, cb) {

    console.log(typeof priority);
    if (typeof priority == 'function') {
        cb = priority;
        priority = null;
    }
    else if (typeof fields == 'function') {
        cb = fields;
        fields = null;
    }

    var now = new Date();
    var ts = now.valueOf() / 1000;
    var ns = now.getMilliseconds() * 1000000;

    // Package it up for thrift
    var obj = {
        body: str + '',
        host: this.hostname,
        priority: priority || ttypes.Priority.INFO,
        fields: fields || {},
        timestamp: ts,
        nanos: ns
    };

    var toSend = new ttypes.ThriftFlumeEvent(obj);

    console.log("sending ", toSend);

    this.client.append(toSend, cb);
};

