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

describe('SiglusConsultationNumberController', function() {

    var vm, template, column;
    var TemplateDataBuilder, $controller, COLUMN_SOURCES, templateConfigureService;

    beforeEach(function() {
        module('siglus-admin-template-configure-consultation-number');
        module('admin-template-configure-column-setting');
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            templateConfigureService = $injector.get('templateConfigureService');
        });

        template = new TemplateDataBuilder().build();
        template.consultationNumber = [{
            name: 'number',
            columns: [{
                name: 'consultationNumber',
                source: 'USER_INPUT',
                displayOrder: 1,
                columnDefinition: {}
            }, {
                name: 'total',
                source: 'USER_INPUT',
                displayOrder: 0,
                columnDefinition: {}
            }]
        }];
        column = {
            name: 'newColumn0',
            source: 'USER_INPUT',
            displayOrder: 2,
            columnDefinition: {}
        };
        spyOn(templateConfigureService, 'getDefaultColumn').andReturn(column);

        vm = $controller('SiglusConsultationNumberController', {
            template: template
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.template).toEqual(template);
        });
    });

    describe('addColumn', function() {

        it('should add a new column and its column source is user input', function() {
            vm.addColumn(vm.template.consultationNumber[0]);

            expect(vm.template.consultationNumber[0].columns.length).toEqual(3);
            expect(vm.template.consultationNumber[0].columns[0].source).toEqual(COLUMN_SOURCES.USER_INPUT);
        });
    });
});
