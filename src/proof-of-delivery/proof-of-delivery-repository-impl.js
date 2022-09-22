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
        '$q', '$resource', 'fulfillmentUrlFactory', 'LotRepositoryImpl',
        // SIGLUS-REFACTOR: starts here
        'SiglusOrderableResource'
        // SIGLUS-REFACTOR: ends here
    ];

    function ProofOfDeliveryRepositoryImpl($q, $resource, fulfillmentUrlFactory, LotRepositoryImpl,
                                           SiglusOrderableResource) {

        ProofOfDeliveryRepositoryImpl.prototype.get = get;
        ProofOfDeliveryRepositoryImpl.prototype.update = update;
        // SIGLUS-REFACTOR: starts here
        ProofOfDeliveryRepositoryImpl.prototype.createDraft = createDraft;
        ProofOfDeliveryRepositoryImpl.prototype.getDraftList = getDraftList;
        ProofOfDeliveryRepositoryImpl.prototype.deleteAllDraft = deleteAllDraft;
        ProofOfDeliveryRepositoryImpl.prototype.getSubDraft = getSubDraft;
        ProofOfDeliveryRepositoryImpl.prototype.updateSubDraft = updateSubDraft;
        ProofOfDeliveryRepositoryImpl.prototype.deleteSubDraft = deleteSubDraft;
        ProofOfDeliveryRepositoryImpl.prototype.mergeDraft = mergeDraft;
        ProofOfDeliveryRepositoryImpl.prototype.submitDraft = submitDraft;
        // SIGLUS-REFACTOR: ends here
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
            // SIGLUS-REFACTOR: starts here
            this.orderableResource = new SiglusOrderableResource();

            this.resource = $resource(fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id'), {}, {
                update: {
                    method: 'PUT'
                },
                createDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts'),
                    method: 'POST'
                },
                getDraftList: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/summary'),
                    method: 'GET'
                },
                deleteAllDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts'),
                    method: 'DELETE'
                },
                getSubDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/:subDraftId'),
                    method: 'GET'
                },
                updateSubDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/:subDraftId'),
                    method: 'PUT'
                },
                deleteSubDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/:subDraftId'),
                    method: 'DELETE'
                },
                mergeDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/merge'),
                    method: 'POST'
                },
                submitDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/submit'),
                    method: 'POST'
                }

            });
            // SIGLUS-REFACTOR: ends here
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
                    var copyProofOfDeliveryJson = angular.copy(_.get(proofOfDeliveryJson, 'podDto'));
                    copyProofOfDeliveryJson.conferredBy = _.get(proofOfDeliveryJson, 'conferredBy');
                    copyProofOfDeliveryJson.preparedBy = _.get(proofOfDeliveryJson, 'preparedBy');
                    var lotIds = getIdsFromListByObjectName(copyProofOfDeliveryJson.lineItems, 'lot'),
                        orderableIds = getIdsFromListByObjectName(copyProofOfDeliveryJson.lineItems, 'orderable');
                    var promiseList = lotIds.length ?
                        [
                            lotRepositoryImpl.query({
                                id: lotIds
                            }),
                            orderableResource.query({
                                id: orderableIds
                            })
                        ] :
                        [
                            orderableResource.query({
                                id: orderableIds
                            })
                        ];
                    return $q.all(promiseList)
                        .then(function(responses) {
                            var lotPage = lotIds.length ? responses[0] : {
                                    content: []
                                },
                                orderablePage = lotIds.length ? responses[1] : responses[0];
                            return combineResponses(copyProofOfDeliveryJson, lotPage.content, orderablePage.content);
                        });
                });
        }
        // SIGLUS-REFACTOR: starts here
        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name createDraft
         *
         * @description
         * Retrieves a proof of delivery from the OpenLMIS server.
         * Communicates with the GET endpoint of the Proof of Delivery REST API.
         *
         * @param   {orderId}    orderId  the ID of the Proof of Delivery order
         * @param   {splitNum}   splitNum multi-user num to get POD order
         * @return  {Promise}       the promise resolving to server response
         */
        function createDraft(orderId, id, splitNum) {
            return this.resource.createDraft({
                id: id
            }, {
                orderId: orderId,
                splitNum: splitNum
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name getDraftList
         *
         * @description
         * Retrieves a proof of delivery from the OpenLMIS server.
         * Communicates with the GET endpoint of the Proof of Delivery REST API.
         *
         * @param   {podId}    podId  the ID of the Proof of Delivery order
         * @return  {Promise}       the promise resolving to server response
         */
        function getDraftList(podId) {
            return this.resource.getDraftList({
                id: podId
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name getDraftList
         *
         * @description
         * Retrieves a proof of delivery from the OpenLMIS server.
         * Communicates with the GET endpoint of the Proof of Delivery REST API.
         *
         * @param   {podId}    podId  the ID of the Proof of Delivery order
         * @return  {Promise}       the promise resolving to server response
         */
        function deleteAllDraft(podId) {
            return this.resource.deleteAllDraft({
                id: podId
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepositoryImpl
         * @name getDraftList
         *
         * @description
         * Retrieves a proof of delivery from the OpenLMIS server.
         * Communicates with the GET endpoint of the Proof of Delivery REST API.
         *
         * @param   {podId}    podId  the ID of the Proof of Delivery order
         * @param   {subDraftId}    subDraftId  the ID of the Proof of Delivery sub draft
         * @return  {Promise}       the promise resolving to server response
         */
        function getSubDraft(podId, subDraftId) {
            var lotRepositoryImpl = this.lotRepositoryImpl,
                orderableResource = this.orderableResource;
            return this.resource.getSubDraft({
                id: podId,
                subDraftId: subDraftId,
                expand: 'shipment.order'
            }).$promise.then(function(proofOfDeliveryJson) {
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

        function updateSubDraft(podId, subDraftId, pod, type) {
            return this.resource.updateSubDraft({
                id: podId,
                subDraftId: subDraftId
            }, {
                operateType: type,
                podDto: pod
            }).$promise;
        }

        function deleteSubDraft(podId, subDraftId) {
            return this.resource.deleteSubDraft({
                id: podId,
                subDraftId: subDraftId
            }).$promise;
        }

        function mergeDraft(podId) {
            var lotRepositoryImpl = this.lotRepositoryImpl,
                orderableResource = this.orderableResource;

            return this.resource.mergeDraft({
                id: podId,
                expand: 'shipment.order'
            }, {}).$promise
                .then(function(proofOfDeliveryJson) {
                    var copyProofOfDeliveryJson = angular.copy(_.get(proofOfDeliveryJson, 'podDto'));
                    copyProofOfDeliveryJson.conferredBy = _.get(proofOfDeliveryJson, 'conferredBy');
                    copyProofOfDeliveryJson.preparedBy = _.get(proofOfDeliveryJson, 'preparedBy');
                    var lotIds = getIdsFromListByObjectName(copyProofOfDeliveryJson.lineItems, 'lot'),
                        orderableIds = getIdsFromListByObjectName(copyProofOfDeliveryJson.lineItems, 'orderable');
                    var promiseList = lotIds.length ?
                        [
                            lotRepositoryImpl.query({
                                id: lotIds
                            }),
                            orderableResource.query({
                                id: orderableIds
                            })
                        ] :
                        [
                            orderableResource.query({
                                id: orderableIds
                            })
                        ];
                    return $q.all(promiseList)
                        .then(function(responses) {
                            var lotPage = lotIds.length ? responses[0] : {
                                    content: []
                                },
                                orderablePage = lotIds.length ? responses[1] : responses[0];
                            return combineResponses(copyProofOfDeliveryJson, lotPage.content, orderablePage.content);
                        });
                });
        }

        function submitDraft(podId, pod) {
            return this.resource.submitDraft({
                id: podId
            }, pod).$promise;
        }

        // SIGLUS-REFACTOR: ends here

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
