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
     * @name siglus-analytics-report-stock-movement.stockMovementReportService
     *
     * @description
     * Responsible for fetching metabase iframeUrl from server.
     */
    angular
        .module('siglus-analytics-report-stock-movement')
        .service('stockMovementReportService', service);

    service.$inject = ['$resource', 'analyticsReportUrlFactory'];

    function service($resource, analyticsReportUrlFactory) {
        var resource = $resource(
            analyticsReportUrlFactory('/api/siglusapi/stockMovement/getMovement'), {}, {
                get: {
                    method: 'GET',
                    transformResponse: transformResponse
                }
            }
        );

        this.getStockMovement = getStockMovement;
        /**
         * @ngdoc method
         * @methodOf siglus-analytics-report-stock-movement.stockMovementReportService
         * @name getStockMovement
         *
         * @description
         * get the stockmovement result by the period , facilityId and orderableId
         *
         * @param {String} startTime  start time of  stockmovement report 
         * @param {String} endTime end time of stockmovement report.
         * @param {String} facilityId the facility of stockmovement report .
         * @param {String} orderableId the orderable of stockmovement report.
         * @return {Promise} siglus-analytics-report-stock-movement promise.
         */
        function getStockMovement(facilityId, orderableId) {
            return resource.query({
                facilityId: facilityId,
                orderableId: orderableId
            }).$promise;
        }

        function transformResponse(data, headers, status) {
            if (status === 200) {
                return angular.fromJson(data);
            }
            return data;
        }

    }
})();
