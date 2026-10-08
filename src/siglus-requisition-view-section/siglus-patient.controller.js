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
        .module('siglus-requisition-view-section')
        .controller('SiglusPatientController', controller);

    controller.$inject = ['$interval', '$scope', 'siglusColumnUtils', 'requisitionValidator'];

    function controller($interval, $scope, siglusColumnUtils, requisitionValidator) {

        var vm = this;
        var intervalPromise;

        vm.$onInit = onInit;
        vm.$onDestroy = onDestroy;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isCalculated = siglusColumnUtils.isCalculated;
        vm.isTotal = siglusColumnUtils.isTotal;
        vm.getTotal = getTotal;

        vm.mergedPatientMap = {};

        function onInit() {
            var sectionsMap = _.indexBy(vm.sections, 'name');
            angular.forEach(vm.lineItems, function(lineItem) {
                lineItem.section = sectionsMap[lineItem.name];
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    var column = _.find(lineItem.section.columns, {
                        name: columnName
                    });
                    lineItem.columns[columnName] = angular.merge({}, column, lineItem.columns[columnName]);
                });
            });

            var patients = patientTemplateFactory();
            vm.mergedPatientMap = patients.mergedPatientMap;

            // Initial execution and recurring interval setup
            calculatePatientValues();
            intervalPromise = $interval(calculatePatientValues, 3000);
        }

        function onDestroy() {
            // Cancel interval timer on scope/controller destruction to prevent memory leaks
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
            }
        }

        function getTotal(lineItem, column) {
            column.value = _.reduce(lineItem.columns, function(total, column) {
                if (!vm.isCalculated(column) && _.isNumber(column.value)) {
                    return (total || 0) + column.value;
                }
                return total;
            }, undefined);
            requisitionValidator.validateTotalColumn(column);
            return column.value;
        }

        function patientTemplateFactory() {
            if (!vm.lineItems.length) {
                return {
                    normalPatientList: [],
                    mergedPatientMap: {}
                };
            }

            var patientLabelNameMap = {};
            _.each(vm.sections, function(item) {
                patientLabelNameMap[item.name] = item.label;
            });

            var jugeArray = [
                'newSection4',
                'newSection2',
                'newSection9',
                'newSection3',
                'newSection7'
            ];

            return _.reduce(vm.sections, function(r, c) {
                var temp = _.find(vm.lineItems, function(item) {
                    return item.name === c.name;
                });
                if (temp) {
                    c.columns = _.chain(c.columns)
                        .filter(function(item) {
                            return item.isDisplayed;
                        })
                        .sortBy(function(item) {
                            return item.displayOrder;
                        })
                        .value();
                    temp.column = c;
                    if (_.contains(jugeArray, c.name)) {
                        r.mergedPatientMap[c.name] = temp;
                    } else {
                        r.normalPatientList.push(temp);
                    }
                }
                return r;
            }, {
                mergedPatientMap: {},
                normalPatientList: []
            });
        }

        function getValueByKey(key, index) {
            if (!vm.lineItems.length) {
                return '';
            }
            var result = '';
            if (vm.mergedPatientMap[key]) {
                var innerKey = vm.mergedPatientMap[key].column.columns[index].name;
                result = vm.mergedPatientMap[key].columns[innerKey].value;
            }
            return result;
        }

        function calculatePatientValues() {
            var dbThisMonth = getValueByKey('newSection9', 1);
            if ('' === dbThisMonth) {
                dbThisMonth = 0;
            }
            vm.totalWithInThisMonth = getValueByKey('newSection2', 5) +
                getValueByKey('newSection3', 2) +
                dbThisMonth +
                getValueByKey('newSection4', 0);

            var dbTotal = getValueByKey('newSection9', 2);
            if ('' === dbTotal) {
                dbTotal = 0;
            }
            vm.totalWithTreatment = getValueByKey('newSection2', 6) +
                getValueByKey('newSection3', 3) +
                dbTotal +
                getValueByKey('newSection4', 1);

            var calculatedAdjustment = vm.totalWithTreatment / vm.totalWithInThisMonth;

            // Return 0 if the calculated value or division results in NaN / Infinity
            if (isNaN(calculatedAdjustment) || !isFinite(calculatedAdjustment)) {
                vm.adjustmentValue = 0;
            } else {
                vm.adjustmentValue = calculatedAdjustment.toFixed(2);
            }

            // Sync the calculated value back into the underlying newSection7 (Ajuste)
            // column so that the requisition's USER_INPUT value is kept up to date and
            // submit-time validation is not blocked by an empty/stale value.
            syncAdjustmentValueToSection();
        }

        function syncAdjustmentValueToSection() {
            var adjustmentSection = vm.mergedPatientMap.newSection7;
            if (!adjustmentSection || !adjustmentSection.column || !adjustmentSection.column.columns.length) {
                return;
            }
            var columnName = adjustmentSection.column.columns[0].name;
            if (adjustmentSection.columns[columnName]) {
                adjustmentSection.columns[columnName].value = Number(vm.adjustmentValue);
            }
        }
    }

})();