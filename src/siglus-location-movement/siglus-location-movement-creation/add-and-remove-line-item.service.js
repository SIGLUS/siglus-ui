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
   * @ngdoc service
   * @name shipment-view.shipmentViewService
   *
   * @description
   * Application layer service that prepares domain objects to be used on the view.
   */
    angular
        .module('siglus-location-movement-creation')
        .service('addAndRemoveLineItemService', addAndRemoveLineItemService);

    // #287: add alertService
    addAndRemoveLineItemService.inject = [];
    // #287: ends here

    function addAndRemoveLineItemService() {

        function getRowTemplateData(lineItem) {
            var rowData = {
                $error: {},
                $hint: {},
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: null,
                isKit: lineItem.isKit,
                isMainGroup: false,
                location: null,
                area: null,
                moveToLocation: null,
                quantity: lineItem.quantity
            };
            return rowData;
        }

        function addRow(tableLineItem, lineItems, isFirstRowToLineItem) {
            lineItems.splice(1, 0,
                getRowTemplateData(tableLineItem, lineItems, isFirstRowToLineItem));
        }

        function resetFirstRow(lineItem) {
            lineItem.lot = null;
            lineItem.location = null;
            lineItem.quantity = null;
            lineItem.isMainGroup = true;
        }

        this.addLineItem = function(lineItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(lineItem, lineItems, true);
                resetFirstRow(lineItem);
            }
            addRow(lineItem, lineItems, false);
        };

        this.removeItem = function(lineItems, index) {
            if (lineItems.length === 1) {
                lineItems.splice(0, 1);
            } else if (lineItems.length === 3) {
                var remainRowData = index > 1 ? lineItems[1] : lineItems[2];
                _.extend(lineItems[0], remainRowData, {
                    isMainGroup: true
                });
                lineItems.splice(1, 2);
            } else if (lineItems.length > 3) {
                lineItems.splice(index, 1);
            }
        };
    }

})();
