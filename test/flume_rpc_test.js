var sys = require('sys'),
Sink = require('flume-rpc-sink').Sink,
Source = require('flume-rpc-sink').Source;

console.log(sys.inspect(require('flume-rpc-sink')));

var source;
var sink = new Sink();

function onMessage(msg)
{
    console.log('got message: ', sys.inspect(msg));
    sink.close();
    source.close();
}

sink.on('message', onMessage);

function onListenDone()
{
    console.log('onListenDone()');
    source = new Source('localhost', 9090);
    source.on('connect', doSend);
}

sink.on('listening', onListenDone);
sink.listen(9090, onListenDone);

function doSend()
{
    function doneSend(err)
    {
        console.log('done logging: ' + sys.inspect(err));
    }

    source.log('hello', doneSend);
}

