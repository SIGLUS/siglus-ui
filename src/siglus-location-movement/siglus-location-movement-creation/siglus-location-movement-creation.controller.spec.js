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

describe('SiglusLocationMovementCreationController', function() {

    var vm, facility, programs, $controller, $q, loadingModalService;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            $q = $injector.get('$q');
        });
    }

    function prepareSpies() {
        spyOn(loadingModalService, 'open').andReturn($q.resolve());
        spyOn(loadingModalService, 'close').andReturn($q.resolve());
    }

    function prepareData() {
        vm = $controller('SiglusLocationMovementCreationController', {
            facility: facility,
            programs: programs,
            draftInfo: {},
            orderableGroups: []
        });
    }

    beforeEach(function() {

        module('siglus-location-movement-creation');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('vm.showEmptyBlock method', function() {
        it('should show empty block when lineItems length is eq 1 and current index is 0', function() {
            var lineItem = {
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001'
            };
            var lineItems = [
                lineItem
            ];

            expect(vm.showEmptyBlock(lineItem, lineItems, 0)).toEqual(true);
        });

        it('should show empty block when lineItems length is mt 1 and current index is 0', function() {
            var lineItem = {
                isKit: false,
                lot: null,
                location: null,
                orderableId: 'A00001'
            };
            var lineItems = [
                lineItem,
                lineItem
            ];

            expect(vm.showEmptyBlock(lineItem, lineItems, 0)).toEqual(false);
            expect(vm.showEmptyBlock(lineItem, lineItems, 1)).toEqual(true);
        });
    });

});
