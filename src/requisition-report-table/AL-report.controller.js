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

/**
 * interface IOrderable {
 *     productCode: string;
 *     fullProductName: string;
 * }
 */

/**
 * interface IAlDepartment {
 *     groupName: string;
 *     stockCount: number;
 *     consumeCount: number;
 * }
 */

/**
 * interface IItem {
 *     orderable: IOrderable;
 *     alDepartmentList: Array<IAlDepartment>;
 * }
 */

(function() {

    'use strict';

    angular
        .module('requisition-report-table')
        .controller('AlReportController', controller);

    controller.$inject = [];

    function controller() {

        var vm = this;

        vm.$onInit = function() {
            vm.lineItems.forEach(function(item) {
                var orderable = item.orderable;
                if (orderable.productCode === '08O05') {
                    orderable.fullProductName = '6x1';
                } else if (orderable.productCode === '08O05Z') {
                    orderable.fullProductName = '6x2';
                } else if (orderable.productCode === '08O05Y') {
                    orderable.fullProductName = '6x3';
                } else if (orderable.productCode === '08O05X') {
                    orderable.fullProductName = '6x4';
                }
            });

            vm.lineItems.sort(function(a, b) {
                var name1 = a.orderable.fullProductName || '';
                var name2 = b.orderable.fullProductName || '';
                return name1.localeCompare(name2);

            });
        };

        vm.isEmpty = function(val) {
            return val === null || val === undefined;
        };

        /**
         * @param list: Array<IAlDepartment>
         * @returns IAlDepartment
         */
        vm.getHF = function(list) {
            return list.find(function(item) {
                return item.groupName === 'HF';
            });
        };

        /**
         * @param list: Array<IAlDepartment>
         * @returns IAlDepartment
         */
        vm.getCHW = function(list) {
            return list.find(function(item) {
                return item.groupName === 'CHW';
            });
        };

        /**
         * @param orderable: IOrderable
         * @returns string
         */
        // vm.displayTh = function(orderable) {
        //     if (orderable.productCode === '08O05') {
        //         return '6x1';
        //     } else if (orderable.productCode === '08O05Z') {
        //         return '6x2';
        //     } else if (orderable.productCode === '08O05Y') {
        //         return '6x3';
        //     } else if (orderable.productCode === '08O05X') {
        //         return '6x4';
        //     }
        //     return orderable.fullProductName;
        // };

        /**
         * @param item: IItem
         * @returns number | null;
         */
        vm.getTotalConsume = function(item) {
            var val1 = vm.getHF(item.alDepartmentList).consumeCount;
            var val2 = vm.getCHW(item.alDepartmentList).consumeCount;
            if ((val1 === null || val1 === undefined) && (val2 === null || val2 === undefined)) {
                return null;
            }

            val1 = val1 || 0;
            val2 = val2 || 0;
            return val1 + val2;
        };

        /**
         * @param item: IItem
         * @returns number | null;
         */
        vm.getTotalStock = function(item) {
            var val1 = vm.getHF(item.alDepartmentList).stockCount;
            var val2 = vm.getCHW(item.alDepartmentList).stockCount;
            if ((val1 === null || val1 === undefined) && (val2 === null || val2 === undefined)) {
                return null;
            }

            val1 = val1 || 0;
            val2 = val2 || 0;
            return val1 + val2;
        };

        vm.validateConsumeCount = function(item) {
            item.isRequiredConsumeCount = true;
        };
        vm.validateStockCount = function(item) {
            item.isRequiredStockCount = true;
        };
    }

})();
