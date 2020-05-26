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

    controller.$inject = ['COLUMN_SOURCES'];

    function controller(COLUMN_SOURCES) {

        var vm = this;

        vm.$onInit = onInit;
        vm.getColumnValue = getColumnValue;
        vm.isProductInfo = isProductInfo;
        vm.isUserInput = isUserInput;

        function onInit() {
            vm.items = [{
                fullProductName: 'Name 1',
                productCode: 'Product 1'
            }, {
                fullProductName: 'Name 2',
                productCode: 'Product 2'
            }];
        }

        function isProductInfo(column) {
            return column.name.indexOf('orderable.') !== -1;
        }

        function isUserInput(column) {
            return column.source === COLUMN_SOURCES.USER_INPUT;
        }

        function getColumnValue(column, lineItem) {
            var value;
            if (column.name === 'orderable.productCode') {
                value = lineItem.productCode;
            } else if (column.name === 'orderable.fullProductName') {
                value = lineItem.fullProductName;
            } else {
                value = column.source
                    .split('_')
                    .join(' ')
                    .toLocaleLowerCase();
            }
            return value;
        }
    }

})();
