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

describe('siglus-soh-lot-detail-print', function() {
    var $state, $rootScope, $q, facilityFactory, localStorageService;
    var facility = {};
    var stockCard = {};

    function prepareInjector() {
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            facilityFactory = $injector.get('facilityFactory');
            localStorageService = $injector.get('localStorageService');
        });
    }

    function prepareSpies() {
        spyOn(facilityFactory, 'getUserHomeFacility').andReturn($q.resolve(facility));
        spyOn(localStorageService, 'get').andReturn($q.resolve(stockCard));
    }

    function init() {
        $state.go('openlmis.locationManagement.lotDetailPrint');
        $rootScope.$apply();
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-soh-lot-detail-print');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('facility resolve', function() {
        it('should return facility', function() {
            $state.go('openlmis.locationManagement.lotDetailPrint');

            expect(getResolvedValue('facility')).toEqual(undefined);
            expect(facilityFactory.getUserHomeFacility).toHaveBeenCalled();
        });
    });

    describe('stockCard resolve', function() {
        it('should return stockCard', function() {
            $state.go('openlmis.locationManagement.lotDetailPrint');

            expect(getResolvedValue('stockCard')).toEqual(undefined);
            expect(localStorageService.get).toHaveBeenCalled();
        });
    });

});
