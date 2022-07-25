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

describe('openlmis.stock.physical.inventory.list state', function() {
    var $q, $state, $rootScope, $location, authorizationService,
        facilityFactory, programService, stockProgramUtilService, physicalInventoryFactory;

    var allProductsProgram, otherPrograms;

    function prepareInjector() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            authorizationService = $injector.get('authorizationService');
            facilityFactory = $injector.get('facilityFactory');
            programService = $injector.get('programService');
            stockProgramUtilService = $injector.get('stockProgramUtilService');
            physicalInventoryFactory = $injector.get('physicalInventoryFactory');
        });
    }

    function prepareSpies() {
        allProductsProgram = [
            {
                code: 'ALL',
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Todos os produtos'
            }
        ];

        otherPrograms = [
            {
                code: 'ML',
                id: '00000000-0000-0000-0000-000000000001',
                name: 'Malaria'
            },
            {
                code: 'VC',
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Via Clássica'
            }
        ];
        spyOn(facilityFactory, 'getUserHomeFacility').andReturn($q.resolve({}));
        spyOn(stockProgramUtilService, 'getPrograms').andReturn($q.resolve(otherPrograms));
        spyOn(programService, 'getAllProductsProgram').andReturn($q.resolve(allProductsProgram));
        spyOn(authorizationService, 'getUser').andReturn($q.resolve({}));
        spyOn(physicalInventoryFactory, 'getDrafts').andReturn($q.resolve([]));
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }

    function init() {
        $state.go('openlmis.locationManagement.physicalInventory',
            {
                programId: 'a24f19a8-3743-4a1a-a919-e8f97b5719'
            });
        $rootScope.$apply();
    }

    beforeEach(function() {
        module('stock-physical-inventory-list');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('test resolve data programId', function() {
        it('should return programId when programId param exist in route', function() {
            expect(getResolvedValue('programId')).toEqual('a24f19a8-3743-4a1a-a919-e8f97b5719');
        });

        it('should return undefined when programId param exist in route', function() {
            goToUrl('/stockmanagement/physicalInventory?programId=');

            expect(getResolvedValue('programId')).toBeUndefined();
        });
    });

    describe('test resolve data programs', function() {
        it('should filter program code is equal ML data when enter physical inventory list page', function() {
            var result = [
                {
                    code: 'ALL',
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Todos os produtos'
                },
                {
                    code: 'VC',
                    id: '00000000-0000-0000-0000-000000000002',
                    name: 'Via Clássica'
                }
            ];

            expect(getResolvedValue('programs')).toEqual(result);
        });
    });

});
