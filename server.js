// server.js

var API_SERVER_HOST = "http://localhost:8080/bbdata2/api";

// call the packages we need
var express = require( 'express' );
var request = require( 'request' );
var proxy = require('http-proxy').createProxyServer({ host: API_SERVER_HOST });

var port = process.env.PORT || 8088;  // set our port
var app = express();                  // define our app using express

// listen to redirects (logging)
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    console.log("request : url=", req.url, req.body ? "body=" + req.body : "");
    console.log("response: status=", res.statusCode);
});

// handle static content
app.use( express.static( 'webapp' ) ); // static content

// setup redirect
app.use('/api', function(req, res, next) {
    proxy.web(req, res, {
        target: API_SERVER_HOST
    }, next);
});


// launch
app.listen( port, function(){
    console.log( 'Magic happens on port ' + port );
});
