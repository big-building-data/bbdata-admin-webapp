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
            this.update(data);
            this.axis = {
                id: sensor.id + "-axis",
                title: {
                    text: sensor.name
                }
            };

            this.manual = false;
            // this.max and this.min are undefined in auto mode

            this.sma =  {
                name: this.name + ' SMA',
                id: this.id + "-sma",
                linkedTo: this.id,
                showInLegend: true,
                type: 'trendline',
                algorithm: 'SMA'
            };
        }

        Serie.prototype.update = function(data){
            this.data = toTrace(data);
        };



        // static
        Serie.toTrace = toTrace;
        Serie.toSensorId = toSensorId;
        // ----------------------------------------------------

        // convert the values received from the OUTPUT API to
        // an array usable with highcharts
        function toTrace( measures ){
            var results = [];
            angular.forEach( measures, function( m ){
                // TODO: type from metadata and do not show strings !!!
                results.push( [new Date( m.timestamp ).getTime(), parseFloat(m.value)] );
            } );

            return results;
        }

        function toSensorId(serieId){
            return serieId.replace(/-(sma|axis|serie)$/, "")
        }

        return Serie;
    }

})();