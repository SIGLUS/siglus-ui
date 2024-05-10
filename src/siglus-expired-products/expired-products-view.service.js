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

        var LineItemTypeProduct = 'Product';
        var LineItemTypeLot = 'Lot';
        var LineItemTypeLocation = 'Location';

        function getExpiredProducts(facilityId, enableLocation) {
            return resource.get({
                id: facilityId,
                expired: true
            }).$promise.then(function(expiredProducts) {
                var itemType = enableLocation ? LineItemTypeLocation : LineItemTypeLot;
                expiredProducts.forEach(function(product) {
                    product.skipped = false;
                    product.itemType = itemType;
                });
                return groupByExpiredProduct(expiredProducts, enableLocation);
            });
        }

        function groupByExpiredProduct(expiredProducts, enableLocation) {
            var productsMap = expiredProducts.reduce(function(acc, expiredProduct) {
                if (!acc[expiredProduct.orderableId]) {
                    acc[expiredProduct.orderableId] = [];
                }
                acc[expiredProduct.orderableId].push(expiredProduct);
                return acc;
            }, {});
            var result = [];
            for (var key in productsMap) {
                var values = productsMap[key];
                var lots = groupByExpiredProductLot(values, enableLocation);
                var total = lots.reduce(function(acc, value) {
                    return acc + value.soh;
                }, 0);
                var productItem = {
                    programId: values[0].programId,
                    programName: values[0].programName,
                    programCode: values[0].programCode,
                    productName: values[0].productName,
                    orderableId: values[0].orderableId,
                    productCode: values[0].productCode,
                    soh: total,
                    itemType: LineItemTypeProduct,
                    lots: lots
                };
                result.push(productItem);
            }
            return result;
        }

        function groupByExpiredProductLot(expiredLots, enableLocation) {
            var result = [];
            if (enableLocation) {
                var lotsMap = expiredLots.reduce(function(acc, expiredLot) {
                    if (!acc[expiredLot.lotId]) {
                        acc[expiredLot.lotId] = [];
                    }
                    acc[expiredLot.lotId].push(expiredLot);
                    return acc;
                }, {});
                for (var key in lotsMap) {
                    var values = lotsMap[key];
                    var total = values.reduce(function(acc, value) {
                        return acc + value.soh;
                    }, 0);
                    var lotItem = {
                        programId: values[0].programId,
                        programName: values[0].programName,
                        programCode: values[0].programCode,
                        productName: values[0].productName,
                        productCode: values[0].productCode,
                        orderableId: values[0].orderableId,
                        lotId: key,
                        lotCode: values[0].lotCode,
                        expirationDate: values[0].expirationDate,
                        stockCardId: values[0].stockCardId,
                        soh: total,
                        skipped: false,
                        itemType: LineItemTypeLot,
                        locations: values
                    };
                    result.push(lotItem);
                }
            } else {
                expiredLots.map(function(expiredLot) {
                    expiredLot.itemType = LineItemTypeLot;
                    expiredLot.skipped = false;
                    result.push(expiredLot);
                });
            }
            return result;
        }

        function removeExpiredProducts(facilityId, lots, signature, documentNumber) {
            return resource.remove({
                id: facilityId
            }, {
                lotType: 'expired',
                lots: lots,
                signature: signature,
                documentNumber: documentNumber
            }).$promise;
        }

        function removeSelectedLots(facilityId, lots, signature, documentNumber) {
            var removeDatas = [];
            lots.forEach(function(lot) {
                if (lot.locations) {
                    removeDatas.concat(lot.locations);
                } else {
                    removeDatas.push(lot);
                }
            });
            var removeLots = removeDatas.map(function(lineItem) {
                return {
                    stockCardId: lineItem.stockCardId,
                    quantity: lineItem.soh,
                    locationCode: lineItem.locationCode,
                    area: lineItem.area
                };
            });
            return removeExpiredProducts(facilityId, removeLots, signature, documentNumber);
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
