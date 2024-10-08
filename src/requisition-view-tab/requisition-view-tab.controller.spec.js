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

describe('ViewTabController', function() {

    beforeEach(function() {
        module('requisition-view-tab');

        var RequisitionLineItemDataBuilder, RequisitionDataBuilder, RequisitionColumnDataBuilder, OrderableDataBuilder;
        inject(function($injector) {
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            RequisitionColumnDataBuilder = $injector.get('RequisitionColumnDataBuilder');
            RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');

            this.$controller = $injector.get('$controller');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.alertService = $injector.get('alertService');
            this.messageService = $injector.get('messageService');
            this.requisitionValidator = $injector.get('requisitionValidator');
            this.selectProductsModalService = $injector.get('selectProductsModalService');
            this.requisitionCacheService = $injector.get('requisitionCacheService');
            // SIGLUS-REFACTOR: starts here
            this.requisitionService = $injector.get('requisitionService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.notificationService = $injector.get('notificationService');
            this.offlineService = $injector.get('offlineService');
            this.$scope = this.$rootScope.$new();
            // SIGLUS-REFACTOR: ends here
            // #409: populate value when requisition is rejected
            this.REQUISITION_STATUS = $injector.get('REQUISITION_STATUS');
            this.alertConfirmModalService = $injector.get('REQUISITION_STATUS');
            spyOn(this.$scope, '$broadcast');
            spyOn(this.notificationService, 'success');
            spyOn(this.offlineService, 'isOffline');
            // #409: ends here
        });

        var requisitionDataBuilder = new RequisitionDataBuilder();
        this.requisition = requisitionDataBuilder
            .withRequisitionLineItems([
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson()
            ])
            .build();

        // SIGLUS-REFACTOR: starts here
        this.requisition.extraData = {};
        this.homeFacility = {};
        // SIGLUS-REFACTOR: ends here
        // #375: create requisition with test consumption section
        this.program = {
            code: 'VC'
        };
        // #375: ends here

        this.initController = initController;

        this.availableFullSupplyProducts = [
            new OrderableDataBuilder()
                .withFullProductName('C Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('A Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('B product')
                .build()
        ];

        this.availableNonFullSupplyProducts = [
            new OrderableDataBuilder()
                .withFullProductName('f Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('E Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('d product')
                .build()
        ];

        this.skippedFullSupplyProducts = [
            new OrderableDataBuilder()
                .withFullProductName('h Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('G Product')
                .build(),
            new OrderableDataBuilder()
                .withFullProductName('I product')
                .build()
        ];

        this.totalLossesAndAdjustmentsColumn = new RequisitionColumnDataBuilder()
            .buildTotalLossesAndAdjustmentsColumn();

        this.columns = [
            new RequisitionColumnDataBuilder().buildSkipColumn()
        ];

        this.fullSupply = false;
        this.canSubmit = false;
        this.canAuthorize = false;
        // SIGLUS-REFACTOR: starts here
        this.canSync = false;
        this.hasAuthorizeRight = false;
        // SIGLUS-REFACTOR: ends here
        this.canApproveAndReject = true;
        this.isCreateForClient = false;
        this.approvedProducts = [];

        spyOn(this.alertService, 'error');
        spyOn(this.selectProductsModalService, 'show');
        spyOn(this.messageService, 'get').andCallFake(function(param) {
            return param;
        });
        // #286 high level approver can skip some products in requisition
        spyOn(this.requisition.template, 'getColumn');
        // #286 ends here
    });

    describe('$onInit', function() {

        beforeEach(function() {
            this.requisition.template.hideSkippedLineItems.andReturn(true);
            this.fullSupply = true;
        });

        it('should bind requisitionValidator.isLineItemValid method to vm', function() {
            this.initController();

            expect(this.vm.isLineItemValid).toBe(this.requisitionValidator.isLineItemValid);
        });

        it('should bind requisition property to vm', function() {
            this.initController();

            expect(this.vm.requisition).toBe(this.requisition);
        });

        it('should expose canApproveAndReject property', function() {
            this.initController();

            expect(this.vm.canApproveAndReject).toEqual(this.canApproveAndReject);
        });

        it('should expose paginationId property', function() {
            this.initController();

            expect(this.vm.paginationId).toEqual('fullSupplyList');
        });

        // #375: create requisition with test consumption section
        it('should bind program property to vm', function() {
            this.initController();

            expect(this.vm.program).toEqual(this.program);
        });
        // #375: ends here

        // #409: populate value when requisition is rejected
        describe('populate default value', function() {
            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                this.hasAuthorizeRight = true;
                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    item.theoreticalQuantityToRequest = 17;
                    item.requestedQuantity = 18;
                    item.authorizedQuantity = 19;
                });
            });

            it('Should populate requestedQuantity from theoreticalQuantityToRequest when can submit', function() {
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.requestedQuantity).toBe(17);
                });
            });

            it('Should not populate requestedQuantity from theoreticalQuantityToRequest when requisition ' +
                'is rejected', function() {
                this.requisition.status = this.REQUISITION_STATUS.REJECTED;
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.requestedQuantity).toBe(18);
                });
            });

            it('Should populate authorizedQuantity from requestedQuantity when can canAuthorize', function() {
                this.canSubmit = false;
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.authorizedQuantity).toBe(18);
                });
            });

            it('Should populate authorizedQuantity from requestedQuantity when can canSubmitAndAuthorize', function() {
                this.canAuthorize = false;
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.authorizedQuantity).toBe(17);
                });
            });

            it('Should populate requestedQuantity and authorizedQuantity from theoreticalQuantityToRequest' +
                ' when can submit and canAuthorize', function() {
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.requestedQuantity).toBe(17);
                    expect(item.authorizedQuantity).toBe(17);
                });
            });

            it('Should not populate value when requisition is saved', function() {
                this.requisition.extraData.isSaved = true;
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.requestedQuantity).toBe(18);
                    expect(item.authorizedQuantity).toBe(19);
                });
            });

            it('Should not populate value when requisition is modified', function() {
                this.requisition.$modified = true;
                this.initController();

                angular.forEach(this.requisition.requisitionLineItems, function(item) {
                    expect(item.requestedQuantity).toBe(18);
                    expect(item.authorizedQuantity).toBe(19);
                });
            });
        });
        // #409: ends here

        describe('Add (Full Supply) Products button', function() {

            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                // SIGLUS-REFACTOR: starts here
                this.hasAuthorizeRight = true;
                // SIGLUS-REFACTOR: ends here
                this.fullSupply = true;
                this.requisition.emergency = true;
            });

            it('should be visible', function() {
                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only submit', function() {
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only authorize', function() {
                this.canSubmit = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(true);
            });

            it('should be hidden if user can\'t submit and authorize', function() {
                this.canSubmit = false;
                this.canAuthorize = false;
                // SIGLUS-REFACTOR: starts here
                this.hasAuthorizeRight = false;
                this.canApproveAndReject = false;
                // SIGLUS-REFACTOR: ends here

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if requisition is not emergency', function() {
                this.requisition.emergency = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if showing non-full supply tab', function() {
                this.fullSupply = false;

                this.initController();

                expect(this.vm.showAddFullSupplyProductsButton).toBe(false);
            });

        });

        describe('Add (Non-Full Supply) Products button', function() {

            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                this.fullSupply = false;
            });

            it('should be visible', function() {
                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only submit', function() {
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only authorize', function() {
                this.canSubmit = false;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(true);
            });

            it('should be hidden if user can\'t submit and authorize', function() {
                this.canSubmit = false;
                this.canAuthorize = false;
                this.canApproveAndReject = false;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if showing full supply tab', function() {
                this.fullSupply = true;

                this.initController();

                expect(this.vm.showAddNonFullSupplyProductsButton).toBe(false);
            });

        });

        describe('Unskip (Full Supply) Products button', function() {

            beforeEach(function() {
                this.canSubmit = true;
                this.canAuthorize = true;
                this.fullSupply = true;
                this.requisition.emergency = false;
                this.requisition.template.hideSkippedLineItems.andReturn(true);
            });

            it('should be visible', function() {
                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only submit', function() {
                this.canAuthorize = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(true);
            });

            it('should be visible if user can only authorize', function() {
                this.canSubmit = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(true);
            });

            it('should be hidden if user can\'t submit and authorize', function() {
                this.canSubmit = false;
                this.canAuthorize = false;
                this.canApproveAndReject = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if showing non-full supply tab', function() {
                this.fullSupply = false;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if requisition is emergency', function() {
                this.requisition.emergency = true;

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

            it('should be hidden if skipped line items are disabled', function() {
                this.requisition.template.hideSkippedLineItems.andReturn(false);

                this.initController();

                expect(this.vm.showUnskipFullSupplyProductsButton).toBe(false);
            });

        });

        describe('noProductMessage', function() {

            it('should set correct for full supply tab', function() {
                this.fullSupply = true;

                this.initController();

                expect(this.vm.noProductsMessage).toBe('requisitionViewTab.noFullSupplyProducts');
            });

            it('should set correct for non full supply tab', function() {
                this.fullSupply = false;

                this.initController();

                expect(this.vm.noProductsMessage).toBe('requisitionViewTab.noNonFullSupplyProducts');
            });

        });

        describe('userCanEdit', function() {

            it('should be true if canAuthorize is true', function() {
                this.canAuthorize = true;

                this.initController();

                expect(this.vm.userCanEdit).toBe(true);
            });

            it('should be true if canSubmit is true', function() {
                this.canSubmit = true;

                this.initController();

                expect(this.vm.userCanEdit).toBe(true);
            });

            it('should be false if canAuthorize and canSubmit are false', function() {
                this.canApproveAndReject = false;
                this.initController();

                expect(this.vm.userCanEdit).toBe(false);
            });

        });

        describe('showSkipControls', function() {

            it('should be hidden', function() {
                this.initController();

                expect(this.vm.showSkipControls).toBe(false);
            });

            // #286 high level approver can skip some products in requisition
            it('should be shown if the template has skip column and the column is display', function() {
                this.columns[0].$display = true;
                this.requisition.template.hasSkipColumn.andReturn(true);
                this.requisition.template.getColumn.andReturn(this.columns[0]);
                this.canApproveAndReject = true;
                this.requisition.isExternalApproval = true;

                this.initController();

                expect(this.vm.showSkipControls).toBe(true);
            });

            it('should be hidden if the template has skip column and the column is not display',
                function() {
                    this.columns[0].$display = false;
                    this.requisition.template.hasSkipColumn.andReturn(true);
                    this.requisition.template.getColumn.andReturn(this.columns[0]);

                    this.initController();

                    expect(this.vm.showSkipControls).toBe(false);
                });

            // it('should be shown if the requisition status is SUBMITTED and user has authorize right', function() {
            //     this.canAuthorize = true;
            //     this.requisition.template.hasSkipColumn.andReturn(true);
            //
            //     this.initController();
            //
            //     expect(this.vm.showSkipControls).toBe(true);
            // });

            // it('should be shown if the requisition status is REJECTED', function() {
            //     this.requisition.template.hasSkipColumn.andReturn(true);
            //     this.canSubmit = true;
            //
            //     this.initController();
            //
            //     expect(this.vm.showSkipControls).toBe(true);
            // });
            //
            // it('should be hidden if the requisition status is REJECTED and user can not submit', function() {
            //     this.requisition.template.hasSkipColumn.andReturn(true);
            //     this.canApproveAndReject = false;
            //
            //     this.initController();
            //
            //     expect(this.vm.showSkipControls).toBe(false);
            // });
            //
            // it('should be shown if the requisition template has a skip column', function() {
            //     this.requisition.template.hasSkipColumn.andReturn(true);
            //     this.canSubmit = true;
            //     this.columns[0].name = 'skipped';
            //
            //     this.initController();
            //
            //     expect(this.vm.showSkipControls).toBe(true);
            // });
            //
            // it('should be hidden if the requisition template does not have a skip column', function() {
            //     this.requisition.template.hasSkipColumn.andReturn(false);
            //     this.columns[0].name = 'foo';
            //     this.canSubmit = true;
            //
            //     this.initController();
            //
            //     expect(this.vm.showSkipControls).toBe(false);
            // });
            //
            // it('should be hidden if user does not authorize right and requisition is submitted', function() {
            //     this.canAuthorize = false;
            //     this.canApproveAndReject = false;
            //     this.requisition.template.hasSkipColumn.andReturn(true);
            //
            //     this.initController();
            //
            //     expect(this.vm.showSkipControls).toBe(false);
            // });
            // #286 ends here

        });

    });

    // SIGLUS-REFACTOR: starts here
    describe('showAddProducts', function() {

        it('should be hidden', function() {
            this.initController();

            expect(this.vm.showAddProducts).toBe(false);
        });
    });

    describe('isOffline', function() {

        it('should call the isOffline of the offlineService', function() {
            this.initController();
            this.vm.isOffline();

            expect(this.offlineService.isOffline).toHaveBeenCalled();
        });
    });
    // SIGLUS-REFACTOR: ends here

    describe('deleteLineItem', function() {

        beforeEach(function() {
            this.initController();
            this.requisition.deleteLineItem.andReturn();
            spyOn(this.$state, 'go').andReturn();
        });

        it('should delete line item if it exist', function() {
            var lineItem = this.requisition.requisitionLineItems[2];

            this.vm.deleteLineItem(lineItem);

            expect(this.requisition.deleteLineItem).toHaveBeenCalledWith(lineItem);
        });

    });

    describe('cacheRequisition', function() {

        beforeEach(function() {
            this.initController();
            spyOn(this.requisitionCacheService, 'cacheRequisition');
        });

        it('should delete line item if it exist', function() {
            this.vm.cacheRequisition();

            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
        });

    });

    describe('addFullSupplyProducts', function() {

        beforeEach(function() {
            this.requisition.getAvailableFullSupplyProducts.andReturn(angular.copy(this.availableFullSupplyProducts));
            this.selectProductsModalService.show.andReturn(this.$q.resolve([
                this.availableFullSupplyProducts[0],
                this.availableFullSupplyProducts[2]
            ]));
            // SIGLUS-REFACTOR: different data structure
            spyOn(this.requisitionService, 'getOrderableLineItem').andReturn(this.$q.resolve(
                [{
                    lineItem: {
                        orderable: this.availableFullSupplyProducts[0],
                        requestedQuantity: 0,
                        $deletable: true
                    },
                    approvedProduct: this.availableFullSupplyProducts[0]
                }, {
                    lineItem: {
                        orderable: this.availableFullSupplyProducts[2],
                        requestedQuantity: 0,
                        $deletable: true
                    },
                    approvedProduct: this.availableFullSupplyProducts[2]
                }]
            ));
            spyOn(this.requisition, 'addProductLineItem');
            // SIGLUS-REFACTOR: ends here
        });

        it('should show alert if there are no skipped full supply products', function() {
            this.requisition.getAvailableFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addFullSupplyProducts();

            expect(this.alertService.error).toHaveBeenCalledWith(
                'requisitionViewTab.noProductsToAdd.label',
                'requisitionViewTab.noProductsToAdd.message'
            );
        });

        it('should not open modal if there no skipped full supply products to add', function() {
            this.requisition.getAvailableFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addFullSupplyProducts();

            expect(this.selectProductsModalService.show).not.toHaveBeenCalled();
        });

        it('should do nothing if modal was dismissed', function() {
            this.selectProductsModalService.show.andReturn(this.$q.reject());

            this.initController();
            this.vm.addFullSupplyProducts();

            // SIGLUS-REFACTOR: starts here
            expect(this.requisition.addProductLineItem).not.toHaveBeenCalled();
            expect(this.requisition.addProductLineItem).not.toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
        });

        // it('should unskip full supply products', function() {
        //     this.initController();
        //     this.vm.addFullSupplyProducts();
        //     this.$rootScope.$apply();
        //
        //     // SIGLUS-REFACTOR: starts here
        //     expect(this.requisition.addProductLineItem).toHaveBeenCalledWith({
        //         orderable: this.availableFullSupplyProducts[0],
        //         approvedProduct: this.availableFullSupplyProducts[0],
        //         requestedQuantity: 0,
        //         $deletable: true
        //     });
        //
        //     expect(this.requisition.addProductLineItem).toHaveBeenCalledWith({
        //         orderable: this.availableFullSupplyProducts[2],
        //         approvedProduct: this.availableFullSupplyProducts[2],
        //         requestedQuantity: 0
        //     });
        //     // SIGLUS-REFACTOR: ends here
        // });

        it('should show products in alphabetical order', function() {
            this.initController();
            this.vm.addFullSupplyProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(this.availableFullSupplyProducts[1]);
            expect(actualProducts.products[1]).toEqual(this.availableFullSupplyProducts[2]);
            expect(actualProducts.products[2]).toEqual(this.availableFullSupplyProducts[0]);
        });

    });

    describe('addNonFullSupplyProducts', function() {

        beforeEach(function() {
            this.requisition.getAvailableNonFullSupplyProducts
                .andReturn(angular.copy(this.availableNonFullSupplyProducts));
            this.selectProductsModalService.show.andReturn(this.$q.resolve([
                this.availableNonFullSupplyProducts[0],
                this.availableNonFullSupplyProducts[2]
            ]));

            // SIGLUS-REFACTOR: different data structure
            spyOn(this.requisitionService, 'getOrderableLineItem').andReturn(this.$q.resolve([
                {
                    lineItem: {
                        orderable: this.availableNonFullSupplyProducts[0],
                        requestedQuantity: 0
                    },
                    approvedProduct: this.availableNonFullSupplyProducts[0]
                }, {
                    lineItem: {
                        orderable: this.availableNonFullSupplyProducts[2],
                        requestedQuantity: 0
                    },
                    approvedProduct: this.availableNonFullSupplyProducts[2]
                }
            ]));
            spyOn(this.requisition, 'addProductLineItem');
            // SIGLUS-REFACTOR: ends here
        });

        it('should show alert if there are no available non-full supply products', function() {
            this.requisition.getAvailableNonFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addNonFullSupplyProducts();

            expect(this.alertService.error).toHaveBeenCalledWith(
                'requisitionViewTab.noProductsToAdd.label',
                'requisitionViewTab.noProductsToAdd.message'
            );
        });

        it('should not open modal if there no available non-full supply products', function() {
            this.requisition.getAvailableNonFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.addNonFullSupplyProducts();

            expect(this.selectProductsModalService.show).not.toHaveBeenCalled();
        });

        it('should do nothing if modal was dismissed', function() {
            this.selectProductsModalService.show.andReturn(this.$q.reject());

            this.initController();
            this.vm.addNonFullSupplyProducts();

            expect(this.requisition.unskipFullSupplyProducts).not.toHaveBeenCalled();
            // SIGLUS-REFACTOR: starts here
            expect(this.requisition.addProductLineItem).not.toHaveBeenCalled();
            // SIGLUS-REFACTOR: ends here
        });

        it('should add non-full supply products', function() {
            this.initController();
            this.vm.addNonFullSupplyProducts();
            this.$rootScope.$apply();

            // SIGLUS-REFACTOR: starts here
            expect(this.requisition.addProductLineItem).toHaveBeenCalledWith({
                orderable: this.availableNonFullSupplyProducts[0],
                approvedProduct: this.availableNonFullSupplyProducts[0],
                requestedQuantity: 0,
                $deletable: true
            });

            expect(this.requisition.addProductLineItem).toHaveBeenCalledWith({
                orderable: this.availableNonFullSupplyProducts[2],
                approvedProduct: this.availableNonFullSupplyProducts[2],
                requestedQuantity: 0,
                $deletable: true
            });
            // SIGLUS-REFACTOR: ends here
        });

        it('should show products in alphabetical order', function() {
            this.initController();
            this.vm.addNonFullSupplyProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(this.availableNonFullSupplyProducts[2]);
            expect(actualProducts.products[1]).toEqual(this.availableNonFullSupplyProducts[1]);
            expect(actualProducts.products[2]).toEqual(this.availableNonFullSupplyProducts[0]);
        });

    });

    describe('unskipFullSupplyProducts', function() {

        beforeEach(function() {
            this.requisition.getSkippedFullSupplyProducts.andReturn(angular.copy(this.skippedFullSupplyProducts));
            this.selectProductsModalService.show.andReturn(this.$q.resolve([
                this.skippedFullSupplyProducts[0],
                this.skippedFullSupplyProducts[2]
            ]));
            this.fullSupply = true;
        });

        it('should show alert if there are no skipped full supply products', function() {
            this.requisition.getSkippedFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.unskipFullSupplyProducts();

            expect(this.alertService.error).toHaveBeenCalledWith(
                'requisitionViewTab.noProductsToAdd.label',
                'requisitionViewTab.noProductsToAdd.message'
            );
        });

        it('should not open modal if there no skipped full supply products to add', function() {
            this.requisition.getSkippedFullSupplyProducts.andReturn([]);

            this.initController();
            this.vm.unskipFullSupplyProducts();

            expect(this.selectProductsModalService.show).not.toHaveBeenCalled();
        });

        it('should do nothing if modal was dismissed for skipped products', function() {
            this.selectProductsModalService.show.andReturn(this.$q.reject());

            this.initController();
            this.vm.unskipFullSupplyProducts();

            expect(this.requisition.unskipFullSupplyProducts).not.toHaveBeenCalled();
            expect(this.requisition.addLineItems).not.toHaveBeenCalled();
        });

        it('should unskip full supply products', function() {
            this.initController();
            this.vm.unskipFullSupplyProducts();
            this.$rootScope.$apply();

            expect(this.requisition.unskipFullSupplyProducts)
                .toHaveBeenCalledWith([
                    this.skippedFullSupplyProducts[0],
                    this.skippedFullSupplyProducts[2]
                ]);
        });

        it('should show products in alphabetical order', function() {
            this.initController();
            this.vm.unskipFullSupplyProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(3);
            expect(actualProducts.products[0]).toEqual(this.skippedFullSupplyProducts[1]);
            expect(actualProducts.products[1]).toEqual(this.skippedFullSupplyProducts[0]);
            expect(actualProducts.products[2]).toEqual(this.skippedFullSupplyProducts[2]);
        });

    });

    describe('showDeleteColumn', function() {

        beforeEach(function() {
            this.fullSupply = false;
            this.canSubmit = false;
            this.canAuthorize = false;
            this.requisition.requisitionLineItems[1].$deletable = true;
        });

        it('should return false if viewing full supply tab', function() {
            this.fullSupply = true;

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(true);
        });

        it('should return false if there is no deletable line items', function() {
            this.canSubmit = true;
            this.requisition.requisitionLineItems[1].$deletable = false;

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(true);
        });

        it('should return false if there is no line items', function() {
            this.requisition.requisitionLineItems = [];

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(true);
        });

        it('should return true if user has right to authorize submitted requisition', function() {
            this.canSubmit = true;

            this.initController();

            expect(this.vm.showDeleteColumn()).toBe(true);
        });

    });

    describe('skippedFullSupplyProductCountMessage', function() {

        it('should count the number of skipped line items and return the right message', function() {
            this.initController();
            this.messageService.get.isSpy = false;
            spyOn(this.messageService, 'get').andCallFake(function(p1, p2) {
                return p2;
            });
            this.requisition.requisitionLineItems[0].skipped = true;

            expect(this.vm.skippedFullSupplyProductCountMessage().skippedProductCount).toBe(1);
        });

        it('should not count the number of skipped line items that are not full supply', function() {
            this.initController();

            this.messageService.get.isSpy = false;
            spyOn(this.messageService, 'get').andCallFake(function(p1, p2) {
                return p2;
            });
            this.requisition.requisitionLineItems[0].skipped = true;
            this.requisition.requisitionLineItems[0].$program.fullSupply = false;

            expect(this.vm.skippedFullSupplyProductCountMessage().skippedProductCount).toBe(0);
        });
    });

    describe('getDescriptionForColumn', function() {

        it('should return column definition for regular columns', function() {
            this.initController();

            expect(this.vm.getDescriptionForColumn(this.columns[0])).toEqual(this.columns[0].definition);
        });

        it('should return info about disabled total losses and adjustments modal', function() {
            this.columns.push(this.totalLossesAndAdjustmentsColumn);
            this.requisition.template.populateStockOnHandFromStockCards = true;

            this.initController();

            expect(this.vm.getDescriptionForColumn(this.columns[1]))
                .toEqual(this.columns[1].definition);
        });
    });

    // #352: can add skipped products
    describe('siglusAddProducts', function() {

        beforeEach(function() {
            var self = this;
            this.requisition.getSkippedProducts = function() {
                return angular.copy([self.skippedFullSupplyProducts[0]]);
            };
            this.requisition.getAvailableFullSupplyProducts.andReturn(
                angular.copy([this.availableFullSupplyProducts[0]])
            );
            this.requisition.template.hideSkippedLineItems.andReturn(true);
            this.selectProductsModalService.show.andReturn(this.$q.resolve([]));
        });

        it('should show the skipped products and available products', function() {
            this.initController();
            this.vm.showSkipControls = true;
            this.vm.siglusAddProducts();

            var actualProducts = this.selectProductsModalService.show.calls[0].args[0];

            expect(actualProducts.products.length).toEqual(2);
            expect(actualProducts.products[0]).toEqual(this.availableFullSupplyProducts[0]);
            expect(actualProducts.products[1]).toEqual(this.skippedFullSupplyProducts[0]);
        });

    });
    // #352: ends here

    // #340: quickly fill the tables in R&R during creating an R&R
    describe('showQuicklyFill', function() {

        beforeEach(function() {
            this.canSubmit = true;
            this.canAuthorize = true;
            this.requisition.template.extension.enableQuicklyFill = true;
            this.requisition.template.extension.enableConsultationNumber = true;
            this.requisition.template.extension.enableProduct = true;
        });

        it('should show quickly fill button', function() {
            this.initController();

            expect(this.vm.showQuicklyFill()).toEqual(true);
        });

        it('should not show quickly fill button when the requisition can not submit or authorize', function() {
            this.canSubmit = false;
            this.canAuthorize = false;
            this.initController();

            expect(this.vm.showQuicklyFill()).toEqual(false);
        });

        it('should not show quickly fill button when the quickly fill is not enabled', function() {
            this.requisition.template.extension.enableQuicklyFill = false;
            this.initController();

            expect(this.vm.showQuicklyFill()).toEqual(false);
        });
    });

    describe('quicklyFillHandler', function() {

        it('should show quickly fill button', function() {
            this.initController();
            this.vm.quicklyFillHandler();

            expect(this.$scope.$broadcast).toHaveBeenCalledWith('siglus-quickly-fill');
            expect(this.notificationService.success).toHaveBeenCalledWith('requisitionViewTab.quicklyFill.success');
        });
    });
    // #340: ends here

    function initController() {
        this.vm = this.$controller('ViewTabController', {
            lineItems: [],
            items: [],
            // #286 high level approver can skip some products in requisition
            columns: this.columns,
            // #286 ends here
            requisition: this.requisition,
            canSubmit: this.canSubmit,
            // SIGLUS-REFACTOR: starts here
            canSubmitAndAuthorize: this.canSubmit && this.hasAuthorizeRight,
            hasAuthorizeRight: this.hasAuthorizeRight,
            // SIGLUS-REFACTOR: ends here
            canAuthorize: this.canAuthorize,
            fullSupply: this.fullSupply,
            canApproveAndReject: this.canApproveAndReject,
            // SIGLUS-REFACTOR: starts here
            requisitionService: this.requisitionService,
            loadingModalService: this.loadingModalService,
            homeFacility: this.homeFacility,
            // SIGLUS-REFACTOR: ends here
            // #375: create requisition with test consumption section
            $scope: this.$scope,
            program: this.program,
            canSync: this.canSync,
            isCreateForClient: this.isCreateForClient,
            approvedProducts: [],
            // #375: ends here
            alertConfirmModalService: this.alertConfirmModalService
        });
        this.vm.$onInit();
    }

});
