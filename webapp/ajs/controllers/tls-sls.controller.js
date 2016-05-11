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
     * @ngdoc tls sls controller
     * @name bbdata.app.TlsSlsCtrl
     *
     * @description
     * Main controller
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'TlsSlsController', ctrl );

    // --------------------------


    function ctrl( RestService, $scope ){

        var self = this;

        self.tls = [];

        _init();

        //##--------------init

        function _init(){
            RestService.getSensors( function( sensors ){
                console.log( sensors );
                self.sensors = sensors;
            }, _handleError );
        }


        //##------------utils

        function _handleError( error ){
            console.log( error );
        }
    }

})();