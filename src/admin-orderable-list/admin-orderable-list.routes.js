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

    angular.module('admin-orderable-list').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.orderables', {
            showInNavigation: true,
            label: 'adminOrderableList.products',
            url: '/orderables?code&name&description&program&page&size&sort',
            params: {
                sort: ['fullProductName']
            },
            controller: 'OrderableListController',
            templateUrl: 'admin-orderable-list/orderable-list.html',
            controllerAs: 'vm',
            accessRights: [
                ADMINISTRATION_RIGHTS.FACILITY_APPROVED_ORDERABLES_MANAGE,
                ADMINISTRATION_RIGHTS.ORDERABLES_MANAGE
            ],
            areAllRightsRequired: false,
            resolve: {
                programs: function(programService) {
                    // SIGLUS-REFACTOR: get true program
                    return programService.getTruePrograms();
                    //SIGLUS-REFACTOR: ends here
                },
                orderables: function(paginationService, OrderableResource, $stateParams) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        return new OrderableResource().query(stateParams);
                    });
                },
                canAdd: function(authorizationService, permissionService, ADMINISTRATION_RIGHTS) {
                    var user = authorizationService.getUser();
                    return permissionService
                        .hasPermissionWithAnyProgramAndAnyFacility(user.user_id, {
                            right: ADMINISTRATION_RIGHTS.ORDERABLES_MANAGE
                        })
                        .then(function() {
                            return true;
                        })
                        .catch(function() {
                            return false;
                        });
                }
            }
        });
    }
})();
