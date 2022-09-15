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

    var vm, programs, $controller, $q, loadingModalService, $rootScope, $scope,
        siglusSignatureWithDateModalService, $state, $stateParams, siglusLocationMovementService,
        siglusPrintPalletLabelComfirmModalService, modalDeferred;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            siglusSignatureWithDateModalService = $injector.get('siglusSignatureWithDateModalService');
            siglusLocationMovementService = $injector.get('siglusLocationMovementService');
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            $stateParams = $injector.get('$stateParams');
            siglusPrintPalletLabelComfirmModalService = $injector.get('siglusPrintPalletLabelComfirmModalService');
            $scope = $rootScope.$new();
            $q = $injector.get('$q');
            modalDeferred = $q.defer();
        });
    }

    function prepareSpies() {
        spyOn(loadingModalService, 'open').andReturn($q.resolve());
        spyOn(loadingModalService, 'close').andReturn($q.resolve());
        spyOn(siglusSignatureWithDateModalService, 'confirm').andReturn($q.resolve());
        spyOn(siglusLocationMovementService, 'saveMovementDraft').andReturn($q.resolve());
        spyOn(siglusPrintPalletLabelComfirmModalService, 'show').andReturn(modalDeferred.promise);
        spyOn($state, 'go').andReturn();
    }

    function prepareData() {
        vm = $controller('SiglusLocationMovementCreationController', {
            facility: {
                id: 'asdfafds-123123djks-123123dafkfs'
            },
            programs: programs,
            draftInfo: {
                id: '45bc8df6-e9e7-48f3-a749-fe9913cdc17'
            },
            user: {
                // eslint-disable-next-line camelcase
                user_id: 'DPM_MP_Role2'
            },
            orderableGroups: [],
            areaLocationInfo: [],
            addedLineItems: [],
            displayItems: [],
            locations: [],
            $scope: $scope
        });
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-print-pallet-label');
        module('siglus-print-pallet-label-comfirm-modal');
        module('siglus-location-common');
        module('siglus-location-movement');
        module('openlmis-table-form');
        module('siglus-alert-confirm-modal');
        module('siglus-location-movement-creation');
        module('stock-confirm-discard');

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

            expect(lineItem.stockOnHand).toEqual(0);
        });

        it('should emit stock on hand  when selected lot and location', function() {
            var lineItem = {
                $error: {
                    quantityError: 'openlmisForm.required'
                },
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

            expect(lineItem.$error.quantityError).toEqual('');
        });

        it('should validate soh mt quantity', function() {
            var lineItem = {
                $error: {
                    quantityError: 'locationMovement.gtSoh'
                },
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

            expect(lineItem.$error.quantityError).toEqual('');
        });

        it('should validate soh mt quantity for kit', function() {
            var lineItem = {
                $error: {
                    quantityError: 'locationMovement.gtSoh'
                },
                isKit: true,
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

            expect(lineItem.$error.quantityError).toEqual('');
        });

        it('should return locationMovement.gtSoh when has duplicated rows and total quantity exceeds stock on hand',
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

                expect(lineItem.$error.quantityError).toEqual('locationMovement.gtSoh');
            });

        it('should has not error when has duplicated rows and total quantity lt stock on hand',
            function() {
                var lineItem = {
                    $error: {
                        quantityError: 'locationMovement.gtSoh'
                    },
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

                expect(lineItem.$error.quantityError).toEqual('locationMovement.gtSoh');
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
                $error: {
                    quantityError: 'openlmisForm.required'
                },
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

            expect(lineItem.$error.quantityError).toEqual('');
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

            expect(lineItem.$error.quantityError).toEqual('');
        });

        it('should return locationMovement.gtSoh when has duplicated rows and total quantity exceeds stock on hand',
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

                expect(lineItem.$error.quantityError).toEqual('locationMovement.gtSoh');
            });

        it('should has not error when has duplicated rows and total quantity lt stock on hand',
            function() {
                var lineItem = {
                    $error: {
                        quantityError: 'locationMovement.gtSoh'
                    },
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

                expect(lineItem.$error.quantityError).toEqual('locationMovement.gtSoh');
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

    describe('submit method', function() {
        it('should validate all', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: null,
                location: null,
                quantity: null,
                moveTo: {
                    area: '',
                    locationCode: ''
                }
            };
            vm.addedLineItems = [
                [
                    lineItem
                ]
            ];
            vm.submit();

            var result = {
                lotCodeError: 'openlmisForm.required',
                locationError: 'openlmisForm.required',
                quantityError: 'openlmisForm.required',
                areaError: 'openlmisForm.required',
                moveToLocationError: 'openlmisForm.required'
            };

            expect(lineItem.$error).toEqual(result);
        });

        it('should validate except first row when has multi rows', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: null,
                location: null,
                quantity: null,
                moveTo: {
                    area: '',
                    locationCode: ''
                }
            };
            var lineItem1 = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: null,
                moveTo: {
                    area: '',
                    locationCode: ''
                }
            };
            vm.addedLineItems = [
                [
                    lineItem,
                    lineItem1,
                    lineItem1
                ]
            ];
            vm.submit();

            expect(lineItem.$error).toEqual({});
        });

        it('should show date picker confirm when passed all validator', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 3,
                moveTo: {
                    area: 'Armazem Principal',
                    locationCode: 'AA25A'
                }
            };
            vm.addedLineItems = [
                [
                    lineItem
                ]
            ];
            vm.isVirtual = false;
            vm.submit();
            modalDeferred.resolve(true);
            $rootScope.$apply();

            expect(siglusPrintPalletLabelComfirmModalService.show).toHaveBeenCalledWith();

            expect(siglusSignatureWithDateModalService.confirm).toHaveBeenCalledWith(
                'stockUnpackKitCreation.signature', null, null, true
            );
        });
    });

    describe('save method', function() {
        it('should save data without first row data when lineItems has multiple rows', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: null,
                location: null,
                quantity: null,
                moveTo: {
                    area: '',
                    locationCode: ''
                }
            };
            var lineItem1 = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 2,
                moveTo: {
                    area: 'Armazem Principal',
                    locationCode: 'AA25A'
                }
            };
            vm.addedLineItems = [
                [
                    lineItem,
                    lineItem1,
                    lineItem1
                ]
            ];
            vm.save();

            var param1 = {
                id: '45bc8df6-e9e7-48f3-a749-fe9913cdc17',
                programId: undefined,
                facilityId: 'asdfafds-123123djks-123123dafkfs',
                userId: 'DPM_MP_Role2'
            };

            var param2 = [lineItem1, lineItem1];

            expect(siglusLocationMovementService.saveMovementDraft).toHaveBeenCalledWith(
                param1, param2, []
            );
        });

        it('should save first row when lineItems has only one row', function() {
            var lineItem1 = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 2,
                moveTo: {
                    area: 'Armazem Principal',
                    locationCode: 'AA25A'
                }
            };
            vm.addedLineItems = [
                [
                    lineItem1
                ]
            ];
            vm.save();

            var param1 = {
                id: '45bc8df6-e9e7-48f3-a749-fe9913cdc17',
                programId: undefined,
                facilityId: 'asdfafds-123123djks-123123dafkfs',
                userId: 'DPM_MP_Role2'
            };

            var param2 = [lineItem1];

            expect(siglusLocationMovementService.saveMovementDraft).toHaveBeenCalledWith(
                param1, param2, []
            );
        });
    });

    describe('watch keyword', function() {
        it('should reload page when keyword change to empty', function() {
            $stateParams.keyword = 'Rifampicina';
            vm.keyword = 'Rifampicina';
            $rootScope.$apply();
            vm.keyword = '';
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalled();

        });
    });

    describe('changeMoveToLocation keyword', function() {
        it('should empty move to location error when move to location has value', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 2,
                moveTo: {
                    area: 'Armazem Principal',
                    locationCode: 'AA25A'
                }
            };

            vm.changeMoveToLocation(lineItem);

            expect(lineItem.$error.moveToLocationError).toEqual('');

        });

        it('should validate move to location when move to location has no value', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 2,
                moveTo: {
                    area: 'Armazem Principal',
                    locationCode: ''
                }
            };

            vm.changeMoveToLocation(lineItem);

            expect(lineItem.$error.moveToLocationError).toEqual('openlmisForm.required');

        });
    });

    describe('changeArea keyword', function() {
        it('should empty move to location error when move to location has value', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 2,
                moveTo: {
                    area: 'Armazem Principal',
                    locationCode: 'AA25A'
                }
            };

            vm.changeArea(lineItem);

            expect(lineItem.$error.areaError).toEqual('');

        });

        it('should validate move to location when move to location has no value', function() {
            var lineItem = {
                $error: {},
                productName: 'Kanamicina sulfato; 1g/3mL-ampola; Inj ',
                lot: {
                    lotCode: 'FAKE-LOTE-08D05-122023-31/1'
                },
                location: {
                    locationCode: 'DC20C'
                },
                quantity: 2,
                moveTo: {
                    area: '',
                    locationCode: ''
                }
            };

            vm.changeArea(lineItem);

            expect(lineItem.$error.areaError).toEqual('openlmisForm.required');

        });
    });

});
