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

describe('ShipmentRepository', function() {

    var ShipmentRepository, shipmentRepository, shipmentRepositoryImplMock, ShipmentDataBuilder,
        ShipmentMock, shipmentJson, $q, shipmentResponse, shipment, $rootScope, Shipment,
        // #372: Improving Fulfilling Order performance
        OrderDataBuilder, StockCardSummaryDataBuilder, CanFulfillForMeEntryDataBuilder, OrderableDataBuilder, order,
        stockCardSummaries;
    // #372: ends here

    beforeEach(function() {
        module('shipment', function($provide) {
            shipmentRepositoryImplMock = jasmine.createSpyObj('shipmentRepositoryImpl', [
                'createDraft', 'updateDraft', 'getDraftByOrderId', 'getByOrderId'
            ]);
            $provide.factory('ShipmentRepositoryImpl', function() {
                return function() {
                    return shipmentRepositoryImplMock;
                };
            });

            ShipmentMock = jasmine.createSpy('Shipment');
            $provide.factory('Shipment', function() {
                return ShipmentMock;
            });
        });

        inject(function($injector) {
            ShipmentRepository = $injector.get('ShipmentRepository');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            Shipment = $injector.get('Shipment');
            // #372: Improving Fulfilling Order performance
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            // #372: ends here
        });

        shipmentRepository = new ShipmentRepository();

        var shipmentBuilder = new ShipmentDataBuilder();
        shipmentJson = shipmentBuilder.buildJson();
        shipmentResponse = shipmentBuilder.buildResponse();
        shipment = shipmentBuilder.build();

        // #372: Improving Fulfilling Order performance
        order = new OrderDataBuilder().build();

        stockCardSummaries = [
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder()
                            .withId(order.orderLineItems[0].orderable.id)
                            .build())
                        .buildJson(),
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder()
                            .withId(order.orderLineItems[0].orderable.id)
                            .build())
                        .buildJson()
                ])
                .build(),
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder()
                            .withId(order.orderLineItems[0].orderable.id)
                            .build())
                        .buildJson(),
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(new OrderableDataBuilder()
                            .withId(order.orderLineItems[0].orderable.id)
                            .build())
                        .buildJson()
                ])
                .build()
        ];
        // #372: ends here
    });

    describe('createDraft', function() {

        it('should return a shipment', function() {
            shipmentRepositoryImplMock.createDraft.andReturn($q.resolve(shipmentJson));
            ShipmentMock.andReturn(shipment);

            var result;
            // #372: Improving Fulfilling Order performance
            shipmentRepository.createDraft(shipmentResponse, order, stockCardSummaries)
            // #372: ends here
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toBe(shipment);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryImplMock.createDraft).toHaveBeenCalledWith(shipmentResponse, order,
                stockCardSummaries);
            // #372: ends here
        });

        it('should reject if implementation rejects', function() {
            shipmentRepositoryImplMock.createDraft.andReturn($q.reject());

            var rejected;
            // #372: Improving Fulfilling Order performance
            shipmentRepository.createDraft(shipmentResponse, order, stockCardSummaries)
            // #372: ends here
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryImplMock.createDraft).toHaveBeenCalledWith(shipmentResponse, order,
                stockCardSummaries);
            // #372: ends here
        });

    });

    describe('getByOrderId', function() {

        it('should return a shipment', function() {
            shipmentRepositoryImplMock.getByOrderId.andReturn($q.resolve(shipmentJson));
            ShipmentMock.andReturn(shipment);

            var result;
            shipmentRepository.getByOrderId(shipmentJson.order.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toBe(shipment);
            expect(shipmentRepositoryImplMock.getByOrderId).toHaveBeenCalledWith(shipmentJson.order.id);
        });

        it('should reject if implementation rejects', function() {
            shipmentRepositoryImplMock.getByOrderId.andReturn($q.reject());

            var rejected;
            shipmentRepository.getByOrderId(shipmentJson.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentRepositoryImplMock.getByOrderId).toHaveBeenCalledWith(shipmentJson.order.id);
        });

    });

    describe('getDraftByOrderId', function() {

        it('should return a shipment', function() {
            shipmentRepositoryImplMock.getDraftByOrderId.andReturn($q.resolve(shipmentJson));
            ShipmentMock.andReturn(shipment);

            var result;
            // #372: Improving Fulfilling Order performance
            shipmentRepository.getDraftByOrderId(order, stockCardSummaries)
            // #372: ends here
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryImplMock.getDraftByOrderId).toHaveBeenCalledWith(order, stockCardSummaries);
            // #372: ends here
        });

        it('should return an instance of the Shipment class', function() {
            shipmentRepositoryImplMock.getDraftByOrderId.andReturn($q.resolve(shipmentJson));
            ShipmentMock.andReturn(shipment);

            var result;
            // #372: Improving Fulfilling Order performance
            shipmentRepository.getDraftByOrderId(order, stockCardSummaries)
            // #372: ends here
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result instanceof Shipment).toBe(true);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryImplMock.getDraftByOrderId).toHaveBeenCalledWith(order, stockCardSummaries);
            // #372: ends here
        });

        it('should reject if implementation rejects', function() {
            shipmentRepositoryImplMock.getDraftByOrderId.andReturn($q.reject());

            var rejected;
            // #372: Improving Fulfilling Order performance
            shipmentRepository.getDraftByOrderId(order, stockCardSummaries)
            // #372: ends here
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            // #372: Improving Fulfilling Order performance
            expect(shipmentRepositoryImplMock.getDraftByOrderId).toHaveBeenCalledWith(order, stockCardSummaries);
            // #372: ends here
        });

    });

    describe('updateDraft', function() {

        it('should resolve if update was successful', function() {
            shipmentRepositoryImplMock.updateDraft.andReturn($q.resolve(shipmentJson));
            ShipmentMock.andReturn(shipment);

            var resolved;
            shipmentRepository.updateDraft(shipmentResponse)
                .then(function() {
                    resolved = true;
                });
            $rootScope.$apply();

            expect(resolved).toEqual(true);
            expect(shipmentRepositoryImplMock.updateDraft).toHaveBeenCalledWith(shipmentResponse);
        });

        it('should reject if implementation rejects', function() {
            shipmentRepositoryImplMock.updateDraft.andReturn($q.reject());

            var rejected;
            shipmentRepository.updateDraft(shipmentResponse)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentRepositoryImplMock.updateDraft).toHaveBeenCalledWith(shipmentResponse);
        });

    });

});