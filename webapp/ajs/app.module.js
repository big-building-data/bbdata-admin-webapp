/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function () {

    /**
     * @ngdoc overview
     * @name thymioCaptain.app
     * @description This module is the one responsible for the whole BBData App.
     * It is mainly composed of controllers.

     *
     * @author Lucy Linder
     * @date     May 2016
     * @context  BBData
     */
    var webapp = angular.module('bbdata.app',
        // dependencies
        [
            'bbdata.rest',
            'ngAnimate',
            'ngRoute',
            'link'
            //'derlin.modals'
        ]);

    webapp.constant("RFC3339_FORMAT", "YYYY-MM-DDTHH:mm:ssZ");

    webapp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/sensors', {
                    templateUrl: 'html/sensors/_main.html',
                    controller: 'SensorsController',
                    controllerAs: 'ctrl'
                }).
                when('/tls-sls', {
                    templateUrl: 'html/tls-sls/_main.html',
                    controller: 'TlsSlsController',
                    controllerAs: 'ctrl'
                }).
                otherwise({
                    redirectTo: '/',
                    templateUrl: 'html/display/_main.html',
                    controller: 'DisplayController',
                    controllerAs: 'ctrl'
                });
        }]);

    webapp.run(function ($rootScope, $location) {
        $rootScope.$on("$locationChangeStart", function (event, next, current) {
            // handle route changes
            $rootScope.locationPath = $location.path();
        });
    })
}());