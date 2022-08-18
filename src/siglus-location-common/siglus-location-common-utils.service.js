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
                    if (!result[lot.orderablesId]) {
                        result[lot.orderablesId] = {};
                    }

                    if (!result[lot.orderablesId][location.locationCode]) {
                        result[lot.orderablesId][location.locationCode] = [];
                    }

                    result[lot.orderablesId][location.locationCode].push({
                        id: lot.lotId,
                        lotCode: lot.lotCode,
                        expirationDate: lot.expirationDate,
                        stockOnHand: lot.stockOnHand
                    });
                });
            });

            return result;
        };

        this.getOrderableLotsLocationMap = function(locations) {
            var result = {};
            _.forEach(locations, function(location) {
                _.forEach(location.lots, function(lot) {

                    if (!result[lot.orderablesId]) {
                        result[lot.orderablesId] = {};
                    }

                    if (!result[lot.orderablesId][lot.lotId]) {
                        result[lot.orderablesId][lot.lotId] = [];
                    }

                    result[lot.orderablesId][lot.lotId].push({
                        id: location.locationId,
                        locationCode: location.locationCode
                    });
                });
            });

            return result;
        };

        this.getLotList = function(lineItem, orderableLocationLotsMap) {
            var orderableId = lineItem.orderableId;
            var locationCode = _.get(lineItem, ['location', 'locationCode']);
            return locationCode
                ? _.get(orderableLocationLotsMap, [orderableId, locationCode], [])
                : _.chain(orderableLocationLotsMap)
                    .get(orderableId, {})
                    .values()
                    .flatten()
                    .uniq(false, function(item) {
                        return item.lotCode;
                    })
                    .value();
        };

        this.getLocationList = function(lineItem, orderableLotsLocationMap) {
            var orderableId = lineItem.orderableId;
            var lotId = _.get(lineItem, ['lot', 'id']);
            return lotId
                ? _.get(orderableLotsLocationMap, [orderableId, lotId], [])
                : _.chain(orderableLotsLocationMap)
                    .get(orderableId, {})
                    .values()
                    .flatten()
                    .uniq(false, function(item) {
                        return item.locationCode;
                    })
                    .value();
        };
    }

})();
