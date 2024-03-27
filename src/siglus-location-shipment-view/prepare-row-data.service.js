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
        .module('siglus-location-shipment-view')
        .service('prepareRowDataService', prepareRowDataService);

    prepareRowDataService.$inject = ['SiglusLocationCommonUtilsService'];

    function prepareRowDataService(SiglusLocationCommonUtilsService) {

        function getRowTemplateData(currentItem, lineItems, isFirstRowToLineItem) {
            var lot = lineItems.length === 1 ? currentItem.lot : null;
            var location = lineItems.length === 1 ? currentItem.location : null;

            return {
                $error: isFirstRowToLineItem ? currentItem.$error : {},
                $hint: isFirstRowToLineItem ? currentItem.$hint : {},
                productCode: currentItem.productCode,
                productName: currentItem.fullProductName ? currentItem.fullProductName : currentItem.productName,
                orderable: currentItem.orderable,
                id: isFirstRowToLineItem ? currentItem.id : undefined,
                quantityShipped: isFirstRowToLineItem ? currentItem.quantityShipped : 0,
                lot: isFirstRowToLineItem ? lot : null,
                isKit: currentItem.isKit,
                location: isFirstRowToLineItem ? location : null,
                netContent: currentItem.netContent,
                skipped: currentItem.skipped,
                orderableId: currentItem.orderableId,
                reservedStock: currentItem.reservedStock
            };
        }

        function addRow(tableLineItem, lineItems, isFirstRowToLineItem) {
            lineItems.push(getRowTemplateData(tableLineItem, lineItems, isFirstRowToLineItem));
        }

        function resetFirstRow(lineItem) {
            lineItem.lot = null;
            lineItem.quantityShipped = 0;
            lineItem.location = null;
        }

        this.addLot = function(currentItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(currentItem, lineItems, true);
                resetFirstRow(currentItem);
            }
            addRow(currentItem, lineItems, false);
        };

        function getDataTemplate(orderLineItem, lineItem, locations, isFirstRow) {
            var lot = SiglusLocationCommonUtilsService.getLotByLotId(locations, _.get(lineItem, ['lot', 'id']));
            if (lot) {
                lot.id = _.get(lot, 'lotId');
                lot = _.omit(lot, 'lotId');
            }
            return {
                $error: {},
                $hint: {},
                orderableId: _.get(orderLineItem, ['orderable', 'id']),
                productCode: _.get(orderLineItem, ['orderable', 'productCode']),
                productName: _.get(orderLineItem, ['orderable', 'fullProductName']),
                orderable: {
                    id: orderLineItem.orderable.id,
                    versionNumber: orderLineItem.orderable.meta.versionNumber
                },
                id: _.get(lineItem, 'id'),
                isKit: _.get(orderLineItem, ['orderable', 'isKit']),
                location: _.get(lineItem, 'location', null),
                lot: lot,
                added: _.get(orderLineItem, 'added', false),
                orderedQuantity: isFirstRow ? orderLineItem.orderedQuantity : '',
                partialFulfilledQuantity: isFirstRow ? orderLineItem.partialFulfilledQuantity : '',
                quantityShipped: _.get(lineItem, 'quantityShipped', 0),
                isMainGroup: isFirstRow,
                netContent: _.get(orderLineItem, ['orderable', 'netContent']),
                skipped: _.get(orderLineItem, 'skipped'),
                reservedStock: _.get(lineItem, ['canFulfillForMe', 'reservedStock'], 0)
            };
        }

        this.prepareGroupLineItems = function(shipment, locations, order) {
            // build map: item.orderable.id -> [item1, item2, ...]
            var groupOrderLineItems = _.chain(shipment.lineItems)
                .groupBy(function(item)  {
                    return item.orderable.id;
                })
                .value();
            var result = [];

            _.forEach(order.orderLineItems, function(orderLineItem, index) {
                var lineItems = groupOrderLineItems[orderLineItem.orderable.id] || [];
                if (_.isEmpty(result[index])) {
                    result[index] = [];
                }
                if (lineItems.length === 0) {
                    result[index].push(getDataTemplate(orderLineItem, undefined, locations, true));
                } else if (lineItems.length === 1) {
                    result[index].push(getDataTemplate(orderLineItem, lineItems[0], locations, true));
                    result[index][0].isMainGroup = true;
                } else {
                    result[index].push(getDataTemplate(orderLineItem, undefined, locations, true));
                    _.forEach(lineItems, function(lineItem) {
                        result[index].push(getDataTemplate(orderLineItem, lineItem, locations, false));
                    });
                }
            });
            return result;
        };

        this.prepareAddProductLineItem = function(selectedOrderables) {
            return _.map(selectedOrderables, function(orderable) {
                orderable.versionNumber = orderable.meta.versionNumber;
                return {
                    $error: {},
                    $hint: {},
                    orderableId: orderable.id,
                    productCode: orderable.productCode,
                    productName: orderable.fullProductName,
                    orderable: orderable,
                    isKit: orderable.isKit,
                    location: null,
                    lot: null,
                    added: true,
                    orderedQuantity: 0,
                    partialFulfilledQuantity: 0,
                    quantityShipped: 0,
                    isMainGroup: true,
                    netContent: orderable.netContent,
                    skipped: false,
                    reservedStock: 0
                };
            });

        };
    }

})();
