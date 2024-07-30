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
        .module('order-fulfillment')
        .config(config);

    config.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS'];

    function config($stateProvider, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.orders.fulfillment', {
            controller: 'OrderFulfillmentController',
            controllerAs: 'vm',
            label: 'orderFulfillment.fulfillOrders',
            showInNavigation: true,
            templateUrl: 'order-fulfillment/order-fulfillment.html',
            url: '/fulfillment?requestingFacilityId&programId&status&page&size',
            params: {
                sort: ['createdDate,desc'],
                orderList: undefined,
                programs: undefined,
                homeFacility: undefined,
                programId: undefined
            },
            accessRights: [
                FULFILLMENT_RIGHTS.SHIPMENTS_VIEW,
                FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
            ],
            areAllRightsRequired: false,
            resolve: {
                supervisedFacilities: function(facilityFactory) {
                    return facilityFactory.getSupervisedFacilitiesBasedOnRights([FULFILLMENT_RIGHTS.ORDERS_VIEW]);
                },
                orderingFacilities: function(supervisedFacilities, requestingFacilityFactory) {
                    var ids = supervisedFacilities.map(function(facility) {
                        return facility.id;
                    });
                    return requestingFacilityFactory.loadRequestingFacilities(ids).then(function(requestingFacilities) {
                        return requestingFacilities;
                    });
                },
                programs: function(programService, $stateParams) {
                    if ($stateParams.programs) {
                        return $stateParams.programs;
                    }
                    return programService.getAll();
                },
                program: function(programs, $stateParams) {
                    return programs.find(function(program) {
                        return program.id === $stateParams.programId;
                    }, undefined);
                },
                homeFacility: function(facilityFactory, $stateParams) {
                    if ($stateParams.homeFacility) {
                        return $stateParams.homeFacility;
                    }
                    return facilityFactory.getUserHomeFacility();
                },
                orderList: function(orderRepository, $stateParams) {
                    if ($stateParams.orderList) {
                        return $stateParams.orderList;
                    }
                    return orderRepository.searchFulfill({
                        page: 0,
                        size: 2147483647,
                        sort: ['createdDate,desc'],
                        status: ['FULFILLING', 'ORDERED', 'PARTIALLY_FULFILLED']
                    });
                },
                filteredOrderList: function(orderList, $stateParams, $filter) {
                    var orderListCopy = angular.copy(orderList);
                    orderListCopy.content = _.filter(orderListCopy.content, function(item) {
                        var filterByFacility = !$stateParams.requestingFacilityId ||
                            _.get(item, [ 'facility', 'id']) === $stateParams.requestingFacilityId;
                        var filterByProgram = !$stateParams.programId ||
                            _.get(item, [ 'program', 'id']) === $stateParams.programId;
                        var filterByStatus = !$stateParams.status ||
                            _.get(item, ['status']) === $stateParams.status;
                        return  filterByFacility && filterByProgram && filterByStatus;
                    });
                    orderListCopy.content = $filter('orderBy')(
                        orderListCopy.content,
                        ['createdDate'],
                        $stateParams.sort[0] === ['createdDate,desc'][0]
                    );
                    return orderListCopy;
                },
                orders: function(paginationService, $stateParams, filteredOrderList) {
                    return paginationService.registerUrl($stateParams, function() {
                        return filteredOrderList;
                    });
                }
            }
        });

    }

})();
