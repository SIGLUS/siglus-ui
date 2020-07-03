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

(function() {

    'use strict';

    angular
        .module('admin-template-configure-preview-section')
        .controller('KitUsagePreviewController', controller);

    controller.$inject = ['columnUtils', 'COLUMN_SOURCES', 'messageService', 'templateConfigureService',
        'SERVICE_TYPES', 'SECTION_TYPES'];

    function controller(columnUtils, COLUMN_SOURCES, messageService, templateConfigureService,
                        SERVICE_TYPES, SECTION_TYPES) {

        var vm = this;

        vm.collection = undefined;
        vm.service = undefined;

        vm.$onInit = onInit;
        vm.getColumnValue = getColumnValue;
        vm.isUserInput = isUserInput;

        function onInit() {
            vm.collection = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.COLLECTION);
            vm.service = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.SERVICE);
        }

        function getColumn(service, collection) {
            return service.name === SERVICE_TYPES.HF ? collection : service;
        }

        function isUserInput(service, collection) {
            return columnUtils.isUserInput(getColumn(service, collection));
        }

        function getColumnValue(service, collection) {
            var column = getColumn(service, collection);
            return messageService.get(COLUMN_SOURCES.getLabel(column.source));
        }
    }

})();
