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


    function ctrl( RestService, $scope, $rootScope, ModalService, TLS_SLS_PAGE ){

        var self = this;

        self.tls = [{
            name: "TLS 1",
            sls : [{name: "sls1", sensors: [{id: 0, name: "alskdfj"}]}, {name: "sls2", sensors: []}]
        },
            {name: "TLS 2", sls: [{name: "sls21", sensors: []}, {name: "sls22", sensors: []}]}];

        self.dragSensorsConfig = {clone: true};
        self.dragSlsConfig = {allowDuplicates: false};

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

        function editTLS( parent, idx ){
            _addEditName( "edit TLS", parent, parent[idx] );
        }

        function addTLS( parent, idx ){
            _addEditName( "add TLS", parent, {name: "", sls: []}, true );
        }

        function deleteTLS( parent, idx ){
            var tls = parent[idx];
            if( tls.sls && tls.sls.length ){
                // some sensors exist, ask for confirmation
                ModalService.showModal( {
                    title   : "confirm",
                    html    : "<p>are you absolutely sure ?</p><p>All its SLS will be deleted as well.</p>",
                    positive: "proceed",
                    negative: "cancel",
                    icon    : "warning sign orange",
                    basic   : true,
                } ).then( function( result ){
                    if( result.status ) splice( parent, idx );

                }, _handleError );

            }else{
                splice( self.tls, idx );
            }
        }

        function addSLS( parent, idx ){
            _addEditName( "SLS", parent, {name: "", sensors: []}, true );
        }

        function editSLS( parent, idx ){
            _addEditName( "edit SLS", parent, parent[idx] );
        }

        function deleteSLS( parent, idx ){
            var sls = parent[idx];
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
                    if( result.status ) splice( parent, idx );

                }, _handleError );
            }else{
                splice( parent, idx );
            }
        }

        //##------------utils

        function _addEditName( title, parent, obj, add ){
            console.log( obj );
            ModalService.showModal( {
                title   : title,
                html    : '<div class="ui labeled input"> <div class="ui label">name</div> <input type="text" ng-model="inputs.obj.name"> </div>',
                positive: "save",
                positiveDisable: '!inputs.obj.name',
                negative: "cancel",
                inputs  : {
                    obj: angular.copy( obj )
                }
            } ).then( function( result ){
                console.log( result );
                if( result.status ){
                    if( add ){
                        parent.push( result.inputs.obj );
                    }else{
                        obj.name = result.inputs.obj.name;
                    }
                }

            }, _handleError );

        }

        function _handleError( error ){
            console.log( error );
        }

        function splice( arr, idx ){
           arr.splice( idx, 1 );
        }

        function _sticky(){
            setTimeout( function(){
                console.log("apply sticky");
                $( '.ui.sticky' ).sticky( {} );
            }, 100 );
        }
    }

})();