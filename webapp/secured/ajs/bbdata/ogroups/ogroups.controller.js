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
     * @name bbdata.app.OgroupsController
     *
     * @description
     * handles the Object groups page.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'OgroupsController', ctrl )
        .filter( 'ownerFilter', ownerFilter );

    // --------------------------


    function ctrl( RestService, DataProvider, ModalService, $q, ErrorHandler ){

        var self = this;

        self.ogroups = [];          // the object groups writable by the user, with objects
        self.objects = [];          // all objects writable by the user
        self.adminGroups = [];      // all user groups for which the user has administrative rights
        self.allUserGroups = [];    // all user groups, useful to give new permissions
        self.currentGroup = null;   // current group, i.e. selected one (whose ogroups and objects are visible)

        self.pagination = {perPage: 10, currentPage: 1};

        // available methods
        self.addObjectGroup = addObjectGroup;
        self.editObjectGroup = editObjectGroup;
        self.deleteObjectGroup = deleteObjectGroup;
        self.removeObjectFromGroup = removeObjectFromGroup;
        self.removePermission = removePermission;
        self.addPermission = addPermission;


        // called on first page load
        self.init = _init;

        //##-------------- drag and drop configuration

        self.dragObjectsConfig = {
            clone    : true,
            itemMoved: function( evt ){
                var objectGroup = evt.dest.sortableScope.ogroup;
                var idx = evt.dest.index;
                console.log( "drag objects", idx, evt.dest.sortableScope.modelValue.length );
                var object = evt.source.itemScope.s;

                for( var i = 0; i < objectGroup.objects.length; i++ ){
                    if( i != evt.dest.index && objectGroup.objects[i].id == object.id ){
                        // duplicate: undo the insert
                        evt.dest.sortableScope.removeItem( evt.dest.index );
                        return;
                    }
                }

                evt.dest.sortableScope.modelValue[evt.dest.index] = object;
                addObjectToGroup( object, objectGroup, null,
                    function(){
                        // on error, remove the object

                        //ogroup.sensors.splice( evt.dest.index, 1 );
                    } );
                console.log( object.id + " to Ogroup " + objectGroup.name );
            }
        };

        self.dragObjectGroupConfig = {
            allowDuplicates: true,
            itemMoved      : function( evt ){
                console.log( "drag Ogroup config" );
                var ogroupFrom = evt.source.sortableScope.ogroup;
                var ogroupTo = evt.dest.sortableScope.ogroup;
                var object = evt.dest.sortableScope.modelValue[evt.dest.index];

                for( var i = 0; i < ogroupTo.objects.length; i++ ){
                    if( i != evt.dest.index && ogroupTo.objects[i].id == object.id ){
                        // duplicate: undo the move
                        evt.dest.sortableScope.removeItem( evt.dest.index );
                        evt.source.itemScope.sortableScope.insertItem( evt.source.index, object );
                        return;
                    }
                }

                // add and then delete
                addObjectToGroup( object, ogroupTo, function(){
                    removeObjectFromGroup( object, ogroupFrom );
                } );
                console.log( object.id + " : " + ogroupFrom.name + " -> " + ogroupTo.name );

            }
        };


        //##--------------init

        function _init(){
            console.log( "object group initialisation" );

            DataProvider.getWritableObjectGroups( function( ogroups ){

                console.log( "object groups", ogroups );
                self.ogroups = ogroups;

                // also fetch permissions
                angular.forEach( ogroups, function( ogrp ){
                    RestService.getObjectGroupPermissions( {id: ogrp.id}, function( perms ){
                        ogrp.permissions = perms;
                    }, ErrorHandler.handle );
                } );

            }, ErrorHandler.handle );

            DataProvider.getWritableObjects( function( objects ){
                console.log( "objects", objects );
                self.objects = objects;
                //$( '.ui.accordion' ).accordion();  // initialise semantic-ui accordion plugin
            }, ErrorHandler.handle );

            DataProvider.getAdminUserGroups( function( groups ){
                console.log( "admin groups", groups );
                self.adminGroups = groups;
                if( groups.length > 0 ) self.currentGroup = groups[0];
            }, ErrorHandler.handle );


            DataProvider.getAllUserGroups( function( groups ){
                console.log( "user groups", groups );
                self.allUserGroups = groups;
            }, ErrorHandler.handle );

        }

        //##-------------- handle object groups

        function addObjectGroup(){
            _addEditNameModal( "add object group", "" )
                .then( function( name ){
                    RestService.addObjectGroup( {owner: self.currentGroup.id, name: name},
                        function( ogroup ){
                            if( !ogroup.hasOwnProperty( "objects" ) ) ogroup.objects = [];
                            self.ogroups.push( ogroup ); // add new object group
                        }, ErrorHandler.handle );
                } );
        }

        function editObjectGroup( ogroup ){
            _addEditNameModal( "edit object group", ogroup.name )
                .then(
                    function( name ){
                        RestService.editObjectGroup( {id: ogroup.id, name: name}, function( data ){
                            // make changes visible
                            ogroup.name = data.name;
                        }, ErrorHandler.handle );
                    } );
        }

        function deleteObjectGroup( ogroup, idx ){

            var deleteCallback = function(){
                RestService.deleteObjectGroup( {id: ogroup.id}, function(){
                    self.ogroups.splice( idx, 1 );
                }, ErrorHandler.handle );
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
                }, ErrorHandler.handle );
            }else{
                deleteCallback();
            }
        }

        //##------------ permissions management

        function addPermission( group, ogroup ){
            // initialize array
            if( !ogroup.permissions ) ogroup.permissions = [];
            if( ogroup.permissions.find(function( u ){ return u.id === group.id; }) ){
                // permissions already exists, do nothing
                console.log( "already here" );
                return;
            }
            RestService.addPermission( {id: ogroup.id, groupId: group.id}, {}, function(){
                ogroup.permissions.push( group );
            }, ErrorHandler.handle );
        }

        function removePermission( perm, ogroup ){
            RestService.removePermission( {id: ogroup.id, groupId: perm.id}, function(){
                ogroup.permissions.splice( ogroup.permissions.indexOf( perm ), 1 );
            }, ErrorHandler.handle );
        }

        //##------------ objects management

        function addObjectToGroup( object, ogroup, resolve, reject ){
            if( !reject ) reject = ErrorHandler.handle;
            // open accordion TODO find a better, more angular way
            $('.ui.accordion.ogroup-' + ogroup.id).accordion('open', 0);
            RestService.addObjectToGroup( {
                id      : ogroup.id,
                objectId: object.id
            }, {}, resolve, reject );
        }

        function removeObjectFromGroup( object, ogroup, resolve, reject ){
            if( !reject ) reject = ErrorHandler.handle;
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

            }, ErrorHandler.handle );

            return deferred.promise;

        }

    }

    function ownerFilter(){

        return function( inputs, group ){

            if( !group ) return [];

            var output = [];
            angular.forEach( inputs, function( input ){
                if( input.owner && group && input.owner.id === group.id ){
                    output.push( input );
                }
            } );
            return output;
        }
    }

})();
