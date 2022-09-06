const Project = require("../models/Projects"),
_ = require('lodash');
// to add Project for specific user
exports.addProject = async(req, user) => {
    const projectName = _.get(req, 'body.name', '');
    const userId = _.get(user, '_id', '');
    const newProject = new Project({
        name: projectName,
        userId: userId,
    });
    await newProject.save();
    return newProject;
}

// to update project/task for specific user
exports.editProject = async(req, user) => {
    const updatedProject = await Project.findOneAndUpdate({
        userId: _.get(req, 'body.userId', ''),
        _id: _.get(req, 'body._id', '')
    }, {
        '$set': req.body,
    });

    return updatedProject;
}

// to delete project for specific user
exports.deleteProject = async(req, user) => {
    const query = {
        _id: _.get(req, 'query._id', ''),
    };
    const updatedProject = await Project.findOneAndDelete(query)
    return updatedProject;
}

// to get list of projects
exports.getProjectList = async(req, user) => {
    return Project.find({ userId: _.get(user, '_id', '') });
}