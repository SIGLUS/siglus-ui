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

describe('openlmis.locationManagement.stockOnHand.locationDetail', function() {
    var $state, $rootScope, siglusLocationStockOnHandService;

    function prepareInjector() {
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            siglusLocationStockOnHandService = $injector.get('siglusLocationStockOnHandService');
            $state = $injector.get('$state');
        });
    }

    function prepareSpies() {
        spyOn(siglusLocationStockOnHandService, 'getLocationDetail').andReturn();
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-location-stock-on-hand');
        module('siglus-soh-location-detail');
        prepareInjector();
        prepareSpies();
    });

    describe('facility resolve', function() {
        it('should return facility', function() {
            $state.go('openlmis.locationManagement.stockOnHand.locationDetail',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: undefined
                });

            $rootScope.$apply();

            expect(getResolvedValue('facility')).toEqual(undefined);
        });

        it('should return facility in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand.locationDetail',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: 'A000001'
                });
            $rootScope.$apply();

            expect(getResolvedValue('facility')).toEqual(undefined);
        });
    });

    describe('stockCard resolve', function() {
        it('should return stockCard', function() {
            $state.go('openlmis.locationManagement.stockOnHand.locationDetail',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCard: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('stockCard')).toEqual(undefined);
            expect(siglusLocationStockOnHandService.getLocationDetail).toHaveBeenCalled();
        });

        it('should return stockCard in stateParams', function() {
            $state.go('openlmis.locationManagement.stockOnHand.locationDetail',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCard: {  }
                });
            $rootScope.$apply();

            expect(getResolvedValue('stockCard')).toEqual(undefined);
        });
    });
});
