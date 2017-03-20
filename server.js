// server.js

//var API_SERVER_HOST = "http://localhost:8080/api";
var API_SERVER_HOST = "http://10.10.10.102:8456/api";

// call the packages we need
var express = require('express');
var proxy = require('http-proxy').createProxyServer({host: API_SERVER_HOST});
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bouncer = require("express-bouncer")(10000, 900000);
var request = require('request');

// logging
var fs = require("fs");
if(!fs.existsSync("./logs")) fs.mkdirSync("./logs");  // create dir if not exist to avoid errors
var log4js = require('log4js');
log4js.configure('log4js.json');
var logger = log4js.getLogger();

var port = process.env.PORT || 8088;  // set our port
var app = express();                  // define our app using express


bouncer.blocked = function (req, res, next, remaining) {
    res.status(429).send(JSON.stringify({
        exception: "TooManyAttempts",
        details: "Too many requests have been made, " +
        "please wait " + remaining / 1000 + " seconds."
    }));
};

// ======================== setup resources

app.use(session({                        // use express sessions
    name: 'bbwebapp-session-cookie',
    secret: 'lkjDDALJE&&%ç"',
    cookie: {maxAge: 60 * (60 * 1000)},
    saveUninitialized: true,
    resave: true,
    store: new FileStore()
}));

app.use(express.static('webapp/common'));               // vendors and assets directory
app.use('/auth', express.static('webapp/login'));      // login resources
app.all('/secured/*', function (req, res, next) {          // secured resource reachable only when logged in
    if (isLoggedIn(req.session)) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    } else {
        res.redirect('/auth');
    }
});
app.use('/secured', express.static('webapp/secured'));  // secured resources (auth required)

// ======================== redirects

app.get( '/', function( req, res, next ){                   // redirect when asking for root
    if( isLoggedIn( req.session ) ){
        res.redirect( '/secured' );
    }else{
        // TODO for DEBUG only
        // var sess = req.session;
        // sess.bbuser = 1;
        // sess.bbtoken = "lala";
        // sess.loggedIn = true;
        // res.redirect( '/secured' );
        res.redirect( '/auth' );
    }
});

// TODO: find a way to redirect after an http-proxy pipe instead of creating a whole new request
app.get('/logout', function (req, res, next) {             // logout utility
    var sess = req.session;

    request({
        url: API_SERVER_HOST + '/logout',
        method: "POST",
        headers: {
            "content-type": "application/json",
            "bbuser": sess.bbuser,
            "bbtoken": sess.bbtoken
        }
    }, function( error, response, body ){
        logger.info( "logout userId=", sess.bbuser );
    } );
    clearSession( sess );
    res.redirect( "/" );
} );

app.post('/logid', function(req, res, next){
    // allow angular to know which apikey is currently used
    res.send({id: req.session.apikeyId});
});
// ======================== proxy management


// avoid brute force login attempts using express-bouncer
app.post("/api/login", bouncer.block, function (req, res, next) {
    next(); // this calls '/api', see proxyRes for bouncer.reset
});


app.use('/api', function (req, res, next) {                // setup redirect to api calls
    proxy.web(req, res, {
        target: API_SERVER_HOST
    }, next);

});


proxy.on('proxyReq', function (proxyReq, req, res) {       // add authentication headers for api calls
    setBbBeaders(proxyReq, req.session);
});


proxy.on('proxyRes', function (proxyRes, req, res) {       // update session after api calls on login/logout
    // handle login and logout response
    if (req.url == '/login') {

        // get response body
        proxyRes.on('data', function (dataBuffer) {
            // decode body
            var data = dataBuffer.toString('utf8');
            if (data) {
                var body = JSON.parse(data);
                console.log(body);
                if (setupSession(req.session, body)) {
                    bouncer.reset(req);
                }
            }
        });


    } else if (req.url == '/logout') {
        clearSession(req.session);
    }

    // logging
    logger.trace( "request (userId=" + req.session.bbuser + ") : url=", req.url, (req.body ? "body=" + req.body : ""), "response:" +
        " status=", res.statusCode );
});

// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
    console.log("ERROR", res);
    console.log(res.body);
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.');
});


// ======================== launch the server

app.listen( port, function(){
    logger.info( 'server started on port ', port );
} );



// ========================  session management utilities

function setBbBeaders(req, sess) {
    console.log("bb set header: ", sess);
    if (isLoggedIn(sess)) {
        req.setHeader('bbuser', sess.bbuser);
        req.setHeader('bbtoken', sess.bbtoken);
    }
}

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

function clearSession(sess) {
    sess.destroy();

}

function isLoggedIn(sess) {
    return sess.loggedIn;
}