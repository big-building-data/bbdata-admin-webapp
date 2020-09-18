/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     September 2020
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function () {

    /**
     * @ngdoc tls about controller
     * @name bbdata.app.AboutController
     */
    angular
        .module('bbdata.app')
        .controller('AboutController', ctrl);

// --------------------------

    function ctrl(RestService, ErrorHandler, $rootScope, ABOUT_PAGE) {
        var self = this;

        self.info = {};
        self.init = _init;

        //##--------------init

        function _init(){
            // register listener: fetch info each time the page is displayed
            $rootScope.$on('bbdata.PageChanged', function (evt, args) {
                if (args.to === ABOUT_PAGE) {
                    getInfo();
                }
            });
            // first time: fetch info
            getInfo();
        }


        function getInfo(){
            RestService.getInfo(function (info) {
                console.log("got info", info);
                self.info = info;
            }, ErrorHandler.handle);
        }
    }

}());
