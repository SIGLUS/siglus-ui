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
        .service('siglusLocationCommonApiService', siglusLocationCommonApiService);

    siglusLocationCommonApiService.$inject = ['$resource', 'stockmanagementUrlFactory'];
    function siglusLocationCommonApiService($resource, stockmanagementUrlFactory) {

        var resource = $resource(stockmanagementUrlFactory('/api/siglusapi/locations'), {}, {

            getOrderableLocationLotsInfo: {
                method: 'POST',
                isArray: true
            },
            getProductList: {
                url: stockmanagementUrlFactory('/api/siglusapi/orderables/available'),
                method: 'GET',
                isArray: true
            },
            getAllProductList: {
                url: stockmanagementUrlFactory('/api/siglusapi/orderables/dropDownList'),
                method: 'GET',
                isArray: true
            }

        });

        this.getProductList = function(isRequestAll, draftId) {
            return resource.getProductList({
                isRequestAll: isRequestAll,
                draftId: draftId
            }).$promise;
        };

        this.getOrderableLocationLotsInfo = function(params, orderableIds) {
            return resource.getOrderableLocationLotsInfo(params, orderableIds ? orderableIds : []).$promise;
        };

        this.getAllProductList = function(draftId) {
            return resource.getAllProductList({
                draftId: draftId
            }).$promise;
        };
    }

})();
