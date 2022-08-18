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
            url: '/:draftId/creation?programId&keyword&page&size',
            label: 'locationMovement.label',
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationMovementCreationController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-movement/siglus-location-movement-creation/' +
                      'siglus-location-movement-creation.html'
                }
            },
            params: {
                orderableGroups: undefined,
                draftInfo: undefined,
                addedLineItems: undefined,
                page: '0',
                size: '10',
                keyword: ''
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
                },
                locations: function(SiglusLocationViewService, draftInfo) {
                    var locations = [
                        {
                            area: 'east',
                            locationCode: 'AA25D',
                            lots: [
                                {
                                    orderablesId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210a',
                                    stockOnHand: 300,
                                    lotCode: 'SEM-LOTE-08I01-07182023',
                                    expirationDate: '2023-07-18'
                                }
                            ]

                        },
                        {
                            area: 'east',
                            locationCode: 'AA25D',
                            lots: [
                                {
                                    orderablesId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210x',
                                    stockOnHand: 111,
                                    lotCode: 'SEM-LOTE-08I01-05202024',
                                    expirationDate: '2024-05-20'
                                }
                            ]

                        },

                        {
                            area: 'east',
                            locationCode: 'AA25D',
                            lots: [
                                {
                                    orderablesId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210y',
                                    stockOnHand: 222,
                                    lotCode: 'SEM-LOTE-08I01-09202024',
                                    expirationDate: '2024-09-20'
                                }
                            ]

                        },
                        {
                            area: 'east',
                            locationCode: 'AA25D',
                            lots: [
                                {
                                    orderablesId: 'ba08a234-4881-472f-af02-fcc0c7ab5d04',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210c',
                                    stockOnHand: 256,
                                    lotCode: 'SEM-LOTE-08I01-07272022',
                                    expirationDate: '2022-07-27'
                                }
                            ]

                        },

                        {
                            area: 'east',
                            locationCode: 'AA46A',
                            lots: [
                                {
                                    orderablesId: 'c965909b-431b-4cfd-98ae-1bf475420560',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210ab',
                                    stockOnHand: 256,
                                    lotCode: 'SEM-LOTE-08I01-09292022',
                                    expirationDate: '2022-09-29'
                                }
                            ]

                        },
                        {
                            area: 'east',
                            locationCode: 'AA46A',
                            lots: [
                                {
                                    orderablesId: 'c965909b-431b-4cfd-98ae-1bf475420560',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210au',
                                    stockOnHand: 333,
                                    lotCode: 'SEM-LOTE-08I01-12292022',
                                    expirationDate: '2022-12-29'
                                }
                            ]

                        },
                        {
                            area: 'west',
                            locationCode: 'AB12C',
                            lots: [
                                {
                                    orderablesId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210a',
                                    stockOnHand: 200,
                                    lotCode: 'SEM-LOTE-08I01-07182023',
                                    expirationDate: '2023-07-18'
                                }
                            ]

                        },
                        {
                            area: 'north',
                            locationCode: 'AC33D',
                            lots: [
                                {
                                    orderablesId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210a',
                                    stockOnHand: 126,
                                    lotCode: 'SEM-LOTE-08I01-07182023',
                                    expirationDate: '2023-07-18'
                                }
                            ]

                        },
                        {
                            area: 'north',
                            locationCode: 'AC10B',
                            lots: [
                                {
                                    orderablesId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                                    lotId: '2992611b-66f8-4443-9096-8fa3f79f210a',
                                    stockOnHand: 126,
                                    lotCode: 'SEM-LOTE-08I01-07182023',
                                    expirationDate: '2023-07-18'
                                }
                            ]

                        }
                    ];
                    return locations;
                    // var orderableIds = _.map(draftInfo.lineItems, function(lineItem) {
                    //     return lineItem.orderable.id;
                    // });
                    // return SiglusLocationViewService.getOrderableLocationLotsInfo({
                    //     orderablesId: orderableIds,
                    //     extraData: false
                    // });
                },
                //
                // orderableLocationLotsMap: function(locations, SiglusLocationCommonUtilsService) {
                //     return SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
                // },
                //
                // orderableLotsLocationMap: function(SiglusLocationCommonUtilsService, locations) {
                //     return SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations);
                // }
                addedLineItems: function(draftInfo, $stateParams) {
                    if ($stateParams.addedLineItems) {
                        return $stateParams.addedLineItems;
                    }
                    return [];
                },
                displayItems: function($stateParams, siglusMovementFilterService, addedLineItems) {
                    return siglusMovementFilterService.filterMovementList($stateParams.keyword || '', addedLineItems);
                }
            }
        });
    }
})();
