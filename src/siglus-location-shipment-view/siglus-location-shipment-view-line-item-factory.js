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
        .module('siglus-location-shipment-view')
        .factory('SiglusLocationShipmentViewLineItemFactory', ShipmentViewLineItemFactory);

    ShipmentViewLineItemFactory.inject = [
        'StockCardResource', 'VVM_STATUS', 'SiglusLocationShipmentViewLineItem',
        'SiglusLocationShipmentViewLineItemGroup'
    ];

    function ShipmentViewLineItemFactory() {

        ShipmentViewLineItemFactory.prototype.createFrom = buildFrom;
        ShipmentViewLineItemFactory.prototype.prepareGroupLineItems = prepareGroupLineItems;

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
        function buildFrom(shipment) {
            var shipmentViewLineItemGroups = shipment.order.orderLineItems
                .map(function(orderLineItem) {
                    var shipmentLineItem =  _.clone(_.find(shipment.lineItems, function(item) {
                        return item.orderable.id === orderLineItem.orderable.id;
                    }));
                    shipmentLineItem.quantityShipped = null;
                    var orderableId = orderLineItem.orderable.id;
                    return {
                        $error: {},
                        $hint: {},
                        productCode: orderLineItem.orderable.productCode,
                        productName: orderLineItem.orderable.fullProductName,
                        id: orderLineItem.id,
                        isKit: orderLineItem.orderable.isKit,
                        lineItems: [],
                        orderQuantity: orderLineItem.orderedQuantity,
                        isMainGroup: true,
                        shipmentLineItem: shipmentLineItem,
                        netContent: orderLineItem.orderable.netContent,
                        skipped: orderLineItem.skipped,
                        orderableId: orderableId,
                        partialFulfilledQuantity: orderLineItem.partialFulfilledQuantity
                    };
                });

            sortLotLineItems(shipmentViewLineItemGroups);

            return flatten(shipmentViewLineItemGroups);
        }

        function getDataTemplate(orderLineItem, shipment, isMainGroup, orderableLocationLotsMap) {
            var shipmentLineItem =  _.clone(_.find(shipment.lineItems, function(item) {
                return item.orderable.id === orderLineItem.orderable.id;
            }));

            var orderable = _.get(_.find(shipment.order.orderLineItems, function(item) {
                return orderLineItem.orderable.id === item.orderable.id;
            }), 'orderable', {});

            var location =  orderLineItem.location;

            var lot =  _.find(_.get(orderableLocationLotsMap, [orderable.id, location.locationCode]), function(item) {
                return item.id === orderLineItem.lot.id;
            });

            shipmentLineItem.quantityShipped = orderLineItem.quantityShipped || 0;
            return {
                $error: {},
                $hint: {},
                productCode: orderable.productCode,
                productName: orderable.fullProductName,
                id: orderLineItem.id,
                isKit: orderable.isKit,
                lineItems: [],
                location: location,
                lot: lot,
                orderQuantity: orderLineItem.orderedQuantity,
                isMainGroup: isMainGroup,
                shipmentLineItem: shipmentLineItem,
                netContent: orderable.netContent,
                skipped: orderLineItem.skipped,
                orderableId: orderable.id,
                partialFulfilledQuantity: orderLineItem.partialFulfilledQuantity
            };
        }

        function prepareGroupLineItems(shipment, orderableLocationLotsMap, orderableLotsLocationMap) {
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
                    result[index].push(getDataTemplate(_.first(groupLineItems), shipment, true,
                        orderableLocationLotsMap, orderableLotsLocationMap));
                    return;
                }

                if (groupLineItems.length > 1) {
                    result[index].push(getDataTemplate(_.first(groupLineItems), shipment, true,
                        orderableLocationLotsMap, orderableLotsLocationMap));
                    _.forEach(groupLineItems, function(orderLineItem) {
                        result[index].push(getDataTemplate(orderLineItem, shipment, false,
                            orderableLocationLotsMap, orderableLotsLocationMap));
                    });
                }
            });
            return result;
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

        // function getVvmStatus(canFulfillForMe) {
        //     if (canFulfillForMe.stockCard && canFulfillForMe.stockCard.extraData) {
        //         return canFulfillForMe.stockCard.extraData.vvmStatus;
        //     }
        // }

        function getExpirationDate(lineItem) {
            if (lineItem.lot && lineItem.lot.expirationDate) {
                return new Date(lineItem.lot.expirationDate);
            }
        }
    }
})();
