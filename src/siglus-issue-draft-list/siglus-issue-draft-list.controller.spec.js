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

describe('SiglusIssueDraftListController', function() {
    var vm, $q, confirmDeferred, $rootScope, alertService, confirmService, siglusStockIssueService,
        stockAdjustmentFactory, $controller, ADJUSTMENT_TYPE;

    function prepareInjector() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            siglusStockIssueService = $injector.get('siglusStockIssueService');
            stockAdjustmentFactory = $injector.get('stockAdjustmentFactory');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            alertService = $injector.get('alertService');
            confirmService = $injector.get('confirmService');
            $controller = $injector.get('$controller');
        });
    }

    function prepareSpies() {
        spyOn(siglusStockIssueService, 'removeIssueDraft').andReturn($q.resolve());
        spyOn(stockAdjustmentFactory, 'getDraft').andReturn($q.resolve([]));
        spyOn(alertService, 'error');
        confirmDeferred = $q.defer();
        spyOn(confirmService, 'confirmDestroy').andReturn(confirmDeferred.promise);

    }

    function prepareData() {

        vm = $controller('SiglusIssueDraftListController', {
            user: {
                // eslint-disable-next-line camelcase
                user_id: 'C00001'
            },
            $scope: $rootScope.$new(),
            programId: '000000-000000-000000-0000000',
            facilityId: '004f4232-cfb8-11e9-9398-0242ac130008',
            adjustmentType: ADJUSTMENT_TYPE.ISSUE,
            draftInfo: {
                documentationNo: 'abc',
                issueTo: 'efc',
                drafts: [
                    {
                        draftNumber: '000000001',
                        status: 'Not Yet Start',
                        operator: ''
                    },
                    {
                        draftNumber: '000000002',
                        status: 'Not Yet Start',
                        operator: ''
                    },
                    {
                        draftNumber: '000000003',
                        status: 'Not Yet Start',
                        operator: ''
                    }
                ]
            }
        });

    }

    beforeEach(function() {
        module('stockmanagement');
        module('siglus-issue-draft-list');
        module('stock-adjustment');
        module('stock-orderable-group');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('removeDraft method', function() {
        it('should call remove draft api when click confirm delete button', function() {
            var draft = {};
            vm.removeDraft(draft);
            confirmDeferred.resolve();
            $rootScope.$apply();

            expect(siglusStockIssueService.removeIssueDraft).toHaveBeenCalled();
        });

    });
});
