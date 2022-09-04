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

describe('openlmis.locationManagement.adjustment', function() {
    var $state, $q, $rootScope, facilityFactory, programService, authorizationService;

    function prepareInjector() {
        inject(function($injector) {
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            // $location = $injector.get('$location');
            facilityFactory = $injector.get('facilityFactory');
            programService = $injector.get('programService');
            authorizationService = $injector.get('authorizationService');
        });
    }

    function prepareSpies() {
        var allProductsProgram = [
            {
                code: 'ALL',
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Todos os produtos'
            }
        ];
        spyOn(facilityFactory, 'getUserHomeFacility').andReturn($q.resolve({
            facilityId: 'A000001'
        }));
        spyOn(programService, 'getAllProductsProgram').andReturn($q.resolve(allProductsProgram));
        spyOn(authorizationService, 'getUser').andReturn($q.resolve({
            username: '张三'
        }));
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    // function goToUrl(url) {
    //     $location.url(url);
    //     $rootScope.$apply();
    // }

    function init() {
        $state.go('openlmis.locationManagement.adjustment',
            {
                draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719'
            });
        $rootScope.$apply();
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-location-adjustment');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('facility resolve', function() {
        it('should return facility', function() {
            expect(getResolvedValue('facility')).toEqual({
                facilityId: 'A000001'
            });
        });
    });

    describe('getUser resolve', function() {
        it('should return user info', function() {
            expect(getResolvedValue('user')).toEqual({
                username: '张三'
            });
        });
    });

    describe('programs resolve', function() {
        it('should return program', function() {
            expect(getResolvedValue('programs')).toEqual([
                {
                    code: 'ALL',
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Todos os produtos'
                }
            ]);
        });
    });
});
