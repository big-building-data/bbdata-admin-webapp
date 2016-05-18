/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function () {

    /**
     * @ngdoc controller
     * @name bbdata.app.DisplayController
     *
     * @description
     * Controller in charge of the first page, which draws
     * the graph and displays the values of the sensors.
     */
    angular
        .module('bbdata.app')
        .factory('Graph', GraphFactory);

    function GraphFactory(Serie) {

        // constructor
        function Graph(shareAxis) {
            this.chart = null;
            this.shareAxis = shareAxis;
            this.series = {};

        }


        // static
        Graph.DEFAULT_AXIS = defaultAxis;
        Graph.DEFAULTchart_OPTIONS = defaultChartOptions;

        var defaultAxis = {id: "y-axis"};

        var defaultChartOptions = { // default options when creating a new graph
            chart: {
                renderTo: 'graphContainer'
            },
            rangeSelector: {
                enabled: false
            },
            legend: {enabled: true}
        };


        Graph.prototype.reflow = function () {
            if (this.graph) this.graph.reflow();
        };

        Graph.prototype.deleteGraph = function () {
            this.graph = null;
        };

        // add the serie, creating the graph if needed
        Graph.prototype.addSerie = function (s) {

            if (!this.chart) {
                // create new graph
                createGraph(this, s);
            } else {
                // axis on the right
                s.axis.opposite = true;
                // add the serie to the existing graph
                if (!self.shareAxis) this.chart.addAxis(s.axis);

                this.chart.addSeries({  // the serie to add
                    name: s.name,
                    id: s.id,
                    data: s.data,
                    yAxis: axis(this, s.axis).id
                });
            }

            this.series[s.id] = s;
        };


        Graph.prototype.toggleShareAxis = function () {
            this.setShareAxis(!this.shareAxis);
        };

        Graph.prototype.setShareAxis = function (shareAxis) {
            if (this.shareAxis === shareAxis) return;
            this.shareAxis = shareAxis;

            if (!this.chart) return;

            if (shareAxis) {
                regroupAxis(this);
            } else {
                splitAxis(this);
            }
        };

        Graph.prototype.removeAssociatedSerie = function (sensor) {
            var serie = this.series[sensor.id + "-serie"];

            // remove serie
            this.chart.get(serie.id).remove();
            // if has its own axis, remove it as well
            var axis = this.chart.get(serie.axis.id);
            if (axis) axis.remove();

            // update list
            delete this.series[serie.id];
        };

        // ----------------------------------------------------

        // create the graph with the serie
        function createGraph(self, serie) {
            var options = angular.copy(defaultChartOptions);
            options.series = [{  // the serie to add
                name: serie.name,
                id: serie.id,
                data: serie.data,
                yAxis: axis(this, serie.axis).id
            }];
            options.yAxis = [axis(self, serie.axis)];
            self.chart = new Highcharts.StockChart(options);
        }


        // returns the axis or the default axis depending on shareAxis
        function axis(self, ax) {
            return self.shareAxis ? defaultAxis : ax;
        }


        function regroupAxis(self) {
            // add shared axis
            self.chart.addAxis(defaultAxis);
            // remove the axis of all the series
            angular.forEach(self.series, function (serie, id) {
                self.chart.get(id).update({yAxis: defaultAxis.id}, false);
                self.chart.get(serie.axis.id).remove(false);
            });

            // update graph
            self.chart.redraw();
        }

        function splitAxis(self) {
            // add the axis of all the series
            angular.forEach(self.series, function (serie, id) {
                self.chart.addAxis(serie.axis, false);
                self.chart.get(id).update({yAxis: serie.axis.id}, false);
            });

            // remove  shared axis
            self.chart.get(defaultAxis.id).remove(false);
            // update graph
            self.chart.redraw();
        }


        return Graph;
    }

})();