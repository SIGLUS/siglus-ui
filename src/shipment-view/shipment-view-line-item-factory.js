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
     * @name shipment-view.ShipmentViewLineItemFactory
     *
     * @description
     * Responsible for creating a list of line items to be displayed on the Shipment View page.
     */
    angular
        .module('shipment-view')
        .factory('ShipmentViewLineItemFactory', ShipmentViewLineItemFactory);

    ShipmentViewLineItemFactory.inject = [
        'StockCardResource', 'VVM_STATUS', 'ShipmentViewLineItem', 'ShipmentViewLineItemGroup'
    ];

    function ShipmentViewLineItemFactory(StockCardResource, VVM_STATUS,
                                         ShipmentViewLineItem, ShipmentViewLineItemGroup) {

        ShipmentViewLineItemFactory.prototype.createFrom = buildFrom;

        return ShipmentViewLineItemFactory;

        function ShipmentViewLineItemFactory() {}

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemFactory
         * @name buildFrom
         *
         * @description
         * Creates a list of line items based on the provided shipment and stock card summaries. The
         * created line items can cover any of the following: Commodity Type, Trade Item Lot or a
         * generic orderable. The returned list is a flat list of all the line items. The references
         * between them stay intact.
         *
         * @param  {Shipment} shipment  the shipment
         * @param  {Array}    summaries the array if stock card summaries
         * @return {Array}              the list of line items
         */
        function buildFrom(shipment, summaries) {
            var shipmentLineItemMap = mapByOrderableAndLot(shipment.lineItems);

            var shipmentViewLineItemGroups = shipment.order.orderLineItems
                .map(function(orderLineItem) {
                    var orderableId = orderLineItem.orderable.id,
                        summary = findSummaryByOrderableId(summaries, orderableId),
                        shipmentLineItem = findShipmentLineItemByOrderableIdAndLotId(
                            shipmentLineItemMap,
                            orderableId,
                            undefined
                        );

                    if (isForGenericOrderable(summary) && shipmentLineItem) {
                        return new ShipmentViewLineItem({
                            productCode: orderLineItem.orderable.productCode,
                            productName: orderLineItem.orderable.fullProductName,
                            shipmentLineItem: shipmentLineItem,
                            orderQuantity: orderLineItem.orderedQuantity,
                            netContent: orderLineItem.orderable.netContent,
                            // #287: Warehouse clerk can skip some products in order
                            skipped: orderLineItem.skipped
                            // #287: ends here
                        });
                    }

                    var tradeItemLineItems = summary ?
                        buildTradeItems(summary, shipmentLineItemMap, orderLineItem.skipped) : [];
                    return new ShipmentViewLineItemGroup({
                        productCode: orderLineItem.orderable.productCode,
                        productName: orderLineItem.orderable.fullProductName,
                        lineItems: tradeItemLineItems,
                        orderQuantity: orderLineItem.orderedQuantity,
                        isMainGroup: true,
                        netContent: orderLineItem.orderable.netContent,
                        // #287: Warehouse clerk can skip some products in order
                        skipped: orderLineItem.skipped,
                        // #287: ends here
                        // #400: Facility user partially fulfill an order and create sub-order for an requisition
                        partialFulfilledQuantity: orderLineItem.partialFulfilledQuantity
                        // #400: ends here
                    });
                });

            sortLotLineItems(shipmentViewLineItemGroups);

            return flatten(shipmentViewLineItemGroups);
        }

        function sortLotLineItems(commodityTypeLineItems) {
            commodityTypeLineItems.forEach(function(commodityTypeLineItem) {
                if (commodityTypeLineItem.lineItems) {
                    commodityTypeLineItem.lineItems.forEach(function(tradeItemLineItems) {
                        if (tradeItemLineItems.lineItems) {
                            tradeItemLineItems.lineItems.sort(compareLineItems);
                        }
                    });
                }
            });
        }

        function buildTradeItems(summary, shipmentLineItemMap, skipped) {
            var uniqueOrderables = getUniqueOrderables(summary.canFulfillForMe),
                canFulfillForMeMap = groupByOrderables(summary.canFulfillForMe),
                tradeItemLineItems = [];

            uniqueOrderables.forEach(function(orderable) {
                var lotLineItems = buildLotLineItems(shipmentLineItemMap, canFulfillForMeMap, orderable, skipped);

                if (lotLineItems.length > 1) {
                    tradeItemLineItems.push(new ShipmentViewLineItemGroup({
                        productCode: orderable.productCode,
                        productName: orderable.fullProductName,
                        lineItems: lotLineItems,
                        netContent: orderable.netContent,
                        // #287: Warehouse clerk can skip some products in order
                        skipped: skipped
                        // #287: ends here
                    }));
                } else if (lotLineItems.length) {
                    tradeItemLineItems.push(new ShipmentViewLineItem({
                        productCode: orderable.productCode,
                        productName: orderable.fullProductName,
                        lot: lotLineItems[0].lot,
                        vvmStatus: lotLineItems[0].vvmStatus,
                        shipmentLineItem: lotLineItems[0].shipmentLineItem,
                        netContent: orderable.netContent,
                        // #287: Warehouse clerk can skip some products in order
                        skipped: skipped
                        // #287: ends here
                    }));
                }
            });

            return tradeItemLineItems;
        }

        function buildLotLineItems(shipmentLineItemMap, canFulfillForMeMap, orderable, skipped) {
            var lotLineItems = [];

            canFulfillForMeMap[orderable.id].forEach(function(canFulfillForMe) {
                var lotId = canFulfillForMe.lot ? canFulfillForMe.lot.id : undefined,
                    shipmentLineItem = findShipmentLineItemByOrderableIdAndLotId(
                        shipmentLineItemMap,
                        orderable.id,
                        lotId
                    );

                if (shipmentLineItem) {
                    lotLineItems.push(new ShipmentViewLineItem({
                        lot: canFulfillForMe.lot,
                        vvmStatus: getVvmStatus(canFulfillForMe),
                        shipmentLineItem: shipmentLineItem,
                        netContent: orderable.netContent,
                        // #287: Warehouse clerk can skip some products in order
                        skipped: skipped
                        // #287: ends here
                    }));
                }
            });

            lotLineItems.sort(compareLineItems);

            return lotLineItems;
        }

        function findShipmentLineItemByOrderableIdAndLotId(shipmentLineItemMap, orderableId, lotId) {
            if (shipmentLineItemMap[orderableId]) {
                return shipmentLineItemMap[orderableId][lotId];
            }
        }

        function findSummaryByOrderableId(summaries, orderableId) {
            return summaries.filter(function(summary) {
                return summary.orderable.id === orderableId;
            })[0];
        }

        function flatten(shipmentViewLineItems) {
            return shipmentViewLineItems.reduce(function(shipmentViewLineItems, lineItem) {
                shipmentViewLineItems.push(lineItem);
                if (lineItem.lineItems && !lineItem.noStockAvailable) {
                    lineItem.lineItems.forEach(function(lineItem) {
                        shipmentViewLineItems.push(lineItem);
                        if (lineItem.lineItems) {
                            lineItem.lineItems.forEach(function(lineItem) {
                                shipmentViewLineItems.push(lineItem);
                            });
                        }
                    });
                }
                return shipmentViewLineItems;
            }, []);
        }

        function groupByOrderables(canFulfillForMe) {
            return canFulfillForMe.reduce(function(canFulfillForMeMap, canFulfillForMe) {
                var orderableId = canFulfillForMe.orderable.id;

                if (!canFulfillForMeMap[orderableId]) {
                    canFulfillForMeMap[orderableId] = [];
                }

                canFulfillForMeMap[orderableId].push(canFulfillForMe);

                return canFulfillForMeMap;
            }, {});
        }

        function mapByOrderableAndLot(lineItems) {
            return lineItems.reduce(function(map, lineItem) {
                var orderableId = lineItem.orderable.id,
                    lotId = lineItem.lot ? lineItem.lot.id : undefined;

                if (!map[orderableId]) {
                    map[orderableId] = {};
                }

                map[orderableId][lotId] = lineItem;

                return map;
            }, {});
        }

        function getUniqueOrderables(canFulfillForMe) {
            var orderablesMap = canFulfillForMe.reduce(function(orderables, canFulfillForMe) {
                orderables[canFulfillForMe.orderable.id] = canFulfillForMe.orderable;
                return orderables;
            }, {});

            return Object.keys(orderablesMap).map(function(id) {
                return orderablesMap[id];
            });
        }

        function isForGenericOrderable(summary) {
            return summary &&
                summary.canFulfillForMe.length === 1 &&
                summary.orderable.id === summary.canFulfillForMe[0].orderable.id;
        }

        function compareLineItems(left, right) {
            return compareLots(left.lot, right.lot) ||
                compareVvmStatuses(left.vvmStatus, right.vvmStatus) ||
                compareExpirationDate(getExpirationDate(left), getExpirationDate(right)) ||
                compare(left.shipmentLineItem.stockOnHand, right.shipmentLineItem.stockOnHand);
        }

        function compareVvmStatuses(left, right) {
            if (left === right) {
                return 0;
            }

            if (!left || !right) {
                return left ? -1 : 1;
            }

            return left > right ? -1 : 1;
        }

        function compareExpirationDate(left, right) {
            if (left === right) {
                return 0;
            }

            if (!left || !right) {
                return left ? 1 : -1;
            }

            if (left.getTime() === right.getTime()) {
                return 0;
            }

            return left > right ? 1 : -1;
        }

        function compare(left, right) {
            if (left === right) {
                return 0;
            }

            return left > right ? 1 : -1;
        }

        function compareLots(left, right) {
            if ((!left && !right) || (left && right)) {
                return 0;
            }

            return left ? 1 : -1;
        }

        function getVvmStatus(canFulfillForMe) {
            if (canFulfillForMe.stockCard && canFulfillForMe.stockCard.extraData) {
                return canFulfillForMe.stockCard.extraData.vvmStatus;
            }
        }

        function getExpirationDate(lineItem) {
            if (lineItem.lot && lineItem.lot.expirationDate) {
                return new Date(lineItem.lot.expirationDate);
            }
        }
    }
})();