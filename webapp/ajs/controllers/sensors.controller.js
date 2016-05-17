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

    function ctrl(RestService, ModalService, $scope) {
        var self = this;

        self.sensors = [];
        self.tokens = {};   // map sensor.id - tokens

        self.addInfosLoading = 3;  // decremented (units,parsers,types), so ok when 0 (false)
        self.units = [];
        self.parsers = [];
        self.types = [];

        self.add = addSensor;
        self.remove = removeSensor;
        self.edit = editSensor;
        self.init = _init;

        self.loadTokens = loadTokens;

        // ===========================================

        function removeSensor(sensor) {
            ModalService.showModal({
                title: "confirm",
                html: "are you sure you want to delete sensor <strong>" + sensor.name + "</strong> (" + sensor.id + ") ?<br />The" +
                " action cannot be undone",
                positive: "proceed",
                negative: "cancel",
                basic: true,
                cancelable: true
            }).then(function (results) {
                if(results.status){
                RestService.deleteSensor(sensor, _handleError, _handleError);
                }
            }, _handleError);
        }

        function editSensor(sensor) {
            ModalService.showModal({
                title: "edit " + sensor.name,
                htmlInclude: "/html/sensors/_editModalContent.html",
                positive: "save",
                positiveDisable: 'form.editform.$invalid',
                negative: "cancel",
                inputs: {
                    sensor: angular.copy(sensor)
                },
                cancelable: false
            }).then(function (results) {
                if(results.status) {
                    // TODO edit sensor
                }
            }, _handleError);
        }

        function addSensor() {
            ModalService.showModal({
                htmlInclude: '/html/sensors/_addModalContent.html',
                positive: "add",
                positiveDisable: "form.addform.$invalid",
                negative: "cancel",
                cancelable: false,
                inputs: {
                    sensor: {},
                    types: self.types,
                    parsers: self.parsers,
                    units: self.units,
                    init: function () {
                        setTimeout(function () {
                            $('select.dropdown').dropdown();
                        }, 500);

                    }
                }
            }).then(function () {
                if(results.status){
                    // TODO add sensor
                }
            }, _handleError);
        }

        //##--------------init

        function _init() {
            RestService.getSensors(function (sensors) {
                console.log("sensors received");
                self.sensors = sensors;
                $('.ui.accordion').accordion();  // initialise semantic-ui accordion plugin
            }, _handleError);

            RestService.getUnits(function (response) {
                self.units = response;
                self.addInfosLoading--;
            }, _handleError);

            RestService.getParsers(function (response) {
                self.parsers = response;
                self.addInfosLoading--;
            }, _handleError);

            RestService.getTypes(function (response) {
                self.types = response;
                self.addInfosLoading--;
            }, _handleError);
        }

        function loadTokens(sid){
            if(self.tokens[sid])  return;
            RestService.getTokens({id: sid}, function(tokens){
                console.log(tokens);
                self.tokens[sid] = tokens;
            }, _handleError);
        }

        //##------------utils

        function _handleError(error) {
            console.log(error);
        }
    }

})();