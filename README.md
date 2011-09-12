# node-flume-rpc-sink

This allows a very simple node.js endpoint to be setup that will receive
messages from flume.  This is mostly useful for interoperability between
flume and some other node.js-based process.

## Install

    npm install flume-rpc-sink

## Synopsis

   var FlumeRPCSink = require('flume-rpc-sink').FlumeRPCSink;
   var sink = new FlumeRPCSink;
   sink.on('message', function(msg) { console.log(msg.body); });
   sink.on('close', function(success) { this.close();  success(); });
   sink.listen(35861);  // this is the default flume RPC port

To test (assuming there's a properly set up flume instance running):

   echo "hello" | flume sink 'rpcSink("localhost")'

## Message format

  { timestamp: 1529023563,
    priority: 3,
    body: 'hello',
    nanos: 2506809501,
    host: 'host.name.com',
    fields: {} }

## Dependencies

The RPC messages are sent with thrift, and so version 0.7.0 or greater of
node thrift support is required.  (Earlier versions don't allow the
transport to be set).

## Development

TODO: list commands used to regenerate thrift bindings
TODO: discussion of selection of different transport