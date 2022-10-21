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

describe('SiglusSohLocationDetailPrintController', function() {
    var vm, $controller, $rootScope;

    var productName = 'Acido acetilsalicilico (Aspirina); 500mg; Comp';

    var stockCardWithUnit = {
        productName: productName,
        displayUnit: 'each'
    };

    var stockCardWithoutUnit = {
        productName: productName
    };

    function prepareInjector() {
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
        });
    }

    function prepareData() {
        $rootScope.$apply();
        vm = $controller('SiglusSohLocationDetailPrintController', {
            $scope: $rootScope,
            facility: {},
            stockCard: stockCardWithUnit,
            program: {}
        });
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-soh-location-detail-print');
        prepareInjector();
        prepareData();
    });

    describe('getProductName method', function() {
        it('should return product name with unit when display unit is not empty', function() {
            vm.stockCard = stockCardWithUnit;

            expect(vm.getProductName()).toEqual(productName + ' - each');
        });

        it('should return product name without unit when display unit is empty', function() {
            vm.stockCard = stockCardWithoutUnit;

            expect(vm.getProductName()).toEqual(productName);
        });
    });
});
