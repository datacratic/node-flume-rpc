var sys = require('sys'),
    os = require('os'),
    thrift = require('thrift'),
    flume = require('./ThriftFlumeEventServer'),
    FlumeProcessor = flume.Processor,
    FlumeClient = flume.Client,
    ttypes = require('./flume_types'),
    EventEmitter = require("events").EventEmitter;

//console.log(sys.inspect(ttypes));

exports.Priority = ttypes.Priority;
exports.EventStatus = ttypes.EventStatus;

// Depending upon npm version, it seems that one or the other is required
var ttransport;
try {
    ttransport = require('thrift/lib/thrift/transport');
} catch (e) {
    ttransport = require('thrift/transport');
}

var Sink = exports.Sink = function Sink() {
    var self = this;
    EventEmitter.call(this);

    var handler = {
        append: function (event) {
            self.emit("message", event);
        },
        close: function (callWhenFinished) {
            self.emit("rpcClose", callWhenFinished);
        }
    };

    this.server = thrift.createServer(FlumeProcessor, handler,
                                      { transport: ttransport.TBufferedTransport });

    // Forward other events...
    this.server.on('listening', function onListening() { self.emit('listening'); });
    this.server.on('connection', function onConnection(socket) { self.emit('connection', socket); });
    this.server.on('close', function onClose() { self.emit('close'); });
    this.server.on('error', function onErr(err) { self.emit('error', err); });
};

sys.inherits(Sink, EventEmitter);

Sink.prototype.listen = function listen(hostname, port, cb) {
    this.server.listen(hostname, port, cb);
};

Sink.prototype.close = function close(hostname, port) {
    this.server.close();
};

var Source = exports.Source = function Source(hostname, port) {
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

Source.prototype.log = function log(str, priority, fields, cb) {

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

    // Convert to the type that thrift wants
    var toSend = new ttypes.ThriftFlumeEvent(obj);

    //console.log("sending ", toSend);

    this.client.append(toSend, cb);
};

Source.prototype.close = function close()
{
    this.conn.end();
};