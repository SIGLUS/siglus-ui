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

describe('ShipmentViewReport', function() {
    var vm, $controller, $scope, $rootScope, $state, $q, SiglusLocationCommonUtilsService;
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

        vm = $controller('ShipmentViewReport', {
            $scope: $scope,
            shipment: {},
            updatedOrder: {},
            stockCardSummaries: stockCardSummaries,
            displayTableLineItems: [],
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
            }
        });
    }

    beforeEach(function() {
        module('siglus-location-shipment-view');
        module('siglus-location-shipment');
        module('requisition-template');
        module('shipment-view');
        module('shipment-view-report');
        module('siglus-requisition-initiate-history');
        module('openlmis-array-decorator');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('getFillQuantity method', function() {
        it('should get FillQuantityquantity when current index is 0', function() {
            var lineItems = [
                {
                    orderQuantity: 0
                },
                {
                    orderQuantity: 3
                },
                {
                    orderQuantity: 5
                }
            ];

            expect(vm.getFillQuantity(lineItems, 0)).toEqual(0);
        });

        it('should return current order quantity when current index is not 0', function() {
            var lineItems = [
                {
                    orderQuantity: 0
                },
                {
                    orderQuantity: 3
                },
                {
                    orderQuantity: 5
                }
            ];

            expect(vm.getFillQuantity(lineItems, 2)).toEqual(0);
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

        it('should return sum remaining soh when current index is 0 and result is lt 0', function() {
            var lineItems = [
                {
                    quantityShipped: 0,
                    location: null,
                    lot: null,
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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
                    orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
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

            expect(vm.getRemainingSoh(lineItems, 1)).toEqual(100);
        });
    });
});
