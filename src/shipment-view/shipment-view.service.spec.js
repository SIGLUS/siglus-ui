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

describe('shipmentViewService', function() {

    // #287: add alertService
    var shipmentViewService, OrderDataBuilder, shipmentRepositoryMock, shipmentFactoryMock, order,
        ShipmentDataBuilder, shipment, $rootScope, $q, Order, loadingModalService, $state,
        notificationService, stateTrackerService, confirmService, alertService,
        StockCardSummaryDataBuilder, stockCardSummaries, CanFulfillForMeEntryDataBuilder, OrderableDataBuilder,
        orderService, siglusShipmentConfirmModalService;
    // #287: ends here

    beforeEach(function() {
        module('order');
        module('siglus-alert-confirm-modal');
        module('shipment-view', function($provide) {
            shipmentRepositoryMock = jasmine.createSpyObj('shipmentRepository', [
                'getByOrderId', 'getDraftByOrderId', 'createDraft'
            ]);
            $provide.factory('ShipmentRepository', function() {
                return function() {
                    return shipmentRepositoryMock;
                };
            });

            shipmentFactoryMock = jasmine.createSpyObj('shipmentFactory', [
                'buildFromOrder'
            ]);
            $provide.factory('ShipmentFactory', function() {
                return function() {
                    return shipmentFactoryMock;
                };
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            shipmentViewService = $injector.get('shipmentViewService');
            siglusShipmentConfirmModalService = $injector.get('siglusShipmentConfirmModalService');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            Order = $injector.get('Order');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            stateTrackerService = $injector.get('stateTrackerService');
            $state = $injector.get('$state');
            confirmService = $injector.get('confirmService');
            // #287: Warehouse clerk can skip some products in order
            alertService = $injector.get('alertService');
            // #287: ends here
            // #372: Improving Fulfilling Order performance
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            orderService = $injector.get('orderService');
            // #372: ends here

        });

        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(notificationService, 'success');
        spyOn(notificationService, 'error');
        spyOn(siglusShipmentConfirmModalService, 'confirm');
        spyOn(stateTrackerService, 'goToPreviousState');
        spyOn($state, 'reload');
        spyOn(confirmService, 'confirm');
        spyOn(confirmService, 'confirmDestroy');
        // #287: Warehouse clerk can skip some products in order
        spyOn(alertService, 'error');
        spyOn(orderService, 'getStatus');
        // #287: ends here

        shipment = new ShipmentDataBuilder().build();

        // #372: Improving Fulfilling Order performance
        stockCardSummaries = [
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder().build())
                        .buildJson(),
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder().build())
                        .buildJson()
                ])
                .build(),
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder().build())
                        .buildJson(),
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder().build())
                        .buildJson()
                ])
                .build()
        ];
        // #372: ends here
    });

    describe('getShipmentForOrder', function() {

        it('should create new shipment for order in the ordered status', function() {
            var json = new ShipmentDataBuilder().buildJson();

            shipmentFactoryMock.buildFromOrder.andReturn($q.resolve(json));
            shipmentRepositoryMock.createDraft.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildOrdered());

            var result;
            // #372: Improving Fulfilling Order performance
            shipmentViewService.getShipmentForOrder(order, stockCardSummaries)
            // #372: ends here
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            // #372: Improving Fulfilling Order performance
            expect(shipmentFactoryMock.buildFromOrder).toHaveBeenCalled();
            expect(shipmentRepositoryMock.createDraft).toHaveBeenCalled();
            // #372: ends here
        });

        it('should fetch draft for order in the fulfilling status', function() {
            shipmentRepositoryMock.getDraftByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildFulfilling());

            var result;
            // #372: Improving Fulfilling Order performance
            shipmentViewService.getShipmentForOrder(order, stockCardSummaries)
            // #372: ends here
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryMock.getDraftByOrderId).toHaveBeenCalledWith(order, stockCardSummaries);
            // #372: ends here
        });

        it('should fetch shipment for order in the shipped status', function() {
            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            var result;
            // #372: Improving Fulfilling Order performance
            shipmentViewService.getShipmentForOrder(order, stockCardSummaries)
            // #372: ends here
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            expect(shipmentRepositoryMock.getByOrderId).toHaveBeenCalledWith(order.id);
        });

        it('should reject if order is undefined', function() {
            var rejected;
            shipmentViewService.getShipmentForOrder()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        // #372: Improving Fulfilling Order performance
        // it('should reject if factory rejects', function() {
        //     shipmentFactoryMock.buildFromOrder.andReturn($q.reject());
        //
        //     order = new Order(new OrderDataBuilder().buildOrdered());
        //
        //     var rejected;
        //     shipmentViewService.getShipmentForOrder(order)
        //         .catch(function() {
        //             rejected = true;
        //         });
        //     $rootScope.$apply();
        //
        //     expect(rejected).toEqual(true);
        //     expect(shipmentFactoryMock.buildFromOrder).toHaveBeenCalledWith(order);
        // });
        // #372: ends here

        it('should reject if createDraft rejects', function() {
            var json = new ShipmentDataBuilder().buildJson();

            shipmentFactoryMock.buildFromOrder.andReturn($q.resolve(json));
            shipmentRepositoryMock.createDraft.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildOrdered());

            var rejected;
            // #372: Improving Fulfilling Order performance
            shipmentViewService.getShipmentForOrder(order, stockCardSummaries)
            // #372: ends here
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            // #372: Improving Fulfilling Order performance
            expect(shipmentFactoryMock.buildFromOrder).toHaveBeenCalled();
            expect(shipmentRepositoryMock.createDraft).toHaveBeenCalled();
            // #372: ends here

        });

        it('should reject if getDraftByOrderId rejects', function() {
            shipmentRepositoryMock.getDraftByOrderId.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildFulfilling());

            var rejected;
            // #372: Improving Fulfilling Order performance
            shipmentViewService.getShipmentForOrder(order, stockCardSummaries)
            // #372: ends here
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryMock.getDraftByOrderId).toHaveBeenCalledWith(order, stockCardSummaries);
            // #372: ends here
        });

        it('should reject if getByOrderId rejects', function() {
            shipmentRepositoryMock.getByOrderId.andReturn($q.reject());

            order = new Order(new OrderDataBuilder().buildShipped());

            var rejected;
            // #372: Improving Fulfilling Order performance
            shipmentViewService.getShipmentForOrder(order, stockCardSummaries)
            // #372: Improving Fulfilling Order performance
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(shipmentRepositoryMock.getByOrderId).toHaveBeenCalledWith(order.id);
        });

    });

    describe('decorated saved', function() {

        var originalSave;

        beforeEach(function() {
            shipment.save = jasmine.createSpy('save');
            originalSave = shipment.save;

            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            shipmentViewService.getShipmentForOrder(order);
            $rootScope.$apply();
        });

        it('should open loading modal before calling originalSave', function() {
            originalSave.andReturn($q.resolve());

            shipment.save();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalSave).toHaveBeenCalled();

            expect($state.reload).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should reject if original save rejects', function() {
            originalSave.andReturn($q.reject());

            var rejected;
            shipment.save()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should show error on failure', function() {
            originalSave.andReturn($q.reject());

            shipment.save();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalSave).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(notificationService.error)
                .toHaveBeenCalledWith('shipmentView.failedToSaveDraft');

            expect($state.reload).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
        });

        it('should show message, reload on success and return response', function() {
            var result;

            originalSave.andReturn($q.resolve(shipment));

            shipment.save().then(function(response) {
                result = response;
            });
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalSave).toHaveBeenCalled();
            expect($state.reload).toHaveBeenCalled();
            expect(notificationService.success)
                .toHaveBeenCalledWith('shipmentView.draftHasBeenSaved');

            expect(result).toEqual(shipment);

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

    });

    describe('decorated confirm', function() {

        var originalConfirm, orderStatus;

        beforeEach(function() {
            shipment.confirm = jasmine.createSpy('confirm');
            originalConfirm = shipment.confirm;

            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));
            shipment.lineItems[0].orderable.id = 'orderable-id-1';
            shipment.lineItems[1].orderable.id = 'orderable-id-2';
            shipment.lineItems.forEach(function(lineItem) {
                lineItem.quantityShipped = 50;
            });

            order = new Order(new OrderDataBuilder().buildShipped());

            shipmentViewService.getShipmentForOrder(order);
            $rootScope.$apply();
            orderStatus = {
                closed: false,
                suborder: false
            };
            orderService.getStatus.andReturn($q.resolve(orderStatus));
        });

        // #287: Warehouse clerk can skip some products in order
        it('should alert error message if all items have been skipped', function() {
            confirmService.confirm.andReturn($q.resolve());
            shipment.order.orderLineItems.forEach(function(lineItem) {
                lineItem.skipped = true;
            });

            shipment.confirm();
            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith('shipmentView.allLineItemsSkipped');

            expect(confirmService.confirm).not.toHaveBeenCalled();
            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(originalConfirm).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });
        // #287: ends here

        // #401: limitation of creating sub-order
        it('should alert error message if all items did not been fulfilled', function() {
            siglusShipmentConfirmModalService.confirm.andReturn($q.resolve({
                preparedBy: '张三',
                conferredBy: '李四'
            }));
            shipment.lineItems.forEach(function(lineItem) {
                lineItem.quantityShipped = 0;
            });

            shipment.confirm();
            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith('shipmentView.allLineItemsNotFulfilled');

            expect(siglusShipmentConfirmModalService.confirm).not.toHaveBeenCalled();
            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(originalConfirm).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });
        // #401: ends here

        it('should reject if confirmation was dismissed', function() {
            siglusShipmentConfirmModalService.confirm.andReturn($q.reject());

            var rejected;
            shipment.confirm()
                .catch(function() {
                    rejected = true;
                });

            $rootScope.$apply();

            expect(rejected).toEqual(true);

            expect(siglusShipmentConfirmModalService.confirm).toHaveBeenCalledWith(
                'shipmentView.confirmShipment.question',
                'shipmentView.confirmShipment'
            );

            // SIGLUS-REFACTOR: starts here
            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalConfirm).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
        });

        it('should open loading modal after confirmation', function() {
            siglusShipmentConfirmModalService.confirm.andReturn($q.resolve({
                preparedBy: '张三',
                conferredBy: '李四'
            }));

            shipment.confirm();
            $rootScope.$apply();

            expect(siglusShipmentConfirmModalService.confirm).toHaveBeenCalledWith(
                'shipmentView.confirmShipment.question',
                'shipmentView.confirmShipment'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalConfirm).toHaveBeenCalledWith({
                preparedBy: '张三',
                conferredBy: '李四'
            });

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            // SIGLUS-REFACTOR: starts here
            // expect(loadingModalService.close).toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
        });

        it('should show error on failure', function() {
            siglusShipmentConfirmModalService.confirm.andReturn($q.resolve({
                preparedBy: '张三',
                conferredBy: '李四'
            }));
            originalConfirm.andReturn($q.reject());

            shipment.confirm();
            $rootScope.$apply();

            expect(siglusShipmentConfirmModalService.confirm).toHaveBeenCalledWith(
                'shipmentView.confirmShipment.question',
                'shipmentView.confirmShipment'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalConfirm).toHaveBeenCalledWith({
                preparedBy: '张三',
                conferredBy: '李四'
            });

            expect(notificationService.error)
                .toHaveBeenCalledWith('shipmentView.failedToConfirmShipment');

            expect(loadingModalService.close).toHaveBeenCalled();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
        });

        it('should go to previous state on success', function() {
            siglusShipmentConfirmModalService.confirm.andReturn($q.resolve({
                preparedBy: '张三',
                conferredBy: '李四'
            }));
            originalConfirm.andReturn($q.resolve());

            shipment.confirm();
            $rootScope.$apply();

            expect(siglusShipmentConfirmModalService.confirm).toHaveBeenCalledWith(
                'shipmentView.confirmShipment.question',
                'shipmentView.confirmShipment'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalConfirm).toHaveBeenCalledWith({
                preparedBy: '张三',
                conferredBy: '李四'
            });

            expect(notificationService.success).
                toHaveBeenCalledWith('shipmentView.shipmentHasBeenConfirmed');

            expect(stateTrackerService.goToPreviousState).
                toHaveBeenCalledWith('openlmis.orders.view');

            expect(notificationService.error).not.toHaveBeenCalled();
            // SIGLUS-REFACTOR: starts here
            // expect(loadingModalService.close).toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
        });

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        it('should call createSuborder when it is not fulfilled after choose create suborder', function() {
            siglusShipmentConfirmModalService.confirm.andReturn($q.resolve({
                preparedBy: '张三',
                conferredBy: '李四'
            }));
            shipment.createSuborder = jasmine.createSpy('createSuborder').andReturn($q.resolve());
            shipment.order.orderLineItems.forEach(function(lineItem) {
                lineItem.orderedQuantity = 100;
                lineItem.partialFulfilledQuantity = 0;
            });
            orderStatus = {
                closed: false,
                suborder: true
            };
            orderService.getStatus.andReturn($q.resolve(orderStatus));

            shipment.confirm();
            $rootScope.$apply();

            expect(siglusShipmentConfirmModalService.confirm).toHaveBeenCalled();
            expect(loadingModalService.open).toHaveBeenCalled();
            expect(shipment.createSuborder).toHaveBeenCalled();
            expect(originalConfirm).not.toHaveBeenCalledWith();
        });
        // #400: ends here

    });

    describe('decorated delete', function() {

        var originalDelete;

        beforeEach(function() {
            shipment.delete = jasmine.createSpy('delete');
            originalDelete = shipment.delete;

            shipmentRepositoryMock.getByOrderId.andReturn($q.resolve(shipment));

            order = new Order(new OrderDataBuilder().buildShipped());

            shipmentViewService.getShipmentForOrder(order);
            $rootScope.$apply();
        });

        it('should reject if confirmation was dismissed', function() {
            confirmService.confirmDestroy.andReturn($q.reject());

            var rejected;
            shipment.delete()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(originalDelete).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should open loading modal after confirmation', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());

            shipment.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalDelete).toHaveBeenCalledWith();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should show error on failure', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            originalDelete.andReturn($q.reject());

            shipment.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalDelete).toHaveBeenCalledWith();
            expect(notificationService.error)
                .toHaveBeenCalledWith('shipmentView.failedToDeleteDraft');

            expect(loadingModalService.close).toHaveBeenCalled();

            expect(notificationService.success).not.toHaveBeenCalled();
            expect(stateTrackerService.goToPreviousState).not.toHaveBeenCalled();
        });

        it('should go to previous state on success', function() {
            confirmService.confirmDestroy.andReturn($q.resolve());
            originalDelete.andReturn($q.resolve());

            shipment.delete();
            $rootScope.$apply();

            expect(confirmService.confirmDestroy).toHaveBeenCalledWith(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(originalDelete).toHaveBeenCalledWith();
            expect(notificationService.success).
                toHaveBeenCalledWith('shipmentView.draftHasBeenDeleted');

            expect(stateTrackerService.goToPreviousState).
                toHaveBeenCalledWith('openlmis.orders.view');

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

    });

});
