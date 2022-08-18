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

describe('openlmis.locationManagement.movement.creation', function() {
    var $state, $q, $rootScope, $location, siglusLocationMovementService;

    function prepareInjector() {
        inject(function($injector) {
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            siglusLocationMovementService = $injector.get('siglusLocationMovementService');
        });
    }

    function prepareSpies() {
        spyOn(siglusLocationMovementService, 'getMovementDraftById').andReturn($q.resolve({
            id: 12311
        }));
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }

    function init() {
        $state.go('openlmis.locationManagement.movement.creation',
            {
                draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719'
            });
        $rootScope.$apply();
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-location-movement-creation');
        module('siglus-location-movement');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('draftInfo resolve', function() {
        it('should return draftInfo', function() {
            goToUrl('/locationManagement/movement/creation');
            $rootScope.$apply();

            expect(getResolvedValue('draftInfo')).toBeUndefined();
        });
    });
});
