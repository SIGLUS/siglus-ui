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
     * @ngdoc service
     * @name openlmis-modal.siglusConfirmModalService
     *
     * @description
     * Service allows to display confirm modal with custom message.
     */

    angular.module('openlmis-modal')
        .service('siglusConfirmModalService', siglusConfirmModalService);

    siglusConfirmModalService.$inject = ['openlmisModalService', '$q'];

    function siglusConfirmModalService(openlmisModalService, $q) {

        this.confirm = confirm;
        this.confirmDestroy = confirmDestroy;

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.siglusConfirmModalService
         * @name confirm
         *
         * @description
         * Shows confirm modal with custom message.
         *
         * @param  {String}   message             Primary message to display at the top
         * @param firstButtonMessage
         * @param secondButtonMessage
         * @param  {String}   cancelButtonMessage Optional message to display on cancel button
         * @param  {String}   titleMessage        Optional message to display on title header
         * @return {Promise}                      Confirm promise
         */
        function confirm(message, firstButtonMessage, secondButtonMessage, cancelButtonMessage, titleMessage) {
            return makeModal(false, message, firstButtonMessage, secondButtonMessage, cancelButtonMessage,
                titleMessage);
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.siglusConfirmModalService
         * @name destroy
         *
         * @description
         * Shows confirm modal with custom message and returns a promise.
         *
         * @param  {String}  message              Message to display
         * @param firstButtonMessage
         * @param secondButtonMessage
         * @param  {String}  cancelButtonMessage  Optional message to display on cancel button
         * @param  {String}  titleMessage         Optional message to display on title header
         * @return {Promise}                      Confirm promise
         */
        function confirmDestroy(message, firstButtonMessage, secondButtonMessage, cancelButtonMessage, titleMessage) {
            return makeModal(true, message, firstButtonMessage, secondButtonMessage, cancelButtonMessage,
                titleMessage);
        }

        function makeModal(remove, message, firstButtonMessage, secondButtonMessage, cancelButtonMessage,
                           titleMessage) {
            var deferred = $q.defer();

            openlmisModalService.createDialog({
                templateUrl: 'openlmis-modal/siglus-confirm-modal.html',
                controller: 'SiglusConfirmModalController',
                controllerAs: 'vm',
                resolve: {
                    className: function() {
                        return remove ? 'danger' : 'primary';
                    },
                    message: function() {
                        return message;
                    },
                    firstConfirmMessage: function() {
                        return firstButtonMessage ? firstButtonMessage : 'openlmisModal.ok';
                    },
                    secondConfirmMessage: function() {
                        return secondButtonMessage ? secondButtonMessage : 'openlmisModal.ok';
                    },
                    cancelMessage: function() {
                        return cancelButtonMessage ? cancelButtonMessage : 'openlmisModal.cancel';
                    },
                    titleMessage: function() {
                        return titleMessage;
                    },
                    confirmDeferred: function() {
                        return deferred;
                    }
                }
            });

            return deferred.promise;
        }
    }
})();
