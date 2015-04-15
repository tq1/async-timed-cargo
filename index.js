var kafka = require('kafka-node'),
    _ = require('lodash'),

    Message = require('./lib//message')(_),
    Publish = require('./lib/publish')(_, kafka);

var middleware = require('./lib/middleware')(kafka, Message, Publish, _);

module.exports = middleware;
