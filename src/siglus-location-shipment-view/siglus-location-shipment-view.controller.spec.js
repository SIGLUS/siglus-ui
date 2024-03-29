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

describe('SiglusLocationShipmentViewController', function() {
    var vm, $controller, $scope, $rootScope, $state, $q, SiglusLocationCommonUtilsService, suggestedQuatity;
    function prepareInjector() {

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $state = $injector.get('$state');
            $controller = $injector.get('$controller');
            SiglusLocationCommonUtilsService = $injector.get('SiglusLocationCommonUtilsService');
        });
    }

    function prepareSpies() {
        spyOn($state, 'go').andReturn($q.resolve());
    }

    function prepareData() {
        var order = {
            id: '0c4d80de-01c2-4a36-85e7-ce27c8b7b168',
            orderLineItems: [
                {
                    id: '0eb44dfd-ca40-499d-9e0b-5aa30b410349',
                    orderable: {
                        id: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                        productCode: '08I01',
                        fullProductName: 'Cotrimoxazol (Sulfametazol+Trimetoprim); 480mg; Comp',
                        netContent: 1,
                        isKit: false
                    },
                    orderedQuantity: 10,
                    partialFulfilledQuantity: 0,
                    skipped: false
                },
                {
                    added: true,
                    id: '8b8fd8bc-c16d-4429-8790-ef4fce013813',
                    orderable: {
                        id: '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a',
                        productCode: '26B02',
                        fullProductName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT',
                        netContent: 1,
                        isKit: true
                    },
                    orderedQuantity: 0,
                    partialFulfilledQuantity: 0,
                    skipped: true
                },
                {
                    id: '506eae2c-d320-45ab-b6fd-e1b2d10877a6',

                    orderable: {
                        id: '51d0e915-0b39-49b1-bb14-8999e9d90dad',
                        productCode: '08R01',
                        fullProductName: 'Aciclovir; 400mg; Comp',
                        netContent: 1,
                        isKit: false
                    },
                    orderedQuantity: 0,
                    partialFulfilledQuantity: 0,
                    skipped: true
                }
            ]
        };

        var stockCardSummaries = {};
        suggestedQuatity = {
            orderableIdToSuggestedQuantity: null,
            showSuggestedQuantity: true
        };
        vm = $controller('SiglusLocationShipmentViewController', {
            $scope: $scope,
            shipment: {},
            updatedOrder: {},
            stockCardSummaries: stockCardSummaries,
            displayTableLineItems: [],
            filterDisplayTableLineItems: [],
            order: order,
            locations: [],
            orderableLotsLocationMap: {
                'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa': {
                    '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a': [
                        {
                            locationId: 'AA25A',
                            locationCode: 'AA25A',
                            stockOnHand: 1000
                        },
                        {
                            locationId: 'AA25B',
                            locationCode: 'AA25B',
                            stockOnHand: 678
                        },
                        {
                            locationId: 'AA28B',
                            locationCode: 'AA28B',
                            stockOnHand: 256
                        }
                    ],
                    '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c': [
                        {
                            locationId: 'AA25A',
                            locationCode: 'AA25A',
                            stockOnHand: 1000
                        }
                    ],
                    '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e89': [
                        {
                            locationId: 'AA28B',
                            locationCode: 'AA28B',
                            stockOnHand: 8000
                        }
                    ],
                    '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e67': [
                        {
                            locationId: 'AA28B',
                            locationCode: 'AA28B',
                            stockOnHand: 8000
                        }
                    ]
                },
                '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a': {
                    undefined: [
                        {
                            locationId: 'AA28B',
                            locationCode: 'AA28B'
                        }
                    ]
                },
                '51d0e915-0b39-49b1-bb14-8999e9d90dad': {
                    '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e90': [
                        {
                            locationId: 'AA23C',
                            locationCode: 'AA23C',
                            stockOnHand: 356
                        }
                    ],
                    '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e98': [
                        {
                            locationId: 'AA35C',
                            locationCode: 'AA35C',
                            stockOnHand: 232
                        }
                    ]
                }
            },
            orderableLocationLotsMap: {
                'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa': {
                    AA25A: [
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            expirationDate: '2022-08-25',
                            stockOnHand: 1000
                        },
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                            lotCode: 'SEM-LOTE-07A03-09082022-2',
                            expirationDate: '2022-08-09',
                            stockOnHand: 1000
                        }
                    ],
                    AA25B: [
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            expirationDate: '2022-08-25',
                            stockOnHand: 678
                        },
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e89',
                            lotCode: 'SEM-LOTE-07A03-17082022-4',
                            expirationDate: '2022-08-17',
                            stockOnHand: 8000
                        }
                    ],
                    AA28B: [
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            expirationDate: '2022-08-25',
                            stockOnHand: 256
                        },
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e67',
                            lotCode: 'SEM-LOTE-07A03-17082023-4',
                            expirationDate: '2023-08-17',
                            stockOnHand: 8000
                        }
                    ]
                },
                '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a': {
                    AA28B: [
                        {
                            stockOnHand: 333
                        }
                    ],
                    AA23C: [
                        {
                            stockOnHand: 567
                        }
                    ]
                },
                '51d0e915-0b39-49b1-bb14-8999e9d90dad': {
                    AA23C: [
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e90',
                            lotCode: 'SEM-LOTE-08R01-052023-3',
                            expirationDate: '2023-06-26',
                            stockOnHand: 356
                        }
                    ],
                    AA35C: [
                        {
                            id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e98',
                            lotCode: 'SEM-LOTE-08R01-072023-3',
                            expirationDate: '2023-07-18',
                            stockOnHand: 232
                        }
                    ]
                }
            },
            facility: {
                id: 'asdfafds-123123djks-123123dafkfs'
            },
            suggestedQuatity: suggestedQuatity
        });
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-print-pallet-label');
        module('siglus-print-pallet-label-comfirm-modal');
        module('siglus-location-shipment-view');
        module('siglus-location-shipment');
        module('requisition-template');
        module('shipment-view');
        module('siglus-requisition-initiate-history');
        module('openlmis-array-decorator');
        module('siglus-alert-confirm-modal');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('onInit', function() {
        it('should init method be called correctly', function() {
            vm.$onInit();

            expect(vm.order).toEqual({});
        });

    });

    describe('addLot method', function() {
        it('should add two rows when group has only one row', function() {
            var lineItem = {
                $error: {
                    lotCodeError: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                productCode: '08I01',
                productName: 'Cotrimoxazol (Sulfametazol+Trimetoprim); 480mg; Comp',
                id: '29a53a4b-d725-47e8-959e-3e127c3348e0',
                isKit: false,
                lineItems: [],
                location: null,
                lot: null,
                isMainGroup: true,
                shipmentLineItem: {
                    id: '29a53a4b-d725-47e8-959e-3e127c3348e0',
                    orderable: {
                        id: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                        href: 'http://dev.siglus.us.internal/api/orderables/e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                        versionNumber: 3
                    },
                    lot: {
                        id: '721af237-29d3-461b-abe1-99a18993410f',
                        href: 'http://dev.siglus.us.internal/api/lots/721af237-29d3-461b-abe1-99a18993410f'
                    },
                    quantityShipped: null,
                    stockOnHand: 196
                },
                netContent: 1,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                $$hashKey: 'object:228'
            };
            var lineItems = [
                lineItem
            ];

            vm.addLot(lineItem, lineItems);

            expect(lineItems.length).toEqual(3);
            expect(lineItems[0].isMainGroup).toEqual(true);
            expect(lineItems[1].isMainGroup).toBeUndefined();
            expect(lineItems[2].isMainGroup).toBeUndefined();
        });
    });

    describe('changeLot method', function() {
        it('it should return openlmisForm.required error when clear lot', function() {
            var lineItem = {
                $error: {
                    lotCodeError: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: false,
                location: null,
                lot: null,
                isMainGroup: true,
                netContent: 1,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [
                lineItem
            ];

            vm.changeLot(lineItem, lineItems, 0);

            expect(lineItem.$error.lotCodeError).toEqual('openlmisForm.required');

        });

        it('it return when select lot is not first to expire', function() {
            var lineItem = {
                $error: {
                    lotCodeError: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: false,
                location: null,
                lot: {
                    lotCode: 'code1',
                    expirationDate: '3098-04-25'
                },
                isMainGroup: true,
                netContent: 1,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItem1 = {
                $error: {
                    lotCodeError: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: false,
                location: null,
                lot: {
                    lotCode: 'code2',
                    expirationDate: '3096-04-25'
                },
                isMainGroup: true,
                netContent: 1,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [
                lineItem,
                lineItem1
            ];

            spyOn(SiglusLocationCommonUtilsService, 'getLotList').andReturn([
                {
                    lotCode: 'code2',
                    expirationDate: '3096-04-25'
                },
                {
                    lotCode: 'code1',
                    expirationDate: '3098-04-25'
                }
            ]);

            vm.changeLot(lineItem, lineItems, 0);

            expect(lineItem.$hint.lotCodeHint).toEqual('locationShipmentView.notFirstToExpire');

        });
    });

    describe('changeLocation method', function() {
        var lineItem;
        beforeEach(function() {
            lineItem = {
                $error: {
                    lotCodeError: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: true,
                location: null,
                lot: null,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
        });

        it('should return openlmisForm.required when product change lot is null', function() {
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.locationError).toEqual('openlmisForm.required');
        });

        it('should validate location duplicate when product is kit', function() {
            lineItem.isKit = true;
            lineItem.location = {
                locationCode: 'AA01'
            };
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.locationError).toEqual('locationShipmentView.locationDuplicated');
        });

        it('should return quantityShippedError openlmisForm.required when location has changed', function() {
            lineItem.isKit = true;
            lineItem.location = {
                locationCode: 'AA01'
            };
            lineItem.shipmentLineItem = {
                quantityShipped: null
            };
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.quantityShippedError).toEqual('locationShipmentView.inputPositiveNumber');
        });

        it('should return quantityShippedError when quantity shipped is more than soh', function() {
            lineItem.isKit = true;
            lineItem.orderableId = '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a';
            lineItem.location = {
                locationCode: 'AA28B'
            };
            lineItem.quantityShipped = 334;
            lineItem.reservedStock = 0;
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.quantityShippedError).toEqual('shipment.fillQuantityCannotExceedStockOnHand');
        });

        it('should return emtpy string when quantity shipped is less than soh', function() {
            lineItem.isKit = true;
            lineItem.orderableId = '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a';
            lineItem.location = {
                locationCode: 'AA28B'
            };
            lineItem.lot = {
                lotCode: 'lotCode'
            };
            lineItem.quantityShipped = 332;
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            spyOn(SiglusLocationCommonUtilsService, 'getOrderableLocationLotsMap').andReturn({
                '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a': {
                    AA28B: [{
                        stockOnHand: 333
                    }]
                }
            });

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.quantityShippedError).toEqual('');
        });

        it('should validate current line item required error when change location and location is null', function() {
            lineItem.isKit = false;
            lineItem.orderableId = '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a';
            lineItem.location = null,
            lineItem.lot = {
                lotCode: 'lotCode'
            };
            lineItem.quantityShipped = 334;
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.locationError).toEqual('openlmisForm.required');
        });

        it('should validate current line item required error when change location and lot is null', function() {
            lineItem.isKit = false;
            lineItem.orderableId = '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a';
            lineItem.location = {
                locationCode: 'AA035'
            };
            lineItem.lot = null;
            lineItem.quantityShipped = 334;
            var lineItems = [
                lineItem
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$error.lotCodeError).toEqual('openlmisForm.required');
        });

    });

    describe('removeItem method', function() {
        var lineItem;
        beforeEach(function() {
            lineItem = {
                $error: {
                    lotCodeError: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: true,
                location: null,
                lot: null,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
        });

        it('should rm all product when current product is manual added', function() {
            var lineItems = [
                lineItem
            ];

            vm.order = {
                orderLineItems: []
            };
            vm.removeItem(lineItems, 0);

            expect(lineItems.length).toEqual(0);
        });

        it('should rm current item when product list is more than 3', function() {
            var lineItems = [
                lineItem,
                _.clone(lineItem),
                _.clone(lineItem),
                _.clone(lineItem)
            ];

            vm.removeItem(lineItems, 2);

            expect(lineItems.length).toEqual(3);
        });

        it('should rm current item when product list length is equal 3', function() {
            var lineItem2 = _.clone(lineItem);
            lineItem2.lot = {
                lotCode: 'test lot code'
            };
            var lineItems = [
                lineItem,
                _.clone(lineItem),
                lineItem2
            ];

            vm.removeItem(lineItems, 1);

            expect(lineItems.length).toEqual(1);
            expect(lineItems[0].lot.lotCode).toEqual('test lot code');
        });
    });

    describe('getOrderQuantity method', function() {
        it('should calculate order quantity when current index is 0', function() {
            var lineItems = [
                {
                    orderedQuantity: 0
                },
                {
                    orderedQuantity: 3
                },
                {
                    orderedQuantity: 5
                }
            ];

            expect(vm.getOrderQuantity(lineItems, 0)).toEqual(8);
        });

        it('should return current order quantity when current index is not 0', function() {
            var lineItems = [
                {
                    orderedQuantity: 0
                },
                {
                    orderedQuantity: 3
                },
                {
                    orderedQuantity: 5
                }
            ];

            expect(vm.getOrderQuantity(lineItems, 1)).toEqual(3);
        });
    });

    describe('getFillQuantity method', function() {
        it('should get FillQuantityquantity when current index is 0', function() {
            var lineItems = [
                {
                    orderedQuantity: 0
                },
                {
                    orderedQuantity: 3
                },
                {
                    orderedQuantity: 5
                }
            ];

            expect(vm.getOrderQuantity(lineItems, 0)).toEqual(8);
        });

        it('should return current order quantity when current index is not 0', function() {
            var lineItems = [
                {
                    orderedQuantity: 0
                },
                {
                    orderedQuantity: 3
                },
                {
                    orderedQuantity: 5
                }
            ];

            expect(vm.getOrderQuantity(lineItems, 2)).toEqual(5);
        });
    });

    describe('getAvailableSoh method', function() {

        it('should return sum availableSoh when current index is 0', function() {
            var lineItems = [
                {
                    quantityShipped: 0,
                    location: null,
                    lot: null,
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
                },
                {
                    quantityShipped: 0,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                        lotCode: 'SEM-LOTE-07A03-2508022-1',
                        expirationDate: '2022-08-25'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
                },
                {
                    quantityShipped: 0,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                        lotCode: 'SEM-LOTE-07A03-09082022-2',
                        expirationDate: '2022-08-09'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
                }
            ];

            spyOn(SiglusLocationCommonUtilsService, 'getOrderableLocationLotsMap').andReturn({
                'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa': {
                    AA25A: [
                        {
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            stockOnHand: 1000
                        },
                        {
                            lotCode: 'SEM-LOTE-07A03-09082022-2',
                            stockOnHand: 1000
                        }
                    ]
                }
            });

            expect(vm.getAvailableSoh(lineItems, 0)).toEqual(2000);
        });

        it('should return availableSoh quantity when current index is not 0', function() {
            var lineItems = [
                {
                    quantityShipped: 0,
                    location: null,
                    lot: null,
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
                },
                {
                    quantityShipped: 0,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                        lotCode: 'SEM-LOTE-07A03-2508022-1',
                        expirationDate: '2022-08-25'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
                },
                {
                    quantityShipped: 0,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                        lotCode: 'SEM-LOTE-07A03-09082022-2',
                        expirationDate: '2022-08-09'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
                }
            ];

            spyOn(SiglusLocationCommonUtilsService, 'getOrderableLocationLotsMap').andReturn({
                'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa': {
                    AA25A: [
                        {
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            stockOnHand: 1000
                        }
                    ]
                }
            });

            expect(vm.getAvailableSoh(lineItems, 1)).toEqual(1000);
        });
    });

    describe('getRemainingSoh method', function() {
        // TODO: add ut to test with reservedStock

        it('should return sum remaining soh when current index is 0 and result is less than 0', function() {
            var lineItems = [
                {
                    quantityShipped: 0,
                    location: null,
                    lot: null,
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                },
                {
                    quantityShipped: 1200,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                        lotCode: 'SEM-LOTE-07A03-2508022-1',
                        expirationDate: '2022-08-25'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                },
                {
                    quantityShipped: 1000,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                        lotCode: 'SEM-LOTE-07A03-09082022-2',
                        expirationDate: '2022-08-09'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                }
            ];

            expect(vm.getRemainingSoh(lineItems, 0)).toEqual(0);
        });

        it('should return sum remaining soh when current index is 0 and result is more than 0 ', function() {
            var lineItems = [
                {

                    quantityShipped: 0,
                    location: null,
                    lot: null,
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                },
                {
                    quantityShipped: 800,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                        lotCode: 'SEM-LOTE-07A03-2508022-1',
                        expirationDate: '2022-08-25'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                },
                {
                    quantityShipped: 1000,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                        lotCode: 'SEM-LOTE-07A03-09082022-2',
                        expirationDate: '2022-08-09'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                }
            ];

            spyOn(SiglusLocationCommonUtilsService, 'getOrderableLocationLotsMap').andReturn({
                'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa': {
                    AA25A: [
                        {
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            stockOnHand: 2000
                        }
                    ]
                }
            });

            expect(vm.getRemainingSoh(lineItems, 0)).toEqual(200);
        });

        it('should return availableSoh quantity when current index is not 0', function() {
            var lineItems = [
                {
                    quantityShipped: 0,
                    location: null,
                    lot: null,
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                },
                {
                    quantityShipped: 900,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                        lotCode: 'SEM-LOTE-07A03-2508022-1',
                        expirationDate: '2022-08-25'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                },
                {
                    quantityShipped: 900,
                    location: {
                        locationCode: 'AA25A'
                    },
                    lot: {
                        id: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                        lotCode: 'SEM-LOTE-07A03-09082022-2',
                        expirationDate: '2022-08-09'
                    },
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                    reservedStock: 0
                }
            ];

            spyOn(SiglusLocationCommonUtilsService, 'getOrderableLocationLotsMap').andReturn({
                'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa': {
                    AA25A: [
                        {
                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                            stockOnHand: 1000
                        }
                    ]
                }
            });

            expect(vm.getRemainingSoh(lineItems, 1)).toEqual(100);
        });
    });

    describe('skipAllLineItems method', function() {

        it('should set skipped to true when lineItem is not checked', function() {
            vm.order = {
                orderLinItems: []
            };
            vm.shipment = {
                order: {
                    orderLineItems: [{
                        orderable: {
                            orderableId: '0001',
                            productCode: 'A0001'
                        }

                    }]
                }
            };
            vm.displayTableLineItems = [
                [
                    {
                        orderableId: '0001',
                        productCode: 'A0001',
                        productName: 'product 1',
                        quantityShipped: 0
                    }
                ]
            ];

            vm.skipAllLineItems();

            expect(vm.displayTableLineItems[0][0].skipped).toEqual(true);
        });
    });

    describe('unskipAllLineItems method', function() {

        it('should set skipped to false  when lineItem is checked', function() {
            vm.order = {
                orderLinItems: []
            };
            vm.shipment = {
                order: {
                    orderLineItems: [{
                        orderable: {
                            orderableId: '0001',
                            productCode: 'A0001'
                        },
                        skipped: false

                    }]
                }
            };
            vm.displayTableLineItems = [
                [
                    {
                        orderableId: '0001',
                        productCode: 'A0001',
                        productName: 'product 1',
                        shipmentLineItem: {
                            quantityShipped: 0
                        },
                        skipped: false
                    }
                ]
            ];

            vm.skipAllLineItems();

            expect(vm.displayTableLineItems[0][0].skipped).toEqual(true);
        });
    });

    describe('isEmptyRow method', function() {
        it('should display no data row when lineItem has no location list and product is kit', function() {
            var lineItem = {
                productName: 'Kit',
                isKit: true
            };

            expect(vm.isEmptyRow(lineItem, [lineItem], 0)).toEqual(true);
        });

        it('should display no data row when lineItem has no location list and product is not kit', function() {
            var lineItem = {
                productName: 'Kit',
                isKit: false,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                location: {
                    locationCode: 'AB08C'
                }
            };

            expect(vm.isEmptyRow(lineItem, [lineItem], 0)).toEqual(true);
        });

    });
});
