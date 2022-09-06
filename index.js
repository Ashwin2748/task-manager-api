'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
process.env.NODE_PORT = process.env.NODE_PORT || 6001;
var config = require('./config');
var app = require('./config/lib/app');
app.start(config.db);
