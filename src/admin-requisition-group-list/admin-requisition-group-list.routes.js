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

    angular.module('admin-requisition-group-list').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.requisitionGroupList', {
            showInNavigation: true,
            label: 'adminRequisitionGroupList.requisitionGroups',
            url: '/requisitionGroups?name&zone&program&page&size',
            controller: 'RequisitionGroupListController',
            templateUrl: 'admin-requisition-group-list/requisition-group-list.html',
            controllerAs: 'vm',
            accessRights: [ADMINISTRATION_RIGHTS.REQUISITION_GROUPS_MANAGE],
            resolve: {
                programs: function(programService) {
                    return programService.getAll();
                },
                geographicZones: function(geographicZoneService) {
                    return geographicZoneService.getAll()
                        .then(function(response) {
                            return response.content;
                        });
                },
                requisitionGroups: function(paginationService, requisitionGroupService,
                    $stateParams) {
                    return paginationService.registerUrl($stateParams,
                        function(stateParams) {
                            var params = angular.copy(stateParams),
                                page = stateParams.page,
                                size = stateParams.size;

                            delete params.page;
                            delete params.size;

                            return requisitionGroupService.search({
                                page: page,
                                size: size
                            }, params);
                        });
                },
                facilitiesMap: function(requisitionGroups, FacilityResourceOrigin,
                    ObjectMapper,
                    OpenlmisArrayDecorator) {

                    var facilityIds = requisitionGroups.map(function(group) {
                        if (group.supervisoryNode && group.supervisoryNode.facility) {
                            return group.supervisoryNode.facility.id;
                        }
                        return undefined;
                    }).filter(function(elem) {
                        return elem !== undefined;
                    });

                    var uniqueFacilities = new OpenlmisArrayDecorator(
                        facilityIds
                    ).getUnique();
                    if (uniqueFacilities.length === 0) {
                        return [];
                    }

                    return new FacilityResourceOrigin()
                        .query({
                            id: uniqueFacilities,
                            page: 0,
                            size: uniqueFacilities.length
                        })
                        .then(function(facilities) {
                            return new ObjectMapper().map(facilities.content);
                        });
                }
            }
        });
    }
})();
