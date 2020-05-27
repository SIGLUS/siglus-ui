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
     * @name admin-template-configure-preview.controller:RequisitionTemplatePreviewController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('admin-template-configure-preview')
        .controller('RequisitionTemplatePreviewController', RequisitionTemplatePreviewController);

    RequisitionTemplatePreviewController.$inject = [
        '$state', 'template', 'notificationService', 'loadingModalService', 'confirmService',
        'requisitionTemplateService'
    ];

    function RequisitionTemplatePreviewController($state, template, notificationService, loadingModalService,
                                                  confirmService, requisitionTemplateService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.goToTemplateList = goToTemplateList;
        vm.saveTemplate = saveTemplate;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure-preview.controller:RequisitionTemplatePreviewController
         * @name template
         * @type {Object}
         *
         * @description
         * Holds template.
         */
        vm.template = undefined;
        vm.columns = undefined;
        /**
         * @ngdoc method
         * @methodOf admin-template-configure-preview.controller:RequisitionTemplatePreviewController
         * @name goToTemplateList
         *
         * @description
         * Redirects user to template list view page.
         */
        function onInit() {
            vm.template = template;
            vm.columns = getDisplayedColumns(template);
        }

        function getDisplayedColumns(template) {
            var columns = [],
                columnsMap = template.columnsMap;
            for (var columnName in columnsMap) {
                if (columnsMap.hasOwnProperty(columnName) &&
                    columnsMap[columnName].isDisplayed) {
                    columns.push(columnsMap[columnName]);
                }
            }
            return columns;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-preview.controller:RequisitionTemplatePreviewController
         * @name goToTemplateList
         *
         * @description
         * Redirects user to template list view page.
         */
        function goToTemplateList() {
            $state.go('openlmis.administration.requisitionTemplates', {}, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-preview.controller:RequisitionTemplatePreviewController
         * @name saveTemplate
         *
         * @description
         * Saves template from scope if template is valid. After successful action displays
         * success notification on screen and redirects user to template
         * list view page. If saving is unsuccessful error notification is displayed.
         */
        function saveTemplate() {
            if (vm.template.isValid()) {
                confirmService.confirm(
                    'adminProgramTemplate.templateSave.description', 'adminProgramTemplate.save',
                    undefined, 'adminProgramTemplate.templateSave.title'
                )
                    .then(function() {
                        loadingModalService.open();
                        requisitionTemplateService.save(vm.template).then(function() {
                            notificationService.success('adminProgramTemplate.templateSave.success');
                            goToTemplateList();
                        }, function() {
                            notificationService.error('adminProgramTemplate.templateSave.failure');
                            loadingModalService.close();
                        });
                    });
            } else {
                notificationService.error('adminProgramTemplate.template.invalid');
            }
        }
    }
})();
