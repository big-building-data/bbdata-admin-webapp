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
        .controller( 'DisplayController', ctrl );

    // --------------------------

    function ctrl( RestService, $rootScope, $scope, $filter, RFC3339_FORMAT, DISPLAY_PAGE ){

        var self = this;

        // === public variables

        self.sensorsHierarchy = []; // the hierarchy TLS > SLS > sensors, shrank
        // the default X axis extremes
        self.date = {
            from: moment().floor( 1, 'hour' ).subtract( 1, 'hour' ).toDate(),
            to  : moment().floor( 1, 'hour' ).toDate()
        };

        self.shareAxis = false;  // don't share axis by default

        // === private variables

        var sidebarState = 'hide'; // keep track of the state, to toggle it when page changes
        var chart = null;  // the chart
        var seriesAxis = {"default": {id: "y-axis"}}; // the default axis, used when shareAxis = true
        var defaultChartOptions = { // default options when creating a new graph
            chart        : {
                renderTo: 'graphContainer'
            },
            rangeSelector: {
                enabled: false
            },
            legend: {enabled: true}
        };

        // === public functions

        self.chkChanged = checkboxChanged; // called when a checkbox is toggled -> update the graph
        self.onSidebarToggle = onSidebarToggle; // called on sidebar toggle, to reflaw the graph
        self.toggleShareAxis = toggleShareAxis; // apply self.shareAxis modifications
        self.applyDate = applyDate; // update the X axis with the self.date values


        _init();

        /* *****************************************************************
         * implementation
         * ****************************************************************/

        //##------------scope power

        $scope.copy = angular.copy;
        $scope.equals = angular.equals;

        //##------------init

        function _init(){
            // get the sensors
            RestService.getHierarchy( function( result ){
                self.sensorsHierarchy = _hierarchise( result );
            }, _log );

            // register listener: close the sidebar on page change +
            // reflow the graph on page show
            $rootScope.$on( 'bbdata.PageChanged', function( evt, args ){
                if( args.from == DISPLAY_PAGE ){
                    _closeSidebar();
                }else if( args.to == DISPLAY_PAGE ){
                    setTimeout( _reflowChart, 100 );
                }
            } );

        }

        //##------------ methods

        function checkboxChanged( item ){
            if( item.selected ){
                // ajax
                getValues( item );

            }else{
                removeSerie( item );
            }
        }

        function addSerie( item, values ){

            var axis = { // Secondary yAxis
                id   : item.id + "-axis",
                title: {
                    text: item.name
                }
            };

            var serie = {  // the serie to add
                name : item.name,
                id   : item.id + "-serie",
                yAxis: self.shareAxis ? "y-axis" : item.id + "-axis",
                data : toTrace( values )
            };


            if( !chart ){
                // create a new chart
                var options = angular.copy( defaultChartOptions );
                options.series = [serie];
                options.yAxis = [self.shareAxis ? seriesAxis["default"] : axis];
                chart = new Highcharts.StockChart( options );
                self.chart = chart;

            }else{
                // add the serie to the existing graph
                axis.opposite = true;
                if( !self.shareAxis ) chart.addAxis( axis );
                chart.addSeries( serie );
            }
            // keep track of the axis name, in case the shareAxis flag changes
            seriesAxis[item.id] = axis;
        }


        function removeSerie( item ){
            // remove serie
            chart.get( item.id + "-serie" ).remove();
            // if has its own axis, remove it as well
            if( !self.shareAxis ) chart.get( item.id + "-axis" ).remove();
            delete seriesAxis[item.id];
        }


        // convert the values received from the OUTPUT API to
        // an array usable with highcharts
        function toTrace( measures ){
            var results = [];
            angular.forEach( measures, function( m ){
                results.push( [new Date( m.timestamp ).getTime(), m.value] );
            } );

            return results;
        }

        function onSidebarToggle( evt ){
            sidebarState = evt; // keep track of the state
            _reflowChart(); // adapt the graph to the page
        }

        // change the x axis
        function applyDate( d ){
            self.date = angular.copy( d );
            var selected = $filter( 'selected' )( self.sensorsHierarchy );
            chart = null;
            angular.forEach( selected, getValues );
        }


        function toggleShareAxis(){
            if( chart ){
                if( self.shareAxis ){
                    chart.addAxis( seriesAxis["default"] );
                }
                angular.forEach( seriesAxis, function( axis, id ){
                    if( id == "default" ) return;
                    if( self.shareAxis ){
                        chart.get( id + "-serie" ).update( {yAxis: seriesAxis["default"].id}, false );
                        chart.get( axis.id ).remove( false );
                    }else{
                        chart.addAxis( axis );
                        chart.get( id + "-serie" ).update( {yAxis: axis.id}, false );
                    }
                } );

                if( !self.shareAxis ){
                    chart.get( seriesAxis["default"].id ).remove( false );
                }

                chart.redraw();
            }
        }


        function getValues( item ){
            RestService.getValues( {
                cid : item.id,
                from: moment( self.date.from ).format( RFC3339_FORMAT ),
                to  : moment( self.date.to ).format( RFC3339_FORMAT )
            }, function( results ){
                addSerie( item, results.values );
            }, _log );
        }

        //##------------utils

        function _closeSidebar(){
            if( sidebarState != 'hide' ){
                $( '#toggleSidebar' ).click();
            }
        }

        function _reflowChart(){
            console.log( "reflow" );
            if( self.chart ){
                self.chart.reflow();
            }
        }

        // modifies the hierarchy received fomr the OUTPUT API
        // to be usable with our ng-repeat (see _sidebar.html)
        function _hierarchise( data ){
            var hierarchy = [];

            angular.forEach( data, function( tls ){
                var sls_array = []; // shrunk sls

                angular.forEach( tls.sls, function( sls ){
                    if( !sls.captors )return; // every sls should have at least one captor

                    if( sls.captors.length > 2 ){
                        // more than one captor: rename them to "children"
                        sls.children = sls.captors;
                        delete sls.captors;
                        sls_array.push( sls );
                    }else{
                        // only one captor: make it a "sls"
                        sls_array.push( sls.captors[0] );
                    }

                } );

                // rename sls to "children"
                tls.children = sls_array;
                delete tls.sls;
                // add the tls to the hierarchy
                hierarchy.push( tls );
            } );

            console.log( JSON.stringify( hierarchy ) );
            return hierarchy;
        }



        function _log( msg ){
            console.log( msg );
        }

    }
})();