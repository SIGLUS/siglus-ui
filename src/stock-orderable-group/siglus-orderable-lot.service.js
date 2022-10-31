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

    angular
        .module('stock-orderable-group')
        .service('siglusOrderableLotService', service);

    service.$inject = ['$http', 'openlmisUrlFactory', '$q'];

    function service($http, openlmisUrlFactory, $q) {
        this.tradeItemIdToOrderableIdMap = {};
        this.orderableIdToLots = {};

        this.setOrderables = function(orderables) {
            var map = {};
            orderables.forEach(function(orderable) {
                if (orderable.identifiers && orderable.identifiers.tradeItem) {
                    map[orderable.identifiers.tradeItem] = orderable.id;
                }
            });
            this.tradeItemIdToOrderableIdMap = map;
            this.orderableIdToLots = {};
        };

        this.getLotsByOrderableIds = function(orderableIds) {
            return $http.post(openlmisUrlFactory('/api/siglusapi/stockCardSummaries/lots'), orderableIds);
        };

        this.getOrderablesPrice = function() {
            return $http.get(openlmisUrlFactory('/api/siglusapi/orderables/price'));
        };

        this.fillLotsToAddedItems = function(addedItems) {
            var deferred = $q.defer();

            var orderableIdToLotsMap = this.orderableIdToLots;
            var missingOrderableIds = addedItems.map(function(item) {
                return item.orderable.id;
            }).filter(function(id) {
                return !_.contains(Object.keys(orderableIdToLotsMap), id);
            })
                .filter(function(id) {
                    return id;
                });
            if (_.isEmpty(missingOrderableIds)) {
                addedItems.forEach(function(item) {
                    item.lotOptions = orderableIdToLotsMap[item.orderable.id];
                });
                deferred.resolve();
            } else {
                var tradeItemIdToOrderableIdMap = this.tradeItemIdToOrderableIdMap;
                this.getLotsByOrderableIds(missingOrderableIds).then(function(lots) {
                    lots.data.forEach(function(lot) {
                        var tradeItemId = lot.tradeItemId;
                        var orderableId = tradeItemIdToOrderableIdMap[tradeItemId];
                        if (orderableIdToLotsMap[orderableId]) {
                            orderableIdToLotsMap[orderableId].push(lot);
                        } else {
                            orderableIdToLotsMap[orderableId] = [lot];
                        }
                    });
                    addedItems.forEach(function(item) {
                        item.lotOptions = orderableIdToLotsMap[item.orderable.id] || [];
                    });
                    deferred.resolve();
                });
            }
            return deferred.promise;
        };
    }

})();