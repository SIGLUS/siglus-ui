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

describe('SiglusSohProductDetailController', function() {
    var vm, facility, $controller, stockCardService;
    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            stockCardService = $injector.get('stockCardService');
        });
    }

    function prepareSpies() {
        spyOn(stockCardService, 'printByProduct').andReturn();
    }

    function prepareData() {
        vm = $controller('SiglusSohProductDetailController', {
            facility: facility,
            stockCard: {
                productName: 'Acido acetilsalicilico (Aspirina); 500mg; Comp',
                productCode: '07A02',
                facilityName: 'Centro de Saude de Macucune',
                displayUnit: 'each',
                inKit: false,
                orderableId: '2ee6bbf4-cfcf-11e9-9535-0242ac130005',
                stockOnHand: 0,
                lineItems: [{
                    productSoh: 0
                }]
            }
        });
    }

    beforeEach(function() {
        module('ui.router');
        module('siglus-location-stock-on-hand');
        module('stock-card');
        module('siglus-soh-product-detail');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('print method', function() {
        it('should call print product service by orderableId', function() {
            vm.$onInit();
            vm.print();

            expect(stockCardService.printByProduct).toHaveBeenCalledWith('2ee6bbf4-cfcf-11e9-9535-0242ac130005');
        });
    });

    describe('getProductName method', function() {
        it('should return product name with unit when display unit is not empty', function() {
            vm.$onInit();

            expect(vm.getProductName()).toEqual('Acido acetilsalicilico (Aspirina); 500mg; Comp - each');
        });

        it('should return product name without unit when display unit is empty', function() {

            vm.$onInit();

            vm.stockCard.displayUnit = '';

            expect(vm.getProductName()).toEqual('Acido acetilsalicilico (Aspirina); 500mg; Comp');
        });
    });
});
