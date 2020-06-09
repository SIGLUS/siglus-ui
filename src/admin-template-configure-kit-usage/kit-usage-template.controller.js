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
     * @name admin-template-configure-kit-usage.controller:KitUsageTemplateController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('admin-template-configure-kit-usage')
        .controller('KitUsageTemplateController', KitUsageTemplateController);

    KitUsageTemplateController.$inject = [
        '$state', 'template', 'program', 'tags', 'notificationService', 'messageService', 'templateValidator',
        'COLUMN_SOURCES', 'refreshConfirmService', '$scope', 'originalTemplate'
    ];

    function KitUsageTemplateController($state, template, program, tags, notificationService, messageService,
                                        templateValidator, COLUMN_SOURCES, refreshConfirmService, $scope,
                                        originalTemplate) {
        var vm = this;

        vm.$onInit = onInit;
        vm.previewTemplate = previewTemplate;
        vm.cancel = cancel;

        vm.template = undefined;

        vm.program = undefined;

        vm.tags = undefined;

        vm.previousColumnsMap = undefined;

        function onInit() {
            vm.template = template;
            vm.tags = tags;
            vm.previousTemplate = angular.copy(template);
            enableCurrentSection();
            refreshConfirm();
            vm.collection = _.find(template.kitUsage, function(section) {
                return section.name === 'collection';
            });
            vm.service = _.find(template.kitUsage, function(section) {
                return section.name === 'service';
            });
        }

        function enableCurrentSection() {
            if (!vm.template.extension) {
                vm.template.extension = {};
            }
            vm.template.extension.enableKitUsage = true;
        }

        function refreshConfirm() {
            $scope.$watch(function() {
                return vm.template;
            }, function(newValue) {
                $scope.needToConfirm = !angular.equals(originalTemplate, newValue);
            }, true);
            refreshConfirmService.register($scope);
            $scope.$on('$destroy', function() {
                refreshConfirmService.deregister();
            });
        }

        function cancel() {
            angular.merge(vm.template, vm.previousTemplate);
            goToTemplatePreview();
        }

        function goToTemplatePreview() {
            $state.go('openlmis.administration.requisitionTemplates.configure.columns');
        }

        function previewTemplate() {
            if (vm.template.isValid()) {
                goToTemplatePreview();
            } else {
                notificationService.error('adminProgramTemplate.template.invalid');
            }
        }
    }
})();
