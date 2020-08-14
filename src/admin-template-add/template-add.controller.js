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

    // SIGLUS-REFACTOR: starts here
    TemplateAddController.$inject = [
        '$q', 'programs', 'facilityTypes', 'availableColumns', 'confirmService', 'messageService', 'programTemplates',
        'template', 'TEMPLATE_COLUMNS', 'DEFAULT_NUMBER_OF_PERIODS_TO_AVERAGE', 'SIGLUS_TEMPLATE_COLUMNS_ORDER'
    ];
    // SIGLUS-REFACTOR: ends here

    function TemplateAddController($q, programs, facilityTypes, availableColumns, confirmService, messageService,
                                   programTemplates, template, TEMPLATE_COLUMNS, DEFAULT_NUMBER_OF_PERIODS_TO_AVERAGE,
                                   SIGLUS_TEMPLATE_COLUMNS_ORDER) {

        var vm = this;

        vm.$onInit = onInit;
        vm.create = create;
        vm.addFacilityType = addFacilityType;
        vm.removeFacilityType = removeFacilityType;
        vm.populateFacilityTypes = populateFacilityTypes;

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
            vm.availableColumns.sort(function(a, b) {
                return SIGLUS_TEMPLATE_COLUMNS_ORDER.getColumnDisplayOrder(a.name) -
                    SIGLUS_TEMPLATE_COLUMNS_ORDER.getColumnDisplayOrder(b.name);
            });

            vm.availableColumns.forEach(function(column) {
                var nonDisplayedColumns = [
                    TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION,
                    TEMPLATE_COLUMNS.IDEAL_STOCK_AMOUNT,
                    TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA,
                    TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY,
                    TEMPLATE_COLUMNS.PACKS_TO_SHIP,
                    TEMPLATE_COLUMNS.REMARKS,
                    TEMPLATE_COLUMNS.TOTAL,
                    TEMPLATE_COLUMNS.NUMBER_OF_NEW_PATIENTS_ADDED,
                    TEMPLATE_COLUMNS.MAXIMUM_STOCK_QUANTITY,
                    TEMPLATE_COLUMNS.ADJUSTED_CONSUMPTION,
                    TEMPLATE_COLUMNS.PRICE_PER_PACK,
                    TEMPLATE_COLUMNS.UNIT_UNIT_OF_ISSUE,
                    TEMPLATE_COLUMNS.ADDITIONAL_QUANTITY_REQUIRED,
                    TEMPLATE_COLUMNS.TOTAL_COST,
                    TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS
                ];
                var isDisplayed = nonDisplayedColumns.indexOf(column.name) === -1;

                addDefaultTag(column);
                addAdditionalInfoForSkippedColumn(column);
                vm.template.addColumn(column, isDisplayed);
            });
            // SIGLUS-REFACTOR: ends here

            vm.template.numberOfPeriodsToAverage = DEFAULT_NUMBER_OF_PERIODS_TO_AVERAGE;

            return vm.template;
        }

        // SIGLUS-REFACTOR: add default tag for totalReceivedQuantity,
        // totalConsumedQuantity, totalLossesAndAdjustments
        function addDefaultTag(column) {
            if (column.name === TEMPLATE_COLUMNS.TOTAL_RECEIVED_QUANTITY
                && column.supportsTag
                && !column.tag) {
                column.defaultTag = 'received';
            }
            if (column.name === TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY
                && column.supportsTag
                && !column.tag) {
                column.defaultTag = 'consumed';
            }
            if (column.name === TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS
                && column.supportsTag
                && !column.tag) {
                column.defaultTag = 'adjustment';
            }
        }

        function addAdditionalInfoForSkippedColumn(column) {
            if (column.name === TEMPLATE_COLUMNS.SKIPPED) {
                column.defaultSource = 'PREVIOUS_REQUISITION';
            }
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
