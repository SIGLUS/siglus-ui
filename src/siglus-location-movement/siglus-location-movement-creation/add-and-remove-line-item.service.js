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

    addAndRemoveLineItemService.inject = ['$filter'];

    function addAndRemoveLineItemService($filter) {

        function getRowTemplateData(lineItem) {
            return  {
                $error: _.clone(lineItem.$error),
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: _.clone(lineItem.lot),
                isKit: lineItem.isKit,
                isMainGroup: false,
                location: _.clone(lineItem.location),
                stockOnHand: lineItem.stockOnHand,
                moveTo: _.clone(lineItem.moveTo),
                moveToLocation: _.clone(lineItem.moveToLocation),
                quantity: lineItem.quantity
            };
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
            lineItem.moveTo = null;
            lineItem.moveToLocation = null;
            lineItem.stockOnHand = 0;
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

        this.getMainGroupRow = function(lineItem) {
            return {
                $error: {},
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: null,
                stockOnHand: 0,
                isKit: lineItem.isKit,
                isMainGroup: true,
                location: null,
                moveTo: null,
                quantity: null
            };
        };

        this.getAddProductRow = function(orderable) {
            return {
                $error: {},
                orderableId: orderable.id,
                productCode: orderable.productCode,
                productName: $filter('productName')(orderable),
                lot: null,
                stockOnHand: 0,
                isKit: orderable.isKit,
                isMainGroup: true,
                location: null,
                moveTo: null,
                quantity: null
            };
        };

        function updateStockOnHand(locations, lineItem) {
            var stockOnHand = 0;
            if (lineItem.lot && lineItem.location) {
                _.forEach(locations, function(loc) {
                    _.forEach(loc.lots, function(lot) {
                        if (lineItem.lot && lineItem.location
                          && lot.lotCode === lineItem.lot.lotCode
                          && loc.locationCode === lineItem.location.locationCode) {
                            stockOnHand = lot.stockOnHand;
                        }
                    });
                });
            }
            return stockOnHand;

        }

        function mapDataToDisplay(group, isMainGroup, locations) {
            return _.map(group, function(item) {
                var lot = item.lotCode ? {
                    id: item.lotId,
                    lotCode: item.lotCode,
                    expirationDate: item.expirationDate,
                    stockOnHand: updateStockOnHand(locations, item)
                } : null;
                var location = item.srcLocationCode ? {
                    locationCode: item.srcLocationCode
                } : null;

                var moveTo = {
                    area: item.destArea,
                    locationCode: item.destLocationCode
                };

                var baseInfo = _.omit(item, ['lotCode', 'lotId', 'expirationDate', '' +
                'srcArea', 'srcLocationCode']);
                return _.extend(baseInfo, {
                    $error: {},
                    lot: lot,
                    isMainGroup: isMainGroup,
                    location: location,
                    moveTo: moveTo
                });
            });
        }

        this.prepareAddedLineItems = function(draftInfo) {
            var $this = this;
            return _.chain(_.get(draftInfo, 'lineItems', []))
                .groupBy('orderableId')
                .values()
                .map(function(group) {
                    if (group.length === 1) {
                        return mapDataToDisplay(group, true);
                    }
                    var firstRow = $this.getMainGroupRow(group[0]);
                    var result = [];
                    result.push(firstRow);

                    var childrenLineItems = mapDataToDisplay(group, false);
                    return result.concat(childrenLineItems);

                })
                .value();
        };
    }

})();
