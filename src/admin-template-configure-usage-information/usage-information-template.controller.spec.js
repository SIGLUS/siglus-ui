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

describe('UsageInformationTemplateController', function() {

    var vm, template, information, service, column;

    var TemplateColumnDataBuilder, TemplateDataBuilder, $controller, COLUMN_SOURCES, templateConfigureService;

    beforeEach(function() {
        module('admin-template-configure-usage-information');
        module('admin-template-configure-column-setting');

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
        information = {
            name: 'information',
            columns: []
        };
        service = {
            name: 'service',
            columns: []
        };
        template.usageInformation = [information, service];
        column = {
            name: 'usage',
            source: 'USER_INPUT',
            columnDefinition: {
                sources: [],
                supportsTag: false
            }
        };
        spyOn(templateConfigureService, 'getDefaultColumn').andReturn(column);

        vm = $controller('UsageInformationTemplateController', {
            template: template
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.template).toEqual(template);
        });

        it('should set information', function() {
            expect(vm.information).toBe(information);
        });

        it('should set service', function() {
            expect(vm.service).toBe(service);
        });
    });

    describe('addInformationColumn', function() {

        it('should return true if column source is user input', function() {
            vm.addInformationColumn();
            column.columnDefinition.sources = [COLUMN_SOURCES.USER_INPUT];

            expect(vm.information.columns).toEqual([column]);
        });
    });

    describe('addServiceColumn', function() {

        it('should return productCode if column name is orderable.productCode', function() {
            vm.addServiceColumn();
            column.source = COLUMN_SOURCES.USER_INPUT;
            column.columnDefinition.sources = [COLUMN_SOURCES.USER_INPUT];
            column.columnDefinition.supportsTag = false;

            expect(vm.service.columns).toEqual([column]);
        });
    });
});
