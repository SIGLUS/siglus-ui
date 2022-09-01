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
        .module('siglus-location-stock-on-hand')
        .service('siglusLocationStockOnHandService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function service($resource, stockmanagementUrlFactory) {

        var resource = $resource('', {}, {
            getStockOnHandInfo: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/stockCardSummariesWithLocation/integration/summary'),
                isArray: true
            },
            getLotDetail: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/stockCardSummariesWithLocation/stockCard/:stockCardId'),
                isArray: false
            },
            getLocationDetail: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/stockCardSummariesWithLocation/byLocation'),
                isArray: false
            },
            getStockCardForProduct: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/stockMovement/byProduct/:orderableId'),
                isArray: false
            }
        });

        this.getStockOnHandInfo = getStockOnHandInfo;

        this.getLotDetail = getLotDetail;

        this.getLocationDetail = getLocationDetail;

        this.getStockCardForProduct = getStockCardForProduct;

        function getStockCardForProduct(id, facilityId) {
            return resource.getStockCardForProduct({
                orderableId: id,
                facilityId: facilityId
            }).$promise;
        }

        function getStockOnHandInfo(facilityId, programId) {
            var params = {
                excludeArchived: true,
                facilityId: facilityId,
                nonEmptyOnly: true,
                page: 0,
                programId: programId,
                rightName: 'STOCK_CARDS_VIEW',
                size: 2147483647
            };
            return resource.getStockOnHandInfo(params).$promise;
        }

        function getLotDetail(stockCardId) {
            return resource.getLotDetail({
                stockCardId: stockCardId
            }).$promise;
        }

        function getLocationDetail(stockCardId, locationCode) {
            return resource.getLocationDetail({
                stockCardId: stockCardId,
                locationCode: locationCode
            }).$promise;
        }
    }
})();
