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

describe('openlmis.stockmanagement.archivedProductSummaries', function() {

    var $q, $state, $rootScope, $location, $templateCache, state, STOCKMANAGEMENT_RIGHTS, authorizationService,
        stockCardRepositoryMock, StockCardSummaryDataBuilder, stockCardSummaries, facilityFactory,
        MinimalFacilityDataBuilder, homeFacility, UserDataBuilder, user, programService, stockProgramUtilService;

    beforeEach(function() {
        loadModules();
        injectServices();
        prepareTestData();
        prepareSpies();
    });

    it('should be available under \'stockmanagement/archivedProductSummaries\'', function() {
        expect($state.current.name).not.toEqual('openlmis.stockmanagement.archivedProductSummaries');

        goToUrl('/stockmanagement/archivedProduct');

        expect($state.current.name).toEqual('openlmis.stockmanagement.archivedProductSummaries');
    });

    it('should resolve stockCardSummaries', function() {
        goToUrl('/stockmanagement/archivedProduct' +
            '?archivedStockCardListPage=0&archivedStockCardListSize=10&program=program-id');

        expect(getResolvedValue('stockCardSummaries')).toEqual(stockCardSummaries);
    });

    it('should call stock card summary repository with parameters', function() {
        goToUrl('/stockmanagement/archivedProduct' +
            '?archivedStockCardListPage=0&archivedStockCardListSize=10&facility=facility-id&program=program-id');

        expect(getResolvedValue('stockCardSummaries')).toEqual(stockCardSummaries);
        expect(stockCardRepositoryMock.query).toHaveBeenCalledWith({
            page: 0,
            size: 2147483647,
            facilityId: 'facility-id',
            programId: 'program-id',
            nonEmptyOnly: true,
            archivedOnly: true,
            rightName: 'STOCK_CARDS_VIEW'
        });
    });

    it('should use template', function() {
        spyOn($templateCache, 'get').andCallThrough();

        goToUrl('/stockmanagement/archivedProduct');

        expect($templateCache.get).toHaveBeenCalledWith(
            'stock-card-summary-list/siglus-archived-product-summary-list.html'
        );
    });

    it('should require stock cards view right to enter', function() {
        expect(state.accessRights).toEqual([STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]);
    });

    function loadModules() {
        stockCardRepositoryMock = jasmine.createSpyObj('stockCardSummaryRepository', ['query']);
        module('stock-card-summary-list', function($provide) {
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return stockCardRepositoryMock;
                };
            });
        });
        module('stock-program-util');
        module('stock-card');
        module('stock-orderable-group');
    }

    function injectServices() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            $templateCache = $injector.get('$templateCache');
            authorizationService = $injector.get('authorizationService');
            STOCKMANAGEMENT_RIGHTS = $injector.get('STOCKMANAGEMENT_RIGHTS');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            facilityFactory = $injector.get('facilityFactory');
            MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            UserDataBuilder = $injector.get('UserDataBuilder');
            programService = $injector.get('programService');
            stockProgramUtilService = $injector.get('stockProgramUtilService');
        });
    }

    function prepareTestData() {
        state = $state.get('openlmis.stockmanagement.stockCardSummaries');
        stockCardSummaries = [
            new StockCardSummaryDataBuilder().build(),
            new StockCardSummaryDataBuilder().build()
        ];

        homeFacility = new MinimalFacilityDataBuilder().build();
        user = new UserDataBuilder()
            .withHomeFacilityId(homeFacility.id)
            .build();
    }

    function prepareSpies() {
        stockCardRepositoryMock.query.andReturn($q.when({
            content: stockCardSummaries
        }));
        spyOn(authorizationService, 'hasRight').andReturn(true);
        spyOn(authorizationService, 'getUser').andReturn($q.resolve(user));
        spyOn(facilityFactory, 'getUserHomeFacility').andReturn($q.resolve(homeFacility));
        spyOn(programService, 'getAllProductsProgram').andReturn($q.resolve([]));
        spyOn(stockProgramUtilService, 'getPrograms').andReturn($q.resolve([]));
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }
});
