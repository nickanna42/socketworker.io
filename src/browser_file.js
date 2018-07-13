//client file

module.exports = function(socketURL, socketOptions) {
    const workerURI = new Blob(decodeURI("reallyUniqueName"), {type : 'application/javascript'});

    class socketworker {
        constructor(workerURI, socketURL, socketOptions) {
            socketURL = socketURL || '/';
            socketOptions = socketOptions || {};
            this.worker = new Worker(workerURI);
            this.worker.postMessage({
                type : 'make_connect',
                content : [socketURL, socketOptions]
            });
            this.ackFunctions = {}; // key: ackId value: function
            this.onHandlers  = {}; // key: eventname value: Array of functions

            this.worker.onmessage = function(e) {
                switch (e.data.type) {
                    case 'error':
                        throw new Error(e.data.content);
                    case 'ack_cb':
                        this.ackFunctions[e.data.ackId](e.data.content);
                        delete this.ackFunctions[e.data.ackId];
                        break;
                    case 'on_cb':
                        this.onHandlers[e.data.eventname]
                        .forEach(function(currentHandler) {
                            currentHandler(e.data.content);
                        });
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
                    tempKey = Math.floor(Math.random()*100000).toString();
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
                    eventName : arguments[0]
                });
            } else {
                throw new TypeError('.on() passed bad params');
            }
        }
    }

    return new socketworker(workerURI, socketURL, socketOptions)
};
