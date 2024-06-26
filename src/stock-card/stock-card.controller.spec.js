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

describe('StockCardController', function() {

    var vm, $state, stockCardService, stockCardId, debitReason, creditReason, ReasonDataBuilder, messageService;
    // SIGLUS-REFACTOR: starts here
    var alertService, $scope, $q, $rootScope, confirmService, notificationService, localStorageService;
    // SIGLUS-REFACTOR: ends here

    beforeEach(function() {
        module('stock-card');

        inject(function($injector) {
            $state = $injector.get('$state');
            stockCardService = $injector.get('stockCardService');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            messageService = $injector.get('messageService');
            // SIGLUS-REFACTOR: starts here
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            alertService = $injector.get('alertService');
            confirmService = $injector.get('confirmService');
            notificationService = $injector.get('notificationService');
            localStorageService = $injector.get('localStorageService');
            // SIGLUS-REFACTOR: ends here

            stockCardId = 123;
            debitReason = new ReasonDataBuilder().buildDebitReason();
            creditReason = new ReasonDataBuilder().buildCreditReason();
            var stockCard = {
                id: stockCardId,
                orderable: {
                    fullProductName: 'Glibenclamide'
                },
                lineItems: [
                    {
                        id: 1,
                        stockAdjustments: [
                            {
                                reason: debitReason,
                                quantity: 10
                            },
                            {
                                reason: debitReason,
                                quantity: 5
                            },
                            {
                                reason: creditReason,
                                quantity: 20
                            }
                        ],
                        stockOnHand: 35
                    },
                    {
                        id: 2,
                        reason: 'Overstock',
                        quantity: 30,
                        stockOnHand: 30,
                        stockAdjustments: []
                    }
                ],
                // SIGLUS-REFACTOR: starts here
                program: {
                    name: 'MTB'
                }
            };

            $scope = {
                $on: function() {}
            };

            vm = $injector.get('$controller')('StockCardController', {
                $scope: $scope,
                stockCard: stockCard,
                $state: $state,
                stockCardService: stockCardService,
                alertService: alertService,
                confirmService: confirmService,
                notificationService: notificationService
            });
            // SIGLUS-REFACTOR: ends here
        });
    });

    describe('onInit', function() {

        var stockCard;

        beforeEach(function() {
            stockCard = {
                id: 123,
                orderable: {
                    fullProductName: 'Glibenclamide'
                },
                lineItems: [
                    {
                        id: 1,
                        reason: creditReason,
                        quantity: 20,
                        stockOnHand: 35,
                        stockAdjustments: []
                    },
                    {
                        id: 1,
                        reason: debitReason,
                        quantity: 5,
                        stockOnHand: 15,
                        stockAdjustments: []
                    },
                    {
                        id: 1,
                        reason: debitReason,
                        quantity: 10,
                        stockOnHand: 20,
                        stockAdjustments: []
                    },
                    {
                        id: 2,
                        reason: 'Overstock',
                        quantity: 30,
                        stockOnHand: 30,
                        stockAdjustments: []
                    }
                ],
                // SIGLUS-REFACTOR: starts here
                program: {
                    name: 'MTB'
                }
                // SIGLUS-REFACTOR: ends here
            };
        });

        it('should initiate valid stock card', function() {
            vm.$onInit();

            expect(vm.stockCard).toEqual(stockCard);
        });

        it('should set state label to product name', function() {
            vm.$onInit();

            expect($state.current.label).toBe(stockCard.orderable.fullProductName);
        });

        it('should set binCardName to fullProductName when is not archived', function() {
            vm.$onInit();

            expect(vm.binCardName).toBe('Glibenclamide');
        });

        it('should set binCardName to program name when is archived', function() {
            $state.params.isArchivedProducts = true;
            vm.$onInit();

            expect(vm.binCardName).toBe('MTB');
        });

        it('should set binCardName to fullProductName when is archived and isViewProductCard', function() {
            $state.params.isArchivedProducts = false;
            vm.$onInit();

            expect(vm.binCardName).toBe('Glibenclamide');
        });
    });

    describe('print method', function() {
        it('should save data by local storage service when invoke print', function() {
            spyOn(localStorageService, 'add').andReturn();
            vm.$onInit();
            vm.print();

            expect(localStorageService.add).toHaveBeenCalled();
        });
    });

    describe('getReason', function() {

        beforeEach(function() {
            spyOn(messageService, 'get').andReturn('test message');
        });

        it('should get reason and free text', function() {
            var lineItem = {
                reasonFreeText: true,
                reason: new ReasonDataBuilder().buildAdjustmentReason()
            };

            expect(vm.getReason(lineItem)).toEqual('test message');
            expect(messageService.get).toHaveBeenCalledWith('stockCard.reasonAndFreeText', {
                name: lineItem.reason.name,
                freeText: lineItem.reasonFreeText
            });
        });

        it('should get message for physical reason', function() {
            var lineItem = {
                reasonFreeText: false,
                reason: new ReasonDataBuilder().buildPhysicalInventoryReason()
            };

            expect(vm.getReason(lineItem)).toEqual('Inventário físico');
        });

        it('should get reason name', function() {
            var lineItem = {
                reasonFreeText: false,
                reason: new ReasonDataBuilder().buildTransferReason()
            };

            expect(vm.getReason(lineItem)).toEqual(lineItem.reason.name);
        });
    });

    // #103: archive product
    describe('archive', function() {

        beforeEach(function() {
            vm.$onInit();
            spyOn(confirmService, 'confirmDestroy').andReturn($q.resolve());
            spyOn(notificationService, 'success');
            spyOn(notificationService, 'error');
            spyOn($state, 'go');
        });

        it('should rediect with proper state params after success', function() {
            spyOn(stockCardService, 'archiveProduct').andReturn($q.resolve());

            vm.archive();
            $rootScope.$apply();

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(notificationService.success).toHaveBeenCalledWith('stockCard.archiveProduct.success');
            expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.archivedProductSummaries', {
                program: vm.stockCard.program.id,
                page: 0
            });
        });

        it('should not rediect after error', function() {
            spyOn(stockCardService, 'archiveProduct').andReturn($q.reject());

            vm.archive();
            $rootScope.$apply();

            expect($state.go).not.toHaveBeenCalled();
            expect(notificationService.error).toHaveBeenCalledWith('stockCard.archiveProduct.failure');
            expect(notificationService.success).not.toHaveBeenCalled();
        });
    });
    // #103: ends here

    // #105: activate archived product
    describe('activate', function() {

        beforeEach(function() {
            vm.$onInit();
            spyOn(confirmService, 'confirm').andReturn($q.resolve());
            spyOn(notificationService, 'success');
            spyOn(notificationService, 'error');
            spyOn($state, 'go');
        });

        it('should rediect with proper state params after success', function() {
            spyOn(stockCardService, 'activateProduct').andReturn($q.resolve());

            vm.activate();
            $rootScope.$apply();

            expect(notificationService.error).not.toHaveBeenCalled();
            expect(notificationService.success).toHaveBeenCalledWith('stockCard.activateProduct.success');
            expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                program: vm.stockCard.program.id,
                page: 0
            });
        });

        it('should not rediect after error', function() {
            spyOn(stockCardService, 'activateProduct').andReturn($q.reject());

            vm.activate();
            $rootScope.$apply();

            expect($state.go).not.toHaveBeenCalled();
            expect(notificationService.error).toHaveBeenCalledWith('stockCard.activateProduct.failure');
            expect(notificationService.success).not.toHaveBeenCalled();
        });
    });
    // #105: ends here
});
