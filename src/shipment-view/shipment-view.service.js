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
     * @name shipment-view.shipmentViewService
     *
     * @description
     * Application layer service that prepares domain objects to be used on the view.
     */
    angular
        .module('shipment-view')
        .service('shipmentViewService', shipmentViewService);

    shipmentViewService.inject = [
        '$resource', 'fulfillmentUrlFactory'
    ];

    function shipmentViewService(
        $resource, fulfillmentUrlFactory
    ) {
        this.getSuggestedQuantity = getSuggestedQuantity;
        this.getPickPackInfo = getPickPackInfo;

        function getSuggestedQuantity(id) {
            var resource = $resource(fulfillmentUrlFactory('/api/siglusapi/orders/:id/suggestedQuantity'), {}, {
                find: {
                    method: 'get'
                }
            });
            return resource.find({
                id: id
            }).$promise;
        }

        function getPickPackInfo(id) {
            var resource = $resource(fulfillmentUrlFactory('/api/siglusapi/orders/:id/pickPackInfo'), {}, {
                find: {
                    url: fulfillmentUrlFactory('/api/siglusapi/orders/:id/pickPackInfo'),
                    method: 'get'
                }
            });
            return resource.find({
                id: id
            }).$promise;
        }

    }

})();
