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

    angular
        .module('siglus-location-physical-inventory-report')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.locationManagement.physicalInventory.printByProduct', {
            url: '/printByProduct?isMerged&programId',
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationPhysicalInventoryReport',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-location-physical-inventory-report/siglus-location-physical-inventory-report.html'
                }
            },
            params: {
                isMerged: false,
                programId: undefined
            },
            resolve: {
                facility: function($stateParams, facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                program: function($stateParams, programService) {
                    return programService.get($stateParams.programId).then(function(programs) {
                        return programs;
                    });
                },
                draft: function(localStorageService) {
                    return localStorageService.get('physicalInventoryCategories');
                }
            }
        });
    }

})();
