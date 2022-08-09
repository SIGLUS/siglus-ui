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

describe('SiglusSignatureWithDateModalController', function() {

    // SIGLUS-REFACTOR: remove UNPACK_REASONS and add siglusSignatureModalService
    var vm, $q, $controller;
    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
        });
    }

    function prepareSpies() {
    }

    function prepareData() {

        vm = $controller('SiglusSignatureWithDateModalController', {
            message: '',
            confirmMessage: '',
            cancelMessage: '',
            onlyShowToday: true,
            confirmDeferred: $q.defer(),
            modalDeferred: $q.defer()
        });
    }

    beforeEach(function() {
        module('openlmis-modal');
        prepareInjector();
        prepareSpies();
        prepareData();
        vm.$onInit();
    });

    describe('changeDateType', function() {

        it('should return null when isToday flag is false', function() {
            vm.changeDateType();

            expect(vm.occurredDate).toEqual(null);
        });

        it('should return current date when isToday flag is true', function() {
            vm.changeDateType(true);
            var date = new Date();

            expect(vm.occurredDate).toEqual(date);

        });
    });

    describe('confirm', function() {
        it('should set signatureIsRequired to true when click confirm and signature has no value', function() {
            vm.confirm();

            expect(vm.signatureIsRequired).toEqual(true);
        });
    });

});
