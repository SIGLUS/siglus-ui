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

describe('LocationPhysicalInventoryListController', function() {

    var $controller, $state, programs, facility, vm, drafts, $scope, $rootScope;
    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
        });
    }

    function prepareSpies() {
        spyOn($state, 'go');
        spyOn($scope, '$on');
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
        drafts = [{
            programId: '1'
        }, {
            programId: '2'
        }];

        vm = $controller('LocationPhysicalInventoryListController', {
            facility: facility,
            programs: programs,
            program: programs[0],
            programId: programs[0].id,
            drafts: drafts,
            $scope: $scope
        });
    }

    beforeEach(function() {
        module('siglus-location-physical-inventory-list');
        module('stock-physical-inventory');
        module('stock-products');
        module('stock-orderable-group');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('onInit', function() {

        it('should init programs and physical inventory drafts properly', function() {
            expect(vm.programs).toEqual(programs);
            expect(vm.drafts).toEqual(drafts);
        });

    });
});
