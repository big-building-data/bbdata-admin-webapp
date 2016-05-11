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

        self.tls = [ {name: "TLS 1", sls: [ {name: "sls1", sensors: [{id: 0, name:"alskdfj"}]}, {name: "sls2", sensors: []} ] },
            {name: "TLS 2", sls: [ {name: "sls21", sensors: []}, {name: "sls22", sensors: []} ] }];

        _init();

        self.dragSensorsConfig = {clone: true};
        self.dragSlsConfig = {allowDuplicates: false};

        //##--------------init

        function _init(){
            RestService.getSensors( function( sensors ){
                console.log( sensors );
                self.sensors = sensors;
                for(var i = 100; i < 200; i++){
                    self.sensors.push({
                        id: i,
                        name: "lala " + i,
                        description: "asdf",
                        location: "slkdjf"
                    });
                }
                $('.ui.sticky' ).sticky({});
            }, _handleError );
        }


        //##------------utils

        function _handleError( error ){
            console.log( error );
        }
    }

})();