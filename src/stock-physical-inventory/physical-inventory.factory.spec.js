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

describe('physicalInventoryFactory', function() {

    var $q, $rootScope, physicalInventoryService, physicalInventoryFactory,
        summaries, draftToSave, StockCardSummaryRepository;

    beforeEach(function() {
        module('stock-physical-inventory', function($provide) {
            physicalInventoryService = jasmine.createSpyObj(
                'physicalInventoryService', ['getDraft', 'getPhysicalInventory', 'saveDraft']
            );
            $provide.factory('physicalInventoryService', function() {
                return physicalInventoryService;
            });

            StockCardSummaryRepository = jasmine.createSpyObj('StockCardSummaryRepository', ['query']);
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return StockCardSummaryRepository;
                };
            });
        });
        module('stock-orderable-group');
        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            physicalInventoryFactory = $injector.get('physicalInventoryFactory');
        });

        summaries = {
            content: [
                {
                    canFulfillForMe: [
                        {
                            stockOnHand: 1,
                            lot: {
                                id: 'lot-1',
                                expirationDate: '2017-06-12'
                            },
                            orderable: {
                                id: 'orderable-1',
                                code: 'orderable-code-1',
                                name: 'orderable-name-1',
                                // #475: Revert code change about the virtual program and real program conversion
                                programs: [{
                                    programId: ''
                                }]
                                // #475: ends here
                            }
                        },
                        {
                            stockOnHand: 2,
                            lot: {
                                id: 'lot-2',
                                expirationDate: '2016-06-12'
                            },
                            orderable: {
                                id: 'orderable-2',
                                code: 'orderable-code-2',
                                name: 'orderable-name-2',
                                // #475: Revert code change about the virtual program and real program conversion
                                programs: [{
                                    programId: ''
                                }]
                                // #475: ends here
                            }
                        }
                    ]
                }
            ]
        };

        draftToSave = {
            id: 'draft-1',
            lineItems: [
                {
                    orderable: {
                        id: 'orderable-1'
                    },
                    lot: {
                        id: 'lot-1'
                    },
                    quantity: 3,
                    vvmStatus: 'STAGE_1',
                    isAdded: false
                },
                {
                    orderable: {
                        id: 'orderable-2'
                    },
                    quantity: null,
                    vvmStatus: null,
                    isAdded: true
                }
            ]
        };

        StockCardSummaryRepository.query.andReturn($q.when(summaries));
        physicalInventoryService.getPhysicalInventory.andReturn($q.reject());
        physicalInventoryService.getDraft.andReturn($q.reject());
        physicalInventoryService.saveDraft.andCallFake(function(passedDraft) {
            return $q.when(passedDraft);
        });
    });

    describe('init', function() {
        it('should expose getDraft method', function() {
            expect(angular.isFunction(physicalInventoryFactory.getDraft)).toBe(true);
        });

        it('should expose getDraftByProgramAndFacility method', function() {
            expect(angular.isFunction(physicalInventoryFactory.getDraftByProgramAndFacility)).toBe(true);
        });

        it('should expose getDrafts method', function() {
            expect(angular.isFunction(physicalInventoryFactory.getDrafts)).toBe(true);
        });

        it('should expose saveDraft method', function() {
            expect(angular.isFunction(physicalInventoryFactory.saveDraft)).toBe(true);
        });
    });

    describe('getDraft', function() {
        var programId,
            facilityId;

        beforeEach(function() {
            programId = 'program-id';
            facilityId = 'facility-id';
        });

        it('should return promise', function() {
            var result = physicalInventoryFactory.getDraft(programId, facilityId);

            expect(result.then).not.toBeUndefined();
            expect(angular.isFunction(result.then)).toBe(true);
        });

        it('should call StockCardSummaryRepository', function() {
            physicalInventoryFactory.getDraft(programId, facilityId);

            expect(StockCardSummaryRepository.query).toHaveBeenCalledWith({
                programId: programId,
                facilityId: facilityId,
                // #225: cant view detail page when not have stock view right
                rightName: 'STOCK_INVENTORIES_EDIT'
                // #225: ends here
            });
        });

        it('should call physicalInventoryService', function() {
            physicalInventoryFactory.getDraft(programId, facilityId);

            expect(physicalInventoryService.getDraft).toHaveBeenCalledWith(programId, facilityId);
        });

        // it('should get proper response when draft was saved', function() {
        //     var returnedDraft;

        //     physicalInventoryService.getDraft.andReturn($q.when([draft]));

        //     physicalInventoryFactory.getDraft(programId, facilityId).then(function(response) {
        //         returnedDraft = response;
        //     });
        //     $rootScope.$apply();

        //     expect(returnedDraft).toBeDefined();
        //     expect(returnedDraft.programId).toEqual(programId);
        //     expect(returnedDraft.facilityId).toEqual(facilityId);
        //     angular.forEach(returnedDraft.lineItems, function(lineItem, index) {
        //         expect(lineItem.stockOnHand).toEqual(summaries.content[0].canFulfillForMe[index].stockOnHand);
        //         expect(lineItem.lot).toEqual(summaries.content[0].canFulfillForMe[index].lot);
        //         expect(lineItem.orderable).toEqual(summaries.content[0].canFulfillForMe[index].orderable);
        //         expect(lineItem.quantity).toEqual(draft.lineItems[index].quantity);
        //         expect(lineItem.vvmStatus).toEqual(draft.lineItems[index].extraData.vvmStatus);
        //     });
        // });

        // it('should get proper response when draft was not saved', function() {
        //     var returnedDraft;

        //     physicalInventoryService.getDraft.andReturn($q.when([]));

        //     physicalInventoryFactory.getDraft(programId, facilityId).then(function(response) {
        //         returnedDraft = response;
        //     });
        //     $rootScope.$apply();

        //     expect(returnedDraft).toBeDefined();
        //     expect(returnedDraft.programId).toEqual(programId);
        //     expect(returnedDraft.facilityId).toEqual(facilityId);
        //     angular.forEach(returnedDraft.lineItems, function(lineItem, index) {
        //         expect(lineItem.stockOnHand).toEqual(summaries.content[0].canFulfillForMe[index].stockOnHand);
        //         expect(lineItem.lot).toEqual(summaries.content[0].canFulfillForMe[index].lot);
        //         expect(lineItem.orderable).toEqual(summaries.content[0].canFulfillForMe[index].orderable);
        //         expect(lineItem.quantity).toEqual(summaries.content[0].canFulfillForMe[index].quantity);
        //         expect(lineItem.vvmStauts).toEqual(null);
        //     });
        // });
    });

    describe('getDraftByProgramAndFacility', function() {
        var programId,
            facilityId;

        beforeEach(function() {
            programId = 'program-id';
            facilityId = 'facility-id';
        });

        it('should return promise', function() {
            var result = physicalInventoryFactory.getDraftByProgramAndFacility(programId, facilityId);

            expect(result.then).not.toBeUndefined();
            expect(angular.isFunction(result.then)).toBe(true);
        });

        it('should call physicalInventoryService', function() {
            physicalInventoryFactory.getDraftByProgramAndFacility(programId, facilityId);

            expect(physicalInventoryService.getDraft).toHaveBeenCalledWith(programId, facilityId);
        });

        // it('should get proper response when draft was saved', function() {
        //     var returnedDraft;

        //     physicalInventoryService.getDraft.andReturn($q.when([draft]));

        //     physicalInventoryFactory.getDraftByProgramAndFacility(programId, facilityId).then(function(response) {
        //         returnedDraft = response;
        //     });
        //     $rootScope.$apply();

        //     expect(returnedDraft).toBeDefined();
        //     expect(returnedDraft.programId).toEqual(programId);
        //     expect(returnedDraft.facilityId).toEqual(facilityId);
        //     expect(returnedDraft.lineItems).toEqual([]);
        // });

        it('should get proper response when draft was not saved', function() {
            var returnedDraft;

            physicalInventoryService.getDraft.andReturn($q.when([]));

            physicalInventoryFactory.getDraftByProgramAndFacility(programId, facilityId).then(function(response) {
                returnedDraft = response;
            });
            $rootScope.$apply();

            expect(returnedDraft).toBeDefined();
            expect(returnedDraft.programId).toEqual(programId);
            expect(returnedDraft.facilityId).toEqual(facilityId);
            expect(returnedDraft.lineItems).toEqual([]);
        });
    });

    describe('saveDraft', function() {
        it('should return promise', function() {
            var result = physicalInventoryFactory.saveDraft(draftToSave);
            $rootScope.$apply();

            expect(result.then).not.toBeUndefined();
            expect(angular.isFunction(result.then)).toBe(true);
        });

        it('should call physicalInventoryService', function() {
            physicalInventoryFactory.saveDraft(draftToSave);

            expect(physicalInventoryService.saveDraft).toHaveBeenCalled();
        });

        it('should save draft with changed lineItems', function() {
            var savedDraft;

            physicalInventoryFactory.saveDraft(draftToSave).then(function(response) {
                savedDraft = response;
            });
            $rootScope.$apply();

            expect(savedDraft).toBeDefined();
            expect(savedDraft.id).toEqual(draftToSave.id);
            expect(savedDraft.lineItems.length).toEqual(2);
            angular.forEach(savedDraft.lineItems, function(lineItem, index) {
                // SIGLUS-REFACTOR: starts here
                var item = draftToSave.lineItems[index];

                if (lineItem.lot && item.lot) {
                    expect(lineItem.lot.id).toEqual(item.lot ? item.lot.id : null);
                }

                if (lineItem.orderable && item.orderable) {
                    expect(lineItem.orderableId).toEqual(item.orderable.id);
                }

                if (lineItem.extraData) {
                    expect(lineItem.extraData.vvmStatus).toEqual(item.vvmStatus);
                }
                // SIGLUS-REFACTOR: ends here
            });
        });
    });
});
