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
    var vm, state, facility, programs, user, $controller, ADJUSTMENT_TYPE, siglusInitialIssueModalService,
        siglusStockIssueService, $q, deferred, $rootScope;
    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            siglusInitialIssueModalService = $injector.get('siglusInitialIssueModalService');
            siglusStockIssueService = $injector.get('siglusStockIssueService');
        });
    }

    function prepareSpies() {
        deferred = $q.defer();
        state = jasmine.createSpyObj('$state', ['go']);
        spyOn(siglusInitialIssueModalService, 'show').andReturn(deferred.promise);
        spyOn(siglusStockIssueService, 'queryIssueToInfo').andReturn($q.resolve({}));
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
        user = {};
        vm = $controller('StockIssueInitialController', {
            facility: facility,
            programs: programs,
            adjustmentType: ADJUSTMENT_TYPE.ADJUSTMENT,
            $state: state,
            issueToInfo: {},
            user: user
        });
    }

    beforeEach(function() {
        module('stock-issue');
        module('stock-orderable-group');
        module('siglus-stock-issue-initial-modal');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('setDraftAttribute method', function() {
        it('should reload issue to info when confirm return value is true', function() {
            vm.start({
                program: {
                    id: '123123'
                }
            });
            deferred.resolve(true);
            $rootScope.$apply();

            expect(siglusStockIssueService.queryIssueToInfo).toHaveBeenCalled();
        });
    });
});
