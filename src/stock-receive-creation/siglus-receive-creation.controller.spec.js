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

describe('SiglusStockReceiveCreationController', function() {
    var vm, $q, confirmDeferred, $rootScope, confirmDiscardService, alertService,
        confirmService, siglusStockIssueService, $state,
        stockAdjustmentFactory, $controller, ADJUSTMENT_TYPE, siglusRemainingProductsModalService,
        alertConfirmModalService, orderablesPrice, messageService;

    function prepareInjector() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            siglusStockIssueService = $injector.get('siglusStockIssueService');
            $state = $injector.get('$state');
            siglusRemainingProductsModalService = $injector.get('siglusRemainingProductsModalService');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            stockAdjustmentFactory = $injector.get('stockAdjustmentFactory');
            confirmDiscardService = $injector.get('confirmDiscardService');
            alertConfirmModalService = $injector.get('alertConfirmModalService');
            alertService = $injector.get('alertService');
            confirmService = $injector.get('confirmService');
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
        });
    }

    function prepareSpies() {
        spyOn(siglusStockIssueService, 'removeIssueDraft').andReturn($q.resolve());
        spyOn(siglusRemainingProductsModalService, 'show');
        spyOn(stockAdjustmentFactory, 'getDraft').andReturn($q.resolve([]));
        spyOn(confirmDiscardService, 'register');
        spyOn(alertConfirmModalService, 'error');
        spyOn(alertService, 'error');
        spyOn($state, 'go');
        confirmDeferred = $q.defer();
        spyOn(confirmService, 'confirmDestroy').andReturn(confirmDeferred.promise);

    }

    function prepareData() {
        var orderableGroups = [
            [ {
                lot: null,
                orderable: {
                    fullProductName: 'KIT PME US; Sem Dosagem; KIT',
                    id: '5f655d74-1213-46e0-9009-38a01e39c503',
                    isKit: true
                },
                stockOnHand: 211
            }],
            [
                {
                    lot: null,
                    orderable: {
                        fullProductName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT',
                        id: '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a',
                        isKit: true
                    },
                    stockOnHand: 89
                }
            ],
            [
                {
                    lot: {
                        id: '4d112513-fe89-4bb4-b960-cbdd912a4b9c',
                        lotCode: 'SEM-LOTE-26B25-102024',
                        experiationDate: new Date(2033, 8, 12)
                    },
                    orderable: {
                        fullProductName: 'Kit KWATMHOSO2- Módulo Mangueiras adicionais; N/A; KIT',
                        id: '0fe4e147-714e-4bf0-9e5b-921e3f6d608d',
                        isKit: false
                    },
                    stockOnHand: 33
                },
                {
                    lot: {
                        id: '4d112513-fe89-4bb4-b960-cbdd912a4b4f',
                        lotCode: 'SEM-LOTE-26B25-102023',
                        experiationDate: new Date(2035, 8, 12)
                    },
                    orderable: {
                        fullProductName: 'Kit KWATMHOSO2- Módulo Mangueiras adicionais; N/A; KIT',
                        id: '0fe4e147-714e-4bf0-9e5b-921e3f6d608d',
                        isKit: false
                    },
                    stockOnHand: 22
                },
                {
                    lot: {
                        id: '433a48cc-fbc7-4dad-9dc7-5bad8add91e7',
                        lotCode: 'SEM-LOTE-26B25-092022',
                        experiationDate: new Date(2034, 7, 22)
                    },
                    orderable: {
                        fullProductName: 'Kit KWATMHOSO2- Módulo Mangueiras adicionais; N/A; KIT',
                        id: '0fe4e147-714e-4bf0-9e5b-921e3f6d608d',
                        isKit: false
                    },
                    stockOnHand: 22
                }
            ]
        ];
        orderablesPrice = {
            '5f655d74-1213-46e0-9009-38a01e39c503': 66.66,
            '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a': 55,
            '0fe4e147-714e-4bf0-9e5b-921e3f6d608d': 10
        };
        vm = $controller('SiglusStockReceiveCreationController', {
            $scope: $rootScope.$new(),
            orderableGroups: orderableGroups,
            adjustmentType: ADJUSTMENT_TYPE.RECEIVE,
            reasons: [],
            srcDstAssignments: [],
            isMerge: false,
            initialDraftInfo: {
                destinationId: '000001',
                destinationName: 'Outros',
                documentNumber: 'Number1',
                locationFreeText: 'hdfaosdfhaidsf'
            },
            mergedItems: [],
            displayItems: [],
            draft: {},
            user: {
                // eslint-disable-next-line camelcase
                user_id: 'C00001'
            },
            programId: '000000-000000-000000-0000000',
            facility: {
                id: '004f4232-cfb8-11e9-9398-0242ac130008'
            },
            orderablesPrice: orderablesPrice
        });

    }

    beforeEach(function() {
        module('stock-receive-creation');
        module('stock-adjustment-creation');
        module('siglus-remaining-products-modal');
        module('siglus-alert-confirm-modal');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('validateLotCodeDuplicated', function() {
        it('should validate duplicated lot code in the same product', function() {
            vm.addedLineItems = [
                {
                    $errors: {
                        lotCodeInvalid: false,
                        lotDateInvalid: false
                    },
                    $previewSOH: 2,
                    isKit: false,
                    lot: {
                        lotCode: 'FAKE-LOTE-08L11-122018',
                        active: true,
                        tradeItemId: '38205859-6be9-4929-8115-6b0c3127c1f4',
                        expirationDate: '2500-12-30'
                    },
                    occurredDate: '2022-08-01',
                    orderableId: 'ba08a234-4881-472f-af02-fcc0c7ab5d04',
                    stockOnHand: 20
                },
                {
                    $errors: {
                        lotCodeInvalid: false,
                        lotDateInvalid: false
                    },
                    $previewSOH: 1,
                    lot: {
                        lotCode: 'FAKE-LOTE-08L14-122017',
                        active: true,
                        tradeItemId: 'f8e19198-86b0-4075-a760-a7186bbd6809',
                        expirationDate: '2500-12-31'
                    },
                    occurredDate: '2022-08-01',
                    orderableId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                    stockOnHand: 2
                },
                {
                    $errors: {
                        lotCodeInvalid: false,
                        lotDateInvalid: false
                    },
                    $previewSOH: 1,
                    lot: {
                        lotCode: 'FAKE-LOTE-08L14-122017',
                        active: true,
                        tradeItemId: 'f8e19198-86b0-4075-a760-a7186bbd6809',
                        expirationDate: '2500-12-31'
                    },
                    occurredDate: '2022-08-01',
                    orderableId: '0e278b62-65ab-447a-ad5a-a6bfb06dea78',
                    stockOnHand: 2
                }
            ];
            vm.validateLotCodeDuplicated();

            expect(vm.addedLineItems[0].$errors.lotCodeInvalid).toEqual(false);
            expect(vm.addedLineItems[1].$errors.lotCodeInvalid)
                .toEqual(messageService.get('stockReceiveCreation.itemDuplicated'));

            expect(vm.addedLineItems[2].$errors.lotCodeInvalid)
                .toEqual(messageService.get('stockReceiveCreation.itemDuplicated'));
        });
    });

    describe('validateLot', function() {
        it('should validate lot code can not be empty', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: false,
                    lotDateInvalid: false
                },
                $previewSOH: 2,
                isKit: false,
                lot: {
                    lotCode: ''
                },
                occurredDate: '2022-08-01',
                orderableId: 'ba08a234-4881-472f-af02-fcc0c7ab5d04',
                stockOnHand: 20
            };
            vm.addedLineItems = [
                lineItem
            ];

            vm.validateLot(lineItem);

            expect(lineItem.$errors.lotCodeInvalid).toEqual(messageService.get('openlmisForm.required'));

        });

        it('should has pass empty validation when lot code has been selected', function() {
            var lineItem = {
                $errors: {
                    lotCodeInvalid: false,
                    lotDateInvalid: false
                },
                $previewSOH: 2,
                isKit: false,
                lot: {
                    lotCode: 'FAKE-LOTE-08L14-122017'
                },
                occurredDate: '2022-08-01',
                orderableId: 'ba08a234-4881-472f-af02-fcc0c7ab5d04',
                stockOnHand: 20
            };
            vm.addedLineItems = [
                lineItem
            ];

            vm.validateLot(lineItem);

            expect(lineItem.$errors.lotCodeInvalid).toEqual(false);

        });
    });

});
