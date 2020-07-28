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
        'messageService'
        // #400: ends here
    ];
    // #287: ends here

    function shipmentViewService(ShipmentRepository, notificationService, stateTrackerService,
                                 $state, loadingModalService, ShipmentFactory, confirmService, $q, alertService,
                                 messageService) {

        var shipmentRepository = new ShipmentRepository();

        this.getShipmentForOrder = getShipmentForOrder;

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
                    .catch(function() {
                        notificationService.error('shipmentView.failedToSaveDraft');
                        loadingModalService.close();
                        return $q.reject();
                    });
            };
        }

        function decorateConfirm(originalConfirm) {
            return function() {
                var shipment = this;
                // #287: Warehouse clerk can skip some products in order
                var unskippedLineItems = getUnskippedLineItems(this.order.orderLineItems);
                if (unskippedLineItems.length === 0) {
                    return alertService.error('shipmentView.allLineItemsSkipped');
                } else if (areAllLineItemsNotFulfilled(shipment, unskippedLineItems)) {
                    return alertService.error('shipmentView.allLineItemsNotFulfilled');
                }
                // #287: ends here
                // #400: Facility user partially fulfill an order and create sub-order for an requisition
                var totalPartialLineItems = getPartialFulfilledLineItems(shipment, unskippedLineItems);
                if (totalPartialLineItems) {
                    return confirmService.confirm(messageService.get('shipmentView.confirmPartialFulfilled.message', {
                        totalPartialLineItems: totalPartialLineItems
                    }), 'shipmentView.confirmPartialFulfilled.createSuborder')
                        .then(function() {
                            loadingModalService.open();
                            return shipment.createSuborder()
                                .then(function() {
                                    notificationService.success('shipmentView.suborderHasBeenConfirmed');
                                    stateTrackerService.goToPreviousState('openlmis.orders.view');
                                })
                                .catch(function() {
                                    notificationService.error('shipmentView.failedToCreateSuborder');
                                    loadingModalService.close();
                                });
                        });
                }
                // #400: ends here
                return confirmService.confirm(
                    'shipmentView.confirmShipment.question',
                    'shipmentView.confirmShipment'
                )
                    .then(function() {
                        loadingModalService.open();

                        return originalConfirm.apply(shipment)
                            .then(function() {
                                notificationService.success('shipmentView.shipmentHasBeenConfirmed');
                                stateTrackerService.goToPreviousState('openlmis.orders.view');
                            })
                            .catch(function() {
                                notificationService.error('shipmentView.failedToConfirmShipment');
                                loadingModalService.close();
                            });
                    });
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
        function areAllLineItemsNotFulfilled(shipment, unskippedLineItems) {
            var allNotFulfilled = true;
            unskippedLineItems.forEach(function(lineItem) {
                if (getTotalQuantityShipped(shipment.lineItems, lineItem)) {
                    allNotFulfilled = false;
                    return;
                }
            });
            return allNotFulfilled;
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