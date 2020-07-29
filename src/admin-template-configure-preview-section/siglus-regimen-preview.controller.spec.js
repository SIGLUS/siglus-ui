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

    var vm, total, regimen, summary;
    var $controller, COLUMN_SOURCES;

    beforeEach(function() {
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
        });
        total = {
            name: 'total',
            source: COLUMN_SOURCES.CALCULATED,
            hide: true
        };
        regimen = {
            name: 'regimen',
            columns: [
                total,
                {
                    name: 'patients',
                    source: COLUMN_SOURCES.USER_INPUT,
                    isDisplayed: true
                }
            ]
        };
        summary = {
            name: 'summary',
            columns: [
                total,
                {
                    name: 'community',
                    source: COLUMN_SOURCES.USER_INPUT,
                    isDisplayed: false
                }
            ]
        };

        vm = $controller('SiglusRegimenPreviewController');
        vm.sections = [regimen, summary];
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set regimenTotal', function() {
            expect(vm.regimenTotal).toEqual(total);
        });

        it('should set summaryTotal', function() {
            expect(vm.summaryTotal).toEqual(total);
        });

        it('should set regimenColumns', function() {
            expect(vm.regimenColumns).toEqual([{
                name: 'patients',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true
            }]);
        });

        it('should set summaryColumns', function() {
            expect(vm.summaryColumns).toEqual([]);
        });
    });
});
