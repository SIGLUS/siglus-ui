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
     * @name SiglusShipmentConfirmModalController
     *
     * @description
     * Exposes data to the confirmation modal view.
     */
    angular
        .module('siglus-shipment-confirm-modal')
        .controller('SiglusShipmentConfirmModalController', controller);

    controller.$inject = [
        'message', 'confirmMessage', 'cancelMessage', 'confirmDeferred', 'modalDeferred'
    ];

    function controller(message, confirmMessage, cancelMessage, confirmDeferred, modalDeferred) {
        var vm = this;

        vm.$onInit = onInit;
        vm.confirm = confirm;
        vm.cancel = cancel;

        vm.preparedBy = '';

        vm.conferredBy = '';

        /**
         * @ngdoc property
         * @propertyOf SiglusShipmentConfirmModalController
         * @type {String}
         * @name message
         *
         * @description
         * The message to be displayed on the header.
         */
        vm.message = undefined;

        /**
         * @ngdoc property
         * @propertyOf SiglusShipmentConfirmModalController
         * @type {String}
         * @name confirmMessage
         *
         * @description
         * The message to be displayed on the confirmation button.
         */
        vm.confirmMessage = undefined;

        /**
         * @ngdoc property
         * @propertyOf SiglusShipmentConfirmModalController
         * @type {String}
         * @name cancelMessage
         *
         * @description
         * The message to be displayed on the cancel button.
         */
        vm.cancelMessage = undefined;

        /**
         * @ngdoc method
         * @methodOf SiglusShipmentConfirmModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SiglusSignatureModalController.
         */
        function onInit() {
            vm.message = message;
            vm.confirmMessage = confirmMessage;
            vm.cancelMessage = cancelMessage;
        }

        /**
         * @ngdoc method
         * @methodOf SiglusShipmentConfirmModalController
         * @name confirm
         *
         * @description
         * Resolves the confirmation promise and closes the modal.
         */
        function confirm() {
            confirmDeferred.resolve({
                preparedBy: vm.preparedBy,
                conferredBy: vm.conferredBy

            });
            modalDeferred.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf SiglusShipmentConfirmModalController
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
