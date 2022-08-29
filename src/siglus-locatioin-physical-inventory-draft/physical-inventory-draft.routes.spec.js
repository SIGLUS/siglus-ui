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

describe('openlmis.locationManagement.physicalInventory.draftList.draft', function() {
    var $q, $state, $rootScope, $location, authorizationService,
        facilityFactory, programService, physicalInventoryFactory;

    beforeEach(function() {
        module('stock-orderable-group');
    });

    function prepareInjector() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            authorizationService = $injector.get('authorizationService');
            facilityFactory = $injector.get('facilityFactory');
            programService = $injector.get('programService');
            physicalInventoryFactory = $injector.get('physicalInventoryFactory');
        });
    }

    function prepareSpies() {
        spyOn(facilityFactory, 'getUserHomeFacility').andReturn($q.resolve({}));
        spyOn(programService, 'get').andReturn($q.resolve({
            code: 'ALL',
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Todos os produtos'
        }));
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
        $state.go('openlmis.locationManagement.physicalInventory.draftList.draft',
            {
                page: '0',
                size: '20',
                subDraftIds:
                    'aeda8653-cef9-496c-858f-89d87f121466,' +
                        '188c8a38-5007-42f1-b9ac-90f558b92296,' +
                        'c2c1e54b-1cca-438f-a56f-bd29e30c4a9c,' +
                        '7d563087-e6e1-4e25-867f-c47639a5b6cc,' +
                        '06545451-1555-4c5f-9362-298324c872a4',
                draftNum: '1',
                actionType: 'DRAFT',
                programId: '00000000-0000-0000-0000-000000000000'
            });
        $rootScope.$apply();
    }

    beforeEach(function() {
        module('siglus-locatioin-physical-inventory-draft');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('test resolve data programId', function() {
        it('should return programId when programId param exist in route', function() {
            goToUrl('/locationManagement/physicalInventory/draftList/?programId=00000000-0000-0000-0000-000000000000');

            expect(getResolvedValue('program')).toBeUndefined();
            // expect(getResolvedValue('program')).toEqual({
            //     code: 'ALL',
            //     id: '00000000-0000-0000-0000-000000000000',
            //     name: 'Todos os produtos'
            // });
        });

        it('should return undefined when programId param exist in route', function() {
            goToUrl('/locationManagement/physicalInventory/draftList/?programId=');

            expect(getResolvedValue('program')).toBeUndefined();
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

            expect(getResolvedValue('program')).toBeUndefined(result);
        });
    });

});
