var sys = require('sys'),
Sink = require('flume-rpc-sink').Sink,
Source = require('flume-rpc-sink').Source;

console.log(sys.inspect(require('flume-rpc-sink')));

var sink = new Sink();
sink.on('message', function (msg) { console.log('got message: ',
                                                sys.inspect(msg)); });
var source;


sink.on('listening', onListenDone);
sink.listen(9090, onListenDone);

function onListenDone()
{
    console.log('onListenDone()');
    source = new Source('localhost', 9090);
    source.on('connect', doSend);
}

function doSend()
{
    function doneSend(err)
    {
        console.log('done logging: ' + sys.inspect(err));
    }

    source.log('hello', doneSend);
}

