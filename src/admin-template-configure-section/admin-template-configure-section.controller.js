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

    /**
     * @ngdoc controller
     * @name admin-template-configure-section.controller:TemplateConfigureSectionController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('admin-template-configure-section')
        .controller('TemplateConfigureSectionController', TemplateConfigureSectionController);

    TemplateConfigureSectionController.$inject = [
        'messageService', 'templateValidator', 'COLUMN_SOURCES', 'MAX_COLUMN_DESCRIPTION_LENGTH'
    ];

    function TemplateConfigureSectionController(messageService, templateValidator, COLUMN_SOURCES,
                                                MAX_COLUMN_DESCRIPTION_LENGTH) {
        var vm = this;

        vm.$onInit = onInit;
        vm.dropCallback = dropCallback;
        vm.canChangeSource = canChangeSource;
        vm.sourceDisplayName = sourceDisplayName;
        vm.getColumnError = templateValidator.getColumnError;

        vm.maxColumnDescriptionLength = undefined;

        vm.availableTags = undefined;

        function onInit() {
            vm.maxColumnDescriptionLength = MAX_COLUMN_DESCRIPTION_LENGTH;
            vm.availableTags = {};
        }

        function dropCallback() {
            return false;
        }

        function canChangeSource() {
            return false;
        }

        function sourceDisplayName(name) {
            return messageService.get(COLUMN_SOURCES.getLabel(name));
        }
    }
})();
