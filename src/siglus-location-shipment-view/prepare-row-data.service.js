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
            var lot = lineItems.length === 1 && currentItem.lot;
            var location = lineItems.length === 1 && currentItem.location;

            return {
                $error: isFirstRowToLineItem ? currentItem.$error : {},
                $hint: isFirstRowToLineItem ? currentItem.$hint : {},
                productCode: currentItem.productCode,
                productName: currentItem.fullProductName,
                id: currentItem.id,
                quantity: 0,
                partialFilled: 0,
                lot: lot,
                isKit: currentItem.isKit,
                location: location,
                netContent: currentItem.netContent,
                skipped: currentItem.skipped,
                orderableId: currentItem.orderableId
            };
        }

        function addRow(tableLineItem, lineItems, isFirstRowToLineItem) {
            lineItems.splice(1, 0,
                getRowTemplateData(tableLineItem, lineItems, isFirstRowToLineItem));
        }

        function resetFirstRow(lineItem) {
            lineItem.lot = null;
            lineItem.shipmentLineItem = {};
            lineItem.location = null;
        }

        this.addLot = function(currentItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(currentItem, lineItems, true);
                resetFirstRow(currentItem);
            }
            addRow(currentItem, lineItems, false);
        };

        function getDataTemplate(orderLineItem, isMainGroup, locations, order) {

            var location =  orderLineItem.location;

            var lot = SiglusLocationCommonUtilsService.getLotByLotId(locations, _.get(orderLineItem.lot, 'id'));
            lot.id = lot.lotId;
            lot = _.omit(lot, 'lotId');

            var orderItem = _.find(order.orderLineItems, function(item) {
                return item.orderable.id === orderLineItem.orderable.id;
            });
            return {
                $error: {},
                $hint: {},
                orderableId: _.get(orderItem, ['orderable', 'id']),
                productCode: _.get(orderItem, ['orderable', 'productCode']),
                productName: _.get(orderItem, ['orderable', 'fullProductName']),
                orderable: orderLineItem.orderable,
                id: orderLineItem.id,
                isKit: _.get(orderItem, ['orderable', 'isKit']),
                location: location,
                lot: lot,
                added: orderItem.added,
                orderQuantity: isMainGroup ? orderItem.orderedQuantity : '',
                partialFulfilledQuantity: isMainGroup ? orderItem.partialFulfilledQuantity : '',
                quantityShipped: orderLineItem.quantityShipped,
                isMainGroup: isMainGroup,
                netContent: _.get(orderItem, ['orderable', 'netContent']),
                skipped: orderItem.skipped
            };
        }

        this.prepareGroupLineItems = function(shipment, locations, order) {
            var groupOrderLineItems = _.chain(shipment.lineItems)
                .groupBy(function(item)  {
                    return item.orderable.id;
                })
                .values()
                .value();
            var result = [];
            _.forEach(groupOrderLineItems, function(groupLineItems, index) {

                if (!_.isArray(result[index])) {
                    result[index] = [];
                }
                if (groupLineItems.length === 1) {
                    result[index].push(getDataTemplate(_.first(groupLineItems), true, locations, order));
                    return;
                }

                if (groupLineItems.length > 1) {
                    result[index].push(getDataTemplate(_.first(groupLineItems), true, locations, order));
                    result[index][0].lot = null;
                    result[index][0].location = null;
                    _.forEach(groupLineItems, function(orderLineItem) {
                        result[index].push(getDataTemplate(orderLineItem, false, locations, order));
                    });
                }
            });
            console.log(result);
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
                    orderQuantity: 0,
                    partialFulfilledQuantity: 0,
                    quantityShipped: 0,
                    isMainGroup: true,
                    netContent: orderable.netContent,
                    skipped: false
                };
            });

        };
    }

})();
