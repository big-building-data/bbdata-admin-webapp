// server.js

var API_SERVER_HOST = "http://10.10.10.103:8081/output-api";

// call the packages we need
var express = require( 'express' );
var request = require( 'request' );

var port = process.env.PORT || 8088;  // set our port
var app = express();                  // define our app using express

// all of our routes will be prefixed with /api
app.use( express.static( 'webapp' ) ); // static content
app.use( '/api', function( req, res ){   // proxying
    var url = API_SERVER_HOST + req.url;
    console.log(" - " + req.url + " => " + url);
    req.pipe( request( url ) ).pipe( res );
} );

// launch
app.listen( port );
console.log( 'Magic happens on port ' + port );
