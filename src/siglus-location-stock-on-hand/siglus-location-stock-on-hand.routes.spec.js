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

describe('openlmis.locationManagement.stockOnHand', function() {
    var $state, $rootScope, siglusLocationStockOnHandService, stockProgramUtilService, $q, programService;

    function prepareInjector() {
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            siglusLocationStockOnHandService = $injector.get('siglusLocationStockOnHandService');
            stockProgramUtilService = $injector.get('stockProgramUtilService');
            programService = $injector.get('programService');
        });
    }

    function prepareSpies() {
        spyOn(siglusLocationStockOnHandService, 'getStockCardForProduct').andReturn();
        spyOn(programService, 'getAllProductsProgram').andReturn($q.resolve([]));
        spyOn(stockProgramUtilService, 'getPrograms').andReturn($q.resolve([]));
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    beforeEach(function() {
        module('stock-program-util');
        module('siglus-location-management');
        module('siglus-location-stock-on-hand');
        prepareInjector();
        prepareSpies();
    });

    describe('facility resolve', function() {
        it('should return facility', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('facility')).toEqual(undefined);
        });

        it('should return facility in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: 'A000001'
                });
            $rootScope.$apply();

            expect(getResolvedValue('facility')).toEqual(undefined);
        });
    });

    describe('user resolve', function() {
        it('should return user', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    user: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('user')).toEqual(undefined);
        });

        it('should return user in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    user: {
                        id: 'A00001'
                    }
                });
            $rootScope.$apply();

            expect(getResolvedValue('user')).toEqual(undefined);
        });
    });

    describe('programs resolve', function() {
        it('should return programs', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    programs: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('programs')).toEqual(undefined);
        });

        it('should return programs in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    programs: {
                        id: '0000000-000000-000000-000000'
                    }
                });
            $rootScope.$apply();

            expect(getResolvedValue('programs')).toEqual(undefined);
        });
    });

    describe('stockCardSummaries resolve', function() {
        it('should return stockCardSummaries', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCardSummaries: undefined,
                    program: [{}]
                });
            $rootScope.$apply();

            expect(getResolvedValue('stockCardSummaries')).toEqual(undefined);
        });

        it('should return stockCardSummaries in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCardSummaries: {
                        id: '0000000-000000-000000-000000'
                    }
                });
            $rootScope.$apply();

            expect(getResolvedValue('stockCardSummaries')).toEqual(undefined);
        });
    });

    describe('stockCardLineItems resolve', function() {
        it('should return stockCardLineItems', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCardLineItems: undefined,
                    program: [{}]
                });
            $rootScope.$apply();

            expect(getResolvedValue('stockCardLineItems')).toEqual(undefined);
        });

        it('should return stockCardSummaries in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCardLineItems: {}
                });
            $rootScope.$apply();

            expect(getResolvedValue('stockCardLineItems')).toEqual(undefined);
        });
    });
});
