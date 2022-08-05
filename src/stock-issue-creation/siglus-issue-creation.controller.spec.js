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

describe('SiglusStockIssueCreationController', function() {
    var vm, $q, confirmDeferred, $rootScope, confirmDiscardService, alertService,
        confirmService, siglusStockIssueService, $state,
        stockAdjustmentFactory, $controller, ADJUSTMENT_TYPE, siglusRemainingProductsModalService,
        alertConfirmModalService;

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

        vm = $controller('SiglusStockIssueCreationController', {
            $scope: $rootScope.$new(),
            orderableGroups: orderableGroups,
            adjustmentType: ADJUSTMENT_TYPE.ISSUE,
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
            program: {
                id: '000000-000000-000000-0000000'
            },
            facility: {
                id: '004f4232-cfb8-11e9-9398-0242ac130008'
            },
            destinationName: 'test'
        });
    }

    beforeEach(function() {
        module('stock-issue-creation');
        module('siglus-alert-confirm-modal');
        module('siglus-remaining-products-modal');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('removeDraft method', function() {
        it('should call remove draft api when click confirm delete button', function() {
            // vm.remove();

            vm.addedLineItems = [
                {
                    lot: null,
                    orderable: {
                        fullProductName: 'KIT PME US; Sem Dosagem; KIT',
                        id: '5f655d74-1213-46e0-9009-38a01e39c503',
                        isKit: true
                    },
                    stockOnHand: 211
                },
                {
                    lot: null,
                    orderable: {
                        fullProductName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT',
                        id: '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a',
                        isKit: true
                    },
                    stockOnHand: 89
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
                }
            ];

            vm.selectedOrderableGroup = [
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
            ];
            var lineItem = {
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
            };

            vm.remove(lineItem);

            expect(vm.lots).toEqual([
                {
                    id: '4d112513-fe89-4bb4-b960-cbdd912a4b9c',
                    lotCode: 'SEM-LOTE-26B25-102024',
                    experiationDate: new Date(2033, 8, 12)
                },
                {
                    id: '4d112513-fe89-4bb4-b960-cbdd912a4b4f',
                    lotCode: 'SEM-LOTE-26B25-102023',
                    experiationDate: new Date(2035, 8, 12)
                },
                {
                    id: '433a48cc-fbc7-4dad-9dc7-5bad8add91e7',
                    lotCode: 'SEM-LOTE-26B25-092022',
                    experiationDate: new Date(2034, 7, 22)
                }
            ]);
        });

        it('should set correct selectedOrderableGroup when input key is kit ' +
          'and id is 4efcc305-fbda-401c-bc67-750a8717c3da ', function() {
            vm.orderableGroups = [
                [
                    {
                        lot: {
                            id: '1bab7243-c054-4751-be3e-7f05b5cf7c31',
                            lotCode: 'FAKE-LOTE-22A07-122017'
                        },
                        orderable: {
                            fullProductName: 'TDR de Unigold; kit de 20; Tests',
                            id: '9f74be18-18d9-4ef4-8b43-0eda127e2e08',
                            isKit: false
                        },
                        stockOnHand: 1
                    }
                ],
                [
                    {
                        lot: {
                            id: '54c64dc6-c878-4eaf-a754-55e6ba0428ff',
                            lotCode: 'SEM-LOTE-22A05-072022-10'
                        },
                        orderable: {
                            fullProductName: 'TDR de Sifilis; teste (kit de 30)',
                            id: '37806f29-8c43-4d46-961d-376b9668f474',
                            isKit: false
                        },
                        stockOnHand: 3
                    }
                ],
                [
                    {
                        lot: {
                            id: '4efcc305-fbda-401c-bc67-750a8717c3da',
                            lotCode: 'FAKE-LOTE-19A03-122028'
                        },
                        orderable: {
                            fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                            id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                            isKit: false
                        },
                        stockOnHand: 211
                    },
                    {
                        lot: {
                            id: '53eb503a-60fa-45ba-9886-3df017c521de',
                            lotCode: 'SEM-LOTE-08O05Z-112022-8'
                        },
                        orderable: {
                            fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                            id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                            isKit: false
                        },
                        stockOnHand: 24
                    }
                ]
            ];

            vm.setSelectedOrderableGroup('lot', '4efcc305-fbda-401c-bc67-750a8717c3da');

            expect(vm.selectedOrderableGroup).toEqual([
                {
                    lot: {
                        id: '4efcc305-fbda-401c-bc67-750a8717c3da',
                        lotCode: 'FAKE-LOTE-19A03-122028'
                    },
                    orderable: {
                        fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                        id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                        isKit: false
                    },
                    stockOnHand: 211
                },
                {
                    lot: {
                        id: '53eb503a-60fa-45ba-9886-3df017c521de',
                        lotCode: 'SEM-LOTE-08O05Z-112022-8'
                    },
                    orderable: {
                        fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                        id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                        isKit: false
                    },
                    stockOnHand: 24
                }
            ]);
        });

        it('should set correct lots when input key is kit ' +
          'and id is 4efcc305-fbda-401c-bc67-750a8717c3da ', function() {
            vm.addedLineItems = [
                {
                    lot: {
                        id: '4efcc305-fbda-401c-bc67-750a8717c3da',
                        lotCode: 'FAKE-LOTE-19A03-122028',
                        expirationDate: new Date(2027, 12, 8)
                    },
                    orderable: {
                        fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                        id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                        isKit: false
                    },
                    stockOnHand: 211
                }
            ];
            var result =
              [
                  {
                      lot: {
                          id: '4efcc305-fbda-401c-bc67-750a8717c3da',
                          lotCode: 'FAKE-LOTE-19A03-122028',
                          expirationDate: new Date(2027, 12, 8)
                      },
                      orderable: {
                          fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                          id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                          isKit: false
                      },
                      stockOnHand: 211
                  },
                  {
                      lot: {
                          id: '53eb503a-60fa-45ba-9886-3df017c521de',
                          lotCode: 'SEM-LOTE-08O05Z-112022-8',
                          expirationDate: new Date(2026, 8, 8)
                      },
                      orderable: {
                          fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                          id: 'd43d9bf6-7098-423c-a1bb-cac0b5d5c2d5',
                          isKit: false
                      },
                      stockOnHand: 24
                  }
              ];

            vm.selectedOrderableGroup = result;
            vm.setLots();

            expect(vm.lots).toEqual([ {
                id: '53eb503a-60fa-45ba-9886-3df017c521de',
                lotCode: 'SEM-LOTE-08O05Z-112022-8',
                expirationDate: new Date(2026, 8, 8)
            }]);
        });

        it('should set correct orderableGroup when initial table has added line items', function() {
            vm.addedLineItems = [
                {
                    lot: null,
                    orderable: {
                        fullProductName: 'KIT PME US; Sem Dosagem; KIT',
                        id: '5f655d74-1213-46e0-9009-38a01e39c503',
                        isKit: true
                    },
                    stockOnHand: 211
                },
                {
                    lot: null,
                    orderable: {
                        fullProductName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT',
                        id: '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a',
                        isKit: true
                    },
                    stockOnHand: 89
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
                }
            ];

            vm.setProductGroups();

            expect(vm.orderableGroups).toEqual([[  {
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
            }]]);
        });
    });
});
