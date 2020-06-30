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

describe('ShipmentFactory', function() {

    // #332: save shipment draft
    var shipmentFactory, ShipmentFactory, stockCardRepositoryImplMock, $q, $rootScope,
        OrderDataBuilder, order, StockCardSummaryDataBuilder, CanFulfillForMeEntryDataBuilder,
        stockCardSummaries, OrderableDataBuilder, programServiceMock, programId, rightName;
    // #332: ends here

    beforeEach(function() {
        module('shipment-view', function($provide) {
            stockCardRepositoryImplMock = jasmine.createSpyObj('stockCardRepositoryImpl', [
                'query'
            ]);
            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return stockCardRepositoryImplMock;
                };
            });

            // #332: save shipment draft
            programServiceMock = jasmine.createSpyObj('programService', [
                'getAllProductsProgram'
            ]);
            $provide.factory('programService', function() {
                return programServiceMock;
            });
            // #332: ends here
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            ShipmentFactory = $injector.get('ShipmentFactory');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
        });

        shipmentFactory = new ShipmentFactory();

        order = new OrderDataBuilder().build();
        // #332: save shipment draft
        order.availableProducts = [
            {
                id: 'orderable-id-1'
            }, {
                id: 'orderable-id-2'
            }
        ];
        programId = 'all';
        rightName = 'STOCK_CARDS_VIEW';
        // #332: ends here

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
    });

    describe('buildFromOrder', function() {
        // #332: save shipment draft
        beforeEach(function() {
            programServiceMock.getAllProductsProgram.andReturn($q.resolve([{
                id: programId
            }]));
        });
        // #332: ends here

        it('should reject if stock card summary repository reject', function() {
            stockCardRepositoryImplMock.query.andReturn($q.reject());

            var rejected;
            shipmentFactory.buildFromOrder(order)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        // #332: save shipment draft
        it('should fetch stock card summaries for all line items', function() {
            stockCardRepositoryImplMock.query.andReturn($q.resolve());

            shipmentFactory.buildFromOrder(order);
            $rootScope.$apply();

            expect(stockCardRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: programId,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ],
                rightName: rightName
            });
        });
        // #332: ends here

        it('should create shipment with line items for each canFulfillForMe', function() {
            stockCardRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));

            var result;
            shipmentFactory.buildFromOrder(order)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0]).toEqual({
                orderable: {
                    id: stockCardSummaries[0].canFulfillForMe[0].orderable.id,
                    versionNumber: stockCardSummaries[0].canFulfillForMe[0].orderable.meta.versionNumber
                },
                lot: stockCardSummaries[0].canFulfillForMe[0].lot,
                quantityShipped: 0
            });

            expect(result.lineItems[1]).toEqual({
                orderable: {
                    id: stockCardSummaries[0].canFulfillForMe[1].orderable.id,
                    versionNumber: stockCardSummaries[0].canFulfillForMe[1].orderable.meta.versionNumber
                },
                lot: stockCardSummaries[0].canFulfillForMe[1].lot,
                quantityShipped: 0
            });

            expect(result.lineItems[2]).toEqual({
                orderable: {
                    id: stockCardSummaries[1].canFulfillForMe[0].orderable.id,
                    versionNumber: stockCardSummaries[1].canFulfillForMe[0].orderable.meta.versionNumber
                },
                lot: stockCardSummaries[1].canFulfillForMe[0].lot,
                quantityShipped: 0
            });

            expect(result.lineItems[3]).toEqual({
                orderable: {
                    id: stockCardSummaries[1].canFulfillForMe[1].orderable.id,
                    versionNumber: stockCardSummaries[1].canFulfillForMe[1].orderable.meta.versionNumber
                },
                lot: stockCardSummaries[1].canFulfillForMe[1].lot,
                quantityShipped: 0
            });
        });

    });

});