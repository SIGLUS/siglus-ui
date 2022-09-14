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

    angular.module('admin-supply-line-list').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.supplyLines', {
            showInNavigation: true,
            label: 'adminSupplyLineList.supplyLines',
            url: '/supplyLines?supplyingFacilityId&programId&page&size&sort',
            controller: 'SupplyLineListController',
            templateUrl: 'admin-supply-line-list/supply-line-list.html',
            controllerAs: 'vm',
            accessRights: [ADMINISTRATION_RIGHTS.SUPPLY_LINES_MANAGE],
            resolve: {
                // SIGLUS-REFACTOR: starts here : change facility Repository to facility Repository origin
                supplyingFacilities: function(FacilityRepositoryOrigin) {
                    return new FacilityRepositoryOrigin().query()
                        .then(function(response) {
                            return response.content;
                        });
                },
                // SIGLUS-REFACTOR: ends here
                programs: function(programService) {
                    return programService.getAll();
                },
                supplyLines: function($stateParams, SupplyLineResource,
                    paginationService) {
                    return paginationService.registerUrl($stateParams,
                        function(stateParams) {
                            var params = angular.copy(stateParams);

                            if (!params.sort) {
                                params.sort = 'supplyingFacility.name';
                            }
                            params.expand = [
                                'supervisoryNode.requisitionGroup.memberFacilities',
                                'supplyingFacility',
                                'program'
                            ];
                            return new SupplyLineResource().query(params);
                        });
                }
            }
        });
    }
})();
