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
     * @ngdoc tls ogroup controller
     * @name bbdata.app.TlsOgroupCtontroller
     *
     * @description
     * handles the TLS/Ogroup page.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'OgroupsController', ctrl )
        .filter( 'ownerFilter', ownerFilter );

    // --------------------------


    function ctrl( RestService, $rootScope, ModalService, OGROUPS_PAGE, toaster, $q, errorParser ){

        var self = this;

        self.ogroups = [];          // the object groups writable by the user, with objects
        self.objects = [];          // all objects writable by the user
        self.adminGroups = [];      // all user groups for which the user has administrative rights
        self.allUserGroups = [];    // all user groups, useful to give new permissions
        self.currentGroup = null;   // current group, i.e. selected one (whose ogroups and objects are visible)


        // available methods
        self.addObjectGroup = addObjectGroup;
        self.editOgroup = editObjectGroup;
        self.deleteOgroup = deleteObjectGroup;
        self.removeObjectFromGroup = removeObjectFromGroup;
        self.removePermission = removePermission;
        self.addPermission = addPermission;

        //##-------------- drag and drop configuration

        self.dragObjectsConfig = {
            clone    : true,
            itemMoved: function( evt ){
                var objectGroup = evt.dest.sortableScope.ogroup;
                var object = evt.dest.sortableScope.modelValue[evt.dest.index];
                addObjectToGroup( object, objectGroup, null,
                    function(){
                        // on error, remove the object

                        //ogroup.sensors.splice( evt.dest.index, 1 );
                    } );
                console.log( object.id + " to Ogroup " + objectGroup.name );
            }
        };

        self.dragObjectGroupConfig = {
            allowDuplicates: false,
            itemMoved      : function( evt ){
                console.log( "drag Ogroup config" );
                var ogroupFrom = evt.source.sortableScope.ogroup;
                var ogroupTo = evt.dest.sortableScope.ogroup;
                var item = evt.dest.sortableScope.modelValue[evt.dest.index];
                // add and then delete
                addObjectToGroup( item, ogroupTo, function(){
                    removeObjectFromGroup( item, ogroupFrom );
                } );
                console.log( item.id + " : " + ogroupFrom.name + " -> " + ogroupTo.name );
            }
        };

        // called on first page load
        self.init = _init;

        //##--------------init

        function _init(){
            console.log( "object group inititialisation" );

            RestService.getObjectGroups( {objects: true, writable: true}, function( ogroups ){

                console.log( "object groups", ogroups );
                self.ogroups = ogroups;

                // also fetch permissions
                angular.forEach( ogroups, function( ogrp ){
                    RestService.getObjectGroupPermissions( {id: ogrp.id}, function( perms ){
                        ogrp.permissions = perms;
                    }, _handleError );
                } );

            }, _handleError );

            RestService.getObjects( {writable: true}, function( objects ){
                console.log( "objects", objects );
                self.objects = objects;
                _sticky(); // initialise sticky module

                $rootScope.$on( 'bbdata.PageChanged', function( evt, args ){
                    // always initialise sticky module when user navigates back to the page
                    if( args.to == OGROUPS_PAGE ){
                        console.log( "page == Ogroup" );
                        _sticky();
                    }
                } );
            }, _handleError );

            RestService.getMyUserGroups( {admin: true}, function( groups ){
                console.log( "admin groups", groups );
                self.adminGroups = groups;
                if( groups.length > 0 ) self.currentGroup = groups[0];
            }, _handleError );

            RestService.getAllUserGroups( function( groups ){
                console.log( "user groups", groups );
                self.allUserGroups = groups;
            }, _handleError );


        }

        //##-------------- handle object groups

        function addObjectGroup(){
            _addEditNameModal( "add object group", "" )
                .then( function( name ){
                    RestService.addObjectGroup( {owner: self.currentGroup.id}, {name: name},
                        function( ogroup ){
                            if( !ogroup.hasOwnProperty( "objects" ) ) ogroup.objects = [];
                            self.ogroups.push( ogroup ); // add new object group
                        }, _handleError );
                } );
        }

        function editObjectGroup( ogroup ){
            _addEditNameModal( "edit object group", ogroup.name )
                .then(
                    function( name ){
                        RestService.editObjectGroup( {id: ogroup.id, name: name}, function( ogroup ){
                            // make changes visible
                            ogroup.name = name;
                        }, _handleError );
                    } );
        }

        function deleteObjectGroup( ogroup, idx ){

            var deleteCallback = function(){
                RestService.deleteObjectGroup( {id: ogroup.id}, function(){
                    self.ogroups.splice( idx, 1 );
                }, _handleError );
            };

            if( ogroup.objects && ogroup.objects.length ){
                // some objects exist, ask for confirmation
                ModalService.showModal( {
                    title   : "confirm",
                    html    : "are you absolutely sure ?",
                    positive: "proceed",
                    negative: "cancel",
                    icon    : "trash",
                    basic   : true
                } ).then( function( result ){
                    if( result.status ) deleteCallback();
                }, _handleError );
            }else{
                deleteCallback();
            }
        }

        //##------------ permissions management

        function addPermission( group, ogroup ){
            if( ogroup.permissions.indexOf( group ) >= 0 ){
                // permissions already exists, do nothing
                console.log( "already here" );
                return;
            }
            RestService.addPermission( {id: ogroup.id, groupId: group.id}, {}, function(){
                ogroup.permissions.push( group );
            }, _handleError );
        }

        function removePermission( perm, ogroup ){
            RestService.removePermission( {id: ogroup.id, groupId: perm.id}, function(){
                ogroup.permissions.splice( ogroup.permissions.indexOf( perm ), 1 );
            }, _handleError );
        }

        //##------------ objects management

        function addObjectToGroup( object, ogroup, resolve, reject ){
            if( !reject ) reject = _handleError;
            RestService.addObjectToGroup( {
                id      : ogroup.id,
                objectId: object.id
            }, {}, resolve, reject );
        }

        function removeObjectFromGroup( object, ogroup, resolve, reject ){
            if( !reject ) reject = _handleError;
            RestService.removeObjectFromGroup( {
                id      : ogroup.id,
                objectId: object.id
            }, {}, function(){
                // idx == -1 if object dragged from another group
                var idx = ogroup.objects.indexOf( object );
                if( idx >= 0 ) ogroup.objects.splice( idx, 1 );
                if( resolve ) resolve();
            }, reject );
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
                if( result.status && name !== result.inputs.name ){
                    deferred.resolve( result.inputs.name );
                }else{
                    deferred.reject();
                }

            }, _handleError );

            return deferred.promise;

        }


        function _handleError( error ){
            console.log( error );
            toaster.error( {body: errorParser.parse( error )} );
        }


        function _sticky(){
            // wait a bit to be sure everything is loaded
            setTimeout( function(){
                console.log( "apply sticky" );
                $( '.ui.sticky' ).sticky( {} );
            }, 100 );
        }

    }


    function ownerFilter(){

        return function( inputs, group ){

            if( !group ) return [];

            var output = [];
            angular.forEach( inputs, function( input ){
                if( input.owner && group && input.owner.id == group.id ){
                    output.push( input );
                }
            } );
            return output;
        }
    }

})();