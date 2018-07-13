// main worker file

const io = require('socket.io-client');
let socket = null;

onmessage = function(e) {
    try {
        switch(e.data.type) {
            case 'make_connect':
                socket = io(...e.data.content);
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
                            type : 'ack_cb',
                            ackId : e.data.ackId,
                            content : ack
                        });
                    });
                }
            case 'on':
                if (socket !== null) {
                    socket.on(e.data.eventname, function(inboundMsg) {
                        postMessage({
                            type : 'on_cb',
                            eventname : e.data.eventname,
                            content : inboundMsg
                        });
                    });
                }
                break;

        }
    } catch (err) {
        postMessage({type : 'error', content : err.toString()});
    }
}
