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
            url: '/:draftId/creation?programId&keyword&isVirtual&page&size',
            label: 'locationMovement.movement',
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationMovementCreationController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-movement/siglus-location-movement-creation/' +
                      'siglus-location-movement-creation.html'
                }
            },
            params: {
                isVirtual: undefined,
                orderableGroups: undefined,
                draftInfo: undefined,
                addedLineItems: undefined,
                areaLocationInfo: undefined,
                locations: undefined,
                user: undefined,
                facility: undefined,
                page: '0',
                size: '10',
                keyword: ''
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            resolve: {
                facility: function(facilityFactory, $stateParams) {
                    if ($stateParams.facility) {
                        return $stateParams.facility;
                    }
                    return facilityFactory.getUserHomeFacility();
                },
                allPrograms: function(programService) {
                    return programService.getAllProductsProgram();
                },
                user: function(authorizationService, $stateParams) {
                    if ($stateParams.user) {
                        return $stateParams.user;
                    }
                    return authorizationService.getUser();
                },
                draftInfo: function(siglusLocationMovementService, $stateParams) {
                    if ($stateParams.draftInfo) {
                        return $stateParams.draftInfo;
                    }
                    return siglusLocationMovementService.getMovementDraftById($stateParams.draftId);
                },
                orderableGroups: function($stateParams, facility, draftInfo, orderableGroupService) {
                    if (!$stateParams.orderableGroups) {
                        var allLineOrderableIds = draftInfo.lineItems.map(function(line) {
                            return line.orderableId;
                        });
                        return orderableGroupService.findAvailableProductsAndCreateOrderableGroups(
                            $stateParams.programId, facility.id, true, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST,
                            undefined, allLineOrderableIds
                        );
                    }
                    return $stateParams.orderableGroups;
                },
                locations: function(draftInfo, siglusLocationCommonApiService, $stateParams) {
                    if ($stateParams.locations) {
                        return $stateParams.locations;
                    }
                    var orderableIds = _.map(draftInfo.lineItems, function(lineItem) {
                        return lineItem.orderableId;
                    });
                    if (_.isEmpty(orderableIds)) {
                        return [];
                    }
                    return siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                        extraData: true
                    }, orderableIds);
                },

                areaLocationInfo: function($stateParams, siglusLocationMovementService) {
                    if ($stateParams.areaLocationInfo) {
                        return $stateParams.areaLocationInfo;
                    }
                    return siglusLocationMovementService.getMovementLocationAreaInfo(undefined, true);
                },
                addedLineItems: function(draftInfo, $stateParams, locations, addAndRemoveLineItemService,
                    orderableGroups) {
                    if ($stateParams.addedLineItems) {
                        return $stateParams.addedLineItems;
                    }
                    var draftLines = _.get(draftInfo, 'lineItems', []);
                    var isVirtual;
                    if (draftLines.length > 0) {
                        isVirtual = _.every(draftLines, function(line) {
                            return _.get(line, 'srcLocationCode') === '00000';
                        });
                    }
                    if (isVirtual) {
                        return addAndRemoveLineItemService
                            .prepareAddedLineItemsForVirtual(draftInfo, locations, orderableGroups);
                    }

                    return addAndRemoveLineItemService.prepareAddedLineItems(draftInfo, locations, orderableGroups);
                },
                displayItems: function($stateParams, siglusLocationCommonFilterService, addedLineItems, locations,
                    areaLocationInfo, SiglusLocationCommonUtilsService, addAndRemoveLineItemService) {
                    var displayItems = siglusLocationCommonFilterService
                        .filterList($stateParams.keyword || '', addedLineItems);
                    displayItems.forEach(function(lineItemGroups) {
                        lineItemGroups.forEach(function(lineItem) {
                            addAndRemoveLineItemService.fillMovementOptions(lineItem, locations, areaLocationInfo);
                        });
                    });

                    return displayItems;
                }
            }
        });
    }
})();
