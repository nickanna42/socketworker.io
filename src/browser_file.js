//client file

const ioworker = function(socketURL, socketOptions) {
    const workerURI = new Blob([decodeURIComponent("reallyUniqueName")], {type : 'application/javascript'});
    return new ioworker.Socket(workerURI, socketURL, socketOptions)
};

ioworker.Socket = class socketworker {
    constructor(workerURI, socketURL, socketOptions) {
        const self = this;
        socketURL = socketURL || '/';
        if (socketURL[0] == '/') {
            socketURL = window.location.protocol + '//' + window.location.host + socketURL;
        }
        socketOptions = socketOptions || {};
        self.worker = new Worker(URL.createObjectURL(workerURI));
        self.worker.postMessage({
            type : 'make_connect',
            content : [socketURL, socketOptions]
        });
        self.ackFunctions = {}; // key: ackId value: function
        self.onHandlers  = {}; // key: eventname value: Array of functions

        self.worker.onmessage = function(e) {
            switch (e.data.type) {
                case 'error':
                    throw new Error(e.data.content);
                case 'emit_cb':
                    self.ackFunctions[e.data.ackId](e.data.content);
                    delete self.ackFunctions[e.data.ackId];
                    break;
                case 'on_cb':
                    if (self.onHandlers[e.data.eventname]) {
                        self.onHandlers[e.data.eventname]
                        .forEach(function(currentHandler) {
                            currentHandler(e.data.content);
                        });
                    }
                    break;
                case 'id':
                    self.id = e.data.content;
                    break;
            }
        };
    }

    emit() {
        const self = this;
        const argumentsArray = Array.from(arguments);
        if (typeof argumentsArray[argumentsArray.length - 1] == 'function') {

            const ackFunc = argumentsArray.pop();
            let tempKey = null;
            do {
                tempKey = Math.floor(Math.random()*100000).toString(16);
            } while (
                Object.keys(self.ackFunctions).indexOf(tempKey) != -1
            );
            self.ackFunctions[tempKey] = ackFunc;
            self.worker.postMessage({
                type : 'emit_ack',
                ackId : tempKey,
                content : argumentsArray
            });
        } else {
            self.worker.postMessage({
                type : 'emit',
                content : argumentsArray
            });
        }
    }

    on() {
        const self = this;
        if (typeof arguments[0] == 'string' && typeof arguments[1] == 'function' && arguments.length == 2) {
            const [currentEventName, currentOnCb] = Array.from(arguments);
            if (!self.onHandlers[currentEventName]) {
                self.onHandlers[currentEventName] = [];
            }
            self.onHandlers[currentEventName].push(currentOnCb);
            self.worker.postMessage({
                type : 'on',
                eventname : currentEventName
            });
        } else {
            throw new TypeError('.on() passed bad params');
        }
    }

    send() {
        const argumentsArray = Array.from(arguments);
        this.emit('message', ...argumentsArray);
    }

    close() {
        postMessage({
            type : 'close'
        });
    }

    disconnect() {
        this.close();
    }
}

module.exports = ioworker;
