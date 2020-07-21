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
     * @name proof-of-delivery.ProofOfDeliveryRepositoryImpl
     *
     * @description
     * Implementation of the ProofOfDeliveryRepository interface. Communicates with the REST API of
     * the OpenLMIS server.
     */
    angular
        .module('proof-of-delivery')
        .factory('ProofOfDeliveryRepositoryImpl', ProofOfDeliveryRepositoryImpl);

    ProofOfDeliveryRepositoryImpl.$inject = [
        '$q', '$resource', 'fulfillmentUrlFactory', 'LotRepositoryImpl', 'OrderableResource'
    ];

    function ProofOfDeliveryRepositoryImpl($q, $resource, fulfillmentUrlFactory, LotRepositoryImpl, OrderableResource) {

        ProofOfDeliveryRepositoryImpl.prototype.get = get;
        ProofOfDeliveryRepositoryImpl.prototype.update = update;

        return ProofOfDeliveryRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name ProofOfDeliveryRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the ProofOfDeliveryRepositoryImpl class.
         */
        function ProofOfDeliveryRepositoryImpl() {
            this.lotRepositoryImpl = new LotRepositoryImpl();
            this.orderableResource = new OrderableResource();

            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            this.resource = $resource(fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id'), {}, {
                // #400: ends here
                update: {
                    method: 'PUT'
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name get
         *
         * @description
         * Retrieves a proof of delivery from the OpenLMIS server.
         * Communicates with the GET endpoint of the Proof of Delivery REST API.
         *
         * @param   {string}    id  the ID of the Proof of Delivery to retrieve
         * @return  {Promise}       the promise resolving to server response
         */
        function get(id) {
            var lotRepositoryImpl = this.lotRepositoryImpl,
                orderableResource = this.orderableResource;

            return this.resource.get({
                id: id,
                expand: 'shipment.order'
            }).$promise
                .then(function(proofOfDeliveryJson) {
                    var lotIds = getIdsFromListByObjectName(proofOfDeliveryJson.lineItems, 'lot'),
                        orderableIds = getIdsFromListByObjectName(proofOfDeliveryJson.lineItems, 'orderable');

                    return $q.all([
                        lotRepositoryImpl.query({
                            id: lotIds
                        }),
                        orderableResource.query({
                            id: orderableIds
                        })
                    ])
                        .then(function(responses) {
                            var lotPage = responses[0],
                                orderablePage = responses[1];
                            return combineResponses(proofOfDeliveryJson, lotPage.content, orderablePage.content);
                        });
                });
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name update
         *
         * @description
         * Updates the given Proof of Delivery on the OpenLMIS server. Communicates with the PUT
         * endpoint of the Proof of Delivery REST API.
         *
         * @param   {string}    proofOfDelivery the Proof of Delivery to updated
         * @return  {Promise}                   the promise resolving to server response
         */
        function update(proofOfDelivery) {
            return this.resource.update(
                {
                    id: proofOfDelivery.id
                },
                proofOfDelivery
            ).$promise;
        }

        function combineResponses(proofOfDeliveryJson, lotJsons, orderableJsons) {
            proofOfDeliveryJson.lineItems.forEach(function(lineItem) {
                lineItem.quantityShipped = getQuantityShipped(
                    lineItem, proofOfDeliveryJson.shipment.lineItems
                );

                lineItem.lot = getFirstObjectFromListById(lotJsons, lineItem, 'lot');
                lineItem.orderable = getFirstObjectFromListById(orderableJsons, lineItem, 'orderable');
            });

            return proofOfDeliveryJson;
        }

        function getIdsFromListByObjectName(list, objectName) {
            return list.reduce(function(ids, item) {
                if (item[objectName]) {
                    ids.push(item[objectName].id);
                }
                return ids;
            }, []);
        }

        function getFirstObjectFromListById(list, object, propertyName) {
            var filteredList;
            if (object[propertyName] && list.length) {
                filteredList = list.filter(function(item) {
                    return item.id === object[propertyName].id;
                });
            }
            return filteredList && filteredList.length ? filteredList[0] : undefined;
        }

        function getQuantityShipped(lineItem, shipmentLineItems) {
            return shipmentLineItems.filter(function(shipmentLineItem) {
                return shipmentLineItem.orderable.id === lineItem.orderable.id &&
                    areLotsEqual(shipmentLineItem.lot, lineItem.lot);
            })[0].quantityShipped;
        }

        function areLotsEqual(left, right) {
            if (left && right && left.id === right.id) {
                return true;
            } else if (!left && !right)  {
                return true;
            }
            return false;
        }

    }

})();
