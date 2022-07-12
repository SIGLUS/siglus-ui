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
     * @name siglus-admin-template-configure-column-setting.controller:SiglusTemplateConfigureColumnSettingController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('siglus-admin-template-configure-column-setting')
        .controller('SiglusTemplateConfigureColumnSettingController', SiglusTemplateConfigureColumnSettingController);

    SiglusTemplateConfigureColumnSettingController.$inject = [
        '$window', '$state', '$scope', 'template', 'originalTemplate', 'notificationService',
        'siglusRefreshConfirmService', 'siglusConfigureStateRouterService'
    ];

    function SiglusTemplateConfigureColumnSettingController($window, $state, $scope, template, originalTemplate,
                                                            notificationService, siglusRefreshConfirmService,
                                                            siglusConfigureStateRouterService) {
        $window.scrollTo(0, 0);

        var vm = this;

        vm.$onInit = onInit;
        vm.previewTemplate = previewTemplate;
        vm.cancel = cancel;

        vm.template = undefined;

        vm.previousTemplate = undefined;

        function onInit() {
            enableCurrentSection();
            vm.template = template;
            vm.previousTemplate = angular.copy(template);
            stateRouter();
            refreshConfirm();
        }

        function enableCurrentSection() {
            var routerMap = {
                'openlmis.administration.requisitionTemplates.configure.columnSetting.product': 'enableProduct',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.kitUsage': 'enableKitUsage',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.usageInformation':
                    'enableUsageInformation',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.patient': 'enablePatient',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.testConsumption':
                    'enableRapidTestConsumption',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.regimen': 'enableRegimen',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.consultationNumber':
                    'enableConsultationNumber',
                'openlmis.administration.requisitionTemplates.configure.columnSetting.ageGroup':
                    'enableAgeGroup'
            };
            template.extension[routerMap[$state.current.name]] = true;
        }

        function stateRouter() {
            var unsubscribe = siglusConfigureStateRouterService.initialize(template);
            $scope.$on('$destroy', function() {
                unsubscribe();
            });
        }

        function refreshConfirm() {
            $scope.$watch(function() {
                return vm.template;
            }, function(newValue) {
                $scope.needToConfirm = !angular.equals(originalTemplate, newValue);
            }, true);
            siglusRefreshConfirmService.register($scope);
            $scope.$on('$destroy', function() {
                siglusRefreshConfirmService.deregister();
            });
        }

        function cancel() {
            angular.extend(vm.template, vm.previousTemplate);
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
