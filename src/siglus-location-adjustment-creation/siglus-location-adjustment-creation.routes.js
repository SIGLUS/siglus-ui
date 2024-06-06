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
        .module('siglus-location-adjustment-creation')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, ADJUSTMENT_TYPE) {
        $stateProvider.state('openlmis.locationManagement.adjustment.creation', {
            url: '/:draftId/creation?page&size&keyword&programId',
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationAdjustmentCreationController',
                    templateUrl: 'siglus-location-adjustment-creation/siglus-location-adjustment-creation.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                orderableGroups: undefined,
                draftInfo: undefined,
                allLineItemsAdded: undefined,
                areaLocationInfo: undefined,
                locations: undefined,
                user: undefined,
                facility: undefined,
                productList: undefined,
                reasons: undefined,
                page: '0',
                size: '10',
                keyword: ''
            },
            resolve: {
                facility: function(facilityFactory, $stateParams) {
                    return $stateParams.facility ? $stateParams.facility : facilityFactory.getUserHomeFacility();
                },
                user: function(authorizationService, $stateParams) {
                    return $stateParams.user ? $stateParams.user : authorizationService.getUser();
                },
                program: function($stateParams, programService) {
                    return $stateParams.program ? $stateParams.program : programService.get($stateParams.programId);
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.ADJUSTMENT;
                },
                reasons: function($stateParams, stockReasonsFactory, facility) {
                    return $stateParams.reasons ? $stateParams.reasons :
                        stockReasonsFactory.getAdjustmentReasons($stateParams.programId, facility.type.id);
                },
                draftInfo: function(siglusLocationAdjustmentService, $stateParams, facility, user, adjustmentType) {
                    return $stateParams.draftInfo ? $stateParams.draftInfo :
                        siglusLocationAdjustmentService.getDraft(
                            $stateParams.programId, adjustmentType.state, facility.id, user.user_id
                        );
                },
                productList: function(siglusLocationCommonApiService, $stateParams) {
                    return $stateParams.productList ? $stateParams.productList :
                        siglusLocationCommonApiService.getAllProductList();
                },
                areaLocationInfo: function($stateParams, siglusLocationCommonApiService) {
                    return $stateParams.areaLocationInfo ? $stateParams.areaLocationInfo :
                        siglusLocationCommonApiService.getOrderableLocationLotsInfo(
                            {
                                extraData: false
                            }
                        );
                },
                locations: function(draftInfo, siglusLocationCommonApiService, $stateParams) {
                    if ($stateParams.locations) {
                        return $stateParams.locations;
                    }
                    var orderableIds = _.uniq(_.map(draftInfo[0].lineItems, function(lineItem) {
                        return lineItem.orderableId;
                    }));

                    if (_.isEmpty(orderableIds)) {
                        return [];
                    }
                    return siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                        extraData: true,
                        isAdjustment: true,
                        returnNoMovementLots: true
                    }, orderableIds);
                },
                allLineItemsAdded: function(
                    draftInfo, $stateParams,
                    locations, siglusLocationAdjustmentModifyLineItemService,
                    productList, reasons, areaLocationInfo
                ) {
                    if ($stateParams.allLineItemsAdded) {
                        return $stateParams.allLineItemsAdded;
                    }
                    return siglusLocationAdjustmentModifyLineItemService
                        .prepareAddedLineItems(draftInfo[0], locations, productList, reasons, areaLocationInfo);
                },
                displayItems: function($stateParams, siglusLocationDisplayItemFilterService, allLineItemsAdded) {
                    return siglusLocationDisplayItemFilterService
                        .filterList($stateParams.keyword || '', allLineItemsAdded);
                }
            }
        });
    }
})();
