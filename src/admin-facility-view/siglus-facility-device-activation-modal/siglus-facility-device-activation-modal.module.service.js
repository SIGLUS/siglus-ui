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
   * @name siglus-facility-device-activation-modal
   *
   * @description
   * This service will pop up a modal window for user to select occurred date and signature.
   */
    angular
        .module('siglus-facility-device-activation-modal')
        .service('SiglusFacilityDeviceActivationModalService', service);

    service.$inject = ['openlmisModalService'];

    function service(openlmisModalService) {
        this.show = show;

        /**
     * @ngdoc method
     * @methodOf siglus-facility-device-activation-modal
     * @name show
     *
     * @description
     * Shows modal that allows users to choose to print.
     *
     * @return {Promise} resolved input number.
     */
        function show(activationCode) {
            return openlmisModalService.createDialog(
                {
                    controller: 'SiglusFacilityDeviceActivationModalController',
                    controllerAs: 'vm',
                    templateUrl: 'admin-facility-view/'
                     + 'siglus-facility-device-activation-modal/siglus-facility-device-activation-modal.html',
                    show: true,
                    resolve: {
                        activationCode: function() {
                            return activationCode;
                        }
                    }
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }
    }

})();
