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
        .module('siglus-location-issue-creation')
        .service('addAndRemoveIssueLineItemIssueService', addAndRemoveIssueLineItemIssueService);

    addAndRemoveIssueLineItemIssueService.inject = ['$filter', 'SiglusLocationCommonUtilsService'];

    function addAndRemoveIssueLineItemIssueService($filter) {

        function getRowTemplateData(lineItem) {
            return  {
                $error: angular.copy(lineItem.$error),
                $hint: angular.copy(lineItem.$hint),
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: _.clone(lineItem.lot),
                isKit: lineItem.isKit,
                isMainGroup: false,
                programId: lineItem.programId,
                location: _.clone(lineItem.location),
                stockOnHand: lineItem.stockOnHand,
                quantity: lineItem.quantity,
                dispensable: lineItem.dispensable
            };
        }

        function addRow(tableLineItem, lineItems) {
            lineItems.splice(1, 0,
                getRowTemplateData(tableLineItem));
        }

        function resetFirstRow(lineItem) {
            lineItem.lot = null;
            lineItem.location = null;
            lineItem.quantity = 0;
            lineItem.isMainGroup = true;
            lineItem.stockOnHand = 0;
            lineItem.$error = {};
            lineItem.$hint = {};
        }

        this.addLineItem = function(lineItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(lineItem, lineItems);
                resetFirstRow(lineItem);
            }
            addRow(lineItem, lineItems);
        };

        this.removeItem = function(lineItems, index) {
            if (lineItems.length === 1) {
                lineItems.splice(0, 1);
            } else if (lineItems.length === 3) {
                var remainRowData = index > 1 ? lineItems[1] : lineItems[2];
                lineItems[0].lot = remainRowData.lot;
                lineItems[0].location = remainRowData.location;
                lineItems[0].quantity = remainRowData.quantity;
                lineItems[0].$error = remainRowData.$error;
                lineItems[0].$hint = remainRowData.$hint;
                lineItems.splice(1, 2);
            } else if (lineItems.length > 3) {
                lineItems.splice(index, 1);
            }
        };

        this.getMainGroupRow = function(lineItem, productList) {
            var isKit = _.get(_.find(productList, function(product) {
                return product.orderableId === lineItem.orderableId;
            }), 'isKit');
            return {
                $error: {},
                $hint: {},
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: null,
                stockOnHand: 0,
                isKit: isKit,
                isMainGroup: true,
                location: null,
                quantity: 0
            };
        };

        this.getAddProductRow = function(product) {
            return {
                $error: {},
                $hint: {},
                orderableId: product.orderableId,
                productCode: product.productCode,
                productName: $filter('productName')(product),
                lot: null,
                stockOnHand: 0,
                isKit: product.isKit,
                isMainGroup: true,
                location: null,
                programId: product.programId,
                quantity: 0
            };
        };

        function updateStockOnHand(locations, lineItem) {
            var stockOnHand = 0;
            if (lineItem.srcLocationCode) {
                _.forEach(locations, function(loc) {
                    _.forEach(loc.lots, function(lot) {
                        if (lot.orderableId === lineItem.orderableId
                            && lot.lotCode === lineItem.lotCode
                            && loc.locationCode === lineItem.srcLocationCode) {
                            stockOnHand = lot.stockOnHand;
                        }
                    });
                });
            }
            return stockOnHand;

        }

        function getProgramId(productList, lineItem) {
            var item = _.find(productList, function(product) {
                return product.orderableId === lineItem.orderableId;
            });
            return _.get(item, 'programId');
        }

        function mapDataToDisplay(group, isMainGroup, locations, productList) {
            return _.map(group, function(item) {
                var stockOnHand = updateStockOnHand(locations, item);
                var lot = item.lotCode ? {
                    id: item.lotId,
                    lotCode: item.lotCode,
                    expirationDate: item.expirationDate,
                    stockOnHand: stockOnHand
                } : null;
                var location = item.locationCode ? {
                    locationCode: item.locationCode,
                    area: item.area
                } : null;

                var baseInfo = _.omit(item, ['lotCode', 'lotId', 'expirationDate', 'occurredDate']);
                var isKit = _.get(_.find(productList, function(product) {
                    return product.orderableId === item.orderableId;
                }), 'isKit');
                return _.extend(baseInfo, {
                    $error: {},
                    $hint: {},
                    lot: lot,
                    isKit: isKit,
                    stockOnHand: stockOnHand,
                    isMainGroup: isMainGroup,
                    programId: getProgramId(productList, item),
                    location: location
                });
            });
        }

        this.prepareAddedLineItems = function(draftInfo, locations,  productList) {
            var $this = this;
            return _.chain(_.get(draftInfo, 'lineItems', []))
                .groupBy('orderableId')
                .values()
                .map(function(group) {
                    if (group.length === 1) {
                        return mapDataToDisplay(group, true, locations, productList);
                    }
                    var firstRow = $this.getMainGroupRow(group[0], productList);
                    var result = [];
                    result.push(firstRow);

                    var childrenLineItems = mapDataToDisplay(group, false, locations, productList);
                    return result.concat(childrenLineItems);

                })
                .value();
        };
    }

})();
