# amqp-consumer

`npm install amqp-consumer`

`amqp-consumer` is a module to help expedite the process with hooking into a messaging channel.
By simply providing options and event handlers, you can get to writing the logic of
your consumer quicker than ever.

## Options

| Option | Description | Default |
|:-------------:|:-------------|:-----:|
| name (string) | Name to identify consumer in output logs. | `Consumer` |
| queue (string) | Amqp channel that consumer will listen on. | `test` |
| host (string) | URL of amqp host to connect to. | `amqp://localhost:5672` |
| raw (boolean) | Whether to pass the raw amqp buffer to `consume` event | `false` (returns as string) |
| quiet (boolean) | Suppress output logs. | `false` |

## How to Use

```
'use strict';

var Consumer = require('amqp-consumer');

var opts = {
    name: 'Adam Consumer',
    queue: 'testing',
    host: 'amqp://localhost:5672',
    raw: false,
    quiet: false
};

var consumer = new Consumer(opts);

consumer.on('consume', (msg) => {

    console.log(`Received ${msg}`);
    // Handle message and perform logic

});

consumer.on('error', (err) => {

    console.log('Error!');
    console.log(err);

});

consumer.on('connect', () => {

    console.log('Connected to amqp!');

});

consumer.on('disconnect', (reason) => {

    console.log('Disconnected!');
    console.log(reason);

});

consumer.connect();
```
