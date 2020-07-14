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

describe('UsageInformationPreviewController', function() {

    var vm, information, service;
    var $controller, COLUMN_SOURCES, messageService, columnUtils;

    beforeEach(function() {
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            messageService = $injector.get('messageService');
            columnUtils = $injector.get('columnUtils');
        });
        information = {
            name: 'information',
            source: COLUMN_SOURCES.USER_INPUT,
            columns: []
        };
        service = {
            name: 'service',
            source: COLUMN_SOURCES.USER_INPUT,
            columns: []
        };

        spyOn(columnUtils, 'isUserInput');
        spyOn(COLUMN_SOURCES, 'getLabel').andReturn('requisitionConstants.userInput');
        spyOn(messageService, 'get').andReturn('User input');

        vm = $controller('UsageInformationPreviewController');
    });

    describe('onInit', function() {

        it('should set information', function() {
            vm.sections = [information, service];
            vm.$onInit();

            expect(vm.information).toEqual(information);
        });

        it('should set service', function() {
            vm.sections = [information, service];
            vm.$onInit();

            expect(vm.service).toEqual(service);
        });
    });

    describe('isUserInput', function() {

        it('should isUserInput of columnUtils be called with service', function() {
            vm.isUserInput(service);

            expect(columnUtils.isUserInput).toHaveBeenCalledWith(service);
        });
    });

    describe('columnDisplayName', function() {

        it('should called getLabel with user input when called columnDisplayName', function() {
            vm.columnDisplayName(service);

            expect(COLUMN_SOURCES.getLabel).toHaveBeenCalledWith(COLUMN_SOURCES.USER_INPUT);
            expect(messageService.get).toHaveBeenCalledWith('requisitionConstants.userInput');
        });
    });
});
