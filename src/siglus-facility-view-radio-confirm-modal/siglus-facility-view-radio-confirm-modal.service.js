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
   * @name siglus-radio-confirm-modal.alertConfirmModalService
   *
   * @description
   * Service allows to display alert modal with custom message.
   */
    angular
        .module('siglus-facility-view-radio-confirm-modal')
        .service('siglusFacilityViewRadioConfirmModalService',
            siglusFacilityViewRadioConfirmModalService);

    siglusFacilityViewRadioConfirmModalService.$inject = [
        '$q', 'openlmisModalService'
    ];

    function siglusFacilityViewRadioConfirmModalService($q,
                                                        openlmisModalService) {

        var modal;

        this.error = error;

        /**
     * @ngdoc method
     * @methodOf openlmis-modal.alertService
     * @name error
     *
     * @description
     * Shows alert modal with custom message and calls callback after closing alert.
     *
     * @param   {String}    title       the title of the alert
     * @param   {String}    message     the detailed message to be shown within the alert modal
     * @param   {String}    buttonLabel the label to be shown on the confirmation button
     * @return  {Promise}               the alert promise, if any other alert is already show this
     *                                  promise will be automatically rejected
     */
        function error(title, message, buttonLabels) {
            return showAlert({
                class: 'is-error',
                title: title,
                message: message,
                buttonLabels: buttonLabels
            });
        }

        function showAlert(config) {
            if (modal) {
                return $q.reject();
            }

            modal = openlmisModalService.createDialog({
                controller: 'radioConfirmModalController',
                controllerAs: 'vm',
                templateUrl: 'siglus-facility-view-radio-confirm-modal/siglus-facility-view-radio-confirm-modal.html',
                show: true,
                resolve: {
                    alertClass: function() {
                        return config.class;
                    },
                    title: function() {
                        return config.title;
                    },
                    message: function() {
                        return config.message;
                    },
                    buttonLabels: function() {
                        return config.buttonLabels || 'openlmisModal.close';
                    }
                }
            });

            modal.promise.finally(function() {
                modal = undefined;
            });

            return modal.promise;
        }
    }
})();
