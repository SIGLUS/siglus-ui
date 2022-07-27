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
     * @name siglus-alert-confirm-modal.controller:AlertConfirmModalController
     *
     * @description
     * Exposes data to the alert modal view.
     */
    angular
        .module('openlmis-modal')
        .controller('AlertConfirmModalController', AlertConfirmModalController);

    AlertConfirmModalController.$inject = ['alertClass', 'title', 'message', 'buttonLabels', 'modalDeferred'];

    function AlertConfirmModalController(alertClass, title, message, buttonLabels, modalDeferred) {
        var vm = this;

        vm.$onInit = onInit;
        vm.close = function() {
            modalDeferred.reject();
        };
        vm.confirm = function() {
            modalDeferred.resolve();
        };
        function onInit() {
            vm.alertClass = alertClass;
            vm.title = title;
            vm.message = message;
            vm.buttonLabels = buttonLabels;
        }
    }

})();
