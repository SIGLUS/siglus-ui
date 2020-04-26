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
     * @name admin-template-add.controller:TemplateAddController
     *
     * @description
     * Controller for Requisition Template Add screen.
     */
    angular
        .module('admin-template-add')
        .controller('TemplateAddController', TemplateAddController);

    TemplateAddController.$inject = [
        '$q', 'programs', 'facilityTypes', 'availableColumns', 'confirmService', 'messageService', 'programTemplates',
        'template', 'TEMPLATE_COLUMNS', 'DEFAULT_NUMBER_OF_PERIODS_TO_AVERAGE',
        // SIGLUS-REFACTOR: starts here
        // 'LOCKED_TEMPLATE_COLUMNS_ORDER'
        '$scope', 'TEMPLATE_TYPE'
        // SIGLUS-REFACTOR: ends here
    ];

    function TemplateAddController($q, programs, facilityTypes, availableColumns, confirmService, messageService,
                                   programTemplates, template, TEMPLATE_COLUMNS, DEFAULT_NUMBER_OF_PERIODS_TO_AVERAGE,
                                   $scope, TEMPLATE_TYPE) {

        var vm = this;

        vm.$onInit = onInit;
        vm.create = create;
        vm.addFacilityType = addFacilityType;
        vm.removeFacilityType = removeFacilityType;
        vm.populateFacilityTypes = populateFacilityTypes;

        // SIGLUS-REFACTOR: starts here
        vm.templateTypeOption = null;
        vm.canSelectTemplateType = true;
        vm.templateTypeOptions = [
            {
                id: TEMPLATE_TYPE.REQUISITION,
                name: 'Requisition'
            },
            {
                id: TEMPLATE_TYPE.USAGE_REPORT,
                name: 'Usage Report'
            }
        ];
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc property
         * @propertyOf admin-template-add.controller:TemplateAddController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds list of available Programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-add.controller:TemplateAddController
         * @name facilityTypes
         * @type {Array}
         *
         * @description
         * Holds list of available Facility Types.
         */
        vm.facilityTypes = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-add.controller:TemplateAddController
         * @name availableColumns
         * @type {Array}
         *
         * @description
         * Holds list of available Requisition Template Columns.
         */
        vm.availableColumns = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-add.controller:TemplateAddController
         * @name template
         * @type {Object}
         *
         * @description
         * Holds Template that will be created.
         */
        vm.template = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-add.controller:TemplateAddController
         * @name selectedFacilityType
         * @type {Object}
         *
         * @description
         * Holds selected Facility Type that will be added to list of Facility Types.
         */
        vm.selectedFacilityType = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-template-add.controller:TemplateAddController
         * @name selectedColumn
         * @type {Object}
         *
         * @description
         * Holds list of selected Facility Types for new Template.
         */
        vm.selectedColumn = undefined;

        /**
         * @ngdoc property
         * @methodOf admin-template-add.controller:TemplateAddController
         * @name $onInit
         *
         * @description
         * Initialization method for TemplateAddController.
         */
        function onInit() {
            vm.programs = programs;
            vm.availableColumns = availableColumns;
            vm.template = template;
            // SIGLUS-REFACTOR: starts here
            $scope.$watch(function() {
                return vm.template;
            }, function(newVal, oldVal) {
                var newProgramId = newVal && newVal.program && newVal.program.id;
                var oldProgramId = oldVal && oldVal.program && oldVal.program.id;
                var templateTypeOption = null;

                if (newProgramId !== oldProgramId) {
                    if (newVal.program && _.isString(newVal.program.templateType)) {
                        templateTypeOption = vm.templateTypeOptions.find(function(tto) {
                            return tto.id === newVal.program.templateType;
                        });
                    }

                    if (templateTypeOption) {
                        vm.templateTypeOption = templateTypeOption;
                        vm.canSelectTemplateType = false;
                    } else {
                        vm.templateTypeOption = null;
                        vm.canSelectTemplateType = true;
                    }
                }

            }, true);
            // SIGLUS-REFACTOR: ends here
        }

        /**
         * @ngdoc property
         * @methodOf admin-template-add.controller:TemplateAddController
         * @name saveProgram
         *
         * @description
         * Saves program to the server. Before action confirm modal will be shown.
         */
        function create() {
            // SIGLUS-REFACTOR: starts here
            if (vm.templateTypeOption) {
                vm.template.templateType = vm.templateTypeOption.id;
                if (vm.template.templateType === TEMPLATE_TYPE.USAGE_REPORT) {
                    vm.template.enableProductModule = false;
                    vm.template.enableALUsageModule = true;
                } else {
                    vm.template.enableProductModule = true;
                    vm.template.enableALUsageModule = false;
                }
            }
            // SIGLUS-REFACTOR: ends here
            vm.template = prepareDefaultColumns();
            var confirmMessage = messageService.get('adminTemplateAdd.createTemplate.confirm', {
                program: vm.template.program.name
            });
            confirmService.confirm(confirmMessage, 'adminTemplateAdd.create')
                .then(function() {
                    template.create();
                });
        }

        /**
         * @ngdoc property
         * @methodOf admin-template-add.controller:TemplateAddController
         * @name addFacilityType
         *
         * @description
         * Adds new Facility Type to the Template. Removes it from the list of available Facility Types.
         *
         * @return {Promise} resolved promise
         */
        function addFacilityType() {
            vm.template.facilityTypes.push(vm.selectedFacilityType);
            vm.facilityTypes.splice(vm.facilityTypes.indexOf(vm.selectedFacilityType), 1);
            return $q.resolve();
        }

        /**
         * @ngdoc property
         * @methodOf admin-template-add.controller:TemplateAddController
         * @name removeFacilityType
         *
         * @description
         * Removes new Facility Type from the Templates. Adds if back to the list of available Facility Types.
         *
         * @param {Object} facilityType Facility Type to be removed from list
         */
        function removeFacilityType(facilityType) {
            if (vm.template.facilityTypes.indexOf(facilityType) > -1) {
                vm.facilityTypes.push(facilityType);
                vm.template.facilityTypes.splice(vm.template.facilityTypes.indexOf(facilityType), 1);
            }
        }

        /**
         * @ngdoc property
         * @methodOf admin-template-add.controller:TemplateAddController
         * @name populateFacilityTypes
         *
         * @description
         * Populates Facility Type list after selecting a Program.
         */
        function populateFacilityTypes() {
            if (vm.template.program) {
                vm.selectedFacilityType = undefined;
                vm.template.facilityTypes = [];

                vm.facilityTypes = facilityTypes
                    .filter(function(facilityType) {
                        var isAssigned = false;
                        programTemplates[vm.template.program.id].forEach(function(template) {
                            template.facilityTypes.forEach(function(assignedFacilityType) {
                                isAssigned = isAssigned || assignedFacilityType.id === facilityType.id;
                            });
                        });
                        return !isAssigned;
                    });
            }
        }

        // SIGLUS-REFACTOR: starts here
        function prepareDefaultColumns() {
            vm.availableColumns.forEach(function(column) {
                vm.template.addColumn(column, column.isDisplayed);
            });
            vm.template.numberOfPeriodsToAverage = DEFAULT_NUMBER_OF_PERIODS_TO_AVERAGE;
            return vm.template;
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
