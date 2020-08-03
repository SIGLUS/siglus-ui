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
        .module('admin-template-configure-preview-section')
        .controller('ProductPreviewController', controller);

    controller.$inject = ['siglusColumnUtils'];

    function controller(siglusColumnUtils) {

        var vm = this;

        vm.$onInit = onInit;
        vm.columnDisplayName = columnDisplayName;
        vm.isUserInput = siglusColumnUtils.isUserInput;

        function onInit() {
            vm.items = [{
                'orderable.fullProductName': 'Name 1',
                'orderable.productCode': 'Product 1'
            }, {
                'orderable.fullProductName': 'Name 2',
                'orderable.productCode': 'Product 2'
            }];
            vm.columns = getColumns();
        }

        function getColumns() {
            var columns = [];
            for (var columnName in vm.columnsMap) {
                if (vm.columnsMap.hasOwnProperty(columnName) &&
                    vm.columnsMap[columnName].isDisplayed) {
                    columns.push(vm.columnsMap[columnName]);
                }
            }
            return columns;
        }

        function columnDisplayName(column, lineItem) {
            var value = lineItem[column.name];
            if (!value) {
                value = siglusColumnUtils.columnDisplayName(column);
            }
            return value;
        }
    }

})();
