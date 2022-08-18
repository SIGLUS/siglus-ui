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

describe('SiglusLocationMovementController', function() {

    // SIGLUS-REFACTOR: add user, drafts
    var vm, state, facility, programs, user, $controller,
        siglusLocationMovementService, $q, $rootScope, deferred, loadingModalService;
    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            siglusLocationMovementService = $injector.get('siglusLocationMovementService');
            loadingModalService = $injector.get('loadingModalService');
            $q = $injector.get('$q');
        });
    }

    function prepareSpies() {
        deferred = $q.defer();
        spyOn(loadingModalService, 'open').andReturn($q.resolve());
        spyOn(loadingModalService, 'close').andReturn($q.resolve());
        spyOn(siglusLocationMovementService, 'getMovementDrafts').andReturn(deferred.promise);
    }

    function prepareData() {
        vm = $controller('SiglusLocationMovementController', {
            facility: facility,
            programs: programs,
            $state: state,
            initialDraftInfo: {},
            user: user
        });
    }

    beforeEach(function() {
        module('ngResource');
        module('siglus-location-movement');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('$onInit method', function() {
        it('should set hasExistInitialDraft to true when drafts length mt 1', function() {
            vm.$onInit();
            deferred.resolve([1, 2]);
            $rootScope.$apply();

            expect(vm.hasExistInitialDraft).toEqual(true);
        });

        it('should set hasExistInitialDraft to false when drafts length equal 0', function() {
            vm.$onInit();
            deferred.resolve([]);
            $rootScope.$apply();

            expect(vm.hasExistInitialDraft).toEqual(false);
        });
    });
});
