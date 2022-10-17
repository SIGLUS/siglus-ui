/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
   * @ngdoc controller
   * @name siglus-double-confirm-modal.controller:DoubleConfirmModalController
   *
   * @description
   * Exposes data to the alert modal view.
   */
    angular
        .module('siglus-facility-view-radio-confirm-modal')
        .controller('radioConfirmModalController', radioConfirmModalController);

    radioConfirmModalController.$inject = ['alertClass', 'title', 'message',
        'buttonLabels', 'modalDeferred'];

    function radioConfirmModalController(alertClass, title, message,
                                         buttonLabels, modalDeferred) {
        var vm = this;
        vm.$onInit = onInit;
        vm.disableLocationManagement = undefined;
        vm.close = function() {
            modalDeferred.reject();
        };
        vm.confirm = function() {
            if (vm.disableLocationManagement === true) {
                modalDeferred.resolve();
            } else {
                modalDeferred.reject();
            }
        };

        function onInit() {
            vm.disableLocationManagement = false;
            vm.alertClass = alertClass;
            vm.title = title;
            vm.message = message;
            vm.buttonLabels = buttonLabels;
        }
    }

})();
