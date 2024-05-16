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
        .module('proof-of-delivery-view')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.orders.podManage.draftList.draftWithLocation', {
            label: 'proofOfDeliveryView.viewProofOfDelivery',
            url: '/podWithLocation?actionType&subDraftId&draftNum',
            accessRights: [
                FULFILLMENT_RIGHTS.PODS_MANAGE,
                FULFILLMENT_RIGHTS.PODS_VIEW,
                FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
            ],
            views: {
                '@openlmis': {
                    templateUrl: 'siglus-location-proof-of-delivery-view/proof-of-delivery-view-location.html',
                    controller: 'ProofOfDeliveryViewControllerWithLocation',
                    controllerAs: 'vm',
                    resolve: {
                        facility: function(facilityFactory, $stateParams) {
                            if ($stateParams.facility) {
                                return $stateParams.facility;
                            }
                            return facilityFactory.getUserHomeFacility();
                        },
                        proofOfDelivery: function($stateParams, proofOfDeliveryService) {

                            if ($stateParams.actionType === 'MERGE') {
                                return proofOfDeliveryService.mergeDraftWithLocation($stateParams.podId);
                            }

                            return proofOfDeliveryService.getSubDraftWithLocation($stateParams.podId,
                                $stateParams.subDraftId);
                        },
                        // SIGLUS-REFACTOR: starts here : getSubDraftDetail if actionType is not Merge
                        user: function(authorizationService) {
                            return authorizationService.getUser();
                        },
                        // SIGLUS-REFACTOR: end here
                        order: function(proofOfDelivery) {
                            return proofOfDelivery.shipment.order;
                        },
                        reasons: function(stockReasonsFactory, order) {
                            return stockReasonsFactory.getReasons(order.program.id, order.facility.type.id);
                        },
                        orderablesPrice: function(siglusOrderableLotService) {
                            return siglusOrderableLotService.getOrderablesPrice();
                        },
                        orderLineItems: function(
                            proofOfDelivery,
                            order,
                            fulfillingLineItemFactory,
                            addAndRemoveLineItemService,
                            orderablesPrice
                        ) {
                            return fulfillingLineItemFactory.groupByOrderableForPod(
                                proofOfDelivery.lineItems,
                                order.orderLineItems
                            ).then(function(orderLineItems) {
                                var orderablesPriceMap = orderablesPrice.data;
                                var result = addAndRemoveLineItemService.prepareLineItemsForPod(orderLineItems);
                                _.each(result, function(c) {
                                    _.each(c.groupedLineItems, function(_c) {
                                        var id = _c.orderable && _c.orderable.id;
                                        _c.price = orderablesPriceMap[id]
                                            ? orderablesPriceMap[id]
                                            : '';
                                    });
                                });
                                return result;
                            });
                        },
                        canEdit: function($stateParams, authorizationService,
                            permissionService, order, proofOfDelivery) {
                            var user = authorizationService.getUser();
                            return permissionService.hasPermission(user.user_id, {
                                right: FULFILLMENT_RIGHTS.PODS_MANAGE,
                                facilityId: order.requestingFacility.id,
                                programId: order.program.id
                            })
                                .then(function() {
                                    return proofOfDelivery.isInitiated() && $stateParams.actionType !== 'SUBMITTED';
                                })
                                .catch(function() {
                                    return false;
                                });
                        },
                        locations: function(orderLineItems, siglusLocationCommonApiService, $stateParams) {
                            if ($stateParams.locations) {
                                return $stateParams.locations;
                            }
                            var orderableIds = _.map(orderLineItems, function(lineItem) {
                                return lineItem.orderable.id;
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
                        printInfo: function(proofOfDeliveryManageService, $stateParams) {
                            return  proofOfDeliveryManageService.getPodInfo($stateParams.podId, $stateParams.orderId);
                        }
                    }
                }
            }
        });
    }

})();
