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

describe('siglusLocationReceiveCreationController', function() {

    var vm, loadingModalService, $controller, $q, $rootScope, $scope,
        alertService, $state, siglusSignatureWithDateModalService;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            alertService = $injector.get('alertService');
            loadingModalService = $injector.get('loadingModalService');
            siglusSignatureWithDateModalService = $injector.get('siglusSignatureWithDateModalService');
            $state = $injector.get('$state');
            $scope = $rootScope.$new();
            $q = $injector.get('$q');
        });
    }

    function prepareSpies() {
        spyOn(alertService, 'error').andReturn($q.resolve());
        spyOn(loadingModalService, 'open').andReturn($q.resolve());
        spyOn(loadingModalService, 'close').andReturn($q.resolve());
        spyOn(siglusSignatureWithDateModalService, 'confirm').andReturn($q.resolve());
        spyOn($state, 'go').andReturn();
    }

    function prepareData() {
        vm = $controller('siglusLocationReceiveCreationController', {
            $scope: $scope,
            draftInfo: {},
            facility: {},
            reasons: [],
            initialDraftInfo: {},
            locations: [],
            addedLineItems: [],
            productList: [],
            displayItems: [],
            isMerge: true,
            areaLocationInfo: [],
            program: '0000000-000000-000000-0000000'
        });
    }

    beforeEach(function() {
        module('ui.router');
        module('siglus-location-common');
        module('openlmis-modal');
        module('siglus-alert-confirm-modal');
        module('siglus-remaining-products-modal');
        module('stock-confirm-discard');
        module('stockmanagement');
        module('siglus-location-receive-creation');
        module('siglus-print-pallet-label-comfirm-modal');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('changeLot method', function() {
        it('it should return openlmisForm.required error when clear lot', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                isKit: false,
                moveTo: null,
                lot: null,
                isMainGroup: true,
                netContent: 1,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [
                lineItem
            ];

            vm.changeLot(lineItem, lineItems, 0);

            expect(lineItem.$errors.lotCodeInvalid).toEqual('openlmisForm.required');

        });

        it('it return locationShipmentView.lotExpired when select lot has expirated', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                isKit: false,
                moveTo: null,
                lot: {
                    lotCode: 'code1',
                    expirationDate: '2020-12-12'
                },
                isMainGroup: true,
                netContent: 1,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [
                lineItem
            ];

            vm.changeLot(lineItem, lineItems, 0);

            expect(lineItem.$errors.lotCodeInvalid).toEqual('receiveLocationCreation.lotExpired');

        });
    });

    describe('changeLocation method', function() {
        var lineItem;
        beforeEach(function() {
            lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: true,
                moveTo: null,
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

            expect(lineItem.$errors.moveToLocationError).toEqual('openlmisForm.required');
        });

        it('should validate location duplicate when product is kit', function() {
            lineItem.isKit = true;
            lineItem.moveTo = {
                locationCode: 'AA01'
            };
            var lineItems = [
                lineItem,
                _.clone(lineItem)
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$errors.moveToLocationError).toEqual('receiveLocationCreation.locationDuplicated');
        });

        it('should return quantityShippedError openlmisForm.required when location has changed', function() {
            lineItem.isKit = true;
            lineItem.moveTo = {
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

            expect(lineItem.$errors.quantityError).toEqual('issueLocationCreation.inputPositiveNumber');
        });

        it('should validate current line item required error when change location and lot is null', function() {
            lineItem.isKit = false;
            lineItem.orderableId = '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a';
            lineItem.moveTo = {
                locationCode: 'AA035'
            };
            lineItem.lot = null;
            lineItem.quantityShipped = 334;
            var lineItems = [
                lineItem
            ];

            vm.changeLocation(lineItem, lineItems, 0);

            expect(lineItem.$errors.lotCodeInvalid).toEqual('openlmisForm.required');
        });

    });

    describe('removeItem method', function() {
        var lineItem;
        beforeEach(function() {
            lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: true,
                moveTo: null,
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

    describe('showEmptyBlock', function() {
        it('show show empty block when line item length mt 0 and index eq 0', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: false,
                moveTo: null,
                lot: null,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [lineItem, angular.copy(lineItem)];

            expect(vm.showEmptyBlock(lineItems, 0)).toEqual(true);
        });
    });

    describe('showEmptyBlockWithKit', function() {
        it('show show empty block when line item is kit', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: true,
                moveTo: null,
                lot: null,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [lineItem, angular.copy(lineItem)];

            expect(vm.showEmptyBlockWithKit(lineItem, lineItems, 0)).toEqual(true);
        });

        it('show show empty block when line item is not kit and index is 0', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: ''
                },
                $hint: {
                    lotCodeHint: ''
                },
                isKit: false,
                moveTo: null,
                lot: null,
                orderableId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa'
            };
            var lineItems = [lineItem, angular.copy(lineItem)];

            expect(vm.showEmptyBlockWithKit(lineItem, lineItems, 0)).toEqual(true);
        });
    });

    describe('submit method', function() {

        it('it should alert form invalid when table form validation is not pass', function() {
            var lineItem = {
                $errors: {
                    moveToLocationError: '',
                    lotCodeError: '',
                    lotCodeHint: '',
                    quantityError: ''
                },
                orderableId: 'A000001',
                lot: {
                    lotCode: 'Code 1',
                    expirationDate: '2399-12-08'
                },
                moveTo: {
                    area: 'WEST',
                    locationCode: 'A2203'
                },
                quantity: 0
            };
            vm.addedLineItems = [
                [
                    lineItem
                ]
            ];
            vm.submit();

            expect(lineItem.$errors.quantityError).toEqual('issueLocationCreation.inputPositiveNumber');
            expect(alertService.error).toHaveBeenCalledWith('This form is invalid');
        });

        it('it should display error message when filed has error', function() {
            var lineItem = {
                $errors: {
                    moveToLocationError: '',
                    lotCodeInvalid: '',
                    quantityError: ''
                },
                orderableId: 'A000001',
                lot: null,
                moveTo: null,
                quantity: 0
            };
            vm.addedLineItems = [
                [
                    lineItem
                ]
            ];
            vm.submit();

            expect(lineItem.$errors.moveToLocationError).toEqual('openlmisForm.required');
            expect(lineItem.$errors.quantityError).toEqual('issueLocationCreation.inputPositiveNumber');

            expect(alertService.error).toHaveBeenCalledWith('This form is invalid');
        });

        it('it should display location duplication error message when location has two or more same', function() {
            var lineItem0 = {
                $errors: {
                    moveToLocationError: '',
                    lotCodeInvalid: '',
                    lotCodeHint: '',
                    quantityError: ''
                },
                orderableId: 'A000001',
                lot: null,
                isKit: true,
                moveTo: null,
                quantity: 0
            };

            var lineItem1 = {
                $errors: {
                    moveToLocationError: '',
                    lotCodeInvalid: '',
                    lotCodeHint: '',
                    quantityError: ''
                },
                orderableId: 'A000001',
                lot: {
                    lotCode: 'Code 1',
                    expirationDate: '2399-12-08'
                },
                moveTo: {
                    area: 'WEST',
                    locationCode: 'A2203'
                },
                isKit: true,
                quantity: 33
            };

            var lineItem2 = {
                $errors: {
                    moveToLocationError: '',
                    lotCodeInvalid: '',
                    lotCodeHint: '',
                    quantityError: ''
                },
                orderableId: 'A000001',
                lot: {
                    lotCode: 'Code 1',
                    expirationDate: '2399-12-08'
                },
                moveTo: {
                    area: 'WEST',
                    locationCode: 'A2203'
                },
                isKit: true,
                quantity: 33
            };
            vm.addedLineItems = [
                [
                    lineItem0, lineItem1, lineItem2
                ]
            ];
            vm.submit();

            expect(lineItem1.$errors.lotCodeInvalid).toEqual('');
            expect(lineItem1.$errors.moveToLocationError).toEqual('receiveLocationCreation.locationDuplicated');

            expect(alertService.error).toHaveBeenCalledWith('This form is invalid');
        });

        it('it should display location duplication error message when location has two or more same and is not kit',
            function() {
                var lineItem0 = {
                    $errors: {
                        moveToLocationError: '',
                        lotCodeInvalid: '',
                        lotCodeHint: '',
                        quantityError: ''
                    },
                    orderableId: 'A000001',
                    lot: null,
                    isKit: false,
                    moveTo: null,
                    quantity: 0
                };

                var lineItem1 = {
                    $errors: {
                        moveToLocationError: '',
                        lotCodeInvalid: '',
                        lotCodeHint: '',
                        quantityError: ''
                    },
                    orderableId: 'A000001',
                    lot: {
                        lotCode: 'Code 1',
                        expirationDate: '2399-12-08'
                    },
                    moveTo: {
                        area: 'WEST',
                        locationCode: 'A2203'
                    },
                    isKit: false,
                    quantity: 33
                };

                var lineItem2 = {
                    $errors: {
                        moveToLocationError: '',
                        lotCodeInvalid: '',
                        lotCodeHint: '',
                        quantityError: ''
                    },
                    orderableId: 'A000001',
                    lot: {
                        lotCode: 'Code 1',
                        expirationDate: '2399-12-08'
                    },
                    moveTo: {
                        area: 'WEST',
                        locationCode: 'A2203'
                    },
                    isKit: false,
                    quantity: 33
                };
                vm.addedLineItems = [
                    [
                        lineItem0, lineItem1, lineItem2
                    ]
                ];
                vm.submit();

                expect(lineItem1.$errors.lotCodeInvalid).toEqual('receiveLocationCreation.lotDuplicated');

                expect(alertService.error).toHaveBeenCalledWith('This form is invalid');
            });

    });

});
