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

    service.$inject = ['$http', 'openlmisUrlFactory'];

    function service($http, openlmisUrlFactory) {
        this.tradeItemIdToOrderableIdMap = {};
        this.setOrderables = function(orderables) {
            var map = {};
            orderables.forEach(function(orderable) {
                if (orderable.identifiers && orderable.identifiers.tradeItem) {
                    map[orderable.identifiers.tradeItem] = orderable.id;
                }
            });
            this.tradeItemIdToOrderableIdMap = map;
        };
        this.getLotsByOrderableIds = function(orderableIds) {
            return $http.post(openlmisUrlFactory('/api/siglusapi/stockCardSummaries/lots'), orderableIds);
        };

        this.fillLotsToAddedItems = function(addedItems) {
            var orderableIds = addedItems.map(function(item) {
                return item.orderable.id;
            });
            var tradeItemIdToOrderableIdMap = this.tradeItemIdToOrderableIdMap;

            var orderableIdToLotsMap = {};
            return this.getLotsByOrderableIds(orderableIds).then(function(lots) {
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
                    item.lotOptions = orderableIdToLotsMap[item.orderable.id];
                });
            });
        };
    }

})();