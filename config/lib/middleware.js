'use strict';

const restResponse = (req, res, next) => {
    res.success = (res, data) => {
        res.status(200).json({
            status: 'success',
            data: data || null,
        })
    };

    res.fail = (res, error) => {
        res.status(400).json({
            status: 'fail',
            message: message || null,
        });
    };

    res.message = (res, code, message) => {
        res.status(code).json({
            status: 'fail',
            message: message || null,
        });
    };

    res.authenticationError = (res, code, data) => {
        res.status(code).json({
            status: 'fail',
            message: data || null,
        });
    }

    res.error = (res, code, message, data) => {
        res.status(code).json({
            status: 'error',
            code: code || 500,
            message: message || null,
            data: data || null,
        });
    };

    res.errorMessage = (res, err) => {
        const code = typeof err.getStatusCode === "function" ? err.getStatusCode() : 500;
        const message = typeof err.getMessage === "function" ? err.getMessage() : err.message || err.stack || err;
        res.status(code).json({
            status: 'fail',
            message: message || null,
        });
    };

    res.successMessage = (res, message) => {
        res.status(200).json({
            status: 'success',
            message: message || null,
        });
    };

    next();
}

module.exports = (app) => {

    app.use(restResponse);

    app.use((req, res, next) => {
        let url = req.url;
        let params;

        if (req.method == 'GET') {
            if (url.indexOf('?') >= 0) {
                url = url.substring(0, url.indexOf('?'));
            }
            params = toSecureParams(req.query);
        }
        else {
            params = toSecureParams(req.body);
        }
        
        next();
    });

    const toSecureParams = (obj) => {
        let params = {};

        for (const param in obj) {
            params[param] = obj[param];
            if (/password/i.test(param)) {
                params[param] = '*****';
            }
        }

        return params;
    };
};
