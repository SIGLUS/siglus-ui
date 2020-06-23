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

    var vm, $q, $controller, ShipmentDataBuilder, shipment, tableLineItems, OrderDataBuilder, fulfillmentUrlFactory,
        QUANTITY_UNIT, order, messageService, $window, $rootScope,
        // #264: warehouse clerk can add product to orders
        selectProductsModalService, alertService, OrderableDataBuilder, availableProducts, ShipmentViewLineItemFactory,
        shipmentViewLineItemFactory, orderService;
        // #264: ends here

    beforeEach(function() {
        module('shipment-view');
        // #264: warehouse clerk can add product to orders
        module('openlmis-array-decorator');
        // #264: ends here
        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            QUANTITY_UNIT = $injector.get('QUANTITY_UNIT');
            messageService = $injector.get('messageService');
            $window = $injector.get('$window');
            $rootScope = $injector.get('$rootScope');
            fulfillmentUrlFactory = $injector.get('fulfillmentUrlFactory');
            // #264: warehouse clerk can add product to orders
            selectProductsModalService = $injector.get('selectProductsModalService');
            alertService = $injector.get('alertService');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            ShipmentViewLineItemFactory = $injector.get('ShipmentViewLineItemFactory');
            shipmentViewLineItemFactory = new ShipmentViewLineItemFactory();
            orderService = $injector.get('orderService');
            // #264: ends here
        });

        shipment = new ShipmentDataBuilder().build();
        order = new OrderDataBuilder().build();
        tableLineItems = [{}, {}];

        // #264: warehouse clerk can add product to orders
        vm = $controller('ShipmentViewController', {
            shipment: shipment,
            tableLineItems: tableLineItems,
            updatedOrder: order,
            stockCardSummaries: []
        });

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
            spyOn(shipment, 'save').andReturn($q.resolve(shipment));

            document = jasmine.createSpyObj('document', ['write']);

            popup = {
                document: document,
                location: {}
            };

            spyOn(messageService, 'get').andReturn('Saving and printing');
            spyOn($window, 'open').andReturn(popup);
        });

        it('should show information when saving shipment', function() {
            vm.printShipment();

            expect($window.open).toHaveBeenCalledWith('', '_blank');
            expect(document.write).toHaveBeenCalledWith('Saving and printing');
            expect(messageService.get).toHaveBeenCalledWith('shipmentView.saveDraftPending');
        });

        it('should print shipment after it was saved', function() {
            vm.printShipment();

            expect(popup.location.href).toBeUndefined();

            $rootScope.$apply();

            expect(popup.location.href)
                .toEqual(fulfillmentUrlFactory('/api/reports/templates/common/583ccc35-88b7-48a8-9193-6c4857d3ff60/' +
                    'pdf?shipmentDraftId=' + shipment.id));
        });

    });

    // #264: warehouse clerk can add product to orders
    describe('addProducts', function() {

        beforeEach(function() {
            vm.$onInit();

            spyOn(alertService, 'error');
            spyOn(selectProductsModalService, 'show');
            spyOn(orderService, 'getOrderableLineItem');
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

            vm.order.orderLineItems = [];
            vm.order.availableProducts = availableProducts;
            vm.addProducts();
            $rootScope.$apply();

            expect(orderService.getOrderableLineItem).toHaveBeenCalledWith(
                vm.order.id,
                [availableProducts[0].id]
            );
        });
    });
    // #264: ends here

});