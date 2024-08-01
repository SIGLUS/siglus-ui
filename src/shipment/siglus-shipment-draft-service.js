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
        .module('shipment')
        .service('SiglusShipmentDraftService', service);

    service.$inject = ['$resource', 'openlmisUrlFactory', 'ORDER_STATUS'];

    function service($resource, openlmisUrlFactory, ORDER_STATUS) {
        var resource = $resource(
            openlmisUrlFactory('/api/siglusapi/shipmentDrafts'), {}, {
                getShipmentDraftByOrderId: {
                    method: 'GET',
                    isArray: true
                }
            }
        );

        this.getShipmentDraftByOrderId = getShipmentDraftByOrderId;

        function getShipmentDraftByOrderId(order) {
            return resource.getShipmentDraftByOrderId({
                orderId: order.id
            }).$promise.then(function(shipmentResponse) {
                var shipmentDraft = shipmentResponse[0];
                return _.assign({}, shipmentDraft, {
                    isEditable: isShipmentEditable(order),
                    canBeConfirmed: shipmentDraft.lineItems.length > 0,
                    order: order
                });
            });
        }

        function isShipmentEditable(order) {
            return ORDER_STATUS.ORDERED === order.status
                || ORDER_STATUS.FULFILLING === order.status
                || ORDER_STATUS.PARTIALLY_FULFILLED === order.status;
        }

    }
})();
