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

    angular.module('admin-supervisory-node-list').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.supervisoryNodes', {
            showInNavigation: true,
            label: 'adminSupervisoryNodeList.supervisoryNodes',
            url: '/supervisoryNodes?name&zoneId&nodesPage&nodesSize',
            controller: 'SupervisoryNodeListController',
            templateUrl: 'admin-supervisory-node-list/supervisory-node-list.html',
            controllerAs: 'vm',
            accessRights: [ADMINISTRATION_RIGHTS.SUPERVISORY_NODES_MANAGE],
            resolve: {
                supervisoryNodes: function(paginationService, SupervisoryNodeResource,
                    $stateParams) {
                    return paginationService.registerUrl($stateParams,
                        function(stateParams) {
                            return new SupervisoryNodeResource().query(stateParams);
                        }, {
                            customPageParamName: 'nodesPage',
                            customSizeParamName: 'nodesSize'
                        });
                },
                // SIGLUS-REFACTOR: starts here : change facility resource to facility resource origin
                facilities: function(supervisoryNodes, FacilityResourceOrigin,
                    OpenlmisArrayDecorator) {
                    var facilitiesIds = supervisoryNodes
                        .filter(function(supervisoryNode) {
                            return !!supervisoryNode.facility;
                        })
                        .map(function(supervisoryNode) {
                            return supervisoryNode.facility.id;
                        });

                    return new FacilityResourceOrigin().query({
                        id: new OpenlmisArrayDecorator(facilitiesIds).getUnique()
                    });
                },
                // SIGLUS-REFACTOR: ends here
                facilitiesMap: function(facilities, ObjectMapper) {
                    return new ObjectMapper().map(facilities.content);
                },
                supervisoryNodesMap: function(SupervisoryNodeResource,
                    supervisoryNodes, ObjectMapper) {
                    var supervisoryNodeIds = supervisoryNodes.flatMap(
                        function(supervisoryNode) {
                            return supervisoryNode.extraData.partnerNodeIds || [];
                        }
                    );

                    return new SupervisoryNodeResource()
                        .query({
                            id: supervisoryNodeIds
                        })
                        .then(function(supplyPartners) {
                            return new ObjectMapper().map(supplyPartners.content);
                        });
                },
                geographicZones: function($q, geographicZoneService) {
                    var deferred = $q.defer();

                    geographicZoneService.getAll().then(function(response) {
                        deferred.resolve(response.content);
                    }, deferred.reject);

                    return deferred.promise;
                }
            }
        });
    }
})();
