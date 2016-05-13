// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require( 'express' );        // call express
var app = express();                 // define our app using express
var bodyParser = require( 'body-parser' );
var moment = require( 'moment' );
var random = require( "random-js" )();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use( bodyParser.urlencoded( {extended: true} ) );
app.use( bodyParser.json() );

var port = process.env.PORT || 8088;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
                                            // (accessed at GET http://localhost:8080/api)

router.post( '/values', function( req, res ){
    params = req.body;
    res.send( randomValues( req.body ) );

} );

router.get( '/hierarchy', function( req, res ){
    res.json( hierarchy );
} );

// more routes for our API will happen here

var sensors = JSON.parse( '[ { "id" : 3329, "address" : "1.22.128",  "creationdate" : "2017-12-31T15:59:60+02:00", "name" : "Température 22b", "location" : "Plafond du bloc 22b, blueFACTORY, Fribourg", "description" : "Température au plafond du bloc 22b. La précision est à +- 0.05K", "parser" : { "name" : "knx-semi-parser" }, "type" : { "name" : "double64" }, "unit" : { "name" : "Kelvin", "symbol" : "K" } },{ "id" : 3929, "address" : "1.22.129",  "creationdate" : "2017-12-31T03:09:60+02:00", "name" : "Température 23b", "location" : "Plafond du bloc 23b, blueFACTORY, Fribourg", "description" : "Température au plafond du bloc 23b. La précision est à +- 0.05K", "parser" : { "name" : "knx-semi-parser" }, "type" : { "name" : "double64" }, "unit" : { "name" : "Kelvin", "symbol" : "K" } },{ "id" : 3, "address" : "noaddress",  "creationdate" : "2017-12-31T04:19:00+02:00", "name" : "Présence 23b", "location" : "Bloc de Mr. Lala Blum", "description" : "Capteur de présence de Mr. Blum", "type" : { "name" : "boolean" }, "unit" : { "name" : "Présence", "symbol" : "P" } }]' );


var hierarchy = JSON.parse( '[{ "id": 18, "name": "Box 22B, blueFACTORY, Fribourg", "owner": { "firstname": "Jean", "lastname": "Dupont", "email": "jean.dupont@example.com" }, "sls": [{ "id": 27, "name": "Températures", "captors": [{ "id": 3, "name": "Température au plafond", "address": "noaddress" }, { "id": 45, "name": "Température au sol 1", "address": "noaddress" }, { "id": 6, "name": "Température au sol 2", "address": "noaddress" }] }, { "sls-id": 2, "name": "Présence box 33", "captors": [{ "id": 12345, "name": "Présence box 33", "address": "1.1.23" }] }] }]' );

router.get( '/sensors', function( req, res ){
    console.log( sensors );
    res.send( sensors );

} );

router.post( '/sensors', function( req, res ){
    sensors.push( req.body );
    res.send( true );

} );

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use( '/api', router );
app.use( express.static( 'webapp' ) );

// START THE SERVER
// =============================================================================
app.listen( port );
console.log( 'Magic happens on port ' + port );


function randomValues( params ){

    var measures = [];
    var from = new Date( params.from ).getTime();
    var to = new Date( params.to ).getTime();
    var increment = (to - from) / 20;
    var mean = random.integer( 0, 300 );

    for( var i = from; i < to; i += increment ){
        measures.push( {
            timestamp: moment( i ).format( "YYYY-MM-DDTHH:mm:ssZ" ),
            value    : random.integer( 0, 20 ) + mean
        } );
    }

    return {values: measures};

}