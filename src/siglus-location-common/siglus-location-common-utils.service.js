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
   * @name shipment.Shipment
   *
   * @description
   * Represents a single shipment (or shipment draft).
   */
    angular
        .module('siglus-location-common')
        .service('SiglusLocationCommonUtilsService', SiglusLocationCommonUtilsService);

    SiglusLocationCommonUtilsService.$inject = ['$resource', 'fulfillmentUrlFactory'];

    function SiglusLocationCommonUtilsService() {

        this.getOrderableLocationLotsMap = function(locations) {
            var result = {};
            _.forEach(locations, function(location) {
                _.forEach(location.lots, function(lot) {
                    if (!result[lot.orderableId]) {
                        result[lot.orderableId] = {};
                    }

                    if (!result[lot.orderableId][location.locationCode]) {
                        result[lot.orderableId][location.locationCode] = [];
                    }

                    result[lot.orderableId][location.locationCode].push({
                        id: lot.lotId,
                        lotCode: lot.lotCode,
                        expirationDate: lot.expirationDate,
                        stockOnHand: lot.stockOnHand,
                        area: location.area
                    });
                });
            });

            return result;
        };

        this.getOrderableLotsLocationMap = function(locations) {
            var result = {};
            _.forEach(locations, function(location) {
                _.forEach(location.lots, function(lot) {

                    if (!result[lot.orderableId]) {
                        result[lot.orderableId] = {};
                    }

                    if (!result[lot.orderableId][lot.lotId]) {
                        result[lot.orderableId][lot.lotId] = [];
                    }

                    result[lot.orderableId][lot.lotId].push({
                        id: location.locationId,
                        area: location.area,
                        locationCode: location.locationCode
                    });
                });
            });

            return result;
        };

        this.getLotByLotId = function(locations, lotId) {
            return _.chain(locations)
                .map(function(location) {
                    return location.lots;
                })
                .flatten()
                .find(function(item) {
                    return item.lotId === lotId;
                })
                .value();
        };

        this.getLotList = function(lineItem, orderableLocationLotsMap) {
            var orderableId = lineItem.orderableId;
            var locationCode = _.get(lineItem, ['location', 'locationCode']);
            var data = locationCode
                ? _.uniq(_.get(orderableLocationLotsMap, [orderableId, locationCode], []), function(item) {
                    return item.lotCode;
                })
                : _.chain(orderableLocationLotsMap)
                    .get(orderableId, {})
                    .values()
                    .flatten()
                    .uniq(function(item) {
                        return item.lotCode;
                    })
                    .value();
            return data;
        };

        this.getLocationList = function(lineItem, orderableLotsLocationMap) {
            var orderableId = lineItem.orderableId;
            var lotId = _.get(lineItem, ['lot', 'id']);
            return lotId
                ? _.uniq(_.get(orderableLotsLocationMap, [orderableId, lotId], []), function(item) {
                    return item.locationCode;
                })
                : _.chain(orderableLotsLocationMap)
                    .get(orderableId, {})
                    .values()
                    .flatten()
                    .uniq(false, function(item) {
                        return item.locationCode;
                    })
                    .value();
        };

        this.getOrderableLotsMapper = function(locations) {
            return _.chain(locations)
                .map(function(location) {
                    return location.lots;
                })
                .flatten()
                .groupBy(function(lot) {
                    return lot.orderableId;
                })
                .value();
        };

        this.getLotsByOrderableId = function(locations, id) {
            return this.getOrderableLotsMapper(locations)[id];
        };

        this.mapStockCardDetail = function(summaries, key) {
            key = _.isEmpty(key) ? 'canFulfillForMe' : key;
            var stockCardDetailMap = {};
            _.forEach(summaries, function(summary) {
                _.forEach(summary[key], function(stockCardDetail) {
                    var orderableId = stockCardDetail.orderable.id,
                        lotId = stockCardDetail.lot ? stockCardDetail.lot.id : undefined;
                    if (!stockCardDetailMap[orderableId]) {
                        stockCardDetailMap[orderableId] = {};
                    }
                    stockCardDetailMap[orderableId][lotId] = stockCardDetail;
                });
            });
            return stockCardDetailMap;
        };
    }

})();
