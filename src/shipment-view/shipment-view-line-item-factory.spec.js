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

describe('ShipmentViewLineItemFactory', function() {

    var shipmentViewLineItemFactory, ShipmentViewLineItemFactory, OrderableDataBuilder,
        LotDataBuilder, OrderLineItemDataBuilder, OrderDataBuilder, ShipmentDataBuilder,
        ShipmentLineItemDataBuilder, StockCardSummaryDataBuilder, ShipmentViewLineItem,
        ShipmentViewLineItemGroup, CanFulfillForMeEntryDataBuilder, StockCardDataBuilder,
        commodityTypeOne, commodityTypeTwo, tradeItemOne, tradeItemTwo, tradeItemThree,
        tradeItemFour,  lotOne, lotTwo, lotThree, lotFour, shipment, summaries;

    beforeEach(function() {
        module('shipment-view');

        inject(function($injector) {
            ShipmentViewLineItemFactory = $injector.get('ShipmentViewLineItemFactory');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            OrderLineItemDataBuilder = $injector.get('OrderLineItemDataBuilder');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            ShipmentDataBuilder = $injector.get('ShipmentDataBuilder');
            ShipmentLineItemDataBuilder = $injector.get('ShipmentLineItemDataBuilder');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            ShipmentViewLineItem = $injector.get('ShipmentViewLineItem');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            ShipmentViewLineItemGroup = $injector.get('ShipmentViewLineItemGroup');
            StockCardDataBuilder = $injector.get('StockCardDataBuilder');
        });

        shipmentViewLineItemFactory = new ShipmentViewLineItemFactory();

        commodityTypeOne = new OrderableDataBuilder().buildJson();
        commodityTypeTwo = new OrderableDataBuilder().buildJson();

        tradeItemOne = new OrderableDataBuilder()
            .withNetContent(1)
            .buildJson();

        tradeItemTwo = new OrderableDataBuilder().buildJson();
        tradeItemThree = new OrderableDataBuilder().buildJson();
        tradeItemFour = new OrderableDataBuilder().buildJson();

        lotOne = new LotDataBuilder().build();
        lotTwo = new LotDataBuilder().build();
        lotThree = new LotDataBuilder().build();
        lotFour = new LotDataBuilder().build();
    });

    describe('buildFrom', function() {

        it('should build a ShipmentViewLineItem for generic orderable', function() {
            commodityTypeOne = new OrderableDataBuilder()
                .withProductCode('PC101')
                .withFullProductName('Full product name')
                .withNetContent(150)
                .buildJson();

            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build()
                        ])
                        .build()
                )
                .withLineItems([
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(commodityTypeOne)
                        .withoutLot()
                        .buildJson()
                ])
                .build();

            summaries = [
                new StockCardSummaryDataBuilder()
                    .forGenericOrderable(commodityTypeOne)
                    .buildJson()
            ];

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result.length).toEqual(1);
            expect(result[0] instanceof ShipmentViewLineItem).toBe(true);
            expect(result[0].productCode).toEqual('PC101');
            expect(result[0].productName).toEqual('Full product name');
            expect(result[0].netContent).toEqual(150);
            expect(result[0].lot).toBeUndefined();
            expect(result[0].vvmStatus).toBeUndefined();
            expect(result[0].shipmentLineItem).toEqual(shipment.lineItems[0]);
            expect(result[0].isLot).toEqual(true);
        });

        it('should ignore entries without shipment line items', function() {
            summaries = [
                new StockCardSummaryDataBuilder()
                    .withOrderable(commodityTypeOne)
                    .withCanFulfillForMe([
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withoutLot()
                            .withStockOnHand(145)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemTwo)
                            .buildJson()

                    ])
                    .buildJson()
            ];

            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build()
                        ])
                        .build()
                )
                .withLineItems([
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withoutLot()
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[0])
                        .buildJson()
                ])
                .build();

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result[0].lineItems.length).toBe(0);
            //expect(result[1].productCode).not.toEqual(tradeItemTwo.productCode);
            // expect(result[1].productName).not.toEqual(tradeItemTwo.fullProductName);
        });

        it('should build a group if order can be fulfilled by multiple lot-less trade items', function() {
            summaries = [
                new StockCardSummaryDataBuilder()
                    .withOrderable(commodityTypeOne)
                    .withCanFulfillForMe([
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withoutLot()
                            .withStockOnHand(150)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemTwo)
                            .withoutLot()
                            .withStockOnHand(150)
                            .buildJson()

                    ])
                    .buildJson(),
                new StockCardSummaryDataBuilder()
                    .withOrderable(commodityTypeTwo)
                    .withCanFulfillForMe([
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemThree)
                            .withoutLot()
                            .withStockOnHand(150)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemFour)
                            .withoutLot()
                            .withStockOnHand(150)
                            .buildJson()

                    ])
                    .buildJson()
            ];

            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build(),
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeTwo)
                                .build()
                        ])
                        .build()
                )
                .withLineItems([
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withoutLot()
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[0])
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemTwo)
                        .withoutLot()
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[1])
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemThree)
                        .withoutLot()
                        .withCanFulfillForMe(summaries[1].canFulfillForMe[0])
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemFour)
                        .withoutLot()
                        .withCanFulfillForMe(summaries[1].canFulfillForMe[1])
                        .buildJson()
                ])
                .build();

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result.length).toBe(2);

            expect(result[0] instanceof ShipmentViewLineItemGroup).toBe(true);
            expect(result[0].productCode).toEqual(commodityTypeOne.productCode);
            expect(result[0].productName).toEqual(commodityTypeOne.fullProductName);
            expect(result[0].orderQuantity).toEqual(shipment.order.orderLineItems[0].orderedQuantity);
            expect(result[0].netContent).toEqual(commodityTypeOne.netContent);
            expect(result[0].isMainGroup).toEqual(true);
            expect(result[0].lineItems.length).toBe(0);

            expect(result[1] instanceof ShipmentViewLineItem).toBe(false);
            // expect(result[1].productCode).toEqual(tradeItemOne.productCode);
            // expect(result[1].productName).toEqual(tradeItemOne.fullProductName);
            expect(result[1].lot).toBe(undefined);
            expect(result[1].vvmStatus).toBeUndefined();
            // expect(result[1].shipmentLineItem).toEqual(shipment.lineItems[0]);
            // expect(result[1].netContent).toEqual(tradeItemOne.netContent);
            expect(result[1].isLot).toEqual(false);

            expect(result[2] instanceof ShipmentViewLineItem).toBe(false);
            // expect(result[2].productCode).toEqual(tradeItemTwo.productCode);
            //expect(result[2].productName).toEqual(tradeItemTwo.fullProductName);
            // expect(result[2].lot).toBe(null);
            // expect(result[2].vvmStatus).toBeUndefined();
            // expect(result[2].shipmentLineItem).toEqual(shipment.lineItems[1]);
            // expect(result[2].netContent).toEqual(tradeItemTwo.netContent);
            // expect(result[2].isLot).toEqual(true);

            // expect(result[3] instanceof ShipmentViewLineItemGroup).toBe(true);
            // expect(result[3].productCode).toEqual(commodityTypeTwo.productCode);
            // expect(result[3].productName).toEqual(commodityTypeTwo.fullProductName);
            // expect(result[3].orderQuantity).toEqual(shipment.order.orderLineItems[1].orderedQuantity);
            // expect(result[3].netContent).toEqual(commodityTypeTwo.netContent);
            // expect(result[3].isMainGroup).toEqual(true);
            // expect(result[3].lineItems.length).toBe(2);

            // expect(result[4] instanceof ShipmentViewLineItem).toBe(true);
            // expect(result[4].productCode).toEqual(tradeItemThree.productCode);
            // expect(result[4].productName).toEqual(tradeItemThree.fullProductName);
            // expect(result[4].lot).toBe(null);
            // expect(result[4].vvmStatus).toBeUndefined();
            // expect(result[4].shipmentLineItem).toEqual(shipment.lineItems[2]);
            // expect(result[4].netContent).toEqual(tradeItemThree.netContent);
            // expect(result[4].isLot).toEqual(true);

            // expect(result[5] instanceof ShipmentViewLineItem).toBe(true);
            // expect(result[5].productCode).toEqual(tradeItemFour.productCode);
            // expect(result[5].productName).toEqual(tradeItemFour.fullProductName);
            // expect(result[5].lot).toBe(null);
            // expect(result[5].vvmStatus).toBeUndefined();
            // expect(result[5].shipmentLineItem).toEqual(shipment.lineItems[3]);
            // expect(result[5].netContent).toEqual(tradeItemFour.netContent);
            // expect(result[5].isLot).toEqual(true);
        });

        it('should create empty group if summary is not available', function() {
            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build(),
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeTwo)
                                .build()
                        ])
                        .build()
                )
                .withoutLineItems()
                .build();

            summaries = [];

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result.length).toBe(2);

            expect(result[0] instanceof ShipmentViewLineItemGroup).toBe(true);
            expect(result[0].productCode).toEqual(commodityTypeOne.productCode);
            expect(result[0].productName).toEqual(commodityTypeOne.fullProductName);
            expect(result[0].orderQuantity).toEqual(shipment.order.orderLineItems[0].orderedQuantity);
            expect(result[0].netContent).toEqual(commodityTypeOne.netContent);
            expect(result[0].isMainGroup).toEqual(true);
            expect(result[0].lineItems.length).toBe(0);

            expect(result[1] instanceof ShipmentViewLineItemGroup).toBe(true);
            expect(result[1].productCode).toEqual(commodityTypeTwo.productCode);
            expect(result[1].productName).toEqual(commodityTypeTwo.fullProductName);
            expect(result[1].orderQuantity).toEqual(shipment.order.orderLineItems[1].orderedQuantity);
            expect(result[1].netContent).toEqual(commodityTypeTwo.netContent);
            expect(result[1].isMainGroup).toEqual(true);
            expect(result[1].lineItems.length).toBe(0);
        });

        it('should group lots by trade items', function() {
            summaries = [
                new StockCardSummaryDataBuilder()
                    .withOrderable(commodityTypeOne)
                    .withCanFulfillForMe([
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(150)
                            .withLot(lotOne)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(150)
                            .withLot(lotTwo)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemTwo)
                            .withStockOnHand(150)
                            .withLot(lotThree)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemTwo)
                            .withStockOnHand(150)
                            .withLot(lotFour)
                            .buildJson()

                    ])
                    .buildJson()
            ];

            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build()
                        ])
                        .build()
                )
                .withLineItems([
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[0])
                        .withLot(lotOne)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[1])
                        .withLot(lotTwo)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemTwo)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[2])
                        .withLot(lotThree)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[3])
                        .withOrderable(tradeItemTwo)
                        .withLot(lotFour)
                        .buildJson()
                ])
                .build();

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result.length).toEqual(7);
            expect(result[0] instanceof ShipmentViewLineItemGroup).toBe(true);
            expect(result[0].productCode).toEqual(commodityTypeOne.productCode);
            expect(result[0].productName).toEqual(commodityTypeOne.fullProductName);
            expect(result[0].orderQuantity).toEqual(shipment.order.orderLineItems[0].orderedQuantity);
            expect(result[0].netContent).toEqual(commodityTypeOne.netContent);
            expect(result[0].isMainGroup).toEqual(true);
            expect(result[0].lineItems.length).toBe(2);

            expect(result[1] instanceof ShipmentViewLineItemGroup).toBe(true);
            expect(result[1].productCode).toEqual(tradeItemOne.productCode);
            expect(result[1].productName).toEqual(tradeItemOne.fullProductName);
            expect(result[1].orderQuantity).toBeUndefined();
            expect(result[1].netContent).toEqual(tradeItemOne.netContent);
            expect(result[1].isMainGroup).toBeFalsy();
            expect(result[1].lineItems.length).toBe(2);

            expect(result[2] instanceof ShipmentViewLineItem).toBe(true);
            expect(result[2].productCode).toBeUndefined();
            expect(result[2].productName).toBeUndefined();
            expect(result[2].lot).toEqual(lotOne);
            expect(result[2].vvmStatus).toBeUndefined();
            expect(result[2].shipmentLineItem).toEqual(shipment.lineItems[0]);
            expect(result[2].netContent).toEqual(tradeItemOne.netContent);
            expect(result[2].isLot).toEqual(true);

            expect(result[3] instanceof ShipmentViewLineItem).toBe(true);
            expect(result[3].productCode).toBeUndefined();
            expect(result[3].productName).toBeUndefined();
            expect(result[3].lot).toEqual(lotTwo);
            expect(result[3].vvmStatus).toBeUndefined();
            expect(result[3].shipmentLineItem).toEqual(shipment.lineItems[1]);
            expect(result[3].netContent).toEqual(tradeItemOne.netContent);
            expect(result[3].isLot).toEqual(true);

            expect(result[4] instanceof ShipmentViewLineItemGroup).toBe(true);
            expect(result[4].productCode).toEqual(tradeItemTwo.productCode);
            expect(result[4].productName).toEqual(tradeItemTwo.fullProductName);
            expect(result[4].orderQuantity).toBeUndefined();
            expect(result[4].netContent).toEqual(tradeItemTwo.netContent);
            expect(result[4].isMainGroup).toBeFalsy();
            expect(result[4].lineItems.length).toBe(2);

            expect(result[5] instanceof ShipmentViewLineItem).toBe(true);
            expect(result[5].productCode).toBeUndefined();
            expect(result[5].productName).toBeUndefined();
            expect(result[5].lot).toEqual(lotThree);
            expect(result[5].vvmStatus).toBeUndefined();
            expect(result[5].shipmentLineItem).toEqual(shipment.lineItems[2]);
            expect(result[5].netContent).toEqual(tradeItemTwo.netContent);
            expect(result[5].isLot).toEqual(true);

            expect(result[6] instanceof ShipmentViewLineItem).toBe(true);
            expect(result[6].productCode).toBeUndefined();
            expect(result[6].productName).toBeUndefined();
            expect(result[6].lot).toEqual(lotFour);
            expect(result[6].vvmStatus).toBeUndefined();
            expect(result[6].shipmentLineItem).toEqual(shipment.lineItems[3]);
            expect(result[6].netContent).toEqual(tradeItemTwo.netContent);
            expect(result[6].isLot).toEqual(true);
        });

        it('should keep structure after flattening', function() {
            summaries = [
                new StockCardSummaryDataBuilder()
                    .withOrderable(commodityTypeOne)
                    .withCanFulfillForMe([
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(150)
                            .withLot(lotOne)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(150)
                            .withLot(lotTwo)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemTwo)
                            .withStockOnHand(150)
                            .withLot(lotThree)
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemTwo)
                            .withStockOnHand(150)
                            .withLot(lotFour)
                            .buildJson()

                    ])
                    .buildJson()
            ];

            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build()
                        ])
                        .build()
                )
                .withLineItems([
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[0])
                        .withLot(lotOne)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[1])
                        .withLot(lotTwo)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemTwo)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[2])
                        .withLot(lotThree)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[3])
                        .withOrderable(tradeItemTwo)
                        .withLot(lotFour)
                        .buildJson()
                ])
                .build();

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result[0].lineItems).toEqual([
                result[1],
                result[4]
            ]);

            expect(result[1].lineItems).toEqual([
                result[2],
                result[3]
            ]);

            expect(result[4].lineItems).toEqual([
                result[5],
                result[6]
            ]);
        });

        it('should sort lot line items', function() {
            summaries = [
                new StockCardSummaryDataBuilder()
                    .withOrderable(commodityTypeOne)
                    .withCanFulfillForMe([
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(20)
                            .withLot(
                                new LotDataBuilder()
                                    .withExpirationDate('2088-06-21T05:59:51.993Z')
                                    .build()
                            )
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_1'
                                    })
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(40)
                            .withLot(
                                new LotDataBuilder()
                                    .withExpirationDate('2089-05-20T05:59:51.993Z')
                                    .build()
                            )
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_2'
                                    })
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(30)
                            .withLot(
                                new LotDataBuilder()
                                    .withExpirationDate('2090-06-21T05:59:51.993Z')
                                    .build()
                            )
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_1'
                                    })
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(75)
                            .withLot(
                                new LotDataBuilder()
                                    .withExpirationDate('2091-06-21T05:59:51.993Z')
                                    .build()
                            )
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_1'
                                    })
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(150)
                            .withLot(
                                new LotDataBuilder()
                                    .withExpirationDate('2092-05-02T05:59:51.993Z')
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(10)
                            .withLot(
                                new LotDataBuilder()
                                    .withExpirationDate('2093-06-21T05:59:51.993Z')
                                    .build()
                            )
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_1'
                                    })
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(13)
                            .withLot(
                                new LotDataBuilder()
                                    .withoutExpirationDate()
                                    .build()
                            )
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_1'
                                    })
                                    .build()
                            )
                            .buildJson(),
                        new CanFulfillForMeEntryDataBuilder()
                            .withOrderable(tradeItemOne)
                            .withStockOnHand(25)
                            .withLot(undefined)
                            .withStockCard(
                                new StockCardDataBuilder()
                                    .withExtraData({
                                        vvmStatus: 'STAGE_1'
                                    })
                                    .build()
                            )
                            .buildJson()
                    ])
                    .buildJson()
            ];

            shipment = new ShipmentDataBuilder()
                .withOrder(
                    new OrderDataBuilder()
                        .withOrderLineItems([
                            new OrderLineItemDataBuilder()
                                .withOrderable(commodityTypeOne)
                                .build()
                        ])
                        .build()
                )
                .withLineItems([
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[2])
                        .withLot(summaries[0].canFulfillForMe[2].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[0])
                        .withLot(summaries[0].canFulfillForMe[0].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[1])
                        .withLot(summaries[0].canFulfillForMe[1].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[4])
                        .withLot(summaries[0].canFulfillForMe[4].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[3])
                        .withLot(summaries[0].canFulfillForMe[3].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[5])
                        .withLot(summaries[0].canFulfillForMe[5].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[6])
                        .withLot(summaries[0].canFulfillForMe[6].lot)
                        .buildJson(),
                    new ShipmentLineItemDataBuilder()
                        .withOrderable(tradeItemOne)
                        .withCanFulfillForMe(summaries[0].canFulfillForMe[7])
                        .withLot(summaries[0].canFulfillForMe[7].lot)
                        .buildJson()
                ])
                .build();

            var result = shipmentViewLineItemFactory.createFrom(shipment, summaries);

            expect(result[2].vvmStatus).toEqual('STAGE_2');
            expect(result[2].lot).toEqual({
                id: 'lot-id-6',
                lotCode: 'L6',
                expirationDate: '2089-05-20T05:59:51.993Z',
                manufactureDate: null,
                tradeItemId: null,
                active: true
            });

            expect(result[2].shipmentLineItem.stockOnHand).toEqual(40);

            expect(result[3].vvmStatus).toEqual('STAGE_1');
            // expect(result[3].lot.expirationDate).toEqual('2089-05-20T05:59:51.993Z');
            expect(result[3].shipmentLineItem.stockOnHand).toEqual(13);

            expect(result[4].vvmStatus).toEqual('STAGE_1');
            expect(result[4].lot.expirationDate).toEqual('2088-06-21T05:59:51.993Z');
            expect(result[4].shipmentLineItem.stockOnHand).toEqual(20);

            expect(result[5].vvmStatus).toEqual('STAGE_1');
            expect(result[5].lot.expirationDate).toEqual('2090-06-21T05:59:51.993Z');
            expect(result[5].shipmentLineItem.stockOnHand).toEqual(30);

            expect(result[6].vvmStatus).toEqual('STAGE_1');
            expect(result[6].lot.expirationDate).toEqual('2091-06-21T05:59:51.993Z');
            expect(result[6].shipmentLineItem.stockOnHand).toEqual(75);

            expect(result[7].vvmStatus).toEqual('STAGE_1');
            expect(result[7].lot.expirationDate).toEqual('2093-06-21T05:59:51.993Z');
            expect(result[7].shipmentLineItem.stockOnHand).toEqual(10);

            expect(result[8].vvmStatus).toBeUndefined();
            expect(result[8].lot.expirationDate).toEqual('2092-05-02T05:59:51.993Z');
            expect(result[8].shipmentLineItem.stockOnHand).toEqual(150);

            // expect(result[9].vvmStatus).toBeUndefined();
            //expect(result[9].lot.expirationDate).toEqual('2092-05-02T05:59:51.993Z');
            //expect(result[9].shipmentLineItem.stockOnHand).toEqual(150);
        });

    });
});