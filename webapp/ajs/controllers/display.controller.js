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
        .controller( 'DisplayController', ctrl );

    // --------------------------

    function ctrl( RestService, $scope, $filter, RFC3339_FORMAT ){

        var self = this;

        self.test = "it works!";
        self.captorsHierarchy = [];
        self.modifiedAxis = null;
        self.chkChanged = checkboxChanged;
        self.applyAxisChanges = applyAxisChanges;
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
                id   : item.id + "-axis",
                title: {
                    text  : item.name,
                    events: {
                        dblclick: function(){
                            console.log( this );
                            console.log( this.min, this.max );
                            if( !this.mydefaults ){
                                this.mydefaults = [this.min, this.max];
                            }
                            self.modifiedAxis = {
                                title: this.userOptions.title.text,
                                min  : this.min,
                                max  : this.max,
                                elem : this
                            };

                            $scope.$apply();

                        }
                    }
                }
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
                axis.opposite = true;
                chart.addAxis( axis );
                chart.addSeries( serie );
            }

            // fix sticky module TODO
            sticky();
        }

        function removeSerie( item ){
            // remove from graph
            chart.get( item.id + "-serie" ).remove();
            chart.get( item.id + "-axis" ).remove();
            // TODO if modifiedAxis = item, hide it !
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

        function applyAxisChanges( reset ){
            var elem = self.modifiedAxis.elem;
            if( reset ){
                self.modifiedAxis.min = elem.mydefaults[0];
                self.modifiedAxis.max = elem.mydefaults[1];

            }
            elem.setExtremes( self.modifiedAxis.min, self.modifiedAxis.max );
        }


        function getValues( item ){
            RestService.getValues( {
                cid : item.id,
                from: moment( self.date.from ).format( RFC3339_FORMAT ),
                to  : moment( self.date.to ).format( RFC3339_FORMAT )
            }, function( results ){
                addSerie( item, results.values );
            }, _handleError );
        }


        function sticky(){
            $( '.ui.sticky' ).sticky( {
                //context: '#stickyContext'
            } );
        }
    }
})();