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

describe('SiglusLocationMovementCreationController', function() {

    var vm, facility, programs, $controller, $q, loadingModalService;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            $q = $injector.get('$q');
        });
    }

    function prepareSpies() {
        spyOn(loadingModalService, 'open').andReturn($q.resolve());
        spyOn(loadingModalService, 'close').andReturn($q.resolve());
    }

    function prepareData() {
        vm = $controller('SiglusLocationMovementCreationController', {
            facility: facility,
            programs: programs,
            draftInfo: {},
            user: {},
            orderableGroups: [],
            areaLocationInfo: [],
            addedLineItems: [],
            displayItems: [],
            locations: []
        });
    }

    beforeEach(function() {

        module('openlmis-table-form');
        module('siglus-location-movement');
        module('siglus-alert-confirm-modal');
        module('siglus-location-movement-creation');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('vm.showEmptyBlock method', function() {
        it('should show empty block when lineItems length is eq 1 and current index is 0', function() {
            var lineItem = {
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001'
            };
            var lineItems = [
                lineItem,
                lineItem
            ];

            expect(vm.showEmptyBlock(lineItem, lineItems, 0)).toEqual(true);
        });

        it('should show empty block when lineItems length is mt 1 and current index is 0', function() {
            var lineItem = {
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001'
            };
            var lineItems = [
                lineItem,
                lineItem
            ];

            expect(vm.showEmptyBlock(lineItem, lineItems, 0)).toEqual(true);
            expect(vm.showEmptyBlock(lineItem, lineItems, 1)).toEqual(false);
        });
    });

    describe('getTotalQuantity method', function() {
        it('should return sum of quantity when lineItems has two row', function() {
            var lineItem = {
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001',
                quantity: 100
            };
            var lineItem1 = _.clone(lineItem);
            lineItem1.quantity = null;
            var lineItems = [
                lineItem,
                lineItem1
            ];

            expect(vm.getTotalQuantity(lineItems)).toEqual(100);
        });
    });

    describe('changeLot method', function() {
        it('should return required error info when clear selected lot', function() {
            var lineItem = {
                $error: {},
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001',
                quantity: 100
            };
            var lineItems = [
                lineItem
            ];
            vm.changeLot(lineItem, lineItems);

            expect(lineItem.$error.lotCodeError).toEqual('openlmisForm.required');
            expect(lineItem.stockOnHand).toEqual(0);
        });

        it('should emit stock on hand  when selected lot and location', function() {
            var lineItem = {
                $error: {},
                isKit: false,
                lot: {
                    stockOnHand: 100
                },
                location: {
                    locationCode: 'AA025'
                },
                orderableId: 'A00001',
                quantity: null
            };
            var lineItems = [
                lineItem
            ];
            vm.changeLot(lineItem, lineItems);

            expect(lineItem.$error.quantityError).toEqual('openlmisForm.required');
        });

        it('should validate soh mt quantity', function() {
            var lineItem = {
                $error: {},
                isKit: false,
                lot: {
                    stockOnHand: 100
                },
                location: {
                    locationCode: 'AA025'
                },
                orderableId: 'A00001',
                quantity: 120
            };
            var lineItems = [
                lineItem
            ];
            vm.changeLot(lineItem, lineItems);

            expect(lineItem.$error.quantityError).toEqual('locationMovement.mtSoh');
        });

        it('should return locationMovement.mtSoh when has duplicated rows and total quantity exceeds stock on hand',
            function() {
                var lineItem = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 100
                };

                var lineItem1 = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 100
                };

                var lineItems = [
                    lineItem,
                    lineItem1
                ];
                vm.changeLot(lineItem, lineItems);

                expect(lineItem.$error.quantityError).toEqual('locationMovement.mtSoh');
            });

        it('should has not error when has duplicated rows and total quantity lt stock on hand',
            function() {
                var lineItem = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 80
                };

                var lineItem1 = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 20
                };

                var lineItems = [
                    lineItem,
                    lineItem1
                ];
                vm.changeLot(lineItem, lineItems);

                expect(lineItem.$error.quantityError).toEqual('');
            });
    });

    describe('changeLocation method', function() {
        it('should return required error info when clear selected lot', function() {
            var lineItem = {
                $error: {},
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001',
                quantity: 100
            };
            var lineItems = [
                lineItem
            ];
            vm.changeLocation(lineItem, lineItems);

            expect(lineItem.$error.locationError).toEqual('openlmisForm.required');
            expect(lineItem.stockOnHand).toEqual(0);
        });

        it('should emit stock on hand  when selected lot and location', function() {
            var lineItem = {
                $error: {},
                isKit: false,
                lot: {
                    stockOnHand: 100
                },
                location: {
                    locationCode: 'AA025'
                },
                orderableId: 'A00001',
                quantity: null
            };
            var lineItems = [
                lineItem
            ];
            vm.changeLot(lineItem, lineItems);

            expect(lineItem.$error.quantityError).toEqual('openlmisForm.required');
        });

        it('should validate soh mt quantity', function() {
            var lineItem = {
                $error: {},
                isKit: false,
                lot: {
                    stockOnHand: 100
                },
                location: {
                    locationCode: 'AA025'
                },
                orderableId: 'A00001',
                quantity: 120
            };
            var lineItems = [
                lineItem
            ];
            vm.changeLot(lineItem, lineItems);

            expect(lineItem.$error.quantityError).toEqual('locationMovement.mtSoh');
        });

        it('should return locationMovement.mtSoh when has duplicated rows and total quantity exceeds stock on hand',
            function() {
                var lineItem = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 100
                };

                var lineItem1 = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 100
                };

                var lineItems = [
                    lineItem,
                    lineItem1
                ];
                vm.changeLot(lineItem, lineItems);

                expect(lineItem.$error.quantityError).toEqual('locationMovement.mtSoh');
            });

        it('should has not error when has duplicated rows and total quantity lt stock on hand',
            function() {
                var lineItem = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 80
                };

                var lineItem1 = {
                    $error: {},
                    isKit: false,
                    lot: {
                        lotCode: 'LTE-202208-01',
                        stockOnHand: 100
                    },
                    location: {
                        locationCode: 'AA025'
                    },
                    orderableId: 'A00001',
                    quantity: 20
                };

                var lineItems = [
                    lineItem,
                    lineItem1
                ];
                vm.changeLot(lineItem, lineItems);

                expect(lineItem.$error.quantityError).toEqual('');
            });
    });

    describe('changeArea method', function() {
        it('should return sum of quantity when lineItems has two row', function() {
            var lineItem = {
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001',
                quantity: 100
            };
            var lineItem1 = _.clone(lineItem);
            lineItem1.quantity = null;
            var lineItems = [
                lineItem,
                lineItem1
            ];

            expect(vm.getTotalQuantity(lineItems)).toEqual(100);
        });
    });

});
