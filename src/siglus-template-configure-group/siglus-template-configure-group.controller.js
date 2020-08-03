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
     * @name siglus-template-configure-group.controller:siglusTemplateConfigureGroupController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('siglus-template-configure-group')
        .controller('siglusTemplateConfigureGroupController', controller);

    controller.$inject = ['$scope', 'siglusColumnUtils', 'COLUMN_SOURCES', 'MAX_ADD_LENGTH'];

    function controller($scope, siglusColumnUtils, COLUMN_SOURCES, MAX_ADD_LENGTH) {
        var vm = this;

        vm.$onInit = onInit;
        vm.defaultColums = [];
        vm.sectionMap = {};
        vm.addGroup = addGroup;
        vm.removeGroup = removeGroup;
        vm.overMaxAddLength = overMaxAddLength;

        function onInit() {
            getDefaultColumns();
            updateSectionMap();
            $scope.$watchCollection(function() {
                return vm.sections;
            }, function() {
                updateDisplayOrder();
                updateSectionMap();
            });
        }

        function getDefaultColumns() {
            var defaultSection = _.find(vm.sections, {
                isDefault: true
            });
            angular.forEach(defaultSection.columns, function(column) {
                if (column.columnDefinition.id) {
                    vm.defaultColums.push(angular.merge({}, column, {
                        id: undefined,
                        label: column.columnDefinition.label,
                        definition: column.columnDefinition.definition,
                        source: siglusColumnUtils.isTotal(column) ? COLUMN_SOURCES.USER_INPUT : column.source
                    }));
                }
            });
        }

        function updateSectionMap() {
            vm.sectionMap = _.indexBy(vm.sections, 'name');
        }

        function updateDisplayOrder() {
            angular.forEach(vm.sections, function(section, idx) {
                section.displayOrder = idx;
            });
        }

        function addGroup() {
            if (!overMaxAddLength()) {
                var defaultName = 'newSection';
                var i = 0;
                while (vm.sectionMap[defaultName + i] && i < MAX_ADD_LENGTH) {
                    i++;
                }
                vm.sections.push({
                    name: defaultName + i,
                    label: '',
                    columns: angular.copy(vm.defaultColums)
                });
            }
        }

        function overMaxAddLength() {
            var addedSections = _.filter(vm.sections, function(section) {
                return !section.isDefault;
            });
            return addedSections.length >= MAX_ADD_LENGTH;
        }

        function removeGroup(section) {
            var index = _.findIndex(vm.sections, section);
            if (index >= 0) {
                vm.sections.splice(index, 1);
            }
        }
    }
})();
