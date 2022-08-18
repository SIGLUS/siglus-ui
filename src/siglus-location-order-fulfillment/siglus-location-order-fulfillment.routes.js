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
        .module('siglus-location-order-fulfillment')
        .config(config);

    config.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS'];

    function config($stateProvider, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.locationManagement.fulfillOrder', {
            label: 'orderFulfillment.fulfillOrders',
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationOrderFulfillmentController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-order-fulfillment/siglus-location-order-fulfillment.html'
                }
            },
            priority: 1,

            url: '/location-fulfillment?requestingFacilityId&programId&status&page&size',
            params: {
                sort: ['createdDate,desc']
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
                programs: function(programService) {
                    return programService.getAll();
                },
                orders: function(paginationService, orderRepository, $stateParams, ORDER_STATUS) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        // #400: Facility user partially fulfill an order and create sub-order for an requisition
                        var availableStatuses = [ORDER_STATUS.FULFILLING, ORDER_STATUS.ORDERED,
                                ORDER_STATUS.PARTIALLY_FULFILLED],
                            // #400: ends here
                            copy = angular.copy(stateParams);
                        if (stateParams.status instanceof Array) {
                            stateParams.status = stateParams.status.filter(function(status) {
                                return availableStatuses.indexOf(status) >= 0;
                            });
                            copy = angular.copy(stateParams);
                        } else if (!stateParams.status || availableStatuses.indexOf(stateParams.status) < 0) {
                            copy.status = availableStatuses;
                        }
                        // #447: DDM facility can see the fulfilment which is supervised by DPM facility
                        return orderRepository.searchFulfill(copy);
                        // #447: ends here
                    });
                }
            }
        });

    }

})();
