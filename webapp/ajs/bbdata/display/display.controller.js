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

    function ctrl( RestService, $rootScope, $scope, $filter, RFC3339_FORMAT, FileSaver, Blob,
                   DISPLAY_PAGE, Graph, Serie, $window, ModalService, toaster, errorParser ){

        var self = this;

        // === public variables

        self.sensorsHierarchy = []; // the hierarchy TLS > SLS > sensors, shrank
        // the default X axis extremes
        self.date = {
            // TODO: reset to default
            from: moment().floor( 1, 'hour' ).subtract( 1, 'hour' ).toDate(),
            to  : moment().floor( 1, 'hour' ).toDate()
        };

        self.sma = false;  //   simple moving average
        self.smaPeriod = 5; // window size for SMA

        self.graph = new Graph( false );  // the chart shareAxis to false by default

        // === private variables

        var sidebarState = 'hide'; // keep track of the state, to toggle it when page changes
        var series = {}; // keep series in cache (without data), indexed by sensor id

        // === public functions

        self.chkChanged = checkboxChanged; // called when a checkbox is toggled -> update the graph
        self.onSidebarToggle = onSidebarToggle; // called on sidebar toggle, to reflaw the graph
        self.toggleShareAxis = toggleShareAxis; // apply self.shareAxis modifications
        //self.toggleSMA = toggleSMA; // apply self.sma modifications
        self.applyDate = applyDate; // update the X axis with the self.date values

        self.yAxisSelectChanged = yAxisSelectChanged; // the dropdown changed
        self.yAxisModeChanged = yAxisModeChanged; // the currently modified axis changed between manual/auto
        self.changeAxisY = changeAxisY; // axis in manual mode and new extremes set

        self.newWindow = createNewWindow;

        self.exportCSV = exportCSV;

        _init();

        /* *****************************************************************
         * implementation
         * ****************************************************************/

        function exportCSV(){
            var csv = self.graph.export();
            console.log(csv);
            var data = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            FileSaver.saveAs(data, 'bbdata-export.csv');
        }

        function createNewWindow(){
            ModalService.showModal( {
                title          : "edit",
                htmlInclude    : "/ajs/bbdata/display/partials/_newWindowContent.html",
                positive       : "generate",
                positiveDisable: "form.nwForm.$invalid",
                negative       : "cancel",
                basic          : false,
                cancelable     : false,
                inputs         : {
                    sensors     : self.all_sensors,
                    durationInt : 10,
                    durationType: 'minutes',
                    refreshRate : 1000
                }

            } ).then( function( result ){
                if( result.status ){
                    var duration = moment.duration( result.inputs.durationInt, result.inputs.durationType );
                    var sensor = result.inputs.selectedSensor;
                    var refreshRate = result.inputs.refreshRate;
                    _createNewWindow( sensor, duration, refreshRate );
                }
            }, function(){
                console.log( "error" );
            } );
        }

        function _createNewWindow( sensor, duration, refreshRate ){
            var popupWindow = $window.open( 'window.html' );
            var interval = setInterval( function(){
                var scope = popupWindow.angular.element( '[ng-app]' ).scope();
                if( scope ){
                    clearInterval( interval );
                    scope.ctrl.setData( [sensor], duration, refreshRate );
                }
            }, 100 );
        }

        function yAxisModeChanged( axis ){
            console.log( "yAxisModeChanged ", axis );
            if( axis.manual ){
                changeAxisY( axis );
            }else{
                resetAxisY( axis );
            }
        }

        function yAxisSelectChanged( item ){
            if( item ){
                var id = Serie.toSensorId( item.id );
                $scope.modifiedAxis = series[id];
            }else{
                $scope.modifiedAxis = null;
            }
        }

        function changeAxisY( serie ){
            self.graph.setExtremesOf( serie.axis.id, serie.min, serie.max );
        }

        function resetAxisY( serie ){
            self.graph.setExtremesOf( serie.axis.id );
        }

        //##------------scope power

        $scope.copy = angular.copy;
        $scope.equals = angular.equals;

        //##------------init

        function _init(){
            // put the default axis in the series array to
            // avoid null exception
            series[Graph.DEFAULT_SERIE.sensor.id] = Graph.DEFAULT_SERIE;

            // get the sensors
            RestService.getHierarchy( function( result ){
                self.sensorsHierarchy = _hierarchise( result );
                if( $rootScope.page == DISPLAY_PAGE ) setTimeout(function(){_showSidebar(); }, 100);
            }, _log );

            // register listener: close the sidebar on page change +
            // reflow the graph on page show
            $rootScope.$on( 'bbdata.PageChanged', function( evt, args ){
                if( args.from == DISPLAY_PAGE ){
                    if( args.to != DISPLAY_PAGE ) _closeSidebar();
                }else if( args.to == DISPLAY_PAGE ){
                    if( !self.graph.chart ) _showSidebar();
                    setTimeout( _reflowChart, 100 );
                }
            } );

            // use utc
            Highcharts.setOptions( {
                // This is for all plots, change Date axis to local timezone
                global: {
                    useUTC: false
                }
            } );

        }

        //##------------ methods

        function checkboxChanged( item ){
            if( item.selected ){
                // ajax
                getValues( item );

            }else{
                $scope.modifiedAxis = null;
                self.graph.removeAssociatedSerie( item );
            }
        }


        function onSidebarToggle( evt ){
            sidebarState = evt; // keep track of the state
            _reflowChart(); // adapt the graph to the page
        }

        // change the x axis
        function applyDate( d ){
            self.date = angular.copy( d );
            var selected = $filter( 'selected' )( self.sensorsHierarchy );
            self.graph.deleteGraph();
            angular.forEach( selected, getValues );
        }


        function toggleShareAxis(){
            self.graph.toggleShareAxis();
            $scope.modifiedAxis = null;
        }

        function getValues( item ){
            RestService.getValues( {
                id  : item.id,
                from: moment( self.date.from ).format( RFC3339_FORMAT ),
                to  : moment( self.date.to ).format( RFC3339_FORMAT )
            }, function( results ){
                if( !results.values.length ){
                    // don't bother with empty values
                    toaster.pop( "warning", "No data", "No data for sensor <i>'" + item.name + "</i>' during this" +
                        " interval.",  null, 'trustedHtml');
                    return;
                }
                var s = series[item.id];
                if( s ){
                    s.update( results.values );
                }else{
                    s = new Serie( item, results.values );
                    series[item.id] = s;
                }
                self.graph.addSerie( s );
            }, _log );
        }

        //##------------utils

        function _closeSidebar(){
            if( sidebarState != 'hide' ){
                $( '#toggleSidebar' ).click();
            }
        }

        function _showSidebar(){
            if( sidebarState != 'show' ){
                $( '#toggleSidebar' ).click();
            }
        }

        function _reflowChart(){
            console.log( "reflow" );
            self.graph.reflow();
        }

        // modifies the hierarchy received fomr the OUTPUT API
        // to be usable with our ng-repeat (see _sidebar.html)
        function _hierarchise( data ){

            var hierarchy = [];
            var all = [];

            angular.forEach( data, function( tls ){
                var sls_array = []; // shrunk sls

                angular.forEach( tls.sls, function( sls ){
                    if( !sls.sensors )return; // every sls should have at least one captor

                    if( sls.sensors.length > 2 ){
                        // more than one captor: rename them to "children"
                        var children = sls.sensors;
                        delete sls.sensors;

                        // keep track of all sensors
                        all.push( sls );
                        all = all.concat( children );
                        // end track

                        sls.children = children;
                        sls_array.push( sls );
                    }else{
                        // only one captor: make it a "sls"
                        var s = sls.sensors[0];
                        if(s){
                            sls_array.push( s );
                            // keep track of all sensors
                            all.push( s );
                        }
                    }

                } );

                // rename sls to "children"
                tls.children = sls_array;
                delete tls.sls;
                // add the tls to the hierarchy
                hierarchy.push( tls );
            } );

            // TODO
            self.all_sensors = all;
            console.log( "hierarchy", hierarchy );
            console.log( "all sensors", all );

            return hierarchy;
        }


        function _log( msg ){
            toaster.error( {body: errorParser.parse(msg)} );
            console.log( msg );
        }

    }
})
();