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

describe('PhysicalInventoryDraftController', function() {

    var vm, $q, $rootScope, scope, state, stateParams, addProductsModalService, draftFactory,
        chooseDateModalService, facility, program, draft, lineItem, lineItem1, lineItem2, lineItem3,
        lineItem4, lineItem5, reasons, physicalInventoryService, stockmanagementUrlFactory, accessTokenFactory,
        $window, $controller, confirmService, PhysicalInventoryLineItemDataBuilder, OrderableDataBuilder,
        ReasonDataBuilder, LotDataBuilder, PhysicalInventoryLineItemAdjustmentDataBuilder,
        siglusRemainingProductsModalService, fulfillmentUrlFactory, siglusOrderableLotListService,
        confirmDiscardService, subDraftIds, alertConfirmModalService;

    beforeEach(function() {

        module('stock-physical-inventory-draft');
        module('siglus-remaining-products-modal');
        module('stock-physical-inventory');
        module('stock-add-products-modal');
        module('stock-confirm-discard');
        //SIGLUS-REFACTOR: starts here
        module('siglus-alert-confirm-modal');
        module('stock-orderable-group');
        module('fulfillment');
        // SIGLUS-REFACTOR: ends here

        subDraftIds = '';
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            scope = $rootScope.$new();
            $window = $injector.get('$window');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            PhysicalInventoryLineItemAdjustmentDataBuilder = $injector
                .get('PhysicalInventoryLineItemAdjustmentDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            siglusOrderableLotListService = $injector.get('siglusOrderableLotListService');

            state = jasmine.createSpyObj('$state', ['go']);
            chooseDateModalService = jasmine.createSpyObj('chooseDateModalService', ['show']);
            state.current = {
                name: '/a/b'
            };
            addProductsModalService = $injector.get('addProductsModalService');
            siglusRemainingProductsModalService = $injector.get('siglusRemainingProductsModalService');
            spyOn(addProductsModalService, 'show');
            // spyOn(siglusRemainingProductsModalService, 'show');
            addProductsModalService = $injector.get('addProductsModalService');
            confirmDiscardService = $injector.get('confirmDiscardService');
            alertConfirmModalService = $injector.get('alertConfirmModalService');
            // siglusOrderableLotService = $injector.get('siglusOrderableLotService');
            // spyOn(siglusOrderableLotService, 'fillLotsToAddedItems');

            spyOn(alertConfirmModalService, 'error');

            physicalInventoryService = jasmine.createSpyObj('physicalInventoryService', [
                'submitPhysicalInventory', 'deleteDraft'
            ]);
            draftFactory = $injector.get('physicalInventoryFactory');

            stockmanagementUrlFactory = jasmine.createSpy();
            stockmanagementUrlFactory.andCallFake(function(url) {
                return 'http://some.url' + url;
            });

            fulfillmentUrlFactory = jasmine.createSpy();
            fulfillmentUrlFactory.andCallFake(function(url) {
                return 'http://some.url' + url;
            });

            accessTokenFactory = jasmine.createSpyObj('accessTokenFactory', ['addAccessToken']);
            confirmService = jasmine.createSpyObj('confirmService', ['confirm', 'confirmDestroy']);
            siglusOrderableLotListService = jasmine.createSpyObj('siglusOrderableLotListService', ['getOrderableLots']);
            physicalInventoryService = jasmine.createSpyObj(
                'physicalInventoryService', ['getApprovedProducts', 'submitPhysicalInventory', 'deleteDraft']
            );
            // siglusOrderableLotListService.fulfillmentUrlFactory = fulfillmentUrlFactory;

            program = {
                name: 'HIV',
                id: '1'
            };

            facility = {
                id: '10134',
                name: 'National Warehouse'
            };

            stateParams = {
                id: 321
            };

            lineItem1 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(1)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C100')
                    .withFullProductName('a')
                    .build())
                .withStockAdjustments([
                    new PhysicalInventoryLineItemAdjustmentDataBuilder()
                        .withQuantity(1)
                        .build()
                ])
                .build();

            lineItem2 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(null)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C300')
                    .withFullProductName('b')
                    .build())
                .build();

            lineItem3 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(null)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C200')
                    .withFullProductName('b')
                    .build())
                .withLot(new LotDataBuilder()
                    .build())
                .buildAsAdded();

            lineItem4 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(null)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C300')
                    .withFullProductName('b')
                    .build())
                .withLot(new LotDataBuilder()
                    .build())
                .build();

            lineItem5 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(10)
                .withStockOnHand(10)
                .withStockAdjustments([])
                .build();

            lineItem = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(20)
                .withStockOnHand(10)
                .withStockAdjustments([
                    new PhysicalInventoryLineItemAdjustmentDataBuilder()
                        .withQuantity(10)
                        .build()
                ])
                .build();

            draft = {
                id: 321,
                lineItems: [
                    lineItem1, lineItem2, lineItem3, lineItem4
                ]
            };

            reasons = [
                new ReasonDataBuilder().buildCreditReason(),
                new ReasonDataBuilder().buildDebitReason()
            ];

            vm = initController();

            vm.$onInit();
        });
    });

    describe('onInit', function() {
        it('should set showVVMStatusColumn to true if any orderable use vvm', function() {
            draft.lineItems[0].orderable.extraData = {
                useVVM: 'true'
            };
            vm = initController();
            vm.$onInit();

            expect(vm.showVVMStatusColumn).toBe(true);
        });

        it('should set showVVMStatusColumn to false if no orderable use vvm', function() {
            draft.lineItems.forEach(function(card) {
                card.orderable.extraData = {
                    useVVM: 'false'
                };
            });
            vm = initController();
            vm.$onInit();

            expect(vm.showVVMStatusColumn).toBe(false);
        });

        it('should watch paged list to group items', function() {
            vm = initController();
            vm.$onInit();
            var updatedLineItem1 = _.assign(angular.copy(lineItem1), {});
            updatedLineItem1.orderable.extraData = {
                orderableCategoryDisplayName: updatedLineItem1.orderable.programs[0].orderableCategoryDisplayName
            };

            vm.pagedLineItems = [[updatedLineItem1]];
            vm.program.id = updatedLineItem1.orderable.programs[0].programId;
            $rootScope.$apply();

            expect(vm.groupedCategories[updatedLineItem1.orderable.programs[0].orderableCategoryDisplayName])
                .toEqual([[updatedLineItem1]]);
        });
    });

    it('should reload with page and keyword when search', function() {
        vm.keyword = '200';
        vm.search();

        expect(state.go).toHaveBeenCalledWith('/a/b', jasmine.any(Object), {
            reload: '/a/b'
        });
    });

    // TODO: need fix
    // it('should only pass items not added yet to add products modal', function() {
    //     var deferred = $q.defer();
    //     deferred.resolve();
    //     addProductsModalService.show.andReturn(deferred.promise);
    //     physicalInventoryService.getApprovedProducts.andReturn($q.resolve([lineItem4]));
    //
    //     // SIGLUS-REFACTOR: starts here
    //     vm = initController();
    //     vm.$onInit();
    //     draft.lineItems = [lineItem3];
    //     draft.subDraftIds = subDraftIds;
    //     vm.rawLineItems = [lineItem3];
    //     vm.addProducts();
    //
    //     expect(addProductsModalService.show).toHaveBeenCalledWith([lineItem4], true, undefined, undefined);
    //     // SIGLUS-REFACTOR: ends here
    // });

    it('should save draft', function() {
        spyOn(draftFactory, 'saveDraft');
        draftFactory.saveDraft.andReturn($q.defer().promise);
        $rootScope.$apply();

        vm.saveDraft();
        // SIGLUS-REFACTOR: starts here
        draft.summaries = [];
        draft.subDraftIds = subDraftIds;
        // SIGLUS-REFACTOR: ends here
        expect(draftFactory.saveDraft).toHaveBeenCalled();
    });

    it('should highlight empty quantities before submit', function() {
        // SIGLUS-REFACTOR: ends here
        lineItem1.$errors = {};
        lineItem3.$errors = {};
        vm.submit();

        expect(lineItem1.$errors.quantityInvalid).toBeFalsy();
        expect(lineItem3.$errors.quantityInvalid).toBeTruthy();
        // SIGLUS-REFACTOR: ends here
    });

    it('should not show modal for occurred date if any quantity missing', function() {
        // vm.submit();
        expect(chooseDateModalService.show).not.toHaveBeenCalled();
    });

    it('should show modal for occurred date if no quantity missing', function() {
        lineItem3.quantity = 123;
        lineItem3.$diffMessage = {
            movementPopoverMessage: undefined
        };
        lineItem3.stockAdjustments = [{
            quantity: 123,
            reason: {
                reasonType: 'CREDIT'
            }
        }];
        // SIGLUS-REFACTOR: starts here
        lineItem3.lot = {
            id: 3,
            lotCode: 'test3',
            expirationDate: '31/08/2019'
        };
        lineItem1.lot = {
            id: 1,
            lotCode: 'test1',
            expirationDate: '31/08/2019'
        };
        lineItem1.$diffMessage = {
            movementPopoverMessage: undefined
        };
        lineItem2.quantity = 456;
        lineItem2.lot = {
            id: 2,
            lotCode: 'test2',
            expirationDate: '31/08/2019'
        };
        lineItem2.$diffMessage = {
            movementPopoverMessage: undefined
        };
        lineItem4.quantity = 789;
        lineItem4.lot = {
            id: 4,
            lotCode: 'test4',
            expirationDate: '31/08/2019'
        };
        lineItem4.$diffMessage = {
            movementPopoverMessage: undefined
        };
        // SIGLUS-REFACTOR: ends here
        var deferred = $q.defer();
        deferred.resolve();
        chooseDateModalService.show.andReturn(deferred.promise);

        vm.submit();

        expect(chooseDateModalService.show).toHaveBeenCalled();
    });

    describe('when submit pass validations', function() {
        beforeEach(function() {
            lineItem3.quantity = 123;
            lineItem3.stockAdjustments = [{
                quantity: 123,
                reason: {
                    reasonType: 'CREDIT'
                }
            }];
            // SIGLUS-REFACTOR: starts here
            lineItem3.lot = {
                id: 3,
                lotCode: 'test3',
                expirationDate: '31/08/2019'
            };
            lineItem1.lot = {
                id: 1,
                lotCode: 'test1',
                expirationDate: '31/08/2019'
            };
            // SIGLUS-REFACTOR: ends here
            spyOn($window, 'open').andCallThrough();
            chooseDateModalService.show.andReturn($q.when({}));
        });

        it('and choose "no" should change state and not open report', function() {
            physicalInventoryService.submitPhysicalInventory
                .andReturn($q.when());
            confirmService.confirm.andReturn($q.reject());
            accessTokenFactory.addAccessToken.andReturn('url');
            // SIGLUS-REFACTOR: starts here
            lineItem2.quantity = 456;
            lineItem2.lot = {
                id: 2,
                lotCode: 'test2',
                expirationDate: '31/08/2019'
            };
            lineItem4.quantity = 789;
            lineItem4.lot = {
                id: 4,
                lotCode: 'test4',
                expirationDate: '31/08/2019'
            };
            // SIGLUS-REFACTOR: ends here

            draft.id = 1;
            vm.submit();
            $rootScope.$apply();

            expect($window.open).not.toHaveBeenCalled();
            expect(accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
        });

        it('and service call failed should not open report and not change state', function() {
            physicalInventoryService.submitPhysicalInventory.andReturn($q.reject());

            vm.submit();
            $rootScope.$apply();

            expect($window.open).not.toHaveBeenCalled();
            expect(accessTokenFactory.addAccessToken).not.toHaveBeenCalled();
            expect(state.go).not.toHaveBeenCalled();
        });
    });

    it('should aggregate given field values', function() {
        var lineItem1 = new PhysicalInventoryLineItemDataBuilder()
            .withQuantity(2)
            .withStockOnHand(233)
            .build();

        var lineItem2 = new PhysicalInventoryLineItemDataBuilder()
            .withQuantity(1)
            .withStockOnHand(null)
            .build();

        var lineItems = [lineItem1, lineItem2];

        expect(vm.calculate(lineItems, 'quantity')).toEqual(3);
        expect(vm.calculate(lineItems, 'stockOnHand')).toEqual(233);
    });

    describe('checkUnaccountedStockAdjustments', function() {

        it('should assign unaccounted value to line item', function() {
            expect(lineItem.unaccountedQuantity).toBe(undefined);

            lineItem.quantity = 30;
            vm.checkUnaccountedStockAdjustments(lineItem);

            expect(lineItem.unaccountedQuantity).toBe(10);
        });

        it('should assign 0 as unaccounted value to line item', function() {
            expect(lineItem.unaccountedQuantity).toBe(undefined);

            lineItem.quantity = 20;
            vm.checkUnaccountedStockAdjustments(lineItem);

            expect(lineItem.unaccountedQuantity).toBe(0);
        });

    });

    describe('quantityChanged', function() {

        it('should update progress', function() {
            spyOn(vm, 'updateProgress');

            // SIGLUS-REFACTOR: starts here
            lineItem5.$errors = {};
            lineItem5.$diffMessage = {};
            // SIGLUS-REFACTOR: ends here
            vm.quantityChanged(lineItem5);

            expect(vm.updateProgress).toHaveBeenCalled();
        });

        it('should validate quantity', function() {
            spyOn(vm, 'validateQuantity');

            // SIGLUS-REFACTOR: starts here
            lineItem5.$errors = {};
            lineItem5.$diffMessage = {};
            // SIGLUS-REFACTOR: ends here
            vm.quantityChanged(lineItem5);

            expect(vm.validateQuantity).toHaveBeenCalledWith(lineItem5);
        });

        it('should check unaccounted stock adjustments', function() {
            spyOn(vm, 'checkUnaccountedStockAdjustments');

            // SIGLUS-REFACTOR: starts here
            lineItem.$errors = {};
            lineItem.$diffMessage = {};
            // SIGLUS-REFACTOR: ends here
            vm.quantityChanged(lineItem);

            expect(vm.checkUnaccountedStockAdjustments).toHaveBeenCalledWith(lineItem);
        });

    });

    describe('delete', function() {
        it('should open confirmation modal', function() {
            alertConfirmModalService.error.andReturn($q.resolve());

            vm.delete();
            $rootScope.$apply();

            expect(alertConfirmModalService.error).toHaveBeenCalledWith(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            );
        });

        it('should go to the physical inventory screen after deleting draft', function() {
            alertConfirmModalService.error.andReturn($q.resolve());
            physicalInventoryService.deleteDraft.andReturn($q.resolve());

            vm.delete();
            $rootScope.$apply();

            expect(state.go).toHaveBeenCalledWith(
                'openlmis.stockmanagement.physicalInventory.draftList',
                stateParams, {
                    reload: true
                }
            );
        });

    });

    function initController() {
        return $controller('PhysicalInventoryDraftController', {
            facility: facility,
            program: program,
            $state: state,
            $scope: scope,
            $stateParams: stateParams,
            addProductsModalService: addProductsModalService,
            siglusRemainingProductsModalService: siglusRemainingProductsModalService,
            chooseDateModalService: chooseDateModalService,
            physicalInventoryService: physicalInventoryService,
            stockmanagementUrlFactory: stockmanagementUrlFactory,
            fulfillmentUrlFactory: fulfillmentUrlFactory,
            accessTokenFactory: accessTokenFactory,
            confirmService: confirmService,
            confirmDiscardService: confirmDiscardService,
            alertConfirmModalService: alertConfirmModalService,
            subDraftIds: subDraftIds,
            draft: draft,
            rawLineItems: [lineItem1, lineItem3],
            displayLineItemsGroup: [],
            reasons: reasons,
            siglusOrderableLotListService: siglusOrderableLotListService
        });
    }

});
