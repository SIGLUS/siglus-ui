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

describe('StockIssueInitialController', function() {

    // SIGLUS-REFACTOR: add user, drafts
    var vm, state, facility, programs, user, drafts, $controller, ADJUSTMENT_TYPE, siglusInitialIssueModalService;
    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            siglusInitialIssueModalService = $injector.get('siglusInitialIssueModalService');
        });
    }

    function prepareSpies() {
        state = jasmine.createSpyObj('$state', ['go']);
        spyOn(siglusInitialIssueModalService, 'show');
    }

    function prepareData() {
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
        drafts = [];
        user = {};
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

    beforeEach(function() {
        module('stock-adjustment');
        module('stock-orderable-group');
        module('siglus-stock-issue-initial-modal');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('setDraftAttribute method', function() {
        it('should return result contains draft equal to true when input data is not empty', function() {
            var data = [{
                draftType: 'issue',
                id: '0aeb0d2a-6b05-42c4-a38b-0e7d53014678',
                isDraft: true,
                programId: '1'
            }];

            var result = [{
                name: 'HIV',
                draft: true,
                id: '1'
            }, {
                name: 'TB',
                draft: false,
                id: '2'
            }];
            vm.setDraftAttribute(data);

            expect(vm.programs).toEqual(result);
        });

        it('should return result all contains true when input data is empty array', function() {
            var data = [];

            var result = [{
                name: 'HIV',
                draft: false,
                id: '1'
            }, {
                name: 'TB',
                draft: false,
                id: '2'
            }];
            vm.setDraftAttribute(data);

            expect(vm.programs).toEqual(result);
        });

    });
});
