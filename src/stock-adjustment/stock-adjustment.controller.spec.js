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

describe('StockAdjustmentController', function() {

    // SIGLUS-REFACTOR: add user, drafts
    var vm, state, facility, programs, user, drafts, rootScope, q, $controller, stockAdjustmentFactory,
        stockAdjustmentService, ADJUSTMENT_TYPE;
    // SIGLUS-REFACTOR: ends here

    beforeEach(function() {

        module('stock-adjustment');
        module('stock-orderable-group');

        inject(
            function($q, $rootScope, $injector) {
                q = $injector.get('$q');
                rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
                stockAdjustmentFactory = $injector.get('stockAdjustmentFactory');
                stockAdjustmentService = $injector.get('stockAdjustmentService');

                state = jasmine.createSpyObj('$state', ['go']);

                programs = [{
                    name: 'HIV',
                    id: '1'
                }, {
                    name: 'TB',
                    id: '2'
                }];
                facility = {
                    id: '10134',
                    name: 'National Warehouse',
                    supportedPrograms: programs
                };

                // SIGLUS-REFACTOR: starts here
                drafts = [];
                user = {};
                // SIGLUS-REFACTOR: ends here

                vm = $controller('StockAdjustmentController', {
                    facility: facility,
                    programs: programs,
                    adjustmentType: ADJUSTMENT_TYPE.ADJUSTMENT,
                    $state: state,
                    // SIGLUS-REFACTOR: starts here
                    drafts: drafts,
                    user: user
                    // SIGLUS-REFACTOR: ends here
                });
            }
        );
    });

    it('should init programs properly', function() {
        expect(vm.programs).toEqual(programs);
    });

    it('should go to stock adjustment draft page when proceed', function() {
        var chooseProgram = {
            name: 'HIV',
            id: '1'
        };
        // SIGLUS-REFACTOR: starts here
        var draft = {
            id: '123456789'
        };
        chooseProgram.draft = draft;
        spyOn(stockAdjustmentFactory, 'getDraft').andReturn(q.resolve(draft));

        vm.proceed(chooseProgram);
        rootScope.$apply();

        expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.adjustment.creation', {
            programId: '1',
            program: chooseProgram,
            facility: facility,
            draft: draft,
            draftId: draft.id
        });
        // SIGLUS-REFACTOR: ends here
    });

    it('should go to stock create new draft when proceed', function() {
        var chooseProgram = {
            name: 'HIV',
            id: '1'
        };
        // SIGLUS-REFACTOR: starts here
        var draft = {
            id: '123456789'
        };
        chooseProgram.draft = draft;
        spyOn(stockAdjustmentFactory, 'getDraft').andReturn(q.resolve());
        spyOn(stockAdjustmentService, 'createDraft').andReturn(q.resolve(draft));

        vm.proceed(chooseProgram);
        rootScope.$apply();

        expect(state.go).toHaveBeenCalledWith('openlmis.stockmanagement.adjustment.creation', {
            programId: '1',
            program: chooseProgram,
            facility: facility,
            draft: draft,
            draftId: draft.id
        });
        // SIGLUS-REFACTOR: ends here
    });
});
