'use strict';

const jwtToken = require('../lib/JWTToken');
const projectService = require('../services/projects.service')
// to add project
exports.addProject = async(req, res) => {
    try {
        let userData = await jwtToken.validateLogin(req);
        const projectDetails = await projectService.addProject(req, userData);
        return res.success(res, projectDetails);
    } catch (error) {
        return res.errorMessage(res, error);
    }
}

// to edit project
exports.editProject = async(req, res) => {
    try {
        let userData = await jwtToken.validateLogin(req);
        const updatedProject = await projectService.editProject(req, userData);
        return res.success(res, updatedProject);
        
    } catch (error) {
        return res.errorMessage(res, error);
    }
}

// to delete project
exports.deleteProject = async(req, res) => {
    try {
        let userData = await jwtToken.validateLogin(req);
        const updatedProject = await projectService.deleteProject(req, userData);
        return res.success(res, updatedProject);
        
    } catch (error) {
        return res.errorMessage(res, error);
    }
}

// to get project list
exports.getProjectList = async(req, res) => {
    try {
        let userData = await jwtToken.validateLogin(req);
        const projectList = await projectService.getProjectList(req, userData);
        return res.success(res, projectList);
    } catch (error) {
        return res.errorMessage(res, error);
    }
}

