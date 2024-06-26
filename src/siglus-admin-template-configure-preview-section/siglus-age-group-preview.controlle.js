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
        .module('siglus-admin-template-configure-preview-section')
        .controller('SiglusAgeGroupPreviewController', controller);

    controller.$inject = ['siglusColumnUtils', 'siglusTemplateConfigureService', 'SIGLUS_SERVICE_TYPES',
        'SIGLUS_SECTION_TYPES'];

    function controller(siglusColumnUtils, siglusTemplateConfigureService, SIGLUS_SERVICE_TYPES,
                        SIGLUS_SECTION_TYPES) {

        var vm = this;

        vm.group = undefined;
        vm.service = undefined;

        vm.$onInit = onInit;
        vm.columnDisplayName = columnDisplayName;
        vm.isUserInput = isUserInput;

        function onInit() {
            vm.group =
                siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.GROUP);
            vm.service =
                siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SERVICE);
        }

        function isUserInput(column) {
            return siglusColumnUtils.isUserInput(column);
        }

        function columnDisplayName(column) {
            return siglusColumnUtils.columnDisplayName(column);
        }
    }

})();
