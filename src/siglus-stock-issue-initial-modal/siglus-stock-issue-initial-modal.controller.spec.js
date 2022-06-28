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

describe('SiglusInitialIssueModalController', function() {
    var vm, $q, $state, $rootScope, modalDeferred, loadingModalService, sourceDestinationService,
        siglusStockIssueService, siglusInitialIssueModalService, $controller;

    function prepareInjector() {
        inject(function($injector) {
            $q = $injector.get('$q');
            siglusInitialIssueModalService = $injector.get('siglusInitialIssueModalService');
            sourceDestinationService = $injector.get('sourceDestinationService');
            $rootScope = $injector.get('$rootScope');
            siglusStockIssueService = $injector.get('siglusStockIssueService');
            $state = $injector.get('$state');
            loadingModalService = $injector.get('loadingModalService');
            $controller = $injector.get('$controller');
        });
    }

    function prepareSpies() {
        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn($state, 'go');
        modalDeferred = $q.defer();

    }

    function prepareData() {
        siglusInitialIssueModalService.facilityId = '2ee6bbf4-cfcf-11e9-9535-0242ac130005';
        siglusInitialIssueModalService.programId = '00000000-0000-0000-0000-000000000000';
        vm = $controller('SiglusInitialIssueModalController', {
            modalDeferred: modalDeferred
        });

    }

    beforeEach(function() {
        module('stock-adjustment-creation');
        module('siglus-stock-issue-initial-modal');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('$onInit method', function() {
        it('should init issueToList when open dialog', function() {
            var deferred = $q.defer();
            spyOn(sourceDestinationService, 'getDestinationAssignments').andReturn(deferred.promise);
            vm.$onInit();
            deferred.resolve([{
                id: 1,
                name: 'test'
            }]);
            $rootScope.$apply();

            expect(vm.issueToList).toEqual([{
                id: 1,
                name: 'test'
            }]);

            expect(loadingModalService.close).toHaveBeenCalled();
        });
    });

    describe('changeIssueTo method', function() {
        it('should clear destinationFacility when switch issueTo select', function() {
            vm.destinationFacility = 'test destination facility';
            vm.changeIssueTo();

            expect(vm.destinationFacility).toEqual('');
        });
    });

    describe('submitForm method', function() {
        it('should go to draft list page when successfully saved form', function() {
            var deferred = $q.defer();
            spyOn(siglusStockIssueService, 'initIssueDraft').andReturn(deferred.promise);
            vm.submitForm();
            deferred.resolve();
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.issue.draft');
        });

        it('should hasError flag set to true when saved form occur error', function() {
            var deferred = $q.defer();
            spyOn(siglusStockIssueService, 'initIssueDraft').andReturn(deferred.promise);
            vm.submitForm();
            deferred.reject();
            $rootScope.$apply();

            expect(vm.hasError).toEqual(true);
        });

        it('should refresh issue page status when saved form occur error and click continue button', function() {
            var deferred = $q.defer();
            spyOn(siglusStockIssueService, 'initIssueDraft').andReturn(deferred.promise);
            spyOn(siglusStockIssueService, 'getIssueDrafts').andReturn($q.resolve());
            vm.submitForm();
            deferred.reject();
            $rootScope.$apply();

            expect(vm.hasError).toEqual(true);

            vm.submitForm();

            expect(siglusStockIssueService.getIssueDrafts).toHaveBeenCalled();
        });
    });
});
