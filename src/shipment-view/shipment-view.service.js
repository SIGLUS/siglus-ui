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
        // #400: add siglusConfirmModalService, messageService
        'siglusConfirmModalService', 'messageService'
        // #400: ends here
    ];
    // #287: ends here

    function shipmentViewService(ShipmentRepository, notificationService, stateTrackerService,
                                 $state, loadingModalService, ShipmentFactory, confirmService, $q, alertService,
                                 siglusConfirmModalService, messageService) {

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
        function getShipmentForOrder(order) {
            if (!order) {
                return $q.reject('Order can not be undefined');
            }

            return getShipmentBasedOnOrderStatus(order)
                .then(function(shipment) {

                    shipment.save = decorateSave(shipment.save);
                    shipment.confirm = decorateConfirm(shipment.confirm);
                    shipment.delete = decorateDelete(shipment.delete);

                    return shipment;
                });
        }

        function getShipmentBasedOnOrderStatus(order) {
            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            if (order.isOrdered() || order.isPartiallyFulfilled()) {
                // #400: ends here
                return new ShipmentFactory()
                    .buildFromOrder(order)
                    .then(function(shipment) {
                        return shipmentRepository.createDraft(shipment);
                    });
            }

            if (order.isFulfilling()) {
                return shipmentRepository.getDraftByOrderId(order.id);
            }

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
                if (areAllLineItemsSkipped(this.order.orderLineItems)) {
                    return alertService.error('shipmentView.allLineItemsSkipped');
                }
                // #287: ends here
                // #400: Facility user partially fulfill an order and create sub-order for an requisition
                var totalPartialLineItems = isPartialFulfilled(shipment);
                if (totalPartialLineItems) {
                    return siglusConfirmModalService.confirm(
                        messageService.get('shipmentView.confirmPartialFulfilled.message', {
                            totalPartialLineItems: totalPartialLineItems +
                                (totalPartialLineItems === 1 ? ' product is' : ' products are')
                        }),
                        'shipmentView.confirmPartialFulfilled.createSuborder',
                        'shipmentView.confirmShipment',
                        undefined,
                        'shipmentView.confirmPartialFulfilled.title'
                    )
                        .then(function(isSubOrder) {
                            loadingModalService.open();
                            if (isSubOrder) {
                                return shipment.createSuborder()
                                    .then(function() {
                                        notificationService.success('shipmentView.suborderHasBeenConfirmed');
                                        stateTrackerService.goToPreviousState('openlmis.orders.view');
                                    })
                                    .catch(function() {
                                        notificationService.error('shipmentView.failedToCreateSuborder');
                                        loadingModalService.close();
                                    });
                            }
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
        function areAllLineItemsSkipped(lineItems) {
            var allSkipped = true;
            lineItems.forEach(function(lineItem) {
                if (!lineItem.skipped) {
                    allSkipped = false;
                    return;
                }
            });
            return allSkipped;
        }
        // #287: ends here

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        function isPartialFulfilled(shipment) {
            var totalPartialLineItems = 0;
            shipment.order.orderLineItems.forEach(function(orderLineItem) {
                if (!orderLineItem.added && !orderLineItem.skipped) {
                    var totalQuantityShipped = 0;
                    shipment.lineItems.forEach(function(lineItem) {
                        if (lineItem.orderable.id === orderLineItem.orderable.id) {
                            totalQuantityShipped = totalQuantityShipped + lineItem.quantityShipped;
                        }
                    });
                    if (totalQuantityShipped + orderLineItem.partialFulfilledQuantity < orderLineItem.orderedQuantity) {
                        totalPartialLineItems = totalPartialLineItems + 1;
                    }
                }
            });
            return totalPartialLineItems;
        }
        // #400: ends here

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