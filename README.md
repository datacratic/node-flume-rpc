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

Please note that there are bugs in the latest version of node-thrift
(0.7.0) that cause the sink to throw exceptions under load and/or to suddenly
jam up and eventually run out of memory.  Please see
https://github.com/wadey/node-thrift/pull/13 for details.  I have created
a fork of that project with the appropriate fixes in it; in order to
install that you need to get the patched version at
https://github.com/recoset/node-thrift.  To do this, run

   npm install http://github.com/recoset/node-thrift/tarball/v0.7.0-recoset
   
I'll update this readme once the fixes have been merged and a new release
made.

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

## Sink Reference

### Accessing

    var flume = require('flume-rpc');
    var Sink = flume.Sink;


### Creating a Sink

    var sink = new Sink;

There are no constructor arguments; the configuration is done later on.

### Listening for messages

    sink.listen(port, [hostname], [callback]);

This method will listen on the given port, binding to the given hostname.
For the moment, for some unknown reason, the callback argument won't
actually be called on a successful bind; you should use the 'listen'
event instead.  On an error, the 'error' event will be emitted.


### Closing down the sink

    sink.close();
    
This will close down the sink, asynchronously.  The 'close' event will be
emitted once it's finished shutdown.


### Getting log messages

    sink.on('message', function (msg) { ... });

Registers a handle to be called whenever a message is received.


### Responding to an RPC close request

As part of the protocol, a source can ask its sink to close via RPC.
Personally, I haven't found a use for this but it's exposed nonetheless.

    sink.on('rpcClose', function (onSuccess) { ... ; onSuccess(); });

The onSuccess() function should be called back once the close has succeeded.
TODO: errors?

#### Message format

The sink receives messages that look like this:

    { timestamp: 1529023563,     // Timestamp in seconds
      nanos: 2506809501,         // nanosecond part of timestamp
      priority: 3,               // see flume.Priority for values
      body: 'hello',             // string or Buffer containing the data from the body
      host: 'host.name.com',     // host that it came from
      fields: {}                 // metadata associated with the event
    }

The fields structure may contain more information if the flume flow that
produced the message is more complicated.


### Other Events

    sink.on('error', function (err) { ... });
    
Called with the details of an error when one occurs.
    
    sink.on('connection', function (sock) { ... });
    
Called with the created socket once a connection is made (something
connects to the sink).  See http://nodejs.org/docs/v0.4.9/api/net.html#event_connection_
    
    sink.on('listening', function () { ... });
    
Called once the socket is bound and has started listening.
    
    sink.on('close', function () { ... });

Called when the server closes.  See http://nodejs.org/docs/v0.4.9/api/net.html#event_close_

### Accessing the underlying server

These are not part of the API, but are exposed.

    sink.server

This is ths server created by Thrift.  It's derived from net.Server.


## Source Reference


## Dependencies

The RPC messages are sent with thrift, and so version 0.7.0 or greater of
node thrift support is required.  (Earlier versions don't allow the
transport to be set).

## Development

* TODO: list commands used to regenerate thrift bindings
* TODO: discussion of selection of different transport