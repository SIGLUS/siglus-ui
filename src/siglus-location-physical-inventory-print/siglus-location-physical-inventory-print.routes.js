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
        .module('siglus-location-physical-inventory-print')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.locationManagement.physicalInventory.draftList.draft.print', {
            url: '/print',
            views: {
                '@openlmis': {
                    controller: 'LocationPhysicalInventoryPrintController',
                    templateUrl:
                   'siglus-location-physical-inventory-print/' +
                   'siglus-location-physical-inventory-print.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
            params: {
                facility: undefined,
                program: undefined,
                draft: undefined
            },
            resolve: {
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                program: function($stateParams, programService) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get($stateParams.programId).then(function(programs) {
                            return programs;
                        });
                    }
                    return $stateParams.program;
                },
                draft: function(localStorageService) {
                    return angular.fromJson(localStorageService.get('locationPhysicalInventory'));
                }
            }

        });
    }
})();