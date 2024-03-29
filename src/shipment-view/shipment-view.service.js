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

    /**
     * @ngdoc service
     * @name shipment-view.shipmentViewService
     *
     * @description
     * Application layer service that prepares domain objects to be used on the view.
     */
    angular
        .module('shipment-view')
        .service('shipmentViewService', shipmentViewService);

    // #287: add alertService
    shipmentViewService.inject = [
        'ShipmentRepository', 'notificationService', '$state', 'stateTrackerService',
        'loadingModalService', 'ShipmentFactory', 'confirmService', '$q', 'alertService',
        // #400: add messageService
        'messageService', 'orderService', '$resource', 'fulfillmentUrlFactory', 'siglusShipmentConfirmModalService',
        '$stateParams', 'alertConfirmModalService',
        // #400: ends here
        'StockCardSummaryRepositoryImpl'
    ];
    // #287: ends here

    function shipmentViewService(
        ShipmentRepository, notificationService, stateTrackerService,
        $state, loadingModalService, ShipmentFactory, confirmService, $q, alertService,
        messageService, orderService, $resource, fulfillmentUrlFactory,
        siglusShipmentConfirmModalService, $stateParams, alertConfirmModalService, StockCardSummaryRepositoryImpl
    ) {

        var shipmentRepository = new ShipmentRepository();

        this.getShipmentForOrder = getShipmentForOrder;
        this.getSuggestedQuantity = getSuggestedQuantity;
        this.getPickPackInfo = getPickPackInfo;

        /**
         * @ngdoc method
         * @methodOf shipment-view.shipmentViewService
         * @name getShipmentForOrder
         *
         * @description
         * Returns a domain object representing a Shipment decorated with loading modal and
         * notifications for success/unsuccessful actions.
         *
         * @param  {Order}   order the order to get the shipment for
         * @param  {Array}   stockCardSummaries stockCard info from /integration/summary api
         * @return {Promise}       the promise resolving to a decorated Shipment
         */
        // #372: Improving Fulfilling Order performance
        function getShipmentForOrder(order, stockCardSummaries) {
            if (!order) {
                return $q.reject('Order can not be undefined');
            }

            return getShipmentBasedOnOrderStatus(order, stockCardSummaries)
            // #372: ends here
                .then(function(shipment) {
                    shipment.save = decorateSave(shipment.save);
                    shipment.confirm = decorateConfirm(shipment.confirm);
                    shipment.delete = decorateDelete(shipment.delete);
                    return shipment;
                });
        }

        function getSuggestedQuantity(id) {
            var resource = $resource(fulfillmentUrlFactory('/api/siglusapi/orders/:id/suggestedQuantity'), {}, {
                find: {
                    url: fulfillmentUrlFactory('/api/siglusapi/orders/:id/suggestedQuantity'),
                    method: 'get'
                }
            });
            return resource.find({
                id: id
            }).$promise;
        }

        function getPickPackInfo(id) {
            var resource = $resource(fulfillmentUrlFactory('/api/siglusapi/orders/:id/pickPackInfo'), {}, {
                find: {
                    url: fulfillmentUrlFactory('/api/siglusapi/orders/:id/pickPackInfo'),
                    method: 'get'
                }
            });
            return resource.find({
                id: id
            }).$promise;
        }

        // #372: Improving Fulfilling Order performance
        function getShipmentBasedOnOrderStatus(order, stockCardSummaries) {
            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            if (order.isOrdered() || order.isPartiallyFulfilled()) {
                // #400: ends here
                return shipmentRepository.createDraft(new ShipmentFactory().buildFromOrder(order, stockCardSummaries),
                    order, stockCardSummaries);
            }

            if (order.isFulfilling()) {
                return shipmentRepository.getDraftByOrderId(order, stockCardSummaries);
            }
            // #372: ends here

            if (order.isShipped()) {
                return shipmentRepository.getByOrderId(order.id);
            }
        }

        function decorateSave(originalSave) {
            return function() {
                loadingModalService.open();
                return originalSave.apply(this, arguments)
                    .then(function(response) {
                        notificationService.success('shipmentView.draftHasBeenSaved');
                        $state.reload();

                        return response;
                    })
                    .catch(function(error) {
                        if (error.data.messageKey && error.data.messageKey ===
                            'siglusapi.error.shipment.order.line items.invalid') {
                            alertService.error(
                                'shipmentView.saveDraftError.label',
                                '',
                                'OK'
                            ).then(function() {
                                new StockCardSummaryRepositoryImpl.queryWithStockCards($stateParams.summaryRequestBody)
                                    .then(function(summaries) {
                                        updateLineItemsReservedAndTotalStock($stateParams.tableLineItems, summaries);
                                    });
                            });
                        } else {
                            notificationService.error('shipmentView.failedToSaveDraft');
                        }
                        return $q.reject();
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });
            };
        }

        function updateLineItemsReservedAndTotalStock(lineItems, summaries) {
            lineItems.forEach(function(lineItem) {
                var currentItemOrderableId = lineItem.shipmentLineItem.orderable.id;
                var currentItemLotId = lineItem.lot.id;

                var summary = summaries.find(function(summary) {
                    return summary.orderable.id === currentItemOrderableId;
                });
                var lineItemCardDetail = summary.stockCardDetails.find(function(stockCardDetail) {
                    stockCardDetail.lot.id === currentItemLotId;
                });

                lineItem.shipmentLineItem.stockOnHand = lineItemCardDetail.stockOnHand;

                if (!lineItem.isMainGroup) {
                    lineItem.reservedStock = lineItemCardDetail.reservedStock;
                }
            });
        }

        function decorateConfirm(originalConfirm) {
            return function() {
                var shipment = this;
                // #287: Warehouse clerk can skip some products in order
                var unskippedLineItems = getUnskippedLineItems(this.order.orderLineItems);
                if (unskippedLineItems.length === 0) {
                    return alertService.error('shipmentView.allLineItemsSkipped');
                } else if (!haveFulfilledLineItem(shipment, unskippedLineItems)) {
                    return alertService.error('shipmentView.allLineItemsNotFulfilled');
                }
                loadingModalService.open();
                // #287: ends here
                // #400: Facility user partially fulfill an order and create sub-order for an requisition
                return orderService.getStatus(this.order.id).then(function(result) {
                    if (result.suborder && result.closed) {
                        return alertService.error('shipmentView.closed');
                    }
                    var totalPartialLineItems = getPartialFulfilledLineItems(shipment, unskippedLineItems);
                    if (!result.closed && totalPartialLineItems) {
                        return siglusShipmentConfirmModalService.confirm(
                            messageService.get('shipmentView.confirmPartialFulfilled.message', {
                                totalPartialLineItems: totalPartialLineItems
                            }), 'shipmentView.confirmPartialFulfilled.createSuborder'
                        )
                            .then(function(signature) {
                                return shipment.createSuborder(signature)
                                    .then(function() {
                                        notificationService.success('shipmentView.suborderHasBeenConfirmed');
                                        stateTrackerService.goToPreviousState('openlmis.orders.view');
                                    })
                                    .catch(function(err) {
                                        // eslint-disable-next-line max-len
                                        if (_.get(err, ['data', 'messageKey']) === 'siglusapi.error.order.expired') {

                                            alertConfirmModalService.error(
                                                'orderFulfillment.expiredMessage',
                                                '',
                                                ['adminFacilityList.close',
                                                    'adminFacilityList.confirm']
                                            )
                                                .then(function() {
                                                    $state.go('openlmis.orders.fulfillment', $stateParams, {
                                                        reload: true
                                                    });
                                                });

                                        } else {
                                            notificationService.error('shipmentView.failedToCreateSuborder');
                                        }
                                    })
                                    .finally(loadingModalService.close);
                            });
                    }
                    // #400: ends here
                    return siglusShipmentConfirmModalService.confirm(
                        'shipmentView.confirmShipment.question',
                        'shipmentView.confirmShipment'
                    )
                        .then(function(signature) {
                            return originalConfirm.apply(shipment, [signature])
                                .then(function() {
                                    notificationService.success('shipmentView.shipmentHasBeenConfirmed');
                                    stateTrackerService.goToPreviousState('openlmis.orders.view');
                                })
                                .catch(function(err) {
                                    // eslint-disable-next-line max-len
                                    if (_.get(err, ['data', 'messageKey']) === 'siglusapi.error.order.expired') {
                                        alertConfirmModalService.error(
                                            'orderFulfillment.expiredMessage',
                                            '',
                                            ['adminFacilityList.close',
                                                'adminFacilityList.confirm']
                                        )
                                            .then(function() {
                                                $state.go('openlmis.orders.fulfillment', $stateParams, {
                                                    reload: true
                                                });
                                            });
                                    } else {
                                        notificationService.error('shipmentView.failedToConfirmShipment');
                                    }
                                })
                                .finally(loadingModalService.close);
                        });
                })
                    .finally(loadingModalService.close);
            };
        }

        // #287: Warehouse clerk can skip some products in order
        function getUnskippedLineItems(lineItems) {
            return lineItems.filter(function(lineItem) {
                return !lineItem.skipped;
            });
        }
        // #287: ends here

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        function getPartialFulfilledLineItems(shipment, unskippedLineItems) {
            var totalPartialLineItems = 0;
            unskippedLineItems.forEach(function(orderLineItem) {
                if (!orderLineItem.added) {
                    var totalQuantityShipped = getTotalQuantityShipped(shipment.lineItems, orderLineItem);
                    if (totalQuantityShipped + orderLineItem.partialFulfilledQuantity < orderLineItem.orderedQuantity) {
                        totalPartialLineItems = totalPartialLineItems + 1;
                    }
                }
            });
            return totalPartialLineItems;
        }
        // #400: ends here

        // #401: limitation of creating sub-order
        function haveFulfilledLineItem(shipment, unskippedLineItems) {
            return _.some(unskippedLineItems, function(lineItem) {
                return getTotalQuantityShipped(shipment.lineItems, lineItem);
            });
        }

        function getTotalQuantityShipped(shipmentLineItems, orderLineItem) {
            var totalQuantityShipped = 0;
            shipmentLineItems.forEach(function(lineItem) {
                if (lineItem.orderable.id === orderLineItem.orderable.id) {
                    totalQuantityShipped = totalQuantityShipped + lineItem.quantityShipped;
                }
            });
            return totalQuantityShipped;
        }
        // #401: ends here

        function decorateDelete(originalDelete) {
            return function() {
                var shipment = this;
                return confirmService.confirmDestroy(
                    'shipmentView.deleteDraftConfirmation',
                    'shipmentView.deleteDraft'
                )
                    .then(function() {
                        loadingModalService.open();

                        return originalDelete.apply(shipment)
                            .then(function() {
                                notificationService.success('shipmentView.draftHasBeenDeleted');
                                stateTrackerService.goToPreviousState('openlmis.orders.view');
                            })
                            .catch(function() {
                                notificationService.error('shipmentView.failedToDeleteDraft');
                                loadingModalService.close();
                            });
                    });
            };
        }
    }

})();
