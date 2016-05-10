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
     * @ngdoc overview
     * @name thymioCaptain.app
     * @description This module is the one responsible for the whole BBData App.
     * It is mainly composed of controllers.

     *
     * @author Lucy Linder
     * @date     May 2016
     * @context  BBData
     */
    angular.module( 'bbdata.app',
        // dependencies
        [
            'bbdata.rest',
            'ngAnimate'
            //'derlin.modals'
        ] )
        .constant("RFC3339_FORMAT", "YYYY-MM-DDTHH:mm:ssZ");

}());