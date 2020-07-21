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
     * @name openlmis-modal.controller:SiglusConfirmModalController
     *
     * @description
     * Exposes data to the confirmation modal view.
     */
    angular
        .module('shipment-view')
        .controller('SiglusConfirmModalController', controller);

    controller.$inject = ['confirmDeferred', 'totalPartialLineItems', 'modalDeferred', 'messageService'];

    function controller(confirmDeferred, totalPartialLineItems, modalDeferred, messageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.confirm = confirm;
        vm.cancel = cancel;

        /**
         * @ngdoc property
         * @propertyOf openlmis-modal.controller:SiglusConfirmModalController
         * @type {String}
         * @name message
         *
         * @description
         * The message to be displayed on the confirmation modal.
         */
        vm.message = undefined;

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusConfirmModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SiglusConfirmModalController.
         */
        function onInit() {
            vm.message = messageService.get('shipmentView.confirmPartialFulfilled.message', {
                totalPartialLineItems: totalPartialLineItems +
                    (totalPartialLineItems === 1 ? ' product is' : ' products are')
            });
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusConfirmModalController
         * @name confirm
         *
         * @description
         * Resolves the confirmation promise and closes the modal.
         */
        function confirm(flag) {
            confirmDeferred.resolve(flag);
            modalDeferred.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusConfirmModalController
         * @name cancel
         *
         * @description
         * Rejects the confirmation promise and closes the modal.
         */
        function cancel() {
            confirmDeferred.reject();
            modalDeferred.resolve();
        }
    }

})();
