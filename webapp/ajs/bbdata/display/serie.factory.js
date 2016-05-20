/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function(){

    /**
     * @ngdoc controller
     * @name bbdata.app.DisplayController
     *
     * @description
     * Controller in charge of the first page, which draws
     * the graph and displays the values of the sensors.
     */
    angular
        .module( 'bbdata.app' )
        .factory( 'Serie', GraphFactory );

    function GraphFactory(){

        // constructor
        function Serie( sensor, data ){
            this.sensor = sensor;
            this.name = sensor.name;
            this.id = sensor.id + "-serie";
            this.data = toTrace( data );
            this.axis = {
                id: sensor.id + "-axis",
                title: {
                    text: sensor.name
                }
            };

            this.sma =  {
                name: this.name + ' SMA',
                id: this.id + "-sma",
                linkedTo: this.id,
                showInLegend: true,
                type: 'trendline',
                algorithm: 'SMA'
            };
        }


        // static
        Serie.toTrace = toTrace;
        // ----------------------------------------------------

        // convert the values received from the OUTPUT API to
        // an array usable with highcharts
        function toTrace( measures ){
            var results = [];
            angular.forEach( measures, function( m ){
                results.push( [new Date( m.timestamp ).getTime(), m.value] );
            } );

            return results;
        }

        return Serie;
    }

})();