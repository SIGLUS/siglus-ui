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
        .service('siglusOrderableLotListService', service);

    service.$inject = ['$resource', 'fulfillmentUrlFactory'];

    function service($resource, fulfillmentUrlFactory) {

        this.getOrderableLots = getOrderableLots;
        this.getLotsMapByOrderableId = getLotsMapByOrderableId;
        this.getSimplifyLotsMapByOrderableId = getSimplifyLotsMapByOrderableId;

        var resource = $resource(fulfillmentUrlFactory('/api/siglusapi/facility/:id/lots'), {}, {
            getOrderableLots: {
                method: 'GET',
                isArray: true
            }
        });

        function getOrderableLots(facilityId, orderableIds) {
            return resource.getOrderableLots({
                id: facilityId,
                orderableIds: orderableIds
            }).$promise;
        }

        function getLotsMapByOrderableId(lotList) {
            return _.groupBy(lotList, function(lotInfo) {
                return _.get(lotInfo, 'orderableId');
            });
        }

        function getSimplifyLotsMapByOrderableId(lotList) {
            var minifyLotList = lotList.map(function(lotInfo) {
                return {
                    orderableId: lotInfo.orderableId,
                    expirationDate: lotInfo.expirationDate,
                    id: lotInfo.lotId,
                    lotCode: lotInfo.lotCode
                };
            });
            return _.groupBy(minifyLotList, function(lotInfo) {
                return _.get(lotInfo, 'orderableId');
            });
        }

    }

})();
