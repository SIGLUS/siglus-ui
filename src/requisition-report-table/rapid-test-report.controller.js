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
        .module('requisition-report-table')
        .controller('RapidTestReportController', controller);

    controller.$inject = ['requisitionUtils', 'requisitionValidator', '$timeout'];

    function controller(requisitionUtils, requisitionValidator, $timeout) {
        var vm = this;

        vm.$onInit = onInit;
        vm.calculateTotal = requisitionUtils.calculateTotal;

        function getSubColumns(serviceLineItems) {
            var cols = [];
            var keyMap = {};
            serviceLineItems.forEach(function(item) {
                var key = item.serviceColumn.code;
                if (!keyMap[key]) {
                    cols.push(item.serviceColumn);
                    keyMap[key] = true;
                }
            });
            // sub col must sort then get ordered parent columns
            cols.sort(function(a, b) {
                return a.displayorder - b.displayorder;
            });

            return cols;
        }
        function getParentColumns(subColumns) {
            var cols = [];
            var keyMap = {};
            subColumns.forEach(function(sub) {
                var key = sub.name;
                if (!keyMap[key]) {
                    cols.push(sub.name);
                    keyMap[key] = true;
                }
            });
            return cols;
        }
        function getServices(serviceLineItems) {
            var services = [];
            var keyMap = {};
            serviceLineItems.forEach(function(item) {
                var key = item.service.code;
                if (!keyMap[key]) {
                    services.push(item.service);
                    keyMap[key] = true;
                }
            });
            // services.sort(function(a, b) {
            //     return a.displayorder - b.displayorder;
            // });

            return services;
        }
        function getGroupedRow(serviceLineItems) {
            var groupedRows = _.groupBy(serviceLineItems, function(item) {
                return item.service.code;
            });

            // for (var key in groupedRows) {
            //     if (groupedRows.hasOwnProperty(key)) {
            //         groupedRows[key].sort(function(a, b) {
            //             return a.serviceColumn.displayorder - b.serviceColumn.displayorder;
            //         });
            //     }
            // }
            return groupedRows;
        }
        // should investigate & optimize later -- peace
        vm.validate = function() {
            requisitionValidator.validateRapidTestReport(vm.requisition);
            $timeout(function() {
                requisitionValidator.validateRapidTestReport(vm.requisition);
            });
        };
        function onInit() {
            var lineItems = vm.requisition.serviceLineItems;
            vm.subColumns = getSubColumns(lineItems);
            vm.parentColumns = getParentColumns(vm.subColumns);
            vm.services = getServices(lineItems);
            vm.groupedRows = getGroupedRow(lineItems);
            vm.updateTotal = function(item) {
                var items = lineItems.filter(function(target) {
                    return item.serviceColumn.code === target.serviceColumn.code;
                });
                var totalItem = items.filter(function(target) {
                    return target.service.code === 'TOTAL';
                })[0];

                totalItem.value = items.reduce(function(accumulator, current) {
                    if (current.service.code !== 'TOTAL'
                        && current.service.code !== 'APES'
                        && _.isNumber(current.value)) {
                        if (_.isNull(accumulator)) {
                            accumulator = 0;
                        }
                        return accumulator + current.value;
                    }

                    return accumulator;
                }, null);
            };
        }
    }
})();