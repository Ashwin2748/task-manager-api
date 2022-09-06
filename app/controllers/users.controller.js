'use strict';

const userService = require('../services/user.service'),
    errors = require ('../errors/errors.js'),
    _ = require('lodash'),
    emailPattern = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
    jwtToken = require('../lib/JWTToken');

exports.registerValidation = (req) => {
    return new Promise((resolve, reject) => {
        if (_.isEmpty(_.trim(_.get(req, 'body.firstName'))) ||
            _.isEmpty(_.trim(_.get(req, 'body.lastName'))) ||
			_.isEmpty(_.get(req, 'body.emailAddress')) ||
            _.isEmpty(_.trim(_.get(req, 'body.password')))
        ) {
            reject(new errors.RequiredParamsNotFoundError());
        } else if (!emailPattern.test(_.get(req, 'body.emailAddress'))) {
            reject(new errors.InvalidEmail());
        } else {
            resolve(req);
        }
    });
};

exports.register = async(req, res) => {
    try {
        await this.registerValidation(req);
        const data = await userService.findUserExistance(_.get(req, 'body.emailAddress', ''));
        if (!_.isEmpty(data)) {
            throw new errors.UserExistError;
        }
        const userData = await userService.register(req),
            tokenData = { user: { id: userData._id, email: userData.email } },
            token = await jwtToken.getToken(tokenData);
            userData['token'] = token;
        return res.success(res, userData);
    } catch (err) {
        return res.errorMessage(res, err);
    }
}

exports.login = async(req, res, next) => {
    try {
        if (_.isEmpty(_.trim(_.get(req, 'body.email'))) ||
			_.isEmpty(_.get(req, 'body.password'))
        ) {
            throw new errors.RequiredParamsNotFoundError;
        }
        const data = await userService.findUserExistance(_.get(req, 'body.email', ''));
        if ((_.isEmpty(data))) {
            throw new errors.UserNotFoundError();
        }

        const userData = await userService.login(req, data),
            tokenData = { user: { id: data._id, email: data.email } },
            token = await jwtToken.getToken(tokenData);
            userData['token'] = token;
        return res.success(res, userData);
    } catch (err) {
        return res.errorMessage(res, err);
    }
}

exports.logout = async(req, res) => {
    try {
        await jwtToken.decodeToken(req);
        res.clearCookie('auth');
        return res.success(res, "Logged out successfully");
    } catch (err) {
        return res.errorMessage(res, 500, err.message || err.stack || err);
    }
}

exports.getUser = async(req, res) => {
    try {
        await jwtToken.decodeToken(req);
        let userData = await jwtToken.validateLogin(req);
        userData = userData.toObject();
        userData = _.omit(userData, [ 'salt', 'password' ]);
        return res.success(res, userData);
    } catch (err) {
        return res.errorMessage(res, err);
    }
}
