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
        .module( 'bbdata.window.app' )
        .controller( 'MainCtrl', ctrl );

    function ctrl( RestService, RFC3339_FORMAT, $window ){
        var self = this;
        self.setData = setData;
        $window.setData = setData;
        // setData([{ "id": 45, "name": "Température au sol 1", "address": "noaddress" }], moment.duration(1, 'hours'), 6000);

        function _now(){
            return moment(new Date()).subtract(moment.duration(20, "seconds"));
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
                    address: sensor.address,
                    to: to.format(RFC3339_FORMAT),
                    from: to.subtract(self.interval).format(RFC3339_FORMAT),
                }, function(data){
                    sensor.serieId = sensor.id + "|" + sensor.address;
                     series.push({
                         id: sensor.serieId,
                         name: sensor.name,
                         data:  toTrace(data.values)
                     });

                    if(idx == self.sensors.length-1){
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
                        address: sensor.address,
                        from: from.format(RFC3339_FORMAT),
                        to: to.format(RFC3339_FORMAT)

                    }, function(data){
                        console.log(data);
                        var trace = toTrace(data.values);
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