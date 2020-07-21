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

describe('ShipmentRepositoryImpl', function() {

    // #287: add siglusShipmentDraftResourceMock, siglusOrderResourceMock, siglusShipmentResourceMock
    var ShipmentRepositoryImpl, shipmentRepositoryImpl, ShipmentDataBuilder, OrderResponseDataBuilder,
        shipment, shipmentResourceMock, orderResourceMock, $q, $rootScope, order,
        stockCardSummaryRepositoryImplMock, StockCardSummaryDataBuilder, ShipmentLineItemDataBuilder,
        CanFulfillForMeEntryDataBuilder, stockCardSummaries, shipmentDraftResourceMock, siglusShipmentDraftResourceMock,
        siglusShipmentResourceMock, rightName, programId, programServiceMock;
    // #287: ends here

    beforeEach(function() {
        module('shipment', function($provide) {
            shipmentResourceMock = jasmine.createSpyObj('shipmentResource', [
                'create', 'get', 'query'
            ]);
            $provide.factory('ShipmentResource', function() {
                return function() {
                    return shipmentResourceMock;
                };
            });

            shipmentDraftResourceMock = jasmine.createSpyObj('shipmentDraftResource', [
                'create', 'update', 'query'
            ]);
            $provide.factory('ShipmentDraftResource', function() {
                return function() {
                    return shipmentDraftResourceMock;
                };
            });

            // #287: Warehouse clerk can skip some products in order
            siglusShipmentDraftResourceMock = jasmine.createSpyObj('siglusShipmentDraftResource', [
                'update'
            ]);
            $provide.factory('SiglusShipmentDraftResource', function() {
                return function() {
                    return siglusShipmentDraftResourceMock;
                };
            });

            $provide.factory('SiglusOrderResource', function() {
                return function() {
                    return orderResourceMock;
                };
            });

            siglusShipmentResourceMock = jasmine.createSpyObj('siglusShipmentResource', [
                'create', 'get', 'query'
            ]);
            $provide.factory('SiglusShipmentResource', function() {
                return function() {
                    return siglusShipmentResourceMock;
                };
            });
            // #287: ends here

            // #332: save shipment draft
            programServiceMock = jasmine.createSpyObj('programService', [
                'getAllProductsProgram'
            ]);
            $provide.factory('programService', function() {
                return programServiceMock;
            });
            rightName = 'STOCK_CARDS_VIEW';
            programId = 'id';
            // #332: ends here

            orderResourceMock = jasmine.createSpyObj('orderResource', [
                'get'
            ]);
            $provide.factory('OrderResource', function() {
                return function() {
                    return orderResourceMock;
                };
            });

            stockCardSummaryRepositoryImplMock = jasmine.createSpyObj(
                'stockCardSummaryRepositoryImpl', [
                    'query'
                ]
            );
            $provide.factory('StockCardSummaryRepositoryImpl', function() {
                return function() {
                    return stockCardSummaryRepositoryImplMock;
                };
            });
        });

        inject(function($injector) {
            ShipmentRepositoryImpl = $injector.get('ShipmentRepositoryImpl');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            OrderResponseDataBuilder = $injector.get('OrderResponseDataBuilder');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            ShipmentLineItemDataBuilder = $injector.get('ShipmentLineItemDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
        });

        shipmentRepositoryImpl = new ShipmentRepositoryImpl();

        shipment = new ShipmentDataBuilder()
            .withLineItems([
                new ShipmentLineItemDataBuilder().buildJson(),
                new ShipmentLineItemDataBuilder()
                    .withoutLot()
                    .buildJson()
            ])
            .build();

        stockCardSummaries = [
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMeEntry(
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(shipment.lineItems[0].orderable)
                        .withLot(shipment.lineItems[0].lot)
                        .buildJson()
                )
                .buildJson(),
            new StockCardSummaryDataBuilder()
                .withCanFulfillForMeEntry(
                    new CanFulfillForMeEntryDataBuilder()
                        .withOrderable(shipment.lineItems[1].orderable)
                        .withLot(shipment.lineItems[1].lot)
                        .buildJson()
                )
                .buildJson()
        ];

        order = {
            order: new OrderResponseDataBuilder().build(),
            availableProducts: [
                {
                    id: 'orderable-id-7'
                }, {
                    id: 'orderable-id-8'
                }
            ]
        };
    });

    describe('create', function() {

        // #287: Warehouse clerk can skip some products in order
        it('should reject if save was unsuccessful', function() {
            siglusShipmentResourceMock.create.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.create(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(siglusShipmentResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).not.toHaveBeenCalled();
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch order', function() {
            siglusShipmentResourceMock.create.andReturn($q.resolve(shipment));
            orderResourceMock.get.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.create(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(siglusShipmentResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch stock card summaries', function() {
            siglusShipmentResourceMock.create.andReturn($q.resolve(shipment));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());
            programServiceMock.getAllProductsProgram.andReturn($q.resolve([{
                id: programId
            }]));

            var rejected;
            shipmentRepositoryImpl.create(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            order = order.order;

            expect(rejected).toBe(true);
            expect(siglusShipmentResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: programId,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ],
                rightName: rightName
            });
        });

        it('should return combined responses', function() {
            siglusShipmentResourceMock.create.andReturn($q.resolve(angular.copy(shipment)));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));
            programServiceMock.getAllProductsProgram.andReturn($q.resolve([{
                id: programId
            }]));

            var result;
            shipmentRepositoryImpl.create(shipment)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            order = order.order;

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(siglusShipmentResourceMock.create).toHaveBeenCalledWith(shipment);
            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: programId,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ],
                rightName: rightName
            });

        });
        // #287: ends here

    });

    describe('createDraft', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentDraftResourceMock.create.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.createDraft(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
            // #372: Improving Fulfilling Order performance
            // expect(orderResourceMock.get).not.toHaveBeenCalled();
            // expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        // it('should reject if could not fetch order', function() {
        //     shipmentDraftResourceMock.create.andReturn($q.resolve(shipment));
        //     orderResourceMock.get.andReturn($q.reject());
        //
        //     var rejected;
        //     shipmentRepositoryImpl.createDraft(shipment)
        //         .catch(function() {
        //             rejected = true;
        //         });
        //     $rootScope.$apply();
        //
        //     expect(rejected).toBe(true);
        //     expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
        //     expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
        //     expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        // });

        // it('should reject if could not fetch stock card summaries', function() {
        //     shipmentDraftResourceMock.create.andReturn($q.resolve(shipment));
        //     orderResourceMock.get.andReturn($q.resolve(order));
        //     stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());
        //
        //     var rejected;
        //     shipmentRepositoryImpl.createDraft(shipment)
        //         .catch(function() {
        //             rejected = true;
        //         });
        //     $rootScope.$apply();
        //
        //     expect(rejected).toBe(true);
        //     expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
        //     expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
        //     expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
        //         programId: order.program.id,
        //         facilityId: order.supplyingFacility.id,
        //         orderableId: [
        //             order.orderLineItems[0].orderable.id,
        //             order.orderLineItems[1].orderable.id
        //         ]
        //     });
        // });

        it('should return combined responses', function() {
            shipmentDraftResourceMock.create.andReturn($q.resolve(angular.copy(shipment)));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));

            var result;
            shipmentRepositoryImpl.createDraft(shipment, order, stockCardSummaries)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentDraftResourceMock.create).toHaveBeenCalledWith(shipment);
            // expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            // expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
            //     programId: order.program.id,
            //     facilityId: order.supplyingFacility.id,
            //     orderableId: [
            //         order.orderLineItems[0].orderable.id,
            //         order.orderLineItems[1].orderable.id
            //     ]
            // });

        });
        // #372: ends here

    });

    describe('updateDraft', function() {

        // #287: Warehouse clerk can skip some products in order
        it('should reject if save was unsuccessful', function() {
            siglusShipmentDraftResourceMock.update.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.updateDraft(shipment)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(siglusShipmentDraftResourceMock.update).toHaveBeenCalledWith(shipment);
        });

        it('should resolve if update was successful', function() {
            siglusShipmentDraftResourceMock.update.andReturn($q.resolve(shipment));

            var result;
            shipmentRepositoryImpl.updateDraft(shipment)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toEqual(shipment);
            expect(siglusShipmentDraftResourceMock.update).toHaveBeenCalledWith(shipment);
        });
        // #287: ends here

    });

    describe('getByOrderId', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentResourceMock.query.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).not.toHaveBeenCalled();
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        it('should reject if could not fetch order', function() {
            shipmentResourceMock.query.andReturn($q.resolve({
                content: [shipment]
            }));
            orderResourceMock.get.andReturn($q.reject());

            var rejected;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        // #332: save shipment draft
        it('should reject if could not fetch stock card summaries', function() {
            shipmentResourceMock.query.andReturn($q.resolve({
                content: [shipment]
            }));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());
            programServiceMock.getAllProductsProgram.andReturn($q.resolve([{
                id: programId
            }]));

            var rejected;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            order = order.order;

            expect(rejected).toBe(true);
            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
                programId: programId,
                facilityId: order.supplyingFacility.id,
                orderableId: [
                    order.orderLineItems[0].orderable.id,
                    order.orderLineItems[1].orderable.id
                ],
                rightName: rightName
            });
        });

        it('should return combined responses', function() {
            shipmentResourceMock.query.andReturn($q.resolve(angular.copy({
                content: [shipment]
            })));
            orderResourceMock.get.andReturn($q.resolve(order));
            stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
                content: stockCardSummaries
            }));
            programServiceMock.getAllProductsProgram.andReturn($q.resolve([{
                id: programId
            }]));

            var result;
            shipmentRepositoryImpl.getByOrderId(shipment.order.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            order = order.order;

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentResourceMock.query).toHaveBeenCalledWith({
                orderId: shipment.order.id
            });

            expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
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

    });

    describe('getDraftByOrderId', function() {

        it('should reject if save was unsuccessful', function() {
            shipmentDraftResourceMock.query.andReturn($q.reject());

            var rejected;
            // #372: Improving Fulfilling Order performance
            shipmentRepositoryImpl.getDraftByOrderId(order, stockCardSummaries)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
                orderId: order.id
            });

            // expect(orderResourceMock.get).not.toHaveBeenCalled();
            // expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        });

        // it('should reject if could not fetch order', function() {
        //     shipmentDraftResourceMock.query.andReturn($q.resolve({
        //         content: [shipment]
        //     }));
        //     orderResourceMock.get.andReturn($q.reject());
        //
        //     var rejected;
        //     shipmentRepositoryImpl.getDraftByOrderId(shipment.order.id)
        //         .catch(function() {
        //             rejected = true;
        //         });
        //     $rootScope.$apply();
        //
        //     expect(rejected).toBe(true);
        //     expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
        //         orderId: shipment.order.id
        //     });
        //
        //     expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
        //     expect(stockCardSummaryRepositoryImplMock.query).not.toHaveBeenCalled();
        // });

        // it('should reject if could not fetch stock card summaries', function() {
        //     shipmentDraftResourceMock.query.andReturn($q.resolve({
        //         content: [shipment]
        //     }));
        //     orderResourceMock.get.andReturn($q.resolve(order));
        //     stockCardSummaryRepositoryImplMock.query.andReturn($q.reject());
        //
        //     var rejected;
        //     shipmentRepositoryImpl.getDraftByOrderId(shipment.order.id)
        //         .catch(function() {
        //             rejected = true;
        //         });
        //     $rootScope.$apply();
        //
        //     expect(rejected).toBe(true);
        //     expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
        //         orderId: shipment.order.id
        //     });
        //
        //     expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
        //     expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
        //         programId: order.program.id,
        //         facilityId: order.supplyingFacility.id,
        //         orderableId: [
        //             order.orderLineItems[0].orderable.id,
        //             order.orderLineItems[1].orderable.id
        //         ]
        //     });
        // });

        it('should return combined responses', function() {
            shipmentDraftResourceMock.query.andReturn($q.resolve(angular.copy({
                content: [shipment]
            })));
            // orderResourceMock.get.andReturn($q.resolve(order));
            // stockCardSummaryRepositoryImplMock.query.andReturn($q.resolve({
            //     content: stockCardSummaries
            // }));

            var result;
            shipmentRepositoryImpl.getDraftByOrderId(order, stockCardSummaries)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result.order).toEqual(order);
            expect(result.lineItems[0].canFulfillForMe)
                .toEqual(stockCardSummaries[0].canFulfillForMe[1]);

            expect(result.lineItems[1].canFulfillForMe)
                .toEqual(stockCardSummaries[1].canFulfillForMe[1]);

            expect(shipmentDraftResourceMock.query).toHaveBeenCalledWith({
                orderId: order.id
            });

            // expect(orderResourceMock.get).toHaveBeenCalledWith(shipment.order.id);
            // expect(stockCardSummaryRepositoryImplMock.query).toHaveBeenCalledWith({
            //     programId: order.program.id,
            //     facilityId: order.supplyingFacility.id,
            //     orderableId: [
            //         order.orderLineItems[0].orderable.id,
            //         order.orderLineItems[1].orderable.id
            //     ]
            // });

        });
        // #372: ends here

    });

});
