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

            getHierarchy: {method: 'GET', url: baseUrl + 'values/tree', isArray: true},

            getValues: {
                method: 'GET',
                url: baseUrl + 'values/sensors',
                isArray: false
            },

            getSensors: {
                method: 'GET',
                url: baseUrl + 'sensors',
                isArray: true
            },

            addSensor: {
                method: 'POST',
                url: baseUrl + 'sensors',
                isArray: false
            },

            deleteSensor: {
                method: 'DELETE',
                url: baseUrl + 'sensors',
                isArray: false
            },

            getUnits: {
                method: "GET",
                url: baseUrl + "units",
                isArray: true
            },

            getParsers: {
                method: "GET",
                url: baseUrl + "parsers",
                isArray: true
            },

            getTypes: {
                method: "GET",
                url: baseUrl + "types",
                isArray: true
            } ,

            getTokens: {
                method: 'GET',
                url: baseUrl + "sensors/tokens",
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