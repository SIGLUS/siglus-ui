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

describe('TestConsumptionController', function() {

    var vm, template, testProject, testOutcome, service, column;

    var TemplateColumnDataBuilder, TemplateDataBuilder, $controller, COLUMN_SOURCES, templateConfigureService;

    beforeEach(function() {
        module('siglus-admin-template-configure-test-consumption');
        module('admin-template-configure-column-setting');
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            templateConfigureService = $injector.get('templateConfigureService');
        });

        template = new TemplateDataBuilder()
            .withColumn(new TemplateColumnDataBuilder().buildTotalColumn())
            .withColumn(new TemplateColumnDataBuilder().buildRemarksColumn())
            .withColumn(new TemplateColumnDataBuilder().buildStockOnHandColumn())
            .withColumn(new TemplateColumnDataBuilder().buildAverageConsumptionColumn())
            .build();
        testProject = {
            name: 'project',
            columns: []
        };
        testOutcome = {
            name: 'outcome',
            columns: []
        };
        service = {
            name: 'service',
            columns: []
        };
        template.testConsumption = [testProject, testOutcome, service];
        column = {
            name: 'HIV Determine',
            source: null,
            columnDefinition: {
                sources: [],
                supportsTag: false
            }
        };
        spyOn(templateConfigureService, 'getDefaultColumn').andReturn(column);

        vm = $controller('testConsumptionController', {
            template: template
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.template).toEqual(template);
        });

        it('should enable test consumption', function() {
            expect(vm.template.extension.enableRapidTestConsumption).toEqual(true);
        });
    });

    describe('addColumn', function() {

        it('should add a new column and its column source is user input', function() {
            vm.addColumn(vm.template.testConsumption[0]);

            expect(vm.template.testConsumption[0].columns.length).toEqual(1);
            expect(vm.template.testConsumption[0].columns[0].source).toEqual(COLUMN_SOURCES.USER_INPUT);
        });
    });
});
