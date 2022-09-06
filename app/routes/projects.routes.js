'use strict';

const projects = require('../controllers/projects.controller');

module.exports = (app) => {
    app.route('/project')
        .post(projects.addProject)
        .put(projects.editProject)
        .delete(projects.deleteProject)
        .get(projects.getProjectList)
};