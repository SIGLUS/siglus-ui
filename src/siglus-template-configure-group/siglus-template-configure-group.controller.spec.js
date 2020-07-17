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

describe('siglusTemplateConfigureGroupController', function() {

    //tested
    var vm, section, columns;

    //injects
    var $rootScope, $scope, $controller, MAX_ADD_LENGTH;

    beforeEach(function() {
        module('siglus-template-configure-group');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $controller = $injector.get('$controller');
            MAX_ADD_LENGTH = $injector.get('MAX_ADD_LENGTH');
        });

        vm = $controller('siglusTemplateConfigureGroupController', {
            $scope: $scope
        });
        columns = [ {
            name: 'new',
            label: 'New',
            indicator: 'PD',
            displayOrder: 0,
            isDisplayed: true,
            option: null,
            definition: 'record the number of new patients',
            tag: null,
            columnDefinition: {
                id: '07a70f2b-451c-401a-b8ca-75e56baeb91c',
                name: 'new',
                sources: [ 'USER_INPUT' ],
                label: 'New',
                indicator: 'PD',
                mandatory: false,
                isDisplayRequired: true,
                canBeChangedByUser: false,
                supportsTag: false,
                definition: 'record the number of new patients',
                canChangeOrder: false,
                columnType: 'NUMERIC',
                displayOrder: 0,
                options: [ ]
            },
            source: 'USER_INPUT',
            id: '75df3b80-dc2a-419d-a547-51f12ece6ce2'
        }, {
            name: 'total',
            label: 'Total',
            indicator: 'PD',
            displayOrder: 1,
            isDisplayed: true,
            option: null,
            definition: 'record the total number of this group',
            tag: null,
            columnDefinition: {
                id: 'f51371a4-ba6f-4119-9a0e-1a588fa5df21',
                name: 'total',
                sources: [ 'USER_INPUT', 'CALCULATED' ],
                label: 'Total',
                indicator: 'PD',
                mandatory: false,
                isDisplayRequired: false,
                canBeChangedByUser: false,
                supportsTag: false,
                definition: 'record the total number of this group',
                canChangeOrder: true,
                columnType: 'NUMERIC',
                displayOrder: 1,
                options: [ ]
            },
            source: 'USER_INPUT',
            id: '8f29debd-f187-4313-80e9-9a8d1705adf8'
        }];
        section = {
            id: 'a810c65b-5f08-4347-b09c-6202962f64db',
            name: 'patientType',
            label: 'Type of Patient',
            displayOrder: 0,
            isDefault: true,
            columns: columns
        };
        vm.sections = [section];

        vm.$onInit();
    });

    describe('onInit', function() {
        it('should get default columns', function() {
            expect(vm.defaultColums).toEqual(angular.merge({}, columns, [{
                id: undefined
            }, {
                id: undefined
            }]));
        });

        it('should set sectionMap', function() {
            expect(vm.sectionMap).toEqual({
                patientType: section
            });
        });
    });

    describe('addGroup', function() {
        it('should set newSection0 when added group', function() {
            vm.addGroup();

            expect(vm.sections.length).toBe(2);
            expect(vm.sections[1].name).toBe('newSection0');
        });

        it('should set newColumn1 for second added column', function() {
            vm.addGroup();
            $rootScope.$apply();
            vm.addGroup();
            $rootScope.$apply();

            expect(vm.sections.length).toBe(3);
            expect(vm.sections[2].name).toBe('newSection1');
        });

        it('should update section display order', function() {
            vm.addGroup();
            $rootScope.$apply();

            expect(vm.sections[0].displayOrder).toBe(0);
            expect(vm.sections[1].displayOrder).toBe(1);

            vm.addGroup();
            $rootScope.$apply();

            expect(vm.sections[2].displayOrder).toBe(2);
        });

        it('should update section map when added group', function() {
            vm.addGroup();
            $rootScope.$apply();

            expect(vm.sectionMap.newSection0).not.toBeUndefined();
        });

        it('should not add section is added section exceed MAX_ADD_LENGTH', function() {
            for (var i = 0; i < MAX_ADD_LENGTH; i++) {
                vm.sections.push(angular.merge({}, section, {
                    isDefault: false
                }));
            }

            vm.addGroup();

            expect(vm.sections.length).toBe(MAX_ADD_LENGTH + 1);
        });
    });

    describe('removeGroup', function() {

        it('should remove section', function() {
            vm.removeGroup(vm.sections[0]);
            $rootScope.$apply();

            expect(vm.sectionMap.patientType).toBeUndefined();
        });

        it('should update display order for all columns', function() {
            vm.sections.push(angular.copy(vm.sections[0]));
            vm.sections.push(angular.copy(vm.sections[0]));
            vm.removeGroup(vm.sections[1]);
            $rootScope.$apply();

            expect(vm.sections[0].displayOrder).toBe(0);
            expect(vm.sections[1].displayOrder).toBe(1);
        });
    });

    describe('overMaxAddLength', function() {

        it('should false if not over max length', function() {
            expect(vm.overMaxAddLength()).toBe(false);
        });

        it('should return true if added section exceed MAX_ADD_LENGTH', function() {
            for (var i = 0; i < MAX_ADD_LENGTH; i++) {
                vm.sections.push(angular.merge({}, section, {
                    isDefault: false
                }));
            }

            expect(vm.overMaxAddLength()).toBe(true);
        });
    });
});
