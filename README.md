# Async Timed Cargo

[![Build Status](https://img.shields.io/travis/felipesabino/async-timed-cargo.svg?style=flat-square)](https://travis-ci.org/felipesabino/async-timed-cargo)

[![NPM](https://nodei.co/npm/async-timed-cargo.png)](https://nodei.co/npm/async-timed-cargo/)

[async.cargo](https://github.com/caolan/async#cargo) based task execution.

## Differences from async.cargo

**Async.cargo:**

- Payload number is used as a limit to the message, but most times the callback is called with a fewer number of items
- It tries to process tasks [as soon as possible when they are pushed](https://github.com/caolan/async/blob/master/lib/async.js#L925), which is bad if used to control batch messages processing, as it will result in more calls with fewer items


**async-timed-cargo**

- Adds a timer concept to the task execution
- Payload tries to be respected, if number of messages received is less than payload it does not do anything until timer is triggered or more messages are received, whatever comes first
- It is better for message batch process as it waits until the queue is full

## Install

add `async-timed-cargo` to you `package.json`


## Example

```

var asyncTimedCargo = require('async-timed-cargo');

var cargo = asyncTimedCargo(function(tasks, callback) {

  // the tasks array will be [1, 2, 3]
  // this will be called after 1000ms, as number of items (3) is smaller than payload (10)
  callback('err', 'arg');

}, 10, 1000);

asyncTimedCargo.push(1);
asyncTimedCargo.push(2);
asyncTimedCargo.push(3, function(err, arg) {
  // err will be 'err'
  // arg will be 'arg'
});


```

Also, check the [example app](example/index.js) for a working example on how to use the middleware


## Usage

### async-timed-cargo(worker, [[payload], timeout])

__Arguments__

* `worker(tasks, callback)` - An asynchronous function for processing an array of
  queued tasks, which must call its `callback(err, arg)` argument when finished, with an optional `err` and `arg` argument.
* `payload` - An optional `integer` for determining how many tasks should be
  processed per round; if omitted, the default is unlimited and only timer will be considered
* `timeout` - An optional `integer` for determining the interval (in ms) to be used to flush data each round; if omitted, the default is 1000ms

__Cargo objects__

The `cargo` object returned by this function has the following properties and
methods:

* `length()` - A function returning the number of items waiting to be processed.
* `push(task, [callback])` - Adds `task` to the `queue`. The callback is called
  once the `worker` has finished processing the task. Instead of a single task, an array of `tasks`
  can be submitted. The respective callback is used for every task in the list.

## Test

```
$ npm install
$ npm test
```
