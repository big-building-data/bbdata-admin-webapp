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
        .controller( 'UsersController', ctrl );

// --------------------------

    function ctrl( DataProvider, RestService, ModalService, $scope, ErrorHandler, ROOT_URL ){
        var self = this;

        self.adminGroups = [];      // all user groups for which the user has administrative rights
        self.users = [];            // all users

        self.addUser = addUser;
        self.createUser = createUser;
        self.removeUser = removeUser;
        self.changeUserStatus = changeUserStatus;

        self.addUserGroup = addUserGroup;
        self.editUserGroup = editUserGroup;
        self.deleteUserGroup = deleteUserGroup;

        self.init = _init;

        //##--------------init

        function _init(){
            DataProvider.getAdminUserGroups( function( groups ){

                console.log( "admin user groups", groups );
                self.adminGroups = groups;

                // also fetch users
                angular.forEach( groups, function( grp ){
                    RestService.getUserGroup( {id: grp.id}, function( response ){
                        grp.users = response.users;
                    }, ErrorHandler.handle );
                } );

            }, ErrorHandler.handle );

            DataProvider.getUsers( function( users ){
                self.users = users;
                self.users2 = angular.copy( users );
            }, ErrorHandler.handle );

        }


        //##-------------- user groups

        function addUserGroup(){
            _addEditNameModal( "Add user group", "", function( name ){
                console.log( "adding usergroup " + name );
                RestService.addUserGroup( {name: name}, function( ugroup ){
                    console.log("new group", ugroup);
                    self.adminGroups.push( ugroup );
                }, ErrorHandler.handle );
            } );
        }

        function editUserGroup( ugroup ){
            _addEditNameModal( "Add user group", ugroup.name, function( name ){
                RestService.editUserGroup( {name: name}, function(){
                    ugroup.name = name;
                }, ErrorHandler.handle );
            } );
        }

        function deleteUserGroup( ugroup, idx ){
            // some objects exist, ask for confirmation
            ModalService.showModal( {
                title   : "confirm",
                html    : "are you absolutely sure ?",
                positive: "proceed",
                negative: "cancel",
                icon    : "trash",
                basic   : true
            } ).then( function( result ){
                if( result.status ){
                    RestService.deleteUserGroup( {id: ugroup.id}, function(){
                        self.adminGroups.splice( idx, 1 );
                    }, ErrorHandler.handle );
                }
            }, ErrorHandler.handle );
        }

        //##-------------- users

        function addUser( ugroup ){
            ModalService.showModal( {
                title          : "add users to '" + ugroup.name + "'",
                htmlInclude    : ROOT_URL + "/ajs/bbdata/users/partials/_addUserModalContent.html",
                positive       : "save",
                positiveDisable: '!inputs.usersToAdd',
                negative       : "cancel",
                inputs         : {
                    users     : filterArrayId( self.users, ugroup.users ),
                    usersToAdd: []
                },
                cancelable     : false
            } ).then( function( results ){
                if( results.status ){
                    var users = results.inputs.usersToAdd;
                    angular.forEach( users, function( user ){
                        RestService.addUserToGroup( {
                            id    : ugroup.id,
                            userId: user.id,
                            isAdmin : user.isAdmin
                        }, {}, function(){
                            if( !ugroup.users ){
                                ugroup.users = [user];
                            }else{
                                ugroup.users.push( user );
                            }
                        }, ErrorHandler.handle );
                    } );

                }
            }, ErrorHandler.handle );
        }


        function createUser( ugroup ){
            ModalService.showModal( {
                title          : "Create a user",
                htmlInclude    : ROOT_URL + "/ajs/bbdata/users/partials/_createUserModalContent.html",
                positive       : "save",
                positiveDisable: 'form.addUserForm.$invalid',
                negative       : "cancel",
                inputs         : {
                    user       : {}
                },
                cancelable     : false
            } ).then( function( results ){
                if( results.status ){
                    var user = results.inputs.user;

                    RestService.createUser( {
                            id    : ugroup.id,
                            isAdmin : user.isAdmin
                        }, user, function(user){
                            console.log("new user created");
                            self.users.push(user);
                            if( !ugroup.users ){
                                ugroup.users = [user];
                            }else{
                                ugroup.users.push( user );
                            }
                        }, ErrorHandler.handle );

                }
            }, ErrorHandler.handle );
        }

        function removeUser( ugroup, user, idx ){
            RestService.removeUserFromGroup( {id: ugroup.id, userId: user.id}, {}, function(){
                ugroup.users.splice( idx, 1 );
            }, ErrorHandler.handle );
        }

        function changeUserStatus( ugroup, user, admin ){

        }

        //##-------------- utils

        /*
         * @param title the title of the modal
         * @param name the current name to modify
         * @return Promise resolves with the new name, rejects on user cancel or no change.
         */
        function _addEditNameModal( title, name, resolve, reject ){

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
                    if( resolve ) resolve( result.inputs.name );
                }else{
                    if( reject ) reject();
                }

            }, ErrorHandler.handle );

        }

    }


    function filterArrayId( whole, part ){
        if( !part || part.length == 0 ) return whole;
        return whole.filter( function( i ){
            return !containsId( part, i.id );
        } );
    }

    function containsId( array, id ){
        for( var i = 0; i < array.length; i++ ){
            if( array[i].id == id ) return true;
        }
        return false;
    }


}());