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

    angular
        .module('expired-products-pick-pack')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.stockmanagement.expiredProductsPickPack', {
            url: '/expiredProductsPickPack',
            showInNavigation: false,
            views: {
                '@openlmis': {
                    controller: 'SiglusExpiredProductsPickPackController',
                    templateUrl: 'siglus-expired-products/expired-products-pick-pack/expired-products-pick-pack.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                facility: function(expiredProductsViewService) {
                    return expiredProductsViewService.getPickPackFacility();
                },
                displayItems: function(expiredProductsViewService) {
                    var lots = expiredProductsViewService.getPickPackDatas();
                    var productsMap = lots.reduce(function(acc, lot) {
                        if (!acc[lot.orderableId]) {
                            acc[lot.orderableId] = [];
                        }
                        acc[lot.orderableId].push(lot);
                        return acc;
                    }, {});
                    var result = [];
                    for (var key in productsMap) {
                        var values = productsMap[key];
                        var total = values.reduce(function(acc, value) {
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
                            itemType: 'Product',
                            lots: values
                        };
                        result.push(productItem);
                    }
                    return result;
                }
            }
        });
    }
})();

