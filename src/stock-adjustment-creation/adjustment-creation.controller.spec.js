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

describe('StockAdjustmentCreationController', function() {

    // SIGLUS-REFACTOR: remove UNPACK_REASONS and add siglusSignatureModalService
    var vm, q, rootScope, state, stateParams, facility, program, confirmService, VVM_STATUS, messageService, scope,
        stockAdjustmentCreationService, reasons, $controller, ADJUSTMENT_TYPE, ProgramDataBuilder, FacilityDataBuilder,
        ReasonDataBuilder, OrderableGroupDataBuilder, OrderableDataBuilder, alertService, notificationService,
        orderableGroups, LotDataBuilder, siglusSignatureWithDateModalService, stockCardDataService, orderablesPrice;
    // SIGLUS-REFACTOR: ends here

    beforeEach(function() {

        module('referencedata-lot');
        module('stock-adjustment-creation');
        module('siglus-issue-or-receive-report');

        inject(function($q, $rootScope, $injector) {
            q = $injector.get('$q');
            rootScope = $injector.get('$rootScope');
            stateParams = $injector.get('$stateParams');
            $controller = $injector.get('$controller');
            VVM_STATUS = $injector.get('VVM_STATUS');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            messageService = $injector.get('messageService');
            confirmService = $injector.get('confirmService');
            stockAdjustmentCreationService = $injector.get('stockAdjustmentCreationService');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            alertService = $injector.get('alertService');
            notificationService = $injector.get('notificationService');
            LotDataBuilder = $injector.get('LotDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.OrderableChildrenDataBuilder = $injector.get('OrderableChildrenDataBuilder');

            // SIGLUS-REFACTOR: starts here
            siglusSignatureWithDateModalService = jasmine.createSpyObj(
                'siglusSignatureWithDateModalService', ['confirm']
            );
            stockCardDataService = jasmine.createSpyObj('stockCardDataService', ['addPrefixForAdjustmentReason']);

            var deferred = q.defer();
            deferred.resolve({
                signature: 'darrewang',
                occurredDate: '2022-08-01'
            });
            siglusSignatureWithDateModalService.confirm.andReturn(deferred.promise);
            // SIGLUS-REFACTOR: ends here

            state = jasmine.createSpyObj('$state', ['go']);
            state.current = {
                name: '/a/b'
            };
            state.params = {
                page: 0
            };

            program = new ProgramDataBuilder().build();
            facility = new FacilityDataBuilder().build();

            orderableGroups = [
                new OrderableGroupDataBuilder().build()
            ];
            reasons = [new ReasonDataBuilder().build()];

            orderablesPrice = {
                data: []
            };

            this.kitConstituents = [
                new this.OrderableChildrenDataBuilder().withId('child_product_1_id')
                    .withQuantity(30)
                    .buildJson()
            ];

            this.kitOrderable = new this.OrderableDataBuilder().withId('kit_product_id')
                .withChildren(this.kitConstituents)
                .buildJson();

            this.orderableGroup = new OrderableGroupDataBuilder()
                .withOrderable(new OrderableDataBuilder().withExtraData({
                    useVVM: 'true'
                })
                    .build())
                .build();

            scope = rootScope.$new();
            scope.productForm = jasmine.createSpyObj('productForm', ['$setUntouched', '$setPristine']);

            vm = initController(orderableGroups);
        });
    });

    describe('onInit', function() {
        it('should init page properly', function() {
            expect(stateParams.page).toEqual(0);
        });

        it('should set showVVMStatusColumn to true if any orderable use vvm', function() {

            vm = initController([this.orderableGroup]);

            expect(vm.showVVMStatusColumn).toBe(true);
        });

        it('should set showVVMStatusColumn to false if no orderable use vvm', function() {
            var orderableGroup = new OrderableGroupDataBuilder()
                .withOrderable(new OrderableDataBuilder().withExtraData({
                    useVVM: 'false'
                })
                    .build())
                .build();

            vm = initController([orderableGroup]);

            expect(vm.showVVMStatusColumn).toBe(false);
        });
    });

    describe('validate', function() {

        it('line item quantity is valid given positive integer', function() {
            var lineItem = {
                id: '1',
                quantity: 1,
                $errors: {}
            };
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid).toBeFalsy();
        });

        // SIGLUS-REFACTOR: starts here
        it('line item quantity is valid given 0', function() {
            var lineItem = {
                id: '1',
                quantity: 0,
                $errors: {}
            };
            vm.validateQuantity(lineItem);

            // expect(lineItem.$errors.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger');
            expect(lineItem.$errors.quantityInvalid).toBeFalsy();
            // SIGLUS-REFACTOR: ends here
        });

        it('line item quantity is invalid when is greater than stock on hand and reason type is DEBIT', function() {
            var lineItem = {
                id: '1',
                quantity: 6,
                $previewSOH: 5,
                reason: {
                    reasonType: 'DEBIT'
                },
                $errors: {}
            };
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid)
                .toEqual(messageService.get('stockAdjustmentCreation.quantityGreaterThanStockOnHand'));
        });

        it('line item quantity is invalid given -1', function() {
            var lineItem = {
                id: '1',
                quantity: -1,
                $errors: {}
            };
            vm.validateQuantity(lineItem);

            expect(lineItem.$errors.quantityInvalid)
                .toEqual(messageService.get('stockAdjustmentCreation.positiveInteger'));
        });
    });

    it('should reorder all added items when quantity validation failed', function() {
        var date1 = new Date(2017, 3, 20);
        var lineItem1 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C100'
            },
            occurredDate: date1,
            $errors: {}
        };

        var lineItem2 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C150'
            },
            occurredDate: date1,
            $errors: {}
        };

        var date2 = new Date(2017, 3, 25);
        var lineItem3 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C100'
            },
            occurredDate: date2,
            $errors: {
                quantityInvalid: 'stockAdjustmentCreation.sohCanNotBeNegative'
            }
        };

        var lineItem4 = {
            reason: {
                id: '123',
                reasonType: 'DEBIT'
            },
            orderable: {
                productCode: 'C120'
            },
            occurredDate: date2,
            $errors: {
                quantityInvalid: 'stockAdjustmentCreation.sohCanNotBeNegative'
            }
        };

        vm.allLineItemsAdded = [lineItem1, lineItem2, lineItem3, lineItem4];

        vm.submit();

        var expectItems = [lineItem3, lineItem1, lineItem4, lineItem2];

        expect(vm.displayItems).toEqual(expectItems);
    });

    it('should remove all line items', function() {
        var lineItem1 = {
            id: '1',
            quantity: 0
        };
        var lineItem2 = {
            id: '2',
            quantity: 1
        };
        vm.allLineItemsAdded = [lineItem1, lineItem2];
        vm.displayItems = [lineItem1];
        spyOn(confirmService, 'confirmDestroy');
        var deferred = q.defer();
        deferred.resolve();
        confirmService.confirmDestroy.andReturn(deferred.promise);

        vm.removeDisplayItems();
        rootScope.$apply();

        expect(confirmService.confirmDestroy).toHaveBeenCalledWith('stockAdjustmentCreation.deleteDraft',
            'stockAdjustmentCreation.delete');
    });

    it('should remove one line item from added line items', function() {
        var lineItem1 = {
            id: '1',
            quantity: 0
        };
        var lineItem2 = {
            id: '2',
            quantity: 1
        };
        vm.allLineItemsAdded = [lineItem1, lineItem2];

        vm.remove(lineItem1);

        expect(vm.allLineItemsAdded).toEqual([lineItem2]);
    });

    it('should get no error when the lot code is valid', function() {
        var lineItem = {
            lot: new LotDataBuilder().build(),
            id: '1',
            isKit: false,
            $errors: {}
        };
        vm.validateLot(lineItem);

        expect(lineItem.$errors.lotCodeInvalid).toBeFalsy();
    });

    it('should get an error of openlmisForm.required when the lot code is not given', function() {
        var lineItem = {
            id: '1',
            isKit: false,
            $errors: {}
        };
        vm.validateLot(lineItem);

        expect(lineItem.$errors.lotCodeInvalid).toBe(messageService.get('openlmisForm.required'));
    });

    it('should get an error of stockPhysicalInventoryDraft.lotCodeTooLong when the lot code is too long', function() {
        var lineItem = {
            id: '1',
            lot: {
                lotCode: '0123456789' + '01234567890'  + '01234567890' + '012345678901'
            },
            isKit: false,
            $errors: {}
        };
        vm.validateLot(lineItem);

        expect(lineItem.$errors.lotCodeInvalid)
            .toBe(messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong'));
    });

    it('should get an error of stockPhysicalInventoryDraft.lotCodeDuplicate ' +
        'when the lot code is duplicated', function() {
        var newLot = {
            lotCode: 'new-lot'
        };
        var lineItem1 = {
            id: '1',
            lot: newLot,
            isKit: false,
            $errors: {}
        };
        var lineItem2 = {
            id: '1',
            lot: newLot,
            isKit: false,
            $errors: {}
        };
        vm.allLineItemsAdded = [lineItem1, lineItem2];
        vm.validateLot(lineItem1);

        expect(lineItem1.$errors.lotCodeInvalid)
            .toBe(messageService.get('stockPhysicalInventoryDraft.lotCodeDuplicate'));
    });
    // SIGLUS-REFACTOR: ends here

    describe('getStatusDisplay', function() {
        it('should expose getStatusDisplay method', function() {
            expect(angular.isFunction(vm.getStatusDisplay)).toBe(true);
        });

        it('should call messageService', function() {
            spyOn(messageService, 'get').andReturn(true);
            vm.getStatusDisplay(VVM_STATUS.STAGE_1);

            expect(messageService.get).toHaveBeenCalled();
        });
    });

    describe('submit', function() {
        beforeEach(function() {
            spyOn(alertService, 'error');
            spyOn(confirmService, 'confirm');
            spyOn(notificationService, 'success');
            confirmService.confirm.andReturn(q.resolve());
        });

        it('should redirect with proper state params after success', function() {
            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments.andReturn(q.resolve());

            vm.submit();
            rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.stockCardSummaries', {
                facility: facility.id,
                program: program.id
            });

            // SIGLUS-REFACTOR: starts here
            expect(siglusSignatureWithDateModalService.confirm).toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
            expect(notificationService.success).toHaveBeenCalledWith('stockAdjustmentCreation.submitted');
            expect(alertService.error).not.toHaveBeenCalled();
        });

        it('should not redirect after error', function() {
            spyOn(stockAdjustmentCreationService, 'submitAdjustments');
            stockAdjustmentCreationService.submitAdjustments
                .andReturn(q.reject({
                    data: {
                        message: 'error occurred'
                    }
                }));

            vm.submit();
            rootScope.$apply();

            // SIGLUS-REFACTOR: starts here
            expect(siglusSignatureWithDateModalService.confirm).toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
            expect(state.go).not.toHaveBeenCalled();
            expect(alertService.error).toHaveBeenCalledWith('error occurred');
            expect(notificationService.success).not.toHaveBeenCalled();
        });

    });

    describe('orderableSelectionChanged', function() {

        it('should unselect lot', function() {
            vm.selectedLot = new LotDataBuilder().build();

            vm.orderableSelectionChanged();

            expect(vm.selectedLot).toBe(null);
        });

        it('should clear form', function() {
            vm.selectedLot = new LotDataBuilder().build();

            vm.orderableSelectionChanged();

            expect(scope.productForm.$setPristine).toHaveBeenCalled();
            expect(scope.productForm.$setUntouched).toHaveBeenCalled();
        });

    });

    function initController(orderableGroups, adjustmentType) {
        return $controller('StockAdjustmentCreationController', {
            $scope: scope,
            $state: state,
            $stateParams: stateParams,
            program: program,
            facility: facility,
            adjustmentType: adjustmentType ? adjustmentType : ADJUSTMENT_TYPE.ADJUSTMENT,
            // SIGLUS-REFACTOR: starts here
            srcDstAssignments: [],
            user: {},
            reasons: reasons,
            orderableGroups: orderableGroups,
            displayItems: [],
            siglusSignatureWithDateModalService: siglusSignatureWithDateModalService,
            draft: {},
            stockCardDataService: stockCardDataService,
            // SIGLUS-REFACTOR: ends here
            orderablesPrice: orderablesPrice
        });
    }

});
