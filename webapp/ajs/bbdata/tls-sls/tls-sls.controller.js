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
     * @name bbdata.app.TlsSlsCtontroller
     *
     * @description
     * handles the TLS/SLS page.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'TlsSlsController', ctrl );

    // --------------------------


    function ctrl( RestService, $scope, $rootScope, ModalService, TLS_SLS_PAGE, toaster, $q ){

        var self = this;

        self.tls = [];

        self.dragSensorsConfig = {
            clone: true, itemMoved: function( evt ){
                console.log( "drag sensors config" );
                var sls = evt.dest.sortableScope.sls;
                var item = evt.dest.sortableScope.modelValue[evt.dest.index];
                RestService.addSensorToSls({sls_id: sls.id, id: item.id, address: item.address}, function(){
                }, _handleError);
                console.log( item.id + " to SLS " + sls.name );
            }
        };

        self.dragSlsConfig = {
            allowDuplicates: false, itemMoved: function( evt ){
                console.log( "drag SLS config" );
                var slsFrom = evt.source.sortableScope.sls;
                var slsTo = evt.dest.sortableScope.sls;
                var item = evt.dest.sortableScope.modelValue[evt.dest.index];
                console.log( item.id + " : " + slsFrom.name + " -> " + slsTo.name );
            }
        };

        self.addTLS = addTLS;
        self.editTLS = editTLS;
        self.deleteTLS = deleteTLS;
        self.addSLS = addSLS;
        self.editSLS = editSLS;
        self.deleteSLS = deleteSLS;

        $scope.splice = splice;

        _init();

        //##--------------init

        function _init(){
            console.log("tls sls init");

            RestService.getSets( function( sets ){
                RestService.getSensors(function(sensors){
                    self.sensors = sensors;
                }, _handleError);
                console.log( "sets", sets );
                self.tls = sets;
                _sticky();

                $rootScope.$on( 'bbdata.PageChanged', function( evt, args ){
                    if( args.to == TLS_SLS_PAGE ){
                        console.log( "page == TLS/SLS." );
                        _sticky();
                    }
                } );

            }, _handleError );
        }


        //##--------------

        function addTLS( parent, idx ){
            _addEditNameModal( "add TLS", "").then(function(name){
                RestService.addTLS({name: name}, function(tls){
                    if(!tls.hasOwnProperty("sls")) tls.sls = [];
                    parent.push(tls);
                }, _handleError);
            });
        }

        function editTLS( parent, idx ){
            var tls = parent[idx];

            _addEditNameModal( "edit TLS", tls.name).then(function(name){
                RestService.editTLS({id: tls.id, name: name}, function(tls){
                    tls.name = name;
                }, _handleError);
            });
        }

        function deleteTLS( parent, idx ){
            var tls = parent[idx];

            var deleteCallback = function(){
                RestService.deleteTLS({id: tls.id}, function(){
                    splice( parent, idx );
                }, _handleError);
            };

            if( tls.sls && tls.sls.length ){
                // some sensors exist, ask for confirmation
                ModalService.showModal( {
                    title   : "confirm",
                    html    : "<p>are you absolutely sure ?</p><p>All its SLS will be deleted as well.</p>",
                    positive: "proceed",
                    negative: "cancel",
                    icon    : "warning sign orange",
                    basic   : true
                } ).then( function( result ){
                    if( result.status ) deleteCallback();

                }, _handleError );

            }else{
                deleteCallback();
            }
        }

        function addSLS( parent, idx ){
            _addEditNameModal( "add SLS", "").then(function(name){
                RestService.addSLS({name: name, tls_id: parent.id}, function(sls){
                    if(!sls.hasOwnProperty("sensors")) sls.sensors = [];
                    parent.sls.push(sls);
                }, _handleError);
            });
        }

        function editSLS( parent, idx ){
            var sls = parent.sls[idx];

            _addEditNameModal( "edit SLS", sls.name).then(function(name){
                RestService.editSLS({id: sls.id, name: name, "tls-id": parent.id}, function(sls){
                    sls.name = name;
                }, _handleError);
            });
        }

        function deleteSLS( parent, idx ){
            var sls = parent.sls[idx];

            var deleteCallback = function(){
                RestService.deleteSLS({id: sls.id}, function(){
                    splice( parent.sls, idx );
                }, _handleError);
            };

            if( sls.sensors && sls.sensors.length ){
                // some sensors exist, ask for confirmation
                ModalService.showModal( {
                    title   : "confirm",
                    html    : "are you absolutely sure ?",
                    positive: "proceed",
                    negative: "cancel",
                    icon    : "trash",
                    basic   : true,
                } ).then( function( result ){
                    if( result.status ) deleteCallback();

                }, _handleError );
            }else{
                deleteCallback();
            }
        }

        //##------------utils

        /*
         * @param title the title of the modal
         * @param name the current name to modify
         * @return Promise resolves with the new name, rejects on user cancel or no change.
         */
        function _addEditNameModal( title, name ){
            var deferred = $q.defer();

            ModalService.showModal( {
                title          : title,
                html           : '<div class="ui labeled input"> <div class="ui label">name</div> <input type="text" ng-model="inputs.name"> </div>',
                positive       : "save",
                positiveDisable: '!inputs.name',
                negative       : "cancel",
                inputs         : {
                    name: name
                }
            } ).then( function( result ){
                if( result.status && name !== result.inputs.name){
                    deferred.resolve(result.inputs.name);
                }else{
                    deferred.reject();
                }

            }, _handleError );

            return deferred.promise;

        }

        function _handleError( error ){
            console.log( error );
            toaster.error( {body: error} );
        }

        function splice( arr, idx ){
            arr.splice( idx, 1 );
        }

        function _sticky(){
            // wait a bit to be sure everything is loaded
            setTimeout( function(){
                console.log( "apply sticky" );
                $( '.ui.sticky' ).sticky( {} );
            }, 100 );
        }
    }

})();