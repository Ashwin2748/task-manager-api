const User = require('../models/User'),
    crypto = require('crypto'),
    errors = require ('../errors/errors.js'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    SALT_WORK_FACTOR = 10;

exports.findUserExistance = (email) => {
    return User.findOne({ email: _.toLower(email) })
};

async function generatePassword(password) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR),
        hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return { salt, value };
}

exports.login = async(req, data, next) => {
    let email = _.get(req.body, 'email', 'null').toLowerCase(),
        password = _.get(req.body, 'password', 'null'),
        userData;
    const hash = crypto.createHmac('sha512', data.salt);
    hash.update(password);
    const value = hash.digest('hex');
    userData = await User.findOne({ email });
    userData = userData.toObject();
    if (!_.isEqual(userData.password, value) && (userData.email, email)) {
        throw new errors.InvalidEmailOrPassword();
    }
    userData = _.omit(userData, [ 'password', 'salt' ]);
    return userData;
};

exports.register = async(req) => {
    const password = _.get(req, 'body.password'),
        passwordData = await generatePassword(password);
    let userData = new User({
        name: _.get(req, 'body.firstName') + ' ' + _.get(req, 'body.lastName'),
        email: _.get(req, 'body.emailAddress').toLowerCase(),
        password: passwordData.value,
        salt: passwordData.salt
    })
    let data = await userData.save();
    data = data.toObject();
    data = _.omit(data, [ 'password', 'salt' ]);
    return data;
}