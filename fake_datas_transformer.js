/**
 *
 * @author: Lucy Linder
 * @date: 05.05.2016
 */

var raw_measures_json = require( './webapp/assets/fake_measures_array.json' );


var presence_raw_measures = raw_measures_json[0];
var temp1_raw_measures = raw_measures_json[1];
var temp2_raw_measures = raw_measures_json[2];


var temp1_mean_per_min = mean_by_minutes( temp1_raw_measures.measures );
var temp2_mean_per_min = mean_by_minutes( temp2_raw_measures.measures );
//console.log( "temp1_minutes =", temp1_mean_per_min, ";" );
//console.log( "temp2_minutes =", temp2_mean_per_min, ";" );


console.log( "temp1_trace =", to_trace(temp2_mean_per_min), ";" );


function mean_by_minutes( raw_measures ){
    // init
    var measure = raw_measures.shift();
    var mean = measure.value;
    var count = 1;
    var date_start = measure.timestamp;
    var cur_min = new Date( date_start ).getMinutes();

    var results = [];

    while( raw_measures.length > 0 ){
        measure = raw_measures.shift();
        var d = measure.timestamp;
        var m = new Date( d ).getMinutes();

        if( m != cur_min ){

            results.push( {
                timestamp: date_start.replace( /(:[0-9]{2}\..*)\+/, ":00.0+" ),
                value    : (mean / count)
            } );

            mean = measure.value;
            date_start = d;
            cur_min = m;
            count = 1;
        }else{
            mean += measure.value;
            count++;
        }
    }

    return results;
}


function to_trace( measures ){

    results = [];

    for( i in measures ){
        m = measures[i];
        results.push( [new Date( m.timestamp ).getTime(), m.value+ 300] );
    }
    return results;
}