# node-flume-rpc

This allows a very simple node.js endpoint to be setup that will receive
messages from flume.  This is mostly useful for interoperability between
flume and some other node.js-based process.

There is also a matching source that can be used to send data into flume.
This was mostly developed to test the sink, and is as such less supported.

It's a very, very thin wrapper around thrift's output for the IDL files
included in flume.

Be warned: it's highly alpha at the moment.


## Install

    npm install flume-rpc


## Synopsis (Sink)

    var flume = require('flume-rpc');
    var Sink = flume.Sink;
    var sink = new Sink;
    sink.on('message', function(msg) { console.log(msg.body); });
    sink.on('close', function(success) { this.close();  success(); });
    sink.listen(35861);  // this is the default flume RPC port

To test (assuming there's a properly set up flume instance running):

    echo "hello" | flume sink 'rpcSink("localhost")'


## Synopsis (Source)

    var flume = require('flume-rpc');
    var Source = flume.Source;
    var source = new Source('localhost', 35861);
    source.on('connect', function () {
       source.log('hello', flume.Priority.INFO, function () {
           console.log('send done');  source.close();
            })
    });

To test (assuming there's a properly set up flume instance running):

    flume dump 'rpcSource("localhost")'

and then run the script above.


## Message format

The sink receives messages that look like this:

    { timestamp: 1529023563,
      nanos: 2506809501,
      priority: 3,
      body: 'hello',
      host: 'host.name.com',
      fields: {}
    }

## Dependencies

The RPC messages are sent with thrift, and so version 0.7.0 or greater of
node thrift support is required.  (Earlier versions don't allow the
transport to be set).

## Development

* TODO: list commands used to regenerate thrift bindings
* TODO: discussion of selection of different transport