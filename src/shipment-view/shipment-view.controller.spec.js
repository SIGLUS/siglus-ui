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

describe('ShipmentViewController', function() {

    var vm, $q, $controller, ShipmentDataBuilder, shipment, tableLineItems, OrderDataBuilder,
        QUANTITY_UNIT, order, messageService, $window, $rootScope,
        // #264: warehouse clerk can add product to orders
        selectProductsModalService, alertService, OrderableDataBuilder, availableProducts, ShipmentViewLineItemFactory,
        shipmentViewLineItemFactory, StockCardSummaryDataBuilder, stockCardSummaries,
        CanFulfillForMeEntryDataBuilder,
        // #264: ends here
        // #287: Warehouse clerk can skip some products in order
        ShipmentLineItem, ShipmentLineItemDataBuilder, suggestedQuantity,
        // #287: ends here
        shipmentViewService, alertConfirmModalService;

    beforeEach(function() {
        module('shipment-view');
        // #264: warehouse clerk can add product to orders
        module('openlmis-array-decorator');
        // #264: ends here
        // #287: Warehouse clerk can skip some products in order
        module('shipment');
        // #287: ends here
        module('siglus-alert-confirm-modal');
        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
            messageService = $injector.get('messageService');
            $window = $injector.get('$window');
            $rootScope = $injector.get('$rootScope');
            // #264: warehouse clerk can add product to orders
            selectProductsModalService = $injector.get('selectProductsModalService');
            alertService = $injector.get('alertService');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            ShipmentViewLineItemFactory = $injector.get('ShipmentViewLineItemFactory');
            shipmentViewLineItemFactory = new ShipmentViewLineItemFactory();
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            // #264: ends here
            // #287: Warehouse clerk can skip some products in order
            ShipmentLineItem = $injector.get('ShipmentLineItem');
            ShipmentLineItemDataBuilder = $injector.get('ShipmentLineItemDataBuilder');
            // #287: ends here
            shipmentViewService = $injector.get('shipmentViewService');
            alertConfirmModalService = $injector.get('alertConfirmModalService');
        });

        shipment = new ShipmentDataBuilder().build();
        order = new OrderDataBuilder().build();
        tableLineItems = [{}, {}];
        suggestedQuantity = {
            orderableIdToSuggestedQuantity: null,
            showSuggestedQuantity: true
        };
        // #264: warehouse clerk can add product to orders
        availableProducts = [
            new OrderableDataBuilder()
                .withFullProductName('C Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('A Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('B product')
                .build()
        ];
        stockCardSummaries = [
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMeEntry(
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(availableProducts[0])
                        .buildJson()
                )
                .buildJson()
        ];
        shipmentViewService.alertConfirmModalService = alertConfirmModalService;
        var mockScope = $rootScope.$new();
        vm = $controller('ShipmentViewController', {
            $scope: mockScope,
            shipment: shipment,
            tableLineItems: tableLineItems,
            updatedOrder: order,
            stockCardSummaries: stockCardSummaries,
            suggestedQuantity: suggestedQuantity,
            displayTableLineItems: tableLineItems,
            shipmentViewService: shipmentViewService
        });
        // #264: ends here
    });

    describe('$onInit', function() {

        it('should expose order', function() {
            vm.$onInit();

            expect(vm.order).toEqual(order);
        });

        it('should expose shipment', function() {
            vm.$onInit();

            expect(vm.shipment).toEqual(shipment);
        });

        it('should expose tableLineItems', function() {
            vm.$onInit();

            expect(vm.tableLineItems).toEqual(tableLineItems);
        });

    });

    describe('showInDoses', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return true if showing in doses', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.showInDoses()).toEqual(true);
        });

        it('should return false if showing in packs', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            expect(vm.showInDoses()).toEqual(false);
        });

    });

    describe('getSelectedQuantityUnitKeyUnitKey', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return \'shipmentView.packs\' for packs', function() {
            vm.quantityUnit = QUANTITY_UNIT.PACKS;

            expect(vm.getSelectedQuantityUnitKey()).toEqual('shipmentView.packs');
        });

        it('should return \'shipmentView.doses\' for doses', function() {
            vm.quantityUnit = QUANTITY_UNIT.DOSES;

            expect(vm.getSelectedQuantityUnitKey()).toEqual('shipmentView.doses');
        });

        it('should return undefined for undefined', function() {
            vm.quantityUnit = undefined;

            expect(vm.getSelectedQuantityUnitKey()).toEqual(undefined);
        });

    });

    describe('printShipment', function() {

        var popup, document;

        beforeEach(function() {

            document = jasmine.createSpyObj('document', ['write']);

            popup = {
                document: document,
                location: {}
            };

            spyOn(messageService, 'get').andReturn('Saving and printing');
            spyOn($window, 'open').andReturn(popup);
        });

        it('should open print page after saving', function() {

            vm.printShipment();

            expect($window.open).toHaveBeenCalled();
        });
    });

    // #264: warehouse clerk can add product to orders
    describe('addProducts', function() {

        beforeEach(function() {
            vm.$onInit();

            spyOn(alertService, 'error');
            spyOn(selectProductsModalService, 'show');
            spyOn(shipmentViewLineItemFactory, 'createFrom');
        });

        it('should show alert if there are no available products', function() {
            vm.order.orderLineItems = [];
            vm.order.availableProducts = [];
            vm.addProducts();
            $rootScope.$apply();

            expect(selectProductsModalService.show).not.toHaveBeenCalled();
            expect(alertService.error).toHaveBeenCalledWith(
                'shipmentView.noProductsToAdd.label',
                'shipmentView.noProductsToAdd.message'
            );
        });

        it('should show products in alphabetical order', function() {
            selectProductsModalService.show.andReturn($q.resolve([]));

            vm.order.orderLineItems = [];
            vm.order.availableProducts = availableProducts;
            vm.addProducts();
            $rootScope.$apply();

            var actualProducts = selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(availableProducts[1]);
            expect(actualProducts.products[1]).toEqual(availableProducts[2]);
            expect(actualProducts.products[2]).toEqual(availableProducts[0]);
        });

        it('should do nothing if modal was dismissed', function() {
            selectProductsModalService.show.andReturn($q.reject());
            shipmentViewLineItemFactory.createFrom.andReturn([]);

            vm.order.orderLineItems = [];
            vm.order.availableProducts = [];
            vm.addProducts();
            $rootScope.$apply();

            expect(shipmentViewLineItemFactory.createFrom).not.toHaveBeenCalled();
        });

        it('should create new line item', function() {
            selectProductsModalService.show.andReturn($q.resolve([
                availableProducts[0]
            ]));

            vm.stockCardSummaries = [
                new StockCardSummaryDataBuilder()
                    .withCanFulfillForMeEntry(
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(availableProducts[0])
                            .withLot(shipment.lineItems[0].lot)
                            .buildJson()
                    )
                    .buildJson()
            ];
            vm.order.availableProducts = availableProducts;
            vm.addProducts();
            $rootScope.$apply();

            expect(vm.tableLineItems.length).toEqual(3);
        });
    });
    // #264: ends here

    // #287: Warehouse clerk can skip some products in order
    describe('skipLineItems', function() {

        beforeEach(function() {
            vm.$onInit();

            var json = new ShipmentLineItemDataBuilder().buildJson();
            var shipmentLineItem = new ShipmentLineItem(json);

            vm.tableLineItems[0] = {
                productCode: 'C1',
                lineItems: [{
                    shipmentLineItem: shipmentLineItem,
                    skipped: false
                }],
                isMainGroup: true,
                skipped: false
            };
            vm.tableLineItems[1] = {
                productCode: 'C2',
                lineItems: [{
                    shipmentLineItem: ShipmentLineItem,
                    skipped: false
                }],
                isMainGroup: true,
                skipped: false
            };
        });

        it('should the lineItems skip status should be changed when change the shipmentViewLineItems ', function() {
            vm.skipAllLineItems();

            expect(vm.shipment.order.orderLineItems[0].skipped).toEqual(true);
            expect(vm.shipment.order.orderLineItems[1].skipped).toEqual(true);

            vm.unskipAllLineItems();

            expect(vm.shipment.order.orderLineItems[0].skipped).toEqual(false);
            expect(vm.shipment.order.orderLineItems[1].skipped).toEqual(false);
        });
    });
    // #287: ends here
});
