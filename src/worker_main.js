// main worker file

const io = require('socket.io-client');
let socket = null;

onmessage = function(e) {
    try {
        switch(e.data.type) {
            case 'make_connect':
                socket = io(...e.data.content);
                socket.on('connect', function() {
                    postMessage({
                        type: 'on_cb',
                        eventname : 'connect',
                        content : undefined
                    });
                    postMessage({
                        type : 'id',
                        content : socket.id
                    })
                });
                socket.on('connect_error', function(error) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'connect_error',
                        content : error.toString()
                    });
                })
                socket.on('connect_timeout', function(timeout) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'connect_timeout',
                        content : timeout
                    });
                });
                socket.on('error', function(error) {
                    postMessage({
                        type : 'on_cb',
                        eventname: 'error',
                        contnet : error.toString()
                    });
                });
                socket.on('disconnect', function(reason) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'disconnect',
                        content : reason
                    });
                });
                socket.on('reconnect', function(attempt) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'reconnect',
                        content : attempt
                    });
                });
                socket.on('reconnect_attempt', function(attempt) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'reconnect_attempt',
                        content : attempt
                    });
                });
                socket.on('reconnecting', function(attempt) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'reconnecting',
                        content : attempt
                    });
                });
                socket.on('reconnect_error', function(error) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'reconnect_error',
                        content : error.toString()
                    });
                });
                socket.on('reconnect_failed', function() {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'reconnect_error',
                        content : undefined
                    });
                });
                socket.on('ping', function() {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'ping',
                        content : undefined
                    });
                });
                socket.on('pong', function(latency) {
                    postMessage({
                        type : 'on_cb',
                        eventname : 'pong',
                        content : latency
                    });
                });
                break;
            case 'emit':
                if (socket !== null) {
                    socket.emit(...e.data.content);
                }
                break;
            case 'emit_ack':
                if (socket !== null) {
                    socket.emit(...e.data.content, function(ack) {
                        postMessage({
                            type : 'emit_cb',
                            ackId : e.data.ackId,
                            content : ack
                        });
                    });
                }
            case 'on':
                if (socket !== null) {
                    if (socket.listeners(e.data.eventname).length == 0) {
                        socket.on(e.data.eventname, function(inboundMsg) {
                            postMessage({
                                type : 'on_cb',
                                eventname : e.data.eventname,
                                content : inboundMsg
                            });
                        });
                    }
                } else {
                    postMessage({
                        type : 'error',
                        content : 'socket isnt connected'
                    });
                }
                break;
            case 'close':
                if (socket) {
                    socket.close();
                }
                break;
        }
    } catch (err) {
        postMessage({type : 'error', content : err.toString()});
    }
}
