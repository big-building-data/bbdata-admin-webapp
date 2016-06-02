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
        .factory( 'Graph', GraphFactory );

    function GraphFactory(Serie){

        // constructor
        function Graph( shareAxis ){
            this.chart = null;
            this.shareAxis = shareAxis;
            this.smaPeriod = 5;
            this.sma = false;
            this.series = {}; // serie id (sensor-"serie") mapped to the serie object

        }


        var defaultSerie = new Serie( {
            id    : Serie.toSensorId( "y" ), // so we have the axis.id = y-axis
            name  : "values",
            values: []
        }, [] );

        var defaultAxis = defaultSerie.axis;


        var defaultChartOptions = { // default options when creating a new graph
            chart        : {
                renderTo: 'graphContainer',
                zoomType: 'xy'
            },
            navigator    : {
                enabled: false
            },
            rangeSelector: {
                enabled: false
            },

            legend: {enabled: true}
        };

        // static
        Graph.DEFAULT_SERIE = defaultSerie;

        Graph.DEFAULTchart_OPTIONS = defaultChartOptions;

        // SMA:
        // add sma
        // .get(serie).hide()
        // .get(serie).update({"showInLegend": false}, true)


        Graph.prototype.reflow = function(){
            if( this.chart ) this.chart.reflow();
        };

        Graph.prototype.deleteGraph = function(){
            this.chart = null;
            this.series = {};
        };

        // add the serie, creating the graph if needed
        Graph.prototype.addSerie = function( s ){

            if( !this.chart ){
                // create new graph
                createGraph( this, s );
            }else{
                // axis on the right
                s.axis.opposite = true;
                // add the serie to the existing graph
                if( !this.shareAxis ) this.chart.addAxis( s.axis );

                this.chart.addSeries( {  // the serie to add
                    name : s.name,
                    id   : s.id,
                    data : s.data,
                    yAxis: axis( this, s.axis ).id
                } );
            }

            this.series[s.id] = s;
            if( this.sma ) addSma( this, s );
            if( s.manual ){
                this.setExtremesOf( s.axis.id, s.min, s.max );
            }
        };


        Graph.prototype.toggleShareAxis = function(){
            this.setShareAxis( !this.shareAxis );
        };

        Graph.prototype.setExtremesOf = function( axisId, min, max ){
            if( !this.chart ) return;
            var axis = this.chart.get( axisId );
            if( axis ){
                axis.setExtremes( min, max );
            }
        };

        Graph.prototype.setShareAxis = function( shareAxis ){
            if( this.shareAxis === shareAxis ) return;
            this.shareAxis = shareAxis;

            if( !this.chart ) return;

            if( shareAxis ){
                regroupAxis( this );
            }else{
                splitAxis( this );
            }
        };

        Graph.prototype.removeAssociatedSerie = function( sensor ){
            var serie = this.series[sensor.id + "-serie"];

            // remove sma
            var sma = this.chart.get( serie.sma.id );
            if( sma ) sma.remove();
            // remove serie
            this.chart.get( serie.id ).remove();
            // if has its own axis, remove it as well
            var axis = this.chart.get( serie.axis.id );
            if( axis ) axis.remove();

            // update list
            delete this.series[serie.id];
        };


        Graph.prototype.smaToggled = function(){
            var self = this;
            if( this.sma ){
                angular.forEach( this.series, function( serie ){
                    addSma( self, serie );
                } );
            }else{
                angular.forEach( this.series, function( serie ){
                    self.chart.get( serie.sma.id ).remove();
                    var s = self.chart.get( serie.id );
                    s.update( {showInLegend: true, color: serie.color}, false );
                } );
            }

            this.chart.redraw();
        };

        Graph.prototype.smaPeriodChanged = function(period){
            if(!this.chart || !this.sma) return; // nothing to do
            var self = this;
            angular.forEach( this.series, function( serie ){
                var options = {periods : period};
                self.chart.get( serie.sma.id ).update(options, false);
            } );
            self.smaPeriod = period;
            console.log("period changed", period);
            self.chart.redraw();
        };

        // ----------------------------------------------------

        // create the graph with the serie
        function createGraph( self, serie ){
            var options = angular.copy( defaultChartOptions );
            options.series = [{  // the serie to add
                name : serie.name,
                id   : serie.id,
                data : serie.data,
                yAxis: axis( self, serie.axis ).id
            }];
            options.yAxis = [axis( self, serie.axis )];
            self.chart = new Highcharts.StockChart( options );
        }

        // returns the axis or the default axis depending on shareAxis
        function axis( self, ax ){
            return self.shareAxis ? defaultAxis : ax;
        }

        function addSma( self, serie ){
            serie.sma.periods = self.smaPeriod;
            serie.sma.yAxis = axis( self, serie.axis ).id;
            self.chart.addSeries( serie.sma );
            var s = self.chart.get( serie.id );
            serie.color = s.color;
            s.update( {showInLegend: false, color: "#00000000"} );
        }


        function regroupAxis( self ){
            // add shared axis
            self.chart.addAxis( defaultAxis );
            // set min max of default axis y if in manual mode
            if( defaultSerie.manual ) self.setExtremesOf(defaultAxis.id, defaultSerie.min, defaultSerie.max );

            // remove the axis of all the series
            angular.forEach( self.series, function( serie, id ){
                // update axis
                var options = {yAxis: defaultAxis.id};
                self.chart.get( id ).update( options, false );
                if( self.sma ) self.chart.get( serie.sma.id ).update( options, false );
                // remove the non-shared axis
                self.chart.get( serie.axis.id ).remove( false );
            } );

            // update graph
            self.chart.redraw();
        }

        function splitAxis( self ){
            // add the axis of all the series
            angular.forEach( self.series, function( serie, id ){
                self.chart.addAxis( serie.axis, false );
                var options = {yAxis: serie.axis.id};
                self.chart.get( id ).update( options, false );
                if( self.sma ) self.chart.get( serie.sma.id ).update( options, false );
                // set min max of default axis y if in manual mode
                if( serie.manual ) self.setExtremesOf( serie.axis.id, serie.min, serie.max );
            } );

            // remove  shared axis
            self.chart.get( defaultAxis.id ).remove( false );
            // update graph
            self.chart.redraw();
        }


        return Graph;
    }

})();