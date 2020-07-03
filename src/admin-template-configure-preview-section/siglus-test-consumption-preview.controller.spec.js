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

describe('TestConsumptionPreviewController', function() {

    var vm, testProject, testOutcome, service;
    var $controller, COLUMN_SOURCES, messageService, columnUtils;

    beforeEach(function() {
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            messageService = $injector.get('messageService');
            columnUtils = $injector.get('columnUtils');
        });
        testProject = {
            name: 'project',
            columns: [
                {
                    name: 'test project 1',
                    isDisplayed: false,
                    source: COLUMN_SOURCES.USER_INPUT
                }, {
                    name: 'test project 2',
                    isDisplayed: true,
                    source: COLUMN_SOURCES.USER_INPUT
                }
            ]
        };
        testOutcome = {
            name: 'outcome',
            columns: [
                {
                    name: 'test outcome 1',
                    isDisplayed: true,
                    displayOrder: 3,
                    source: COLUMN_SOURCES.USER_INPUT
                }, {
                    name: 'test outcome 2',
                    isDisplayed: false,
                    displayOrder: 2,
                    source: COLUMN_SOURCES.USER_INPUT
                }, {
                    name: 'test outcome 3',
                    isDisplayed: true,
                    displayOrder: 1,
                    source: COLUMN_SOURCES.USER_INPUT
                }
            ]
        };
        service = {
            name: 'services',
            columns: [
                {
                    name: 'total',
                    source: COLUMN_SOURCES.USER_INPUT
                }
            ]
        };

        spyOn(columnUtils, 'isUserInput');
        spyOn(COLUMN_SOURCES, 'getLabel').andReturn('requisitionConstants.userInput');
        spyOn(messageService, 'get').andReturn('User input');

        vm = $controller('TestConsumptionPreviewController');
        vm.sections = [testProject, testOutcome, service];
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set test project', function() {
            expect(vm.testProject).toEqual(testProject);
        });

        it('should set test outcome', function() {
            expect(vm.testOutcome).toEqual(testOutcome);
        });

        it('should set service', function() {
            expect(vm.service).toEqual(service);
        });

        it('should set testOutcomeDisplayedCount', function() {
            expect(vm.testOutcomeDisplayedCount).toEqual(2);
        });

        it('should set testOutcomeDisplayColumns', function() {
            expect(vm.testOutcomeDisplayColumns).toEqual([
                {
                    name: 'test outcome 3',
                    isDisplayed: true,
                    displayOrder: 1,
                    source: COLUMN_SOURCES.USER_INPUT
                }, {
                    name: 'test outcome 1',
                    isDisplayed: true,
                    displayOrder: 3,
                    source: COLUMN_SOURCES.USER_INPUT
                }
            ]);
        });
    });

    describe('getColumnValue', function() {
        it('should called getLabel with user input when called getColumnValue', function() {
            vm.getColumnValue(vm.testProject.columns[0]);

            expect(COLUMN_SOURCES.getLabel).toHaveBeenCalledWith(COLUMN_SOURCES.USER_INPUT);
            expect(messageService.get).toHaveBeenCalledWith('requisitionConstants.userInput');
        });
    });

    describe('isTotal', function() {
        it('should return true when the service name is total', function() {
            expect(vm.isTotal(vm.service.columns[0])).toBe(true);
        });
    });
});
