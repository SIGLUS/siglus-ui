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
        .controller('SiglusConsultationNumberPreviewController', controller);

    controller.$inject = ['columnUtils', 'templateConfigureService',
        'SECTION_TYPES'];

    function controller(columnUtils, templateConfigureService, SECTION_TYPES) {

        var vm = this;

        vm.$onInit = onInit;
        vm.isUserInput = columnUtils.isUserInput;
        vm.isTotal = columnUtils.isTotal;
        vm.columnDisplayName = columnUtils.columnDisplayName;

        function onInit() {
            vm.consultationNumber = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.NUMBER);
        }
    }

})();
