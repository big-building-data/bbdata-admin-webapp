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
     * @name bbdata.app.MainCtrl
     *
     * @description
     * Main controller
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'MainCtrl', MainCtrl );

    // --------------------------

    function MainCtrl( RestService, $scope, $filter ){

        var self = this;

        self.test = "it works!";
        self.captorsHierarchy = [];
        self.chkChanged = checkboxChanged;
        _init();


        self.date = {
            from: moment().floor( 1, 'hour' ).subtract( 1, 'hour' ).toDate(),
            to  : moment().floor( 1, 'hour' ).toDate()
        };

        self.applyDate = applyDate;


        var chart = null;
        var defaultChartOptions = {
            chart        : {
                renderTo: 'graphContainer'
            },
            rangeSelector: {
                enabled: false
            },

            legend: {enabled: true}
        };


        /* *****************************************************************
         * implementation
         * ****************************************************************/

        //##------------scope power

        $scope.copy = angular.copy;
        $scope.equals = angular.equals;

        //##------------init

        function _init(){
            RestService.getHierarchy( function( result ){
                self.captorsHierarchy = result;
            }, _handleError );

        }


        //##------------available methods

        function checkboxChanged( item ){
            console.log( item );
            if( item.selected ){
                // ajax
                getValues( item );

            }else{
                removeSerie( item );
            }
        }

        function addSerie( item, values ){
            console.log( values );

            var axis = { // Secondary yAxis
                id      : item.id + "-axis",
                title   : {
                    text: item.name
                },
                opposite: true
            };

            var serie = {
                name : item.name,
                id   : item.id + "-serie",
                yAxis: item.id + "-axis",
                data : toTrace( values )
            };

            if( !chart ){
                var options = angular.copy( defaultChartOptions );
                options.series = [serie];
                options.yAxis = axis;

                chart = new Highcharts.StockChart( options );
                self.chart = chart;

            }else{
                chart.addAxis( axis );
                chart.addSeries( serie );
            }

        }

        function removeSerie( item ){
            // remove from graph
            chart.get( item.id + "-serie" ).remove();
            chart.get( item.id + "-axis" ).remove();
        }


        function toTrace( measures ){

            var results = [];
            angular.forEach( measures, function( m ){
                results.push( [new Date( m.timestamp ).getTime(), m.value] );
            } );

            return results;
        }

        //##------------utils

        function _handleError( error ){
            console.log( error );
        }

        function applyDate( d ){
            self.date = angular.copy( d );
            var selected = $filter( 'selected' )( self.captorsHierarchy );
            chart = null;
            angular.forEach( selected, getValues );
        }


        function getValues( item ){
            RestService.getValues( {
                cid : item.id,
                from: moment( self.date.from ).format( "YYYY-MM-DDTHH:mm:ssZ" ),
                to  : moment( self.date.to ).format( "YYYY-MM-DDTHH:mm:ssZ" )
            }, function( results ){
                addSerie( item, results.values );
            }, _handleError );
        }

    }
}());