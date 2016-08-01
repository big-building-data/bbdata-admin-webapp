/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     May 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function () {

    /**
     * @ngdoc service
     * @name bbdata.rest.RestService
     * @description
     * Service to talk to the backend.
     */
    angular
        .module('bbdata.rest')
        .factory('RestService', RestService);

    // --------------------------

    function RestService($resource, baseUrl) {

        return $resource('', {}, {

            getObjects: {
                method: 'GET',
                url: baseUrl + 'objects',
                isArray: true
            },

            addObject: {
                method: 'PUT',
                url: baseUrl + 'objects/:id',
                params: {id: '@id'},
                isArray: false
            },

            editObject: {
                method: 'POST',
                url: baseUrl + 'objects/:id',
                params: {id: '@id'},
                isArray: false
            },

            deleteObject: {
                method: 'DELETE',
                url: baseUrl + 'objects/:id',
                params: {id: '@id'},
                isArray: false
            },

            getUnits: {
                method: "GET",
                url: baseUrl + "units",
                isArray: true
            },

            getTypes: {
                method: "GET",
                url: baseUrl + "types",
                isArray: true
            } ,

            getTokens: {
                method: 'GET',
                url: baseUrl + "objects/:id/tokens",
                params: {id: '@id'},
                isArray: true
            }




            ///**
            // * @ngdoc
            // * @name infos
            // * @methodOf thymioCaptain.rest.RestService
            // *
            // * @description
            // * Returns information based on the cookie.
            // *
            // * @returns {httpPromise} resolves with the object {cardId: "", isadmin: bool}, or fails with error
            // * description.
            // */
            //infos: {method: 'GET', url: baseUrl + 'info'},

        })
    }

}());