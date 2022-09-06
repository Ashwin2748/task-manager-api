'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const taskSchema = new Schema({
    name: {
        type: String,
        default: null,
    },
    expirationDate: {
        type: Date,
        default: null,
    },
    completedDate: {
        type: Date,
        default: null,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
    updatedDate: {
        type: Date,
        default: null,
    },
})
const projectSchema = new Schema({
    name: {
        type: String,
        default: null,
    },
    userId: {
        type: String,
        default: null,
    },
    tasks: [ taskSchema ],
});

module.exports = mongoose.model('Project', projectSchema);
