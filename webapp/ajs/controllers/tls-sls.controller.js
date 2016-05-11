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


    function ctrl( RestService, $scope, ModalService ){

        var self = this;

        self.tls = [{
            name: "TLS 1",
            sls : [{name: "sls1", sensors: [{id: 0, name: "alskdfj"}]}, {name: "sls2", sensors: []}]
        },
            {name: "TLS 2", sls: [{name: "sls21", sensors: []}, {name: "sls22", sensors: []}]}];

        self.dragSensorsConfig = {clone: true};
        self.dragSlsConfig = {allowDuplicates: false};

        self.editTLS = editTLS;
        self.deleteTLS = deleteTLS;
        self.editSLS = editSLS;
        self.deleteSLS = deleteSLS;

        $scope.splice = splice;

        _init();

        //##--------------init

        function _init(){
            RestService.getSensors( function( sensors ){
                console.log( sensors );
                self.sensors = sensors;
                for( var i = 100; i < 200; i++ ){
                    self.sensors.push( {
                        id         : i,
                        name       : "lala " + i,
                        description: "asdf",
                        location   : "slkdjf"
                    } );
                }
                $( '.ui.sticky' ).sticky( {} );
            }, _handleError );
        }


        function editTLS( tls, idx ){

        }

        function deleteTLS( tls, idx ){
            if( tls.sls && tls.sls.length ){
                // some sensors exist, ask for confirmation
                ModalService.showModal( {
                    title: "confirm",
                    html : "are you absolutely sure ? <br />All its SLS will be deleted as well.",
                    positive: "proceed",
                    negative: "cancel",
                    basic: true,
                } ).then( function( result ){
                    if( result.status ) splice( tls, idx );

                }, _handleError );

            }else{
                splice( tls, idx );
            }
        }



        function editSLS( tls, idx ){

        }

        function deleteSLS( tls, idx ){
            var sls = tls.sls[idx];
            if( sls.sensors && sls.sensors.length ){
                // some sensors exist, ask for confirmation
                ModalService.showModal( {
                    title: "confirm",
                    html : "are you absolutely sure ?",
                    positive: "proceed",
                    negative: "cancel",
                    basic: true,
                } ).then( function( result ){
                    if( result.status ) splice( tls.sls, idx );

                }, _handleError );
            }else{
                splice( tls.sls, idx );
            }
        }

        //##------------utils

        function _handleError( error ){
            console.log( error );
        }

        function splice( arr, idx ){
            arr = arr.splice( idx, 1 );
        }
    }

})();