// server.js

//var API_SERVER_HOST = "http://localhost:8080/api";
var API_SERVER_HOST = "http://10.10.10.102:8456/api";

// call the packages we need
var express = require( 'express' );
var proxy = require( 'http-proxy' ).createProxyServer( {host: API_SERVER_HOST} );
var session = require( 'express-session' );
var request = require( 'request' );

// logging
var fs = require("fs");
if(!fs.existsSync("./logs")) fs.mkdirSync("./logs");  // create dir if not exist to avoid errors
var log4js = require('log4js');
log4js.configure('log4js.json');
var logger = log4js.getLogger();

var port = process.env.PORT || 8088;  // set our port
var app = express();                  // define our app using express

// ======================== setup resources

app.use( session( {secret: 'bbdata2-l34DDlk3Qo2'} ) );      // use express sessions

app.use( express.static( 'webapp/common' ) );               // vendors and assets directory
app.use( '/auth', express.static( 'webapp/login' ) );      // login resources
app.all( '/secured/*', function( req, res, next ){          // secured resource reachable only when logged in
    if( isLoggedIn( req.session ) ){
        next();
    }else{
        res.redirect( '/auth' );
    }
} );
app.use( '/secured', express.static( 'webapp/secured' ) );  // secured resources (auth required)

// ======================== redirects

app.get( '/', function( req, res, next ){                   // redirect when asking for root
    if( isLoggedIn( req.session ) ){
        res.redirect( '/secured' );
    }else{
        res.redirect( '/auth' );
    }
} );

// TODO: find a way to redirect after an http-proxy pipe instead of creating a whole new request
app.get( '/logout', function( req, res, next ){             // logout utility
    var sess = req.session;

    request( {
        url    : API_SERVER_HOST + '/logout',
        method: "POST",
        headers: {
            "content-type": "application/json",
            "bbuser" : sess.bbuser,
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


app.use( '/api', function( req, res, next ){                // setup redirect to api calls
    proxy.web( req, res, {
        target: API_SERVER_HOST
    }, next );
} );


proxy.on( 'proxyReq', function( proxyReq, req, res ){       // add authentication headers for api calls
    setBbBeaders( proxyReq, req.session );
} );


proxy.on( 'proxyRes', function( proxyRes, req, res ){       // update session after api calls on login/logout
    // handle login and logout response
    if( req.url == '/login' ){
        // get response body
        proxyRes.on( 'data', function( dataBuffer ){
            // decode body
            var data = dataBuffer.toString( 'utf8' );
            if( data ){
                // TODO: log login failure
                var body = JSON.parse( data );
                var sess = req.session;
                setupSession( sess, body );
                logger.info("Login userId", sess.bbuser, sess.loggedIn);
            }
        } );

    }else if( req.url == '/logout' ){
        clearSession( req.session );
    }

    // logging
    logger.trace( "request (userId=" + req.session.bbuser + ") : url=", req.url, (req.body ? "body=" + req.body : ""), "response:" +
    " status=", res.statusCode );
} );


proxy.on('error', function(e) {
    logger.error("api error", e);
});

// ======================== launch the server

app.listen( port, function(){
    logger.info( 'server started on port ', port );
} );


// ========================  session management utilities

function setBbBeaders( req, sess ){
    if( isLoggedIn( sess ) ){
        req.setHeader( 'bbuser', sess.bbuser );
        req.setHeader( 'bbtoken', sess.bbtoken );
    }
}

function setupSession( sess, jsonResponse ){
    if( jsonResponse.secret ){
        // get got a new apikey, save it to the session
        sess.bbuser = jsonResponse.userId;
        sess.bbtoken = jsonResponse.secret;
        sess.apikeyId = jsonResponse.id;
        sess.loggedIn = true;
    }
}

function clearSession( sess ){
    sess.loggedIn = false;
}

function isLoggedIn( sess ){
    return sess.loggedIn;
}
