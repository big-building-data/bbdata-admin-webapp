// address of the output-api
var API_SERVER_HOST = "http://10.10.10.102:8456/api";
// application port
var port = process.env.PORT || 8088;

// == imports
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var request = require('request');

var bouncer = require("express-bouncer")(10000, 900000);
var proxy = require('http-proxy').createProxyServer({host: API_SERVER_HOST});

// == setup logging
// logs are written to ./logs/server.log and are rotated automatically
// see log4js.json for the configuration
var fs = require("fs");
if (!fs.existsSync("./logs")) {
    // create dir if not exist to avoid errors
    fs.mkdirSync("./logs");
}
var log4js = require('log4js');
log4js.configure('log4js.json');
var logger = log4js.getLogger();

// == application
var app = express();


// == bouncer
// bouncer will block an IP automatically for some time if
// too many login attempts are made
// see https://github.com/dkrutsko/express-bouncer for more info
bouncer.blocked = function (req, res, next, remaining) {
    res.status(429).send(JSON.stringify({
        exception: "TooManyAttempts",
        details: "Too many requests have been made, " +
        "please wait " + remaining / 1000 + " seconds."
    }));
};

// == sessions
// see https://github.com/expressjs/session for more info
app.use(session({
    name: 'bbwebapp-session-cookie',
    secret: 'lkjDDALJE&&%ç"',
    cookie: {maxAge: 60 * (60 * 1000)}, // one hour
    saveUninitialized: true,
    resave: true,
    store: new FileStore()
}));

// ======================== routes

// make everything in ./common public
app.use(express.static('webapp/common'));
// make webapp/login public
app.use('/auth', express.static('webapp/login'));
// make /secured content only available to logged in users
app.all('/secured/*', function (req, res, next) {
    if (isLoggedIn(req.session)) {
        // avoid caching
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    } else {
        // if not logged in, redirect to login page
        res.redirect('/auth');
    }
});
// /secured serves content in the webapp/secured directory
// this line must be set in the end (in express,
// the route priority depends on the order they are defined)
app.use('/secured', express.static('webapp/secured'));

// the index depends on the status of the user:
// login page for anonymous users, secured page for logged-in users
app.get('/', function (req, res, next) {
    if (isLoggedIn(req.session)) {
        res.redirect('/secured');
    } else {
        res.redirect('/auth');
    }
});

// handle the logout request
// for now, we make a request to the output-api
// and wait for the answer
// TODO: find a way to redirect after an http-proxy pipe instead of creating a whole new request
app.get('/logout', function (req, res, next) {
    var sess = req.session;
    // call /logout on the output-api
    request({
        url: API_SERVER_HOST + '/logout',
        method: "POST",
        headers: {
            "content-type": "application/json",
            "bbuser": sess.bbuser,
            "bbtoken": sess.bbtoken
        }
    }, function (error, response, body) {
        logger.info("logout userId=", sess.bbuser);
    });
    // invalidate current session
    clearSession(sess);
    // back to login page
    res.redirect("/");
});

// create an endpoint for AngularJS to get the
// current apikey (used to forbid the user to delete
// the apikey used to log in the webapp), see secured/ajs/bbdata/me
app.post('/logid', function (req, res, next) {
    // allow angular to know which apikey is currently used
    res.send({id: req.session.apikeyId});
});

// ======================== proxy management
// the proxy will redirect all /api/* request to the output-api

// avoid brute force login attempts using express-bouncer
app.post("/api/login", bouncer.block, function (req, res, next) {
    next(); // this calls '/api', see proxyRes for bouncer.reset
});

// setup redirect to api calls
app.use('/api', function (req, res, next) {
    proxy.web(req, res, {
        target: API_SERVER_HOST
    }, next);

});

// proxyReq is called by the proxy before a request
// --> add authentication headers for api calls
proxy.on('proxyReq', function (proxyReq, req, res) {
    setBbBeaders(proxyReq, req.session);
});

// proxyRes is called by the proxy after a response
// --> useful to get the result of a /login or /logout call 
proxy.on('proxyRes', function (proxyRes, req, res) {

    if (req.url == '/login') {
        // get response body
        proxyRes.on('data', function (dataBuffer) {
            // decode body
            var data = dataBuffer.toString('utf8');
            if (data) {
                var body = JSON.parse(data);
                // setupSession will fail if 
                // the body contains an error
                if (setupSession(req.session, body)) {
                    // notify bouncer this user 
                    // was successfully authenticated
                    bouncer.reset(req);
                }
            }
        });
    }
    // log every api response
    logger.trace("request (userId=" + req.session.bbuser + ") : url=", req.url, (req.body ? "body=" + req.body : ""), "response:" +
        " status=", res.statusCode);
});

// in case a proxy call generated an error,
// notify the frontend
proxy.on('error', function (err, req, res) {
    console.log("ERROR", res);
    console.log(res.body);
    res.writeHead(500, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        "exception": "UnknownException",
        "details": "Proxy call failed (body=" + res.body + ")"
    }));
});


// ======================== launch the server

app.listen(port, function () {
    logger.info('server started on port ', port);
});


// ========================  utils

/**
 * add authentication headers to a proxy request
 * @param req the request
 * @param sess the current session
 */
function setBbBeaders(req, sess) {
    if (isLoggedIn(sess)) {
        req.setHeader('bbuser', sess.bbuser);
        req.setHeader('bbtoken', sess.bbtoken);
    }
}

/**
 * setup a session after a call to the /login endpoint of the
 * output-api
 * @param sess the session object
 * @param jsonResponse the response from the output-api
 * @returns {boolean} if the user logged in successfully
 */
function setupSession(sess, jsonResponse) {
    if (jsonResponse.secret) {
        // get got a new apikey, save it to the session
        sess.bbuser = jsonResponse.userId;
        sess.bbtoken = jsonResponse.secret;
        sess.apikeyId = jsonResponse.id;
        sess.loggedIn = true;
        return true;
    }
    return false;
}

/**
 * destroy a session
 * @param sess the session object
 */
function clearSession(sess) {
    sess.destroy();

}

/**
 * check if the user is logged in
 * @param sess the session object
 * @returns {boolean} true if the user is logged in, false otherwise
 */
function isLoggedIn(sess) {
    return sess.loggedIn;
}