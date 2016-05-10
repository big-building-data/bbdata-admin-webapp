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
     * @ngdoc sensors controller
     * @name bbdata.app.SensorCtrl
     *
     * @description
     * Main controller
     */
    angular
        .module('bbdata.app')
        .controller('SensorsController', ctrl);

    // --------------------------

    function ctrl(RestService, $scope) {
        var self = this;

        self.sensors = [];

        self.remove = removeSensor;
        self.edit = editSensor;
        _init();

        // ===========================================

        function removeSensor(sensor){

        }

        function editSensor(sensor){

        }

        //##--------------init

        function _init() {
            RestService.getSensors(function (sensors) {
                console.log(sensors);
                self.sensors = sensors;
                $('.ui.accordion').accordion();  // initialise semantic-ui accordion plugin
            }, _handleError);
        }


        //##------------utils

        function _handleError(error) {
            console.log(error);
        }
    }

})();