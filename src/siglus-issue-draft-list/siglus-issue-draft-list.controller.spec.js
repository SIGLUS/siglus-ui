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
        stockAdjustmentFactory, $controller, ADJUSTMENT_TYPE, $stateParams;

    function prepareInjector() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $stateParams = $injector.get('$stateParams');
            siglusStockIssueService = $injector.get('siglusStockIssueService');
            stockAdjustmentFactory = $injector.get('stockAdjustmentFactory');
            ADJUSTMENT_TYPE = $injector.get('ADJUSTMENT_TYPE');
            alertService = $injector.get('alertService');
            confirmService = $injector.get('confirmService');
            $controller = $injector.get('$controller');
        });
    }

    function prepareSpies() {
        confirmDeferred = $q.defer();
        spyOn(siglusStockIssueService, 'removeIssueDraft').andReturn($q.resolve());
        spyOn(siglusStockIssueService, 'queryIssueToInfo').andReturn($q.resolve());
        spyOn(siglusStockIssueService, 'getIssueDrafts').andReturn($q.resolve());
        spyOn(siglusStockIssueService, 'createIssueDraft').andReturn(confirmDeferred.promise);
        spyOn(stockAdjustmentFactory, 'getDraft').andReturn($q.resolve([]));
        spyOn(alertService, 'error');
        spyOn(confirmService, 'confirmDestroy').andReturn(confirmDeferred.promise);

    }

    function prepareData() {

        vm = $controller('SiglusIssueDraftListController', {
            user: {
                // eslint-disable-next-line camelcase
                user_id: 'C00001'
            },
            $scope: $rootScope.$new(),
            $stateParams: $stateParams,
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
            var draft = {
                id: '6f0e7285-e391-419c-831d-10076ade1931'
            };
            vm.removeDraft(draft);
            confirmDeferred.resolve();
            $rootScope.$apply();

            expect(siglusStockIssueService.removeIssueDraft)
                .toHaveBeenCalledWith('6f0e7285-e391-419c-831d-10076ade1931');
        });

    });

    describe('getDestinationName method', function() {
        it('should return Outros destinationName when selected destinationName is Outros', function() {
            vm.issueToInfo = {
                destinationId: '00001',
                destinationName: 'Outros',
                locationFreeText: 'test',
                documentNumber: 'number-1'
            };

            expect(vm.getDestinationName()).toEqual('Outros: test');
        });

        it('should return destinationName when selected destinationName is not Outroså', function() {
            vm.issueToInfo = {
                destinationId: '00001',
                destinationName: 'destination name',
                locationFreeText: 'test',
                documentNumber: 'number-1'
            };

            expect(vm.getDestinationName()).toEqual('destination name');
        });
    });

    describe('$onInit method', function() {
        it('should call api to get issueToInfo when issueToInfo not exist in $stateParams', function() {
            vm.$onInit();

            expect(siglusStockIssueService.queryIssueToInfo).toHaveBeenCalledWith('000000-000000-000000-0000000',
                '004f4232-cfb8-11e9-9398-0242ac130008', 'issue');
        });

        it('should only call refresh list method when issueToInfo exist in $stateParams', function() {
            $stateParams.issueToInfo = {
                id: 'A000001',
                destinationId: '00001',
                destinationName: 'destination name',
                locationFreeText: 'test',
                documentNumber: 'number-1'
            };
            vm.$onInit();

            expect(siglusStockIssueService.getIssueDrafts).toHaveBeenCalledWith({
                initialDraftId: 'A000001'
            });
        });
    });

    describe('addDraft method', function() {
        it('should alert error dialog when current drafts is over 10', function() {
            vm.drafts = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
            vm.addDraft();

            expect(alertService.error).toHaveBeenCalledWith('issueDraft.exceedTenDraftHint');
        });

        it('should create draft when current drafts is less than 11', function() {
            vm.drafts = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
            vm.issueToInfo = {
                id: 'A000001'
            };
            vm.addDraft();
            confirmDeferred.resolve();
            $rootScope.$apply();

            expect(siglusStockIssueService.createIssueDraft).toHaveBeenCalledWith({
                programId: '000000-000000-000000-0000000',
                facilityId: '004f4232-cfb8-11e9-9398-0242ac130008',
                userId: 'C00001',
                initialDraftId: 'A000001',
                draftType: 'issue'
            });
        });

        it('should alert error message from backend when current draft is over 10', function() {
            vm.drafts = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
            vm.issueToInfo = {
                id: 'A000001'
            };
            vm.addDraft();
            confirmDeferred.reject({
                data: {
                    title: 'Bad Request',
                    status: 400,
                    isBusinessError: true,
                    businessErrorExtraData: 'same drafts more than limitation'
                }
            });
            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith('issueDraft.exceedTenDraftHint');
        });
    });
});