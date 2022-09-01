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

describe('SiglusLocationStockOnHandController', function() {
    var vm, facility, $controller, $state, $stateParams, siglusLocationCommonFilterService,
        stockCardService;
    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $stateParams = $injector.get('$stateParams');
            stockCardService = $injector.get('stockCardService');
            siglusLocationCommonFilterService = $injector.get('siglusLocationCommonFilterService');
        });
    }

    function prepareSpies() {
        spyOn(stockCardService, 'printByProduct').andReturn();
        spyOn($state, 'go').andReturn();
    }

    function prepareData() {
        vm = $controller('SiglusLocationStockOnHandController', {
            facility: facility,
            stockCardSummaries: [],
            displayItems: [],
            user: {},
            programs: [],
            stockCardLineItems: []
        });
    }

    beforeEach(function() {
        module('stock-card');
        module('siglus-location-common');
        module('siglus-location-stock-on-hand');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('onInit method', function() {
        it('should return to prev page when total page is 2 and to page is 1', function() {
            $stateParams.pageNumber = 1;
            $stateParams.pageSize = 2;
            spyOn(siglusLocationCommonFilterService, 'filterList').andReturn([1, 2, 3]);
            vm.$onInit();

            expect($stateParams.pageNumber).toEqual(1);
        });

        it('should return to first page when total page is 0 and to page is 2', function() {
            $stateParams.pageNumber = 2;
            $stateParams.pageSize = 2;
            spyOn(siglusLocationCommonFilterService, 'filterList').andReturn([1, 2, 3]);
            vm.$onInit();

            expect($stateParams.pageNumber).toEqual(1);
        });

        it('should return to first page when total page is 1', function() {
            $stateParams.pageNumber = 1;
            $stateParams.pageSize = 10;
            spyOn(siglusLocationCommonFilterService, 'filterList').andReturn([1, 2, 3]);
            vm.$onInit();

            expect($stateParams.pageNumber).toEqual(0);
        });
    });

    describe('viewDetail method', function() {
        it('should go to product detail page when type is PRODUCT', function() {
            var lineItem = {
                orderableId: '2ee6bbf4-cfcf-11e9-9535-0242ac130005',
                type: 'PRODUCT'
            };

            vm.viewDetail(lineItem);

            expect($state.go).toHaveBeenCalledWith('openlmis.locationManagement.stockOnHand.productDetail', {
                orderable: '2ee6bbf4-cfcf-11e9-9535-0242ac130005'
            });

        });

        it('should go to Lot detail page when type is LOT', function() {
            var lineItem = {
                stockCardId: '2ee6bbf4-cfcf-11e9-9535-0242ac1390002',
                type: 'LOT'
            };

            vm.viewDetail(lineItem);

            expect($state.go).toHaveBeenCalledWith('openlmis.locationManagement.stockOnHand.lotDetail', {
                stockCardId: '2ee6bbf4-cfcf-11e9-9535-0242ac1390002'
            });

        });

        it('should go to Location detail page when type is LOCATION', function() {
            var lineItem = {
                stockCardId: '2ee6bbf4-cfcf-11e9-9535-0242ac1390002',
                type: 'LOCATION',
                locationCode: 'AA2001'
            };

            vm.viewDetail(lineItem);

            expect($state.go).toHaveBeenCalledWith('openlmis.locationManagement.stockOnHand.locationDetail', {
                stockCardId: '2ee6bbf4-cfcf-11e9-9535-0242ac1390002',
                locationCode: 'AA2001'
            });

        });
    });
});
