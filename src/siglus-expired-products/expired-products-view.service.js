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
     * @name siglus-expired-products.ExpiredProductsViewService
     *
     * @description
     * Application layer service that prepares domain objects to be used on the view.
     */
    angular
        .module('siglus-expired-products')
        .service('expiredProductsViewService', ExpiredProductsViewService);

    ExpiredProductsViewService.inject = ['$filter', '$resource', 'stockmanagementUrlFactory', 'localStorageService'];

    function ExpiredProductsViewService($resource, stockmanagementUrlFactory, localStorageService) {
        var resource = $resource(stockmanagementUrlFactory(), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/facility/:id/lots'),
                isArray: true
            },
            remove: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/facility/:id/lots/remove')
            }
        });

        this.getExpiredProducts = getExpiredProducts;
        this.removeSelectedLots = removeSelectedLots;
        this.savePickPackDatas = savePickPackDatasToLocalStorage;
        this.getPickPackFacility = getPickPackFacilityFromLocalStorage;
        this.getPickPackDatas = getPickPackDatasFromLocalStorage;

        function getExpiredProducts(facilityId) {
            return resource.get({
                id: facilityId,
                expired: true
            }).$promise.then(function(expiredProducts) {
                expiredProducts.forEach(function(product) {
                    product.skipped = false;
                });
                return expiredProducts;
            });
        }

        function removeExpiredProducts(facilityId, lots) {
            return resource.remove({
                id: facilityId
            }, {
                lotType: 'expired',
                lots: lots
            });
        }

        function removeSelectedLots(facilityId, lineItems) {
            var lots = lineItems.map(function(lineItem) {
                return {
                    stockCardId: lineItem.stockCardId,
                    quantity: lineItem.soh,
                    locationCode: lineItem.locationCode,
                    area: lineItem.area
                };
            });
            return removeExpiredProducts(facilityId, lots);
        }

        this.filterList = function(keyword, lineItems) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = lineItems;
            } else {
                keyword = keyword.trim().toLowerCase();
                result = _.map(lineItems, function(lineItem) {
                    var isMatched = _.some([lineItem.productName, lineItem.productCode], function(value) {
                        return String(value.toLowerCase()).includes(keyword);
                    });
                    return isMatched ? lineItem : null;
                });

            }
            return _.filter(result, function(item) {
                return !_.isEmpty(item);
            });
        };

        function savePickPackDatasToLocalStorage(facility, pickPackDatas) {
            localStorageService.add('expiredProductForPickPackFacility', angular.toJson(facility));
            localStorageService.add('expiredProductForPickPackDatas', angular.toJson(pickPackDatas));
        }

        function getPickPackFacilityFromLocalStorage() {
            return angular.fromJson(localStorageService.get('expiredProductForPickPackFacility'));
        }

        function getPickPackDatasFromLocalStorage() {
            return angular.fromJson(localStorageService.get('expiredProductForPickPackDatas'));
        }
    }

})();
