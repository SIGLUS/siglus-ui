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
   * @name stockmanagement.siglusStockIssueService
   *
   * @description
   * provide issue draft save delete create get request
   */
    angular
        .module('stock-orderable-group')
        .service('siglusProductOrderableGroupService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory', '$filter', 'moment', 'siglusStockUtilsService'];

    function service($resource, stockmanagementUrlFactory) {

        var resource = $resource(stockmanagementUrlFactory(), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/stockCardSummaries/integration/detail'),
                isArray: true
            },
            queryStockOnHandsInfo: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/stockCardSummaries/integration/summary'),
                isArray: true
            }
        });

        this.getProductOrderableGroup = function(params) {
            return resource.get(params).$promise;
        };

        this.queryStockOnHandsInfo = function(params) {
            return resource.queryStockOnHandsInfo(params).$promise;
        };

    }
})();
