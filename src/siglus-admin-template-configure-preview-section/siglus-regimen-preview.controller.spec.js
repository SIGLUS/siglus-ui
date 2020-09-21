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

describe('SiglusRegimenPreviewController', function() {

    var vm, regimen, summary;
    var $controller, COLUMN_SOURCES;

    beforeEach(function() {
        module('siglus-admin-template-configure-preview-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
        });
        regimen = {
            name: 'regimen',
            columns: [{
                name: 'patients',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }]
        };
        summary = {
            name: 'summary',
            columns: [{
                name: '1st Linhas',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }, {
                name: 'total',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }, {
                name: 'community',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: false
            }]
        };

        vm = $controller('SiglusRegimenPreviewController');
        vm.sections = [regimen, summary];
    });

    describe('onInit', function() {

        it('should set summary', function() {
            vm.$onInit();

            expect(vm.summary).toEqual(summary);
        });

        it('should set regimenColumns', function() {
            vm.$onInit();

            expect(vm.regimenColumns).toEqual([{
                name: 'patients',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }]);
        });

        it('should set summaryColumns', function() {
            vm.$onInit();

            expect(vm.summaryColumns).toEqual([{
                name: '1st Linhas',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }, {
                name: 'total',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }]);
        });

        it('should set hasCode to false when do not have code column', function() {
            vm.$onInit();

            expect(vm.hasCode).toBe(false);
        });

        it('should set colspan to true when have code column', function() {
            regimen.columns.push({
                name: 'code',
                source: COLUMN_SOURCES.REFERENCE_DATA,
                isDisplayed: true
            });
            vm.$onInit();

            expect(vm.hasCode).toBe(true);
        });

        it('should set total', function() {
            vm.$onInit();

            expect(vm.total).toEqual({
                name: 'total',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            });
        });
    });

    describe('columnDisplayName', function() {
        beforeEach(function() {
            vm.$onInit();
        });

        it('Should return code name', function() {
            var column = {
                name: 'code',
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(vm.columnDisplayName(column, 1, 0)).toBe('code 3');
        });

        it('Should return regimen name', function() {
            var column = {
                name: 'regiment',
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(vm.columnDisplayName(column, 0, 1)).toBe('Regimen name 2');
        });

        it('Should return column source', function() {
            var column = {
                name: 'community',
                source: COLUMN_SOURCES.USER_INPUT
            };

            expect(vm.columnDisplayName(column)).toBe('requisitionConstants.userInput');
        });
    });
});
