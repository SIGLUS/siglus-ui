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
     * @name admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('admin-template-configure-settings')
        .controller('AdminTemplateConfigureSettingsController', AdminTemplateConfigureSettingsController);

    // #163: add associate program
    AdminTemplateConfigureSettingsController.$inject = [
        'template', 'availableFacilityTypes', 'loadingModalService', 'notificationService', '$state', 'confirmService',
        'requisitionTemplateService', 'templateFacilityTypes', '$q', 'templateAssociatePrograms',
        'availableAssociatePrograms'
    ];
    // #163: ends here

    function AdminTemplateConfigureSettingsController(template, availableFacilityTypes, loadingModalService,
                                                      notificationService, $state, confirmService,
                                                      requisitionTemplateService, templateFacilityTypes, $q,
                                                      templateAssociatePrograms, availableAssociatePrograms) {

        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name template
         * @type {Object}
         *
         * @description
         * Holds template.
         */
        vm.template = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name facilityTypes
         * @type {Array}
         *
         * @description
         * Holds facilityTypes.
         */
        vm.facilityTypes = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name facilityType
         * @type {Object}
         *
         * @description
         * Holds facility type.
         */
        vm.facilityType = undefined;

        // #163: add associate program
        /**
         * @ngdoc property
         * @propertyOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name associatePrograms
         * @type {Array}
         *
         * @description
         * Holds associate programs.
         */
        vm.associatePrograms = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name associateProgram
         * @type {Object}
         *
         * @description
         * Holds associate program.
         */
        vm.associateProgram = undefined;
        // #163: ends here

        vm.add = add;
        vm.goToTemplateList = goToTemplateList;
        vm.remove = remove;
        vm.saveTemplate = saveTemplate;
        vm.$onInit = onInit;
        // #163: add associate program
        vm.addAssociateProgram = addAssociateProgram;
        vm.removeAssociateProgram = removeAssociateProgram;
        // #163: ends here

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name add
         *
         * @description
         * Add a facility type to the template facility types.
         */
        function add() {
            vm.template.facilityTypes.push(vm.facilityType);

            var index = vm.facilityTypes.indexOf(vm.facilityType);
            vm.facilityTypes.splice(index, 1);
            sortByName(vm.template.facilityTypes);

            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name remove
         *
         * @description
         * Remove a facility type from added template facility types.
         *
         * @param {Object} facilityType facility type to be removed.
         */
        function remove(facilityType) {
            var index = vm.template.facilityTypes.indexOf(facilityType);
            vm.template.facilityTypes.splice(index, 1);

            vm.facilityTypes.push(facilityType);
            sortByName(vm.facilityTypes);

            $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
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
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name saveTemplate
         *
         * @description
         * Saves template from scope if template is valid. After successful action displays
         * success notification on screen and redirects user to template
         * list view page. If saving is unsuccessful error notification is displayed.
         */
        function saveTemplate() {
            confirmService.confirm(
                'adminTemplateConfigureSettings.templateSettingsSave.description',
                'adminTemplateConfigureSettings.save',
                undefined,
                'adminTemplateConfigureSettings.templateSettingsSave.title'
            )
                .then(function() {
                    loadingModalService.open();
                    requisitionTemplateService.save(vm.template).then(function() {
                        notificationService.success('adminTemplateConfigureSettings.templateSettingsSave.success');
                        goToTemplateList();
                    }, function() {
                        notificationService.error('adminTemplateConfigureSettings.templateSettingsSave.failure');
                        loadingModalService.close();
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name onInit
         *
         * @description
         * Removes facility types assigned to template from available facility types.
         */
        function onInit() {
            vm.template = template;
            vm.facilityTypes = availableFacilityTypes;
            vm.template.facilityTypes = sortByName(templateFacilityTypes[template.id]);
            // #163: add associate program
            vm.associatePrograms = availableAssociatePrograms;
            vm.template.associatePrograms = templateAssociatePrograms;
            // #163: ends here
        }

        function sortByName(facilityTypes) {
            return facilityTypes.sort(function(left, right) {
                return left.name.localeCompare(right.name);
            });
        }

        // #163: add associate program
        /**
         * @ngdoc method
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name addAssociateProgram
         *
         * @description
         * Add a associate program to the template associate programs.
         */
        function addAssociateProgram() {
            vm.template.associatePrograms.push(vm.associateProgram);
            vm.associatePrograms.splice(vm.associatePrograms.indexOf(vm.associateProgram), 1);
            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-configure-settings.controller:AdminTemplateConfigureSettingsController
         * @name removeAssociateProgram
         *
         * @description
         * Remove a associate program from added template associate programs.
         *
         * @param {Object} associateProgram associate program to be removed.
         */
        function removeAssociateProgram(associateProgram) {
            vm.template.associatePrograms.splice(vm.template.associatePrograms.indexOf(associateProgram), 1);
            vm.associatePrograms.push(associateProgram);
        }
        // #163: ends here
    }
})();
