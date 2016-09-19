// server.js

//var API_SERVER_HOST = "http://localhost:8080/api";
var API_SERVER_HOST = "http://10.10.10.102:8456/api";

// call the packages we need
var express = require( 'express' );
var proxy = require( 'http-proxy' ).createProxyServer( {host: API_SERVER_HOST} );
var session = require( 'express-session' );
var request = require( 'request' );

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
    console.log( "/ asked. Redirect." );
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
        console.log( "logout done", body, error );
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
                var body = JSON.parse( data );
                console.log( body );
                setupSession( req.session, body );
            }
        } );

    }else if( req.url == '/logout' ){
        clearSession( req.session );
    }

    // logging
    console.log( "request : url=", req.url, req.body ? "body=" + req.body : "" );
    console.log( "response: status=", res.statusCode );
} );


// ======================== launch the server

app.listen( port, function(){
    console.log( 'Magic happens on port ' + port );
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
