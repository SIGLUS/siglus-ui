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
     * @ngdoc object
     * @name requisition-constants.SIGLUS_TEMPLATE_COLUMNS_ORDER
     *
     * @description
     * This is constant for siglus requisition columns order.
     */
    angular
        .module('requisition-constants')
        .constant('SIGLUS_TEMPLATE_COLUMNS_ORDER', columns());

    function columns() {
        var columnsOrder = {
            skipped: 1,
            'orderable.productCode': 2,
            'orderable.fullProductName': 3,
            beginningBalance: 4,
            totalReceivedQuantity: 5,
            totalConsumedQuantity: 6,
            theoreticalStockAtEndofPeriod: 7,
            stockOnHand: 8,
            difference: 9,
            totalStockoutDays: 10,
            averageConsumption: 11,
            theoreticalQuantityToRequest: 12,
            requestedQuantity: 13,
            authorizedQuantity: 14,
            suggestedQuantity: 15,
            estimatedQuantity: 16,
            approvedQuantity: 17
        };

        return {
            getColumnDisplayOrder: getColumnDisplayOrder
        };

        function getColumnDisplayOrder(columnName) {
            return columnsOrder[columnName] ?
                columnsOrder[columnName] :
                Object.keys(columnsOrder).length + 1;
        }
    }

})();
