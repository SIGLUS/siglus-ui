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
        .module('siglus-location-movement-creation')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.locationManagement.movement.creation', {
            url: '/:draftId/creation?programId',
            label: 'locationMovement.label',
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationMovementCreationController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-movement/siglus-location-movement-creation/' +
                      'siglus-location-movement-creation.html'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            resolve: {
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                draftInfo: function() {
                    return {
                        lineItems: []
                    };
                    // return siglusLocationMovementService.getMovementDraftById($stateParams.draftId)
                    //     .finally(function() {
                    //         return {};
                    //     });
                },
                orderableGroups: function($stateParams, facility, draftInfo, orderableGroupService) {
                    if (!$stateParams.orderableGroups) {
                        var allLineOrderableIds = draftInfo.lineItems.map(function(line) {
                            return line.orderableId;
                        });
                        return orderableGroupService.findAvailableProductsAndCreateOrderableGroups(
                            $stateParams.programId, facility.id, true, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST,
                            $stateParams.draftId, allLineOrderableIds
                        );
                    }
                    return $stateParams.orderableGroups;
                }
                // locations: function(SiglusLocationViewService) {
                //     // var orderableIds = order.availableProducts.map(function(orderable) {
                //     //     return orderable.id;
                //     // })
                //     return SiglusLocationViewService.getOrderableLocationLotsInfo({
                //         orderablesId: [],
                //         extraData: false
                //     });
                // },
                //
                // orderableLocationLotsMap: function(locations, SiglusLocationCommonUtilsService) {
                //     return SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
                // },
                //
                // orderableLotsLocationMap: function(SiglusLocationCommonUtilsService, locations) {
                //     return SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations);
                // }
            }
        });
    }
})();
