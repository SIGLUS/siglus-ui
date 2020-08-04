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
        .controller('SiglusKitUsagePreviewController', controller);

    controller.$inject = ['siglusColumnUtils', 'siglusTemplateConfigureService', 'SIGLUS_SERVICE_TYPES',
        'SECTION_TYPES'];

    function controller(siglusColumnUtils, siglusTemplateConfigureService, SIGLUS_SERVICE_TYPES, SECTION_TYPES) {

        var vm = this;

        vm.collection = undefined;
        vm.service = undefined;

        vm.$onInit = onInit;
        vm.columnDisplayName = columnDisplayName;
        vm.isUserInput = isUserInput;

        function onInit() {
            vm.collection = siglusTemplateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.COLLECTION);
            vm.service = siglusTemplateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.SERVICE);
        }

        function getColumn(service, collection) {
            return service.name === SIGLUS_SERVICE_TYPES.HF ? collection : service;
        }

        function isUserInput(service, collection) {
            return siglusColumnUtils.isUserInput(getColumn(service, collection));
        }

        function columnDisplayName(service, collection) {
            var column = getColumn(service, collection);
            return siglusColumnUtils.columnDisplayName(column);
        }
    }

})();
