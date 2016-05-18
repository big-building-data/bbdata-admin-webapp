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
     * @name bbdata.app.SensorController
     *
     * @description
     * handles the sensors page: add, edit, remove, manage tokens.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'SensorsController', ctrl );

    // --------------------------

    function ctrl( RestService, ModalService ){
        var self = this;

        self.sensors = []; // all the sensors
        self.tokens = {};   // map sensor.id - tokens

        self.addInfosLoading = 3;  // decremented (units,parsers,types), so ok when 0 (false)
        self.units = [];    // all the available units (add modal)
        self.parsers = [];  // all the available parsers (add modal)
        self.types = [];    // all the available value types (add modal)

        // manage sensors
        self.add = addSensor;
        self.remove = removeSensor;
        self.edit = editSensor;

        // manage tokens
        self.loadTokens = loadTokens; // lazy loading
        self.addToken = addToken;
        self.removeToken = removeToken;
        self.editToken = editToken;

        // called on first page load
        self.init = _init;


        // ==================== init


        //##--------------init

        function _init(){
            // get the sensors list
            RestService.getSensors( function( sensors ){
                console.log( "sensors received" );
                self.sensors = sensors;
                $( '.ui.accordion' ).accordion();  // initialise semantic-ui accordion plugin
            }, _handleError );

            // get units, parsers and types
            RestService.getUnits( function( response ){
                self.units = response;
                self.addInfosLoading--;
            }, _handleError );

            RestService.getParsers( function( response ){
                self.parsers = response;
                self.addInfosLoading--;
            }, _handleError );

            RestService.getTypes( function( response ){
                self.types = response;
                self.addInfosLoading--;
            }, _handleError );
        }

        // ==================== sensors

        function removeSensor( sensor ){
            ModalService.showModal( {
                title     : "confirm",
                html      : "are you sure you want to delete sensor <strong>" + sensor.name + "</strong> (" + sensor.id + ") ?<br />The" +
                " action cannot be undone",
                positive  : "proceed",
                negative  : "cancel",
                basic     : true,
                cancelable: true
            } ).then( function( results ){
                if( results.status ){
                    RestService.deleteSensor( sensor, _handleError, _handleError );
                }
            }, _handleError );
        }

        function editSensor( sensor ){
            ModalService.showModal( {
                title          : "edit " + sensor.name,
                htmlInclude    : "/ajs/bbdata/sensors/partials/_editModalContent.html",
                positive       : "save",
                positiveDisable: 'form.editform.$invalid',
                negative       : "cancel",
                inputs         : {
                    sensor: angular.copy( sensor )
                },
                cancelable     : false
            } ).then( function( results ){
                if( results.status ){
                    // TODO edit sensor
                }
            }, _handleError );
        }

        function addSensor(){
            ModalService.showModal( {
                htmlInclude    : '/ajs/bbdata/sensors/partials/_addModalContent.html',
                positive       : "add",
                positiveDisable: "form.addform.$invalid",
                negative       : "cancel",
                cancelable     : false,
                inputs         : {
                    sensor : {},
                    types  : self.types,
                    parsers: self.parsers,
                    units  : self.units,
                    init   : function(){
                        setTimeout( function(){
                            $( 'select.dropdown' ).dropdown();
                        }, 500 );

                    }
                }
            } ).then( function(){
                if( results.status ){
                    // TODO add sensor
                }
            }, _handleError );
        }

        // ==================== tokens


        function loadTokens( sid ){
            if( self.tokens[sid] )  return;
            RestService.getTokens( {id: sid}, function( tokens ){
                console.log( tokens );
                self.tokens[sid] = tokens;
            }, _handleError );
        }

        function removeToken( sensor, index ){
            ModalService.showModal( {
                title     : "confirm",
                icon      : "warning sign orange",
                html      : "are you sure you want to delete this token ?<br />" +
                "Rights associated with it will all be revoqued.",
                positive  : "proceed",
                negative  : "cancel",
                basic     : true,
                cancelable: true
            } ).then( function( results ){
                if( results.status ){
                    // TODO delete token
                    var tokens = self.tokens[sensor.id];
                    tokens.splice( index, 1 );
                }
            }, _handleError );
        }

        function editToken( sensor, token ){
            _addEditToken( sensor, token );
        }

        function addToken( sensor ){
            _addEditToken( sensor, null );
        }

        function _addEditToken( sensor, token ){
            ModalService.showModal( {
                title   : (token ? "edit " : "add") + " token",
                html    : '<div class="ui form"><div class="field"> <label>Description</label> <textarea ng-model="inputs.description" rows="2"></textarea></div></div>',
                positive: "save",
                negative: "cancel",
                inputs  : {
                    description: token ? token.description : ""
                }
            } ).then( function( result ){
                if( result.status ){
                    if( token == null ){
                        // TODO put token
                        self.tokens[sensor.id].push( {
                            id         : sensor.id,
                            secret     : "saldkfjasédlkfja",
                            description: result.inputs.description
                        } );
                    }else{
                        // TODO update +
                        token.description = result.inputs.description;
                    }
                }

            }, _handleError );
        }


        // ==================== other

        //##------------utils

        function _handleError( error ){
            console.log( error );
        }
    }

})();