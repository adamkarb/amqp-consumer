'use strict';

var amqp = require('amqplib');

function Consumer(opts) {

    this.broker = {};

    this.options = {
        name: typeof opts.name === 'string' ? opts.name : 'Consumer',
        queue: opts.queue,
        host: opts.host,
        debug: opts.debug === true
    };

    this.events = {
        shutdown: this.exit.bind(this),
        consume: function() {},
        connect: function() {},
        disconnect: function() {},
        error: function() {}
    };

}

Consumer.prototype.on = function(event, callback) {

    if (typeof event !== 'string' || !this.events.hasOwnProperty(event)) {

        throw new Error('Not a valid event.');

    }

    if (typeof callback !== 'function') {

        throw new Error(`Not a valid callback for ${event}.`);

    }

    this.events[event] = callback;

};

Consumer.prototype.log = function(msg) {

    if (this.options.debug) {

        console.log(`[ ${this.options.name} ] ${msg}`);

    }

};

Consumer.prototype.connect = function(opts) {

    this.log('Connecting to broker...');

    this.connectToBroker(this.options.host)
    .then(() => {

        this.log(`Connection to broker host ${this.broker.host} established.`);

    })
    .then(() => {

        this.broker.connection.on('error', this.events.error);
        this.broker.connection.on('close', this.events.disconnect);

    })
    .then(() => {

        return this.connectToQueue(this.options.queue);

    })
    .then(() => {

        return this.setHandler();

    })
    .then(() => {

        this.log(`Listening for messages on queue ${this.broker.queue}.`);
        return this.events.connect();

    })
    .catch(this.events.shutdown);

};

Consumer.prototype.connectToBroker = function(connectionUrl) {

    return amqp.connect(connectionUrl)
    .then((connection) => {

        this.broker.host = connectionUrl;
        this.broker.connection = connection;
        return connection.createChannel();

    })
    .then((channel) => {

        this.broker.channel = channel;

    });

};

Consumer.prototype.connectToQueue = function(queueName) {

    return this.broker.channel.assertQueue(queueName)
    .then(() => {

        this.broker.queue = queueName;

    });

};

Consumer.prototype.setHandler = function() {

    return this.broker.channel.consume(this.broker.queue, (msg) => {

        msg = msg.content.toString();
        this.events.consume(msg);
        this.broker.channel.ack(msg);

    });

};

Consumer.prototype.exit = function(err) {

    console.log( 'err', err );

    var exit = function(error) {

        if (error) { throw error; }
        this.log('Consumer shut down successfully.');
        process.exit(0);

    };

    if (this.broker && this.broker.channel) {

        this.log('Shutting down channel...');

        this.broker.channel.close()
        .then(() => {

            this.log('Closing connection to broker...');
            return this.broker.connection.close();

        })
        .then(exit)
        .catch(exit);

    }

};

module.exports = Consumer;
