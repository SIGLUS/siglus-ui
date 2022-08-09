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

describe('orderableGroupService', function() {

    var $q, $rootScope, service, stockCardRepositoryMock, stockCardSummaries, siglusProductOrderableGroupService;

    beforeEach(function() {
        stockCardRepositoryMock = jasmine.createSpyObj('stockCardSummaryRepository', ['query']);
        module('stock-orderable-group', function($provide) {
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return stockCardRepositoryMock;
                };
            });
        });
        module('referencedata');
        module('referencedata-orderable');
        module('referencedata-lot');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            service = $injector.get('orderableGroupService');
            this.StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            this.CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            siglusProductOrderableGroupService = $injector.get('siglusProductOrderableGroupService');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
            this.OrderableChildrenDataBuilder = $injector.get('OrderableChildrenDataBuilder');
            this.OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });

        this.lot1 = new this.LotDataBuilder().build();

        this.item1 = {
            orderable: {
                id: 'a'
            },
            lot: this.lot1
        };
        this.item2 = {
            orderable: {
                id: 'a'
            }
        };
        this.item3 = {
            orderable: {
                id: 'b'
            }
        };

        this.kitConstituents = [
            new this.OrderableChildrenDataBuilder().withId('child_product_1_id')
                .withQuantity(30)
                .buildJson()
        ];
        this.orderable = new this.OrderableDataBuilder().withChildren(this.kitConstituents)
            .buildJson();
        this.kitOrderableGroup = new this.OrderableGroupDataBuilder().withOrderable(this.orderable)
            .build();
        this.orderableGroups = [
            new this.OrderableGroupDataBuilder().withOrderable(
                new this.OrderableDataBuilder().withChildren([])
                    .buildJson()
            )
                .build(),
            new this.OrderableGroupDataBuilder().withOrderable(this.orderable)
                .build()
        ];

    });

    it('should group items by orderable id', function() {
        //given
        var items = [this.item1, this.item2, this.item3];

        //when
        var groups = service.groupByOrderableId(items);

        //then
        expect(groups).toEqual([
            [this.item1, this.item2],
            [this.item3]
        ]);
    });

    it('should find item in group by lot', function() {
        //given
        var items = [this.item1, this.item2, this.item3];

        //when
        var found = service.findByLotInOrderableGroup(items, this.lot1);

        //then
        expect(found).toBe(this.item1);
    });

    it('should find item in group by NULL lot', function() {
        //given
        var items = [this.item1, this.item2, this.item3];

        //when
        var found = service.findByLotInOrderableGroup(items, null);

        //then
        expect(found).toBe(this.item2);
    });

    it('should find lots in orderable group', function() {
        //given
        var group = [this.item1, this.item2];

        //when
        var lots = service.lotsOf(group);

        //then
        expect(lots[0]).toEqual({
            lotCode: 'orderableGroupService.noLotDefined'
        });

        expect(lots[1]).toEqual(this.lot1);
        // #176: the expiry date is invalid
        // expect(lots[1].expirationDate.toString())
        //     .toEqual('Tue May 02 2017 05:59:51 GMT+0000 (Coordinated Universal Time)');
        // #176: ends here
    });

    it('should return kit only orderableGroups', function() {
        var item = service.getKitOnlyOrderablegroup(this.orderableGroups);

        expect(item).toEqual([this.orderableGroups.pop()]);

    });

    describe('findAvailableProductsAndCreateOrderableGroups', function() {
        var productGroups;
        beforeEach(function() {
            prepareStockCardSummaries(
                new this.StockCardSummaryDataBuilder().build(),
                new this.StockCardSummaryDataBuilder().build()
            );

            this.lots = [
                new this.LotDataBuilder().withTradeItemId('trade-item-id-1')
                    .build(),
                new this.LotDataBuilder().withTradeItemId('trade-item-id-2')
                    .build()
            ];
            productGroups = [
                [
                    {
                        lot: {
                            id: '40e1b14e-d56a-4483-bba9-a28830bba4eb',
                            lotCode: 'FAKE-LOTE-26B09-122017',
                            expirationDate: '2022-12-12'
                        },
                        occurredDate: '2022-08-01',
                        orderable: {
                            id: '7d598fb1-d511-46ff-9b53-bac560292138',
                            productCode: '26B09',
                            fullProductName: 'Kit de Emergengia -Interagency ' +
                              'Emergency Health Kit (Basic Unit); N/A; KIT'
                        },
                        processedDate: '2022-08-01T08:41:03.545Z',
                        stockCard: {
                            id: '73f2373e-f954-46d5-94de-6c9dc61d408f'
                        },
                        stockOnHand: 2
                    }
                ],
                [
                    {
                        lot: {
                            id: 'e2877242-1bcc-4eb6-9359-5f34c3ac0c75',
                            lotCode: 'SEM-LOTE-08A07-032021',
                            expirationDate: '2022-12-12'
                        },
                        occurredDate: '2021-11-23',
                        orderable: {
                            id: '23c078e5-d7de-4ee8-99d2-f8cece5ea2d4',
                            productCode: '08A07',
                            fullProductName: 'Amoxicilina trihidrato; 500mg; Caps'
                        },
                        processedDate: '2021-11-23T01:56:50.827Z',
                        stockCard: {
                            id: 'b4cf3b3a-35ef-444d-b2f7-587a6b3cd66f'
                        },
                        stockOnHand: 100
                    },
                    {
                        lot: {
                            id: '2324c8ea-a1f8-4b0c-946f-086cae42a32b',
                            lotCode: 'SEM-LOTE-08A07-062022-1',
                            expirationDate: '2022-12-12'
                        },
                        occurredDate: '2021-11-23',
                        orderable: {
                            id: '23c078e5-d7de-4ee8-99d2-f8cece5ea2d4',
                            productCode: '08A07',
                            fullProductName: 'Amoxicilina trihidrato; 500mg; Caps'
                        },
                        processedDate: '2021-11-23T01:56:50.827Z',
                        stockCard: {
                            id: '2a855e29-ea7c-4b65-8c75-912b835225da'
                        },
                        stockOnHand: 5000
                    }
                ]
            ];
            spyOn(siglusProductOrderableGroupService, 'getProductOrderableGroup').andReturn($q.resolve(productGroups));
        });

        it('should query stock card summaries', function() {
            service.findAvailableProductsAndCreateOrderableGroups('program-id', 'facility-id', false);

            expect(siglusProductOrderableGroupService.getProductOrderableGroup).toHaveBeenCalledWith({
                programId: 'program-id',
                facilityId: 'facility-id'
            });
        });

        it('should sort orderable group by productName', function() {
            var orderableGroups = findAvailableProductsAndCreateOrderableGroups(false);

            expect(orderableGroups).toEqual([
                [
                    {
                        lot: {
                            id: 'e2877242-1bcc-4eb6-9359-5f34c3ac0c75',
                            lotCode: 'SEM-LOTE-08A07-032021',
                            expirationDate: new Date('2022-12-12')
                        },
                        occurredDate: new Date('2021-11-23'),
                        orderable: {
                            id: '23c078e5-d7de-4ee8-99d2-f8cece5ea2d4',
                            productCode: '08A07',
                            fullProductName: 'Amoxicilina trihidrato; 500mg; Caps'
                        },
                        processedDate: '2021-11-23T01:56:50.827Z',
                        stockCard: {
                            id: 'b4cf3b3a-35ef-444d-b2f7-587a6b3cd66f'
                        },
                        stockOnHand: 100
                    },
                    {
                        lot: {
                            id: '2324c8ea-a1f8-4b0c-946f-086cae42a32b',
                            lotCode: 'SEM-LOTE-08A07-062022-1',
                            expirationDate: new Date('2022-12-12')
                        },
                        occurredDate: new Date('2021-11-23'),
                        orderable: {
                            id: '23c078e5-d7de-4ee8-99d2-f8cece5ea2d4',
                            productCode: '08A07',
                            fullProductName: 'Amoxicilina trihidrato; 500mg; Caps'
                        },
                        processedDate: '2021-11-23T01:56:50.827Z',
                        stockCard: {
                            id: '2a855e29-ea7c-4b65-8c75-912b835225da'
                        },
                        stockOnHand: 5000
                    }
                ],
                [
                    {
                        lot: {
                            id: '40e1b14e-d56a-4483-bba9-a28830bba4eb',
                            lotCode: 'FAKE-LOTE-26B09-122017',
                            expirationDate: new Date('2022-12-12')
                        },
                        occurredDate: new Date('2022-08-01'),
                        orderable: {
                            id: '7d598fb1-d511-46ff-9b53-bac560292138',
                            productCode: '26B09',
                            fullProductName: 'Kit de Emergengia -Interagency ' +
                              'Emergency Health Kit (Basic Unit); N/A; KIT'
                        },
                        processedDate: '2022-08-01T08:41:03.545Z',
                        stockCard: {
                            id: '73f2373e-f954-46d5-94de-6c9dc61d408f'
                        },
                        stockOnHand: 2
                    }
                ]
            ]);

        });

        it('should create orderable groups from approved products', function() {
            var orderableOne = new this.OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: 'trade-item-id-1'
                    })
                    .build(),
                orderableTwo = new this.OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: 'trade-item-id-2'
                    })
                    .build();

            var stockCardSummaryOne = new this.StockCardSummaryDataBuilder()
                .withOrderable(orderableOne)
                .withCanFulfillForMe([
                    new this.CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(orderableOne)
                        .buildJson(),
                    new this.CanFulfillForMeEntryDataBuilder()
                        .withLot(this.lots[0])
                        .withOrderable(orderableOne)
                        .buildJson()
                ])
                .build();
            var stockCardSummaryTwo = new this.StockCardSummaryDataBuilder()
                .withOrderable(orderableTwo)
                .withCanFulfillForMe([
                    new this.CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(orderableTwo)
                        .buildJson(),
                    new this.CanFulfillForMeEntryDataBuilder()
                        .withLot(this.lots[1])
                        .withOrderable(orderableTwo)
                        .buildJson()
                ])
                .build();
            prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo);

            var orderableGroups = findAvailableProductsAndCreateOrderableGroups(true);

            expect(orderableGroups.length).toBe(2);
            orderableGroupElementEqualsNoLot(orderableGroups[0][0], stockCardSummaryOne);
            orderableGroupElementEqualsNoLot(orderableGroups[1][0], stockCardSummaryTwo);
            orderableGroupElementEqualsWithLot(orderableGroups[0][1], stockCardSummaryOne, this.lots[0]);
            orderableGroupElementEqualsWithLot(orderableGroups[1][1], stockCardSummaryTwo, this.lots[1]);
        });

        function prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo) {
            stockCardSummaries = [
                stockCardSummaryOne,
                stockCardSummaryTwo
            ];
            stockCardRepositoryMock.query.andReturn($q.when({
                content: stockCardSummaries
            }));
        }

        function findAvailableProductsAndCreateOrderableGroups(includeApprovedProducts) {
            var orderableGroups;
            service
                .findAvailableProductsAndCreateOrderableGroups('program-id', 'facility-id', includeApprovedProducts)
                .then(function(response) {
                    orderableGroups = response;
                });
            $rootScope.$apply();
            return orderableGroups;
        }

        function orderableGroupElementEqualsNoLot(orderableGroupElement, expected) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toBe(null);
        }

        function orderableGroupElementEqualsWithLot(orderableGroupElement, expected, lot) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toEqual(lot);
        }

    });

});
