(function(){

    /**
     * @ngdoc controller
     * @name bbdata.app.MainCtrl
     *
     * @description
     * Controller in charge of the first page, loads the other components
     */
    angular
        .module( 'bbdata.window.app' )
        .controller( 'MainCtrl', ctrl );

    function ctrl( RestService, RFC3339_FORMAT, $window ){
        const LAG = moment.duration(10, "seconds"); // to let the input be processed by the API

        var self = this;
        self.setData = setData;
        $window.setData = setData;

        function _now(){
            return moment(new Date()).subtract(LAG);
        }

        function setData( sensors, interval, refreshRate ){
            self.sensors = sensors;
            self.interval = interval; // should be a moment duration
            self.refreshRate = refreshRate; // should be in ms
            init();
        }

        function init(){
            var to = _now();
            self.xAxisUpperBound = angular.copy(to);
            var series = [];

            self.sensors.forEach(function(sensor, idx){
                RestService.getValues({
                    id: sensor.id,
                    to: to.format(RFC3339_FORMAT),
                    from: to.subtract(self.interval).format(RFC3339_FORMAT),
                }, function(values){
                     sensor.serieId = sensor.id + "|" + sensor.name;
                     series.push({
                         id: sensor.serieId,
                         name: sensor.name,
                         data:  toTrace(values)
                     });

                    if(idx === self.sensors.length-1){
                        createChart(series);
                    }
                });
            });
        }


        function loadEvent(){

            setInterval(function () {
                var to = _now();
                var from = self.xAxisUpperBound;
                self.xAxisUpperBound = to;

                self.sensors.forEach(function(sensor, idx){
                    console.log("refresh ", moment());
                    RestService.getValues({
                        id: sensor.id,
                        from: from.format(RFC3339_FORMAT),
                        to: to.format(RFC3339_FORMAT)
                    }, function(values){
                        var trace = toTrace(values);
                        console.log(trace);
                        var serie = self.chart.get(sensor.serieId);
                        trace.forEach(function(point){
                            serie.addPoint(point, false, serie.data.length > 20, true);
                        });
                        self.chart.redraw();
                    });
                });

            }, self.refreshRate);
        }


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


        function createChart( series ){
            console.log("create chart", series);
            // Create the chart
            self.chart = new Highcharts.StockChart({
                chart: {
                    renderTo: 'graphContainer',
                    events: {
                        load: loadEvent
                    }
                },

                navigator    : {
                    enabled: false
                },
                rangeSelector: {
                    enabled: false
                },

                legend: {enabled: true},

                title: {
                    text: 'Live data'
                },

                exporting: {
                    enabled: false
                },

                series: series
            });

        }
    }

})();
