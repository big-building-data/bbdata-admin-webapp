// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var moment = require('moment');
var random = require("random-js")();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8088;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
                                            // (accessed at GET http://localhost:8080/api)

router.post('/values', function (req, res) {
    params = req.body;
    res.send(randomValues(req.body));

});

router.get('/hierarchy', function (req, res) {
    res.json([{
        name: 'BOX 2B',
        opened: true,
        children: [{
            name: 'Température',
            id: 'tempMean',
            children: [{
                name: 'Température 1',
                id: "temp1"
            }, {
                name: 'Température 2',
                id: "temp2"
            }, {
                name: 'Température 3',
                id: "temp3"
            }]
        }, {
            name: 'Présence',
            id: "presence"
        }]
    }]);
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use(express.static('webapp'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);


function randomValues(params){

    var measures = [];
    var from = new Date(params.from ).getTime();
    var to = new Date(params.to ).getTime();
    var increment = (to - from) / 20;
    var mean = random.integer(0, 300);

    for(var i = from; i < to; i += increment){
        measures.push({
            timestamp: moment(i ).format( "YYYY-MM-DDTHH:mm:ssZ" ),
            value: random.integer(0,20) + mean
        });
    }

    return {values: measures };

}