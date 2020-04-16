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
     * @name openlmis-modal.signatureModalService
     *
     * @description
     * Service allows to display signature modal with custom message.
     */

    angular.module('openlmis-modal')
        .service('signatureModalService', signatureModalService);

    signatureModalService.$inject = ['openlmisModalService', '$q'];

    function signatureModalService(openlmisModalService, $q) {

        this.confirm = confirm;

        function confirm(message, confirmButtonMessage, cancelButtonMessage) {
            var deferred = $q.defer();

            openlmisModalService.createDialog({
                templateUrl: 'openlmis-modal/signature-modal.html',
                controller: 'SignatureModalController',
                controllerAs: 'vm',
                resolve: {
                    confirmMessage: function() {
                        return confirmButtonMessage ? confirmButtonMessage : 'openlmisModal.confirm';
                    },
                    cancelMessage: function() {
                        return cancelButtonMessage ? cancelButtonMessage : 'openlmisModal.cancel';
                    },
                    message: function() {
                        return message;
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
