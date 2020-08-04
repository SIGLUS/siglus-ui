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
     * @name siglus-admin-template-configure-column-setting-detail:SiglusConsultationNumberController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('siglus-admin-template-configure-column-setting-detail')
        .controller('SiglusColumnSettingDetailController', SiglusColumnSettingDetailController);

    SiglusColumnSettingDetailController.$inject = ['$state', 'COLUMN_SOURCES', 'siglusTemplateConfigureService',
        'template'];

    function SiglusColumnSettingDetailController($state, COLUMN_SOURCES, siglusTemplateConfigureService, template) {
        var vm = this;

        vm.$onInit = onInit;

        vm.sections = undefined;
        vm.addColumn = addColumn;

        function onInit() {
            vm.sections = template[$state.params.section];
        }

        function addColumn(section) {
            section.columns.push(angular.merge({}, siglusTemplateConfigureService.getDefaultColumn(), {
                source: COLUMN_SOURCES.USER_INPUT,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT],
                    supportsTag: false
                }
            }));
        }
    }
})();
