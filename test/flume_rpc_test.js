var util = require('util'),
Sink = require('flume-rpc').Sink,
Source = require('flume-rpc').Source;

var source;
var sink = new Sink();

function onMessage(msg)
{
    console.log('got message: ', util.inspect(msg));
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
        console.log('done logging: ' + util.inspect(err));
    }

    source.log('hello', doneSend);
}

