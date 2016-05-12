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
     * @ngdoc sensors controller
     * @name bbdata.app.SensorCtrl
     *
     * @description
     * Main controller
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'SensorsController', ctrl );

    // --------------------------

    function ctrl( RestService, ModalService, $scope ){
        var self = this;

        self.sensors = [];

        self.remove = removeSensor;
        self.edit = editSensor;
        self.init = _init;

        // ===========================================

        function removeSensor( sensor ){
            ModalService.showModal( {
                title     : "confirm",
                html      : "are you sure you want to delete sensor <strong>" + sensor.name + "</strong> (" + sensor.id + ") ?<br />The" +
                " action cannot be undone",
                positive  : "proceed",
                negative  : "cancel",
                basic     : true,
                cancelable: true
            } ).then( function(){
                RestService.deleteSensor( sensor, _handleError, _handleError );
            }, _handleError );
        }

        function editSensor( sensor ){
            ModalService.showModal( {
                title      : "edit " + sensor.name,
                htmlInclude: "/html/sensors/_editModalContent.html",
                positive   : "save",
                negative   : "cancel",
                inputs: {
                    sensor: angular.copy(sensor)
                },
                cancelable : false
            } ).then( function(){
                // TODO edit sensor
            }, _handleError );
        }

        //##--------------init

        function _init(){
            RestService.getSensors( function( sensors ){
                console.log( "sensors received" );
                self.sensors = sensors;
                $( '.ui.accordion' ).accordion();  // initialise semantic-ui accordion plugin
            }, _handleError );
        }


        //##------------utils

        function _handleError( error ){
            console.log( error );
        }
    }

})();