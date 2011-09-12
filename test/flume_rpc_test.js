var sys = require('sys'),
    Sink = require('flume-rpc-sink').Sink;

var sink = new Sink();
sink.on('message', function (msg) { console.log(sys.inspect(msg)); });
sink.listen(9090);

