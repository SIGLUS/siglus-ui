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

        $stateProvider.state('openlmis.orders.podManage.draftList.draft', {
            label: 'proofOfDeliveryView.viewProofOfDelivery',
            url: '/pod?actionType&subDraftId&draftNum',
            accessRights: [
                FULFILLMENT_RIGHTS.PODS_MANAGE,
                FULFILLMENT_RIGHTS.PODS_VIEW,
                FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
            ],
            views: {
                '@openlmis': {
                    templateUrl: 'proof-of-delivery-view/proof-of-delivery-view.html',
                    controller: 'ProofOfDeliveryViewController',
                    controllerAs: 'vm',
                    resolve: {
                        proofOfDelivery: function($stateParams, proofOfDeliveryService) {
                            // SIGLUS-REFACTOR: starts here : getSubDraftDetail if actionType is not Merge

                            if ($stateParams.actionType === 'VIEW') {
                                return proofOfDeliveryService.get($stateParams.podId);
                            }
                            if ($stateParams.actionType === 'MERGE') {
                                return proofOfDeliveryService.mergeDraft($stateParams.podId);
                            }
                            return proofOfDeliveryService.getSubDraft($stateParams.podId, $stateParams.subDraftId);
                            // SIGLUS-REFACTOR: end here
                        },
                        facility: function(facilityFactory) {
                            return facilityFactory.getUserHomeFacility();
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
                        rawLineItems: function(fulfillingLineItemFactory, proofOfDelivery, order) {
                            return fulfillingLineItemFactory.groupByOrderableForPod(
                                proofOfDelivery.lineItems,
                                order.orderLineItems
                            ).then(function(orderLineItems) {
                                return orderLineItems;
                            });
                        },
                        lotsMapByOrderableId: function(rawLineItems, siglusOrderableLotListService, facility) {
                            var orderableIdList = _.flatten(rawLineItems.map(function(orderLineItem) {
                                return orderLineItem.groupedLineItems.map(function(lineItemGroup) {
                                    return _.get(lineItemGroup, [0, 'orderable', 'id']);
                                });
                            }));
                            return siglusOrderableLotListService.getOrderableLots(facility.id, orderableIdList)
                                .then(function(lotList) {
                                    return siglusOrderableLotListService.getSimplifyLotsMapByOrderableId(lotList);
                                });

                        },
                        orderLineItems: function(rawLineItems, orderablesPrice, lotsMapByOrderableId) {
                            var orderablesPriceMap = orderablesPrice.data;
                            _.each(rawLineItems, function(orderLineItem) {
                                _.each(orderLineItem.groupedLineItems, function(lineItemGroup) {
                                    var orderableId = lineItemGroup[0].orderable && lineItemGroup[0].orderable.id;
                                    // set price
                                    var price = orderablesPriceMap[orderableId];
                                    if (price) {
                                        lineItemGroup.forEach(function(lineItem) {
                                            lineItem.price = price;
                                        });
                                    }
                                    // set lotOptions
                                    var newlyAddedLineItems = lineItemGroup.filter(function(lineItem) {
                                        return lineItem.added;
                                    });
                                    if (newlyAddedLineItems.length > 0) {
                                        var lotOptions = lotsMapByOrderableId[orderableId] || [];
                                        newlyAddedLineItems.forEach(function(lineItem) {
                                            lineItem.lotOptions = lotOptions;
                                        });
                                    }
                                });
                            });
                            return rawLineItems;
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
                        }
                    }
                }
            }
        });
    }

})();
