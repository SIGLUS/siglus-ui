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

describe('KitUsagePreviewController', function() {

    var vm, collection, service;
    var $controller, COLUMN_SOURCES, messageService, columnUtils;

    beforeEach(function() {
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            messageService = $injector.get('messageService');
            columnUtils = $injector.get('columnUtils');
        });
        collection = {
            name: 'collection',
            source: COLUMN_SOURCES.USER_INPUT,
            columns: []
        };
        service = {
            name: 'service',
            columns: []
        };

        spyOn(columnUtils, 'isUserInput');
        spyOn(COLUMN_SOURCES, 'getLabel').andReturn('requisitionConstants.userInput');
        spyOn(messageService, 'get').andReturn('User input');

        vm = $controller('KitUsagePreviewController');
    });

    describe('onInit', function() {

        it('should set collection', function() {
            vm.sections = [collection, service];
            vm.$onInit();

            expect(vm.collection).toEqual(collection);
        });

        it('should set service', function() {
            vm.sections = [collection, service];
            vm.$onInit();

            expect(vm.service).toEqual(service);
        });
    });

    describe('isUserInput', function() {

        it('should isUserInput of columnUtils be called with collection if service name if HF', function() {
            service.name = 'HF';
            vm.isUserInput(service, collection);

            expect(columnUtils.isUserInput).toHaveBeenCalledWith(collection);
        });

        it('should isUserInput of columnUtils be called with service', function() {
            vm.isUserInput(service, collection);

            expect(columnUtils.isUserInput).toHaveBeenCalledWith(service);
        });
    });

    describe('columnDisplayName', function() {

        it('getLabel should be called with user input if service name if HF', function() {
            service.name = 'HF';
            vm.columnDisplayName(service, collection);

            expect(COLUMN_SOURCES.getLabel).toHaveBeenCalledWith(COLUMN_SOURCES.USER_INPUT);
            expect(messageService.get).toHaveBeenCalledWith('requisitionConstants.userInput');
        });
    });
});
