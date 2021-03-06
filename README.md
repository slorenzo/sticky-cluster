# sticky-cluster


### What is it

In cluster environment `socket.io` requires you to use sticky sessions, to ensure that a given client hits the same process every time, otherwise its handshake mechanism won't work properly. To accomplish that, manuals [suggest](http://socket.io/docs/using-multiple-nodes/) the `sticky-session` module.

My module is based on the same principles as `sticky-session`, but utilizes a more efficient [hash function](https://github.com/darkskyapp/string-hash) and also works asynchronously out of the box.


#### Advantages

* up to 10x faster than `sticky-session`
* much better scattering over the worker processes than that of `sticky-session`
* asynchronous out of the box, just run a callback when you're done initializing everything else
* works correctly with `ipv6`


#### More alternatives

* [sticky-session](https://github.com/indutny/sticky-session) -- worse perfomance, not async
* [throng](https://github.com/hunterloftis/throng) -- plain cluster, not sticky
* [node-cluster-socket.io](https://github.com/elad/node-cluster-socket.io) -- doesn't work with `ipv6`


### Get started

As usual

```
npm install sticky-cluster --save
```

then

```js
require('sticky-cluster')(

  // server initialization function
  function (callback) {
    var http = require('http');
    var app = require('express')();
    var server = http.createServer(app);
      
    // configure an app
      // do some async stuff if needed
      
    // don't do server.listen(), just pass the server instance into the callback
    callback(server);
  },
  
  // options
  {
    concurrency: 10,
    port: 3000,
    debug: true
  }
);
```


### Accepted options

Here's the full list of accepted options:

| key           | meaning                         | default                           |
| :------------ | :-----------------------------  | :-------------------------------- |
| `concurrency` | number of workers to be forked  | number of CPUs on the host system |
| `port`        | http port number to listen      | `8080`                            |
| `debug`       | log actions to console          | `false`                             |
| `prefix`      | prefix in names of [IPC](https://en.wikipedia.org/wiki/Inter-process_communication) messages | `sticky-cluster:`                 |


### Example

Open terminal at the `./example` directory and sequentially run `npm install` and `npm start`. Navigate to `http://localhost:8080`. Have a look at the source.


### Benchmarking

There's a script you can run to test various hashing functions. It generates a bunch of random IP addresses (both `v4` and `v6`) and then hashes them using different algorithms aiming to get a consistent {IP address -> array index} mapping. 

For every hash function the script outputs execution time in milliseconds (less is better) and distribution of IP addresses over the clients' ids (more even distribution is better).

Navigate to `./benchmark` and run `npm install` in advance. To run the benchmarking tool with default parameters type `npm start` or `npm run-script start:lite`, or if you wish to try different values, do:

```
$ npm start -- <num_workers> <num_ip_addresses>
```

An output from my laptop:

```
$ npm run-script start:lite
generating random ips...
benchmarking...
int31
  time (ms):  17
  scatter:  [ 2629, 911, 1081, 736, 657, 988, 858, 782, 677, 681 ]
djb2
  time (ms):  3
  scatter:  [ 997, 981, 996, 1000, 1003, 1019, 983, 1002, 1014, 1005 ]
```

```
$ npm start
generating random ips...
benchmarking...
int31
  time (ms):  140
  scatter:  [ 27367, 6818, 8184, 9313, 8065, 9153, 7893, 8196, 6792, 8219 ]
djb2
  time (ms):  21
  scatter:  [ 10005, 10006, 9920, 9926, 10132, 10071, 10046, 9924, 10022, 9948 ]
```

The algorithm used in the `sticky-session` module is `int31` and the local one is `djb2`. As might be seen, the `djb2` algorithm provides significant time advantage and clearly more even scattering over the worker processes.


### Changelog

#### 0.1.2 -> 0.2.0

+ Removed a `SIGTERM` listener on the master process.
+ Replaced `.on('SIGINT', ...)` with `.once('SIGINT', ...)`.
+ Improved debug logs.
+ Moved unnecessary dependencies from the main package to the `./example` and `./benchmark` apps.
+ Fixed a few minor issues in the mentioned apps.

#### 0.1.1 -> 0.1.2

+ Updated the example.

#### 0.1.0 -> 0.1.1

+ Published to NPM.
