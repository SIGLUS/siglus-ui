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
   * @name stock-choose-date-modal.chooseDateModalService
   *
   * @description
   * This service will pop up a modal window for user to select occurred date and signature.
   */
    angular
        .module('siglus-physical-inventory-creation')
        .service('SiglusPhysicalInventoryCreationService', service);

    service.$inject = ['openlmisModalService', 'facilityFactory'];

    function service(openlmisModalService, facilityFactory) {
        this.show = show;

        /**
     * @ngdoc method
     * @methodOf stock-choose-date-modal.chooseDateModalService
     * @name show
     *
     * @description
     * Shows modal that allows users to input value.
     *
     * @return {Promise} resolved input number.
     */
        function show(programId, type) {
            return openlmisModalService.createDialog(
                {
                    controller: 'SiglusPhysicalInventoryCreationController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-physical-inventory-creation/siglus-physical-inventory-creation.html',
                    show: true,
                    resolve: {
                        programId: function() {
                            return programId;
                        },
                        type: function() {
                            return type;
                        },
                        facility: function() {
                            return facilityFactory.getUserHomeFacility().then(function(res) {
                                return res;
                            });
                        }
                    }
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }
    }

})();
