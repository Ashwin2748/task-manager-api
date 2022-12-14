'use strict';

const config = require('.././'),
    _ = require('lodash'),
    express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    helmet = require('helmet'),
    path = require('path'),
    cors = require('cors'),
    expressJwt = require('express-jwt'),
    JWTSecretKey = require('../../config').JWTSecretKey,
    cookieParser = require('cookie-parser'),
    http = require('http');


// initialize middlewares
module.exports.initExpressMiddleware = (app) => {

    app.use(cookieParser());
    app.use(helmet());

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));
    app.use(methodOverride());
    const corsOptions = {
        origin: 'http://localhost:4200',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: [ 'Content-Type', 'token' ],
    };
    app.use(cors(corsOptions));
};

module.exports.initJwt = (app) => {
    app.use(expressJwt({
        secret: JWTSecretKey,
        getToken: function(req) {
            if (req.headers) {
                return req.headers['token'];
            }
            return null;
        },
    }).unless({
        path: [
            { url: '/api/login', methods: [ 'POST', 'OPTIONS' ] },
            { url: '/api/register', methods: [ 'POST', 'OPTIONS' ] },
        ],
    }));
};

// Helmet configurations
module.exports.initHelmetHeaders = (app) => {
    // Use helmet to secure Express headers
    let SIX_MONTHS = 15778476000;
    app.use(helmet.xssFilter());
    app.use(helmet.hsts({
        maxAge: SIX_MONTHS,
        includeSubdomains: true,
        force: true,
    }));
    app.disable('x-powered-by');
};

// Server Routes
module.exports.initModulesServerRoutes = (app) => {
    let router = express.Router();
    // Globbing All Routes files
    config.getGlobbedPaths([
        'app/routes/*.routes.js',
    ])
        .forEach((routePath) => {
            require(path.resolve(routePath))(router);
        });

    app.use(config.urlPrefix, router);
};

// Error Routes
module.exports.initErrorRoutes = (app) => {
    // Handle Routes Error
    app.use((err, req, res, next) => {
        // If the error object doesn't exists
        if (!err) {
            return next();
        } else if (err.name !== undefined && err.name === 'UnauthorizedError') {
            return res.status(401).send({ status: 'fail', message: 'Invalid Token' });
        }
        // Log it
        console.error(err.stack);
        res.status(500).json({ error: err.stack });
    });
};

// Termination handler
module.exports.terminator = (sig) => {
    if (typeof sig === 'string') {
        console.log('%s: Received %s - terminating Rest app ...', Date(Date.now()), sig);
        process.exit(1);
    }
    console.log('%s: Rest Server Stopped.', Date(Date.now()));
};

module.exports.setupTerminationHandlers = () => {
    var self = this;

    process.on('exit', () => {
        self.terminator();
    });

    [ 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM',
    ].forEach((element) => {
        process.on(element, () => {
            self.terminator(element);
        });
    });
};

module.exports.setupUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        console.log(new Date().toString(), err.stack || err);
        process.kill(process.pid, 'SIGKILL');
    });
};

module.exports.setupUnhandledRejection = () => {
    process.on('unhandledRejection', (err) => {
        console.log(new Date().toString(), err.stack || err);
        process.kill(process.pid, 'SIGKILL');
    });
};

module.exports.initMiddleware = (app) => {
    require('./middleware')(app);
};

module.exports.initMongooseSchemas = () => {
    config.getGlobbedPaths([
        'server/app/models/*.js',
    ])
        .forEach((routePath) => {
            require(path.resolve(routePath));
        });
};

module.exports.initServer = (app) => {
    const server = http.createServer(app);
    return server;
}

/**
 * Initialize the Express application
 */
module.exports.init = (db) => {
    // Initialize express app
    var app = express();

    // Initialize Express middleware
    this.initExpressMiddleware(app);

    // use JWT auth to secure the api, the token can be passed in the authorization header or querystring
    this.initJwt(app);
    // Initialize Helmet security headers
    this.initHelmetHeaders(app);

    // Winston logger
    this.initMiddleware(app);

    // Initialize error routes
    this.initErrorRoutes(app);

    this.initMongooseSchemas();

    // Initialize Signal Handlers
    this.setupTerminationHandlers();
    this.setupUncaughtException();
    this.setupUnhandledRejection();

    // Initialize modules server routes
    this.initModulesServerRoutes(app);
    const server = this.initServer(app);
    return server;
};
