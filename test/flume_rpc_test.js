var sys = require('sys'),
    thrift = require('thrift'),
    FlumeProcessor = require('../ThriftFlumeEventServer').Processor,
    ttypes = require('../flume_types'),
    ttransport = require('thrift/lib/thrift/transport');

console.log(sys.inspect(thrift));

var handler =  {
  append: function(event) {
    console.log("got event:", event);
    // Not asynchronous; it's a one-way event
  },

  close: function(success) {
    console.log("close received");
    success();
  },
};

var server = thrift.createServer(FlumeProcessor, handler,
                                 { transport: ttransport.TBufferedTransport });

server.listen(9090);

