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

    addAndRemoveLineItemService.inject = ['$filter', 'SiglusLocationCommonUtilsService'];

    function addAndRemoveLineItemService($filter, SiglusLocationCommonUtilsService) {

        this.addLineItem = addLineItem;
        this.addLineItemForVirtual = addLineItemForVirtual;
        this.removeItem = removeItem;
        this.getMainGroupRow = getMainGroupRow;
        this.getMainGroupRowForPod = getMainGroupRowForPod;
        this.getAddProductRow = getAddProductRow;
        this.prepareAddedLineItems = prepareAddedLineItems;
        this.prepareAddedLineItemsForVirtual = prepareAddedLineItemsForVirtual;
        this.fillMovementOptions = fillMovementOptions;
        this.prepareLineItemsForPod = prepareLineItemsForPod;
        this.addItemForPod = addItemForPod;
        this.removeItemForPod = removeItemForPod;

        function getRowTemplateData(lineItem) {
            return  {
                $error: _.clone(lineItem.$error),
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: _.clone(lineItem.lot),
                isKit: lineItem.isKit,
                isMainGroup: false,
                programId: lineItem.programId,
                location: _.clone(lineItem.location),
                stockOnHand: lineItem.stockOnHand,
                moveTo: _.clone(lineItem.moveTo),
                moveToLocation: _.clone(lineItem.moveToLocation),
                quantity: lineItem.quantity
            };
        }
        function getRowTemplateDataForVirtualMovement(lineItem) {
            return  {
                $error: _.clone(lineItem.$error),
                orderableId: lineItem.orderableId,
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lot: _.clone(lineItem.lot),
                isKit: lineItem.isKit,
                isMainGroup: false,
                programId: lineItem.programId,
                location: _.clone(lineItem.location),
                stockOnHand: lineItem.stockOnHand,
                quantity: undefined
            };
        }

        // TODO
        function getRowTemplateDataForPod(lineItem) {
            return  {
                $error: {},
                id: lineItem.id,
                orderable: _.clone(lineItem.orderable),
                lot: _.clone(lineItem.lot),
                isKit: lineItem.isKit,
                isMainGroup: false,
                stockOnHand: lineItem.stockOnHand,
                moveTo: {},
                quantity: lineItem.quantity,
                notes: lineItem.notes,
                quantityShipped: lineItem.quantityShipped,
                useVvm: lineItem.useVvm,
                vvmStatus: lineItem.vvmStatus,
                price: lineItem.price
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
            lineItem.moveTo = null;
            lineItem.moveToLocation = null;
            lineItem.stockOnHand = 0;
            lineItem.isFirst = false;
        }

        function addLineItem(lineItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(lineItem, lineItems);
                resetFirstRow(lineItem);
            }
            addRow(lineItem, lineItems);
        }

        function addLineItemForVirtual(lineItem, lineItems, index) {
            var copied = angular.copy(lineItem);
            if (lineItems.length === 1) {
                addRow(copied, lineItems);
                lineItems[1].isFirst = true;
                resetFirstRow(lineItem);
            }
            lineItems.splice(index === 0 ?  2 : ++index, 0, getRowTemplateDataForVirtualMovement(copied));
        }

        function removeItem(lineItems, index) {
            if (lineItems.length === 1) {
                lineItems.splice(0, 1);
            } else if (lineItems.length === 3) {
                var remainRowData = index > 1 ? lineItems[1] : lineItems[2];
                _.extend(lineItems[0], remainRowData, {
                    isMainGroup: true,
                    isFirst: true
                });
                lineItems.splice(1, 2);
            } else if (lineItems.length > 3) {
                lineItems.splice(index, 1);
            }
        }

        function getMainGroupRow(lineItem) {
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
                quantity: 0
            };
        }

        function getMainGroupRowForPod(lineItem) {
            return {
                $error: {},
                id: lineItem.id,
                orderable: _.clone(lineItem.orderable),
                lot: _.clone(lineItem.lot),
                isKit: lineItem.isKit,
                stockOnHand: 0,
                isMainGroup: true,
                location: null,
                moveTo: null,
                notes: lineItem.notes,
                quantityShipped: lineItem.quantityShipped,
                quantityAccepted: lineItem.quantityAccepted,
                quantityRejected: lineItem.quantityRejected,
                rejectionReasonId: lineItem.rejectionReasonId,
                useVvm: lineItem.useVvm,
                vvmStatus: lineItem.vvmStatus
            };
        }

        function getAddProductRow(product) {
            return {
                $error: {},
                orderableId: product.orderableId,
                productCode: product.productCode,
                productName: $filter('productName')(product),
                lot: null,
                stockOnHand: 0,
                isKit: product.isKit,
                isMainGroup: true,
                location: null,
                programId: product.programId,
                moveTo: null,
                quantity: 0
            };
        }

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

        function mapDataToDisplay(group, isMainGroup, locations, productList, isFirst) {
            return _.map(group, function(item) {
                var stockOnHand = updateStockOnHand(locations, item);
                var lot = item.lotCode ? {
                    id: item.lotId,
                    lotCode: item.lotCode,
                    expirationDate: item.expirationDate,
                    stockOnHand: stockOnHand
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
                    stockOnHand: stockOnHand,
                    isMainGroup: isMainGroup,
                    programId: getProgramId(productList, item),
                    location: location,
                    moveTo: moveTo,
                    isFirst: isFirst
                });
            });
        }

        function prepareAddedLineItems(draftInfo, locations,  productList) {
            var $this = this;
            return _.chain(_.get(draftInfo, 'lineItems', []))
                .groupBy('orderableId')
                .values()
                .map(function(group) {
                    if (group.length === 1) {
                        return mapDataToDisplay(group, true, locations, productList);
                    }
                    var firstRow = $this.getMainGroupRow(group[0]);
                    var result = [];
                    result.push(firstRow);

                    var childrenLineItems = mapDataToDisplay(group, false, locations, productList);
                    return result.concat(childrenLineItems);

                })
                .value();
        }

        function prepareAddedLineItemsForVirtual(draftInfo, locations,  productList) {
            var $this = this;
            var sortedByProductCode = _.chain(_.get(draftInfo, 'lineItems', [])).sort(function(i1, i2) {
                return _.get(i1, 'productCode', '').localeCompare(_.get(i2, 'productCode', ''));
            });
            return _.chain(sortedByProductCode)
                .groupBy('orderableId')
                .values()
                .map(function(group) {
                    if (group.length === 1) {
                        return mapDataToDisplay(group, true, locations, productList, true);
                    }
                    var firstRow = $this.getMainGroupRow(group[0]);
                    var result = [];
                    result.push(firstRow);

                    var childrenLineItems = mapDataToDisplay(group, false, locations, productList);
                    if (childrenLineItems.length > 1 && childrenLineItems[0].lot && childrenLineItems[0].lot.id) {
                        childrenLineItems.sort(function(i1, i2) {
                            return _.get(i2, ['lot', 'lotCode'], '').localeCompare(_.get(i1, ['lot', 'lotCode'], ''));
                        });
                        childrenLineItems[0].isFirst = true;
                        for (var i = 1; i < childrenLineItems.length; i++) {
                            if (_.get(childrenLineItems[i], ['lot', 'id'], '') !==
                                _.get(childrenLineItems[i - 1], ['lot', 'id'], '')) {
                                childrenLineItems[i].isFirst = true;
                            }
                        }
                    } else {
                        childrenLineItems[0].isFirst = true;
                    }
                    return result.concat(childrenLineItems);

                })
                .value();
        }

        function fillMovementOptions(lineItem, locations, areaLocationInfo) {
            if (!lineItem.lotCodeOptions) {
                lineItem.lotCodeOptions = SiglusLocationCommonUtilsService.getLotList(
                    lineItem,
                    SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)
                );
            }
            if (!lineItem.srcLocationOptions) {
                lineItem.srcLocationOptions = SiglusLocationCommonUtilsService.getLocationList(
                    lineItem,
                    SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations)
                );
            }
            if (!lineItem.destLocationOptions) {
                lineItem.destLocationOptions = SiglusLocationCommonUtilsService
                    .getDesLocationList(lineItem, areaLocationInfo);
            }
            if (!lineItem.destAreaOptions) {
                lineItem.destAreaOptions = SiglusLocationCommonUtilsService
                    .getDesAreaList(lineItem, areaLocationInfo);
            }
        }

        function prepareLineItemsForPod(orderLineItems) {
            var that = this;
            return orderLineItems.map(function(orderLineItem) {
                var allLineItems = _.flatten(_.get(orderLineItem, 'groupedLineItems', []));

                var groupByLot = _.groupBy(allLineItems, function(line) {
                    return _.get(line, ['lot', 'id'], '');
                });

                Object.values(groupByLot).forEach(function(lotLineItems) {
                    if (lotLineItems.length > 1) {
                        lotLineItems.unshift(that.getMainGroupRowForPod(lotLineItems[0]));
                    } else {
                        lotLineItems[0].isFirst = true;
                    }
                    lotLineItems.forEach(function(line) {
                        line.$error = {};
                    });
                });

                orderLineItem.groupedLineItems = _.flatten(Object.values(groupByLot));

                return orderLineItem;
            });
        }

        function addItemForPod(lineItem, index, groupedLineItems) {
            var copy = angular.copy(lineItem);
            if (lineItem.isFirst) {
                var mainGroupRow = getRowTemplateDataForPod(copy);
                mainGroupRow.isMainGroup = true;
                groupedLineItems.splice(index, 0, mainGroupRow);
                lineItem.isFirst = false;
                lineItem.quantityRejected = undefined;
            }
            groupedLineItems.push(getRowTemplateDataForPod(copy));
        }

        function removeItemForPod(lineItem, index, groupedLineItems) {
            var count = groupedLineItems.filter(function(line) {
                return _.get(lineItem, ['lot', 'id'], '') === _.get(line, ['lot', 'id'], '');
            }).length;
            groupedLineItems.splice(index, 1);
            if (count === 3) {
                var mainGroupIndex = groupedLineItems.findIndex(function(line) {
                    return _.get(lineItem, ['lot', 'id'], '') === _.get(line, ['lot', 'id'], '') && line.isMainGroup;
                });
                groupedLineItems[mainGroupIndex + 1].isFirst = true;
                groupedLineItems.splice(mainGroupIndex, 1);
            }
        }
    }

})();
