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
        ProofOfDeliveryRepositoryImpl.prototype.deleteAllDraftWithLocation = deleteAllDraftWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.getSubDraft = getSubDraft;
        ProofOfDeliveryRepositoryImpl.prototype.getSubDraftWithLocation = getSubDraftWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.getPodWithLocation = getPodWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.updateSubDraft = updateSubDraft;
        ProofOfDeliveryRepositoryImpl.prototype.updateSubDraftWithLocation = updateSubDraftWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.deleteSubDraft = deleteSubDraft;
        ProofOfDeliveryRepositoryImpl.prototype.deleteSubDraftWithLocation = deleteSubDraftWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.mergeDraft = mergeDraft;
        ProofOfDeliveryRepositoryImpl.prototype.mergeDraftWithLocation = mergeDraftWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.submitDraft = submitDraft;
        ProofOfDeliveryRepositoryImpl.prototype.submitDraftWithLocation = submitDraftWithLocation;
        // SIGLUS-REFACTOR: ends here
        ProofOfDeliveryRepositoryImpl.prototype.addLineItem = addLineItem;
        ProofOfDeliveryRepositoryImpl.prototype.removeLineItem = removeLineItem;
        ProofOfDeliveryRepositoryImpl.prototype.addLineItemWithLocation = addLineItemWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.removeLineItemWithLocation = removeLineItemWithLocation;
        ProofOfDeliveryRepositoryImpl.prototype.getOrderableLots = getOrderableLots;

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
                deleteAllDraftWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id/subDrafts'),
                    method: 'DELETE'
                },
                getSubDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/:subDraftId'),
                    method: 'GET'
                },
                getSubDraftWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id/subDrafts/:subDraftId'),
                    method: 'GET'
                },
                updateSubDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/:subDraftId'),
                    method: 'PUT'
                },
                updateSubDraftWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id/subDrafts/:subDraftId'),
                    method: 'PUT'
                },
                deleteSubDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/:subDraftId'),
                    method: 'DELETE'
                },
                deleteSubDraftWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id/subDrafts/:subDraftId'),
                    method: 'DELETE'
                },
                mergeDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/merge'),
                    method: 'POST'
                },
                mergeDraftWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id/subDrafts/merge'),
                    method: 'GET'
                },
                submitDraft: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDelivery/:id/subDrafts/submit'),
                    method: 'POST'
                },
                submitDraftWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id'),
                    method: 'PUT'
                },
                getPodWithLocation: {
                    url: fulfillmentUrlFactory('/api/siglusapi/proofsOfDeliveryWithLocation/:id'),
                    method: 'GET'
                },
                addLineItem: {
                    url: fulfillmentUrlFactory(
                        '/api/siglusapi/proofsOfDelivery/:podId/subDrafts/:subDraftId/lineItems'
                    ),
                    method: 'POST'
                },
                removeLineItem: {
                    url: fulfillmentUrlFactory(
                        '/api/siglusapi/proofsOfDelivery/:podId/subDrafts/:subDraftId/lineItems/:lineItemId'
                    ),
                    method: 'DELETE'
                },
                addLineItemWithLocation: {
                    url: fulfillmentUrlFactory(
                        '/api/siglusapi/proofsOfDeliveryWithLocation/:podId/subDrafts/:subDraftId/lineItems'
                    ),
                    method: 'POST'
                },
                removeLineItemWithLocation: {
                    url: fulfillmentUrlFactory(
                        '/api/siglusapi/proofsOfDeliveryWithLocation/:podId/subDrafts/:subDraftId/lineItems/:lineItemId'
                    ),
                    method: 'DELETE'
                },
                getOrderableLots: {
                    url: fulfillmentUrlFactory('/api/siglusapi/facility/:id/lots'),
                    method: 'GET',
                    isArray: true
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
                    var lotIds = getLotIdListFromLineItems(copyProofOfDeliveryJson.lineItems);
                    var orderableIds = getOrderableIdListFromLineItems(copyProofOfDeliveryJson.lineItems);
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
                            return setLotAndOrderableIntoLineItems(
                                copyProofOfDeliveryJson, lotPage.content, orderablePage.content
                            );
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
        function deleteAllDraftWithLocation(podId) {
            return this.resource.deleteAllDraftWithLocation({
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
                var lotIds = getLotIdListFromLineItems(proofOfDeliveryJson.lineItems);
                var orderableIds = getOrderableIdListFromLineItems(proofOfDeliveryJson.lineItems);

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
                        return setLotAndOrderableIntoLineItems(
                            proofOfDeliveryJson, lotPage.content, orderablePage.content
                        );
                    });
            });
        }

        function getSubDraftWithLocation(podId, subDraftId) {
            var lotRepositoryImpl = this.lotRepositoryImpl,
                orderableResource = this.orderableResource;
            return this.resource.getSubDraftWithLocation({
                id: podId,
                subDraftId: subDraftId
            }).$promise.then(function(podWithLocation) {
                var podDto = podWithLocation.podDto;
                var podLineItemLocation = podWithLocation.podLineItemLocation;

                var locationInfoMap = _.groupBy(podLineItemLocation, function(lineItem) {
                    return lineItem.podLineItemId;
                });

                // set location info from podLineItemLocation to podDto.lineItems
                // return _.flatten( [[{}, {}] , [{}]] )
                podDto.lineItems = _.flatten(_.map(podDto.lineItems, function(podLineItem) {
                    var podLineItemId = podLineItem.id;
                    var locationInfoList = locationInfoMap[podLineItemId];
                    var lineItemTemplate = _.assign({}, podLineItem, {
                        moveTo: {
                            locationCode: undefined,
                            area: undefined
                        }
                    });
                    // return [{}, {}]
                    return locationInfoList && locationInfoList.length > 0 ?
                        locationInfoList.map(function(locationInfo) {
                            return _.assign({}, lineItemTemplate, {
                                quantityAccepted: locationInfo.quantityAccepted,
                                moveTo: {
                                    locationCode: locationInfo.locationCode,
                                    area: locationInfo.area
                                }
                            });
                        }) : [lineItemTemplate];
                }));

                var lotIds = getLotIdListFromLineItems(podDto.lineItems);
                var orderableIds = getOrderableIdListFromLineItems(podDto.lineItems);

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
                        return setLotAndOrderableIntoLineItems(podDto, lotPage.content, orderablePage.content);
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

        function updateSubDraftWithLocation(podId, subDraftId, pod, type, podLineItemLocation) {
            return this.resource.updateSubDraftWithLocation({
                id: podId,
                subDraftId: subDraftId
            }, {
                operateType: type,
                podDto: pod,
                podLineItemLocation: podLineItemLocation
            }).$promise;
        }

        function submitDraftWithLocation(podId, pod, podLineItemLocation) {
            return this.resource.submitDraftWithLocation({
                id: podId
            }, {
                podDto: pod,
                podLineItemLocation: podLineItemLocation
            }).$promise;
        }

        function deleteSubDraft(podId, subDraftId) {
            return this.resource.deleteSubDraft({
                id: podId,
                subDraftId: subDraftId
            }).$promise;
        }
        function deleteSubDraftWithLocation(podId, subDraftId) {
            return this.resource.deleteSubDraftWithLocation({
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
                    var copyProofOfDeliveryJson = _.assign({}, proofOfDeliveryJson.podDto, {
                        conferredBy: proofOfDeliveryJson.conferredBy,
                        preparedBy: proofOfDeliveryJson.preparedBy
                    });
                    var lotIds = getLotIdListFromLineItems(copyProofOfDeliveryJson.lineItems);
                    var orderableIds = getOrderableIdListFromLineItems(copyProofOfDeliveryJson.lineItems);
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
                            return setLotAndOrderableIntoLineItems(
                                copyProofOfDeliveryJson, lotPage.content, orderablePage.content
                            );
                        });
                });
        }

        function mergeDraftWithLocation(podId) {
            var lotRepositoryImpl = this.lotRepositoryImpl,
                orderableResource = this.orderableResource;

            return this.resource.mergeDraftWithLocation({
                id: podId
            }, {}).$promise
                .then(function(podWithLocation) {
                    var podDto = _.assign({}, podWithLocation.podDto, {
                        conferredBy: podWithLocation.conferredBy,
                        preparedBy: podWithLocation.preparedBy
                    });
                    podDto.conferredBy = _.get(podWithLocation, ['conferredBy']);
                    podDto.preparedBy = _.get(podWithLocation, ['preparedBy']);
                    var podLineItemLocation = podWithLocation.podLineItemLocation;

                    podDto.lineItems = _.flatten(podDto.lineItems.map(function(lineItem) {
                        var targets = _.filter(podLineItemLocation, function(itemLocation) {
                            return lineItem.id === itemLocation.podLineItemId;
                        });
                        if (targets && targets.length > 0) {
                            return targets.map(function(target) {
                                var copy = angular.copy(lineItem);
                                copy.moveTo = {
                                    locationCode: target.locationCode,
                                    area: target.area
                                };
                                copy.quantityAccepted = target.quantityAccepted;
                                return copy;
                            });
                        }
                        lineItem.moveTo = {
                            locationCode: undefined,
                            area: undefined
                        };
                        return lineItem;
                    }));

                    var lotIds = getLotIdListFromLineItems(podDto.lineItems);
                    var orderableIds = getOrderableIdListFromLineItems(podDto.lineItems);
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
                            return setLotAndOrderableIntoLineItems(podDto, lotPage.content, orderablePage.content);
                        });
                });
        }

        function getPodWithLocation(podId) {
            var lotRepositoryImpl = this.lotRepositoryImpl,
                orderableResource = this.orderableResource;

            return this.resource.getPodWithLocation({
                id: podId
            }, {}).$promise
                .then(function(podWithLocation) {

                    var podExtension = _.get(podWithLocation, ['podExtension']);
                    var podDto = angular.copy(_.get(podExtension, ['podDto']));
                    podDto.conferredBy = _.get(podExtension, ['conferredBy']);
                    podDto.preparedBy = _.get(podExtension, ['preparedBy']);
                    var podLineItemLocation = podWithLocation.podLineItemLocation;

                    podDto.lineItems = _.flatten(podDto.lineItems.map(function(lineItem) {
                        var targets = _.filter(podLineItemLocation, function(itemLocation) {
                            return lineItem.id === itemLocation.podLineItemId;
                        });
                        if (targets && targets.length > 0) {
                            return targets.map(function(target) {
                                var copy = angular.copy(lineItem);
                                copy.moveTo = {
                                    locationCode: target.locationCode,
                                    area: target.area
                                };
                                copy.quantityAccepted = target.quantityAccepted;
                                return copy;
                            });
                        }
                        lineItem.moveTo = {
                            locationCode: undefined,
                            area: undefined
                        };
                        return lineItem;
                    }));

                    var lotIds = getLotIdListFromLineItems(podDto.lineItems);
                    var orderableIds = getOrderableIdListFromLineItems(podDto.lineItems);
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
                            return setLotAndOrderableIntoLineItems(podDto, lotPage.content, orderablePage.content);
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

        function setLotAndOrderableIntoLineItems(proofOfDeliveryJson, lotJsons, orderableJsons) {
            proofOfDeliveryJson.lineItems.forEach(function(lineItem) {
                lineItem.orderable = getOrderableInfoById(orderableJsons, _.get(lineItem, ['orderable', 'id']));
                if (!lineItem.added) {
                    lineItem.quantityShipped = getQuantityShipped(
                        lineItem, proofOfDeliveryJson.shipment.lineItems
                    );
                    lineItem.lot = getLotInfoById(lotJsons, _.get(lineItem, ['lot', 'id']));
                }
            });
            return proofOfDeliveryJson;
        }

        function getLotIdListFromLineItems(lineItems) {
            return lineItems.reduce(function(idList, lineItem) {
                var lotId = _.get(lineItem, ['lot', 'id']);
                if (lotId && !idList.includes(lotId)) {
                    idList.push(lotId);
                }
                return idList;
            }, []);
        }

        function getOrderableIdListFromLineItems(lineItems) {
            return lineItems.reduce(function(idList, lineItem) {
                var orderableId = _.get(lineItem, ['orderable', 'id']);
                if (orderableId && !idList.includes(orderableId)) {
                    idList.push(orderableId);
                }
                return idList;
            }, []);
        }

        function getOrderableInfoById(orderableResultList, lineItemOrderableId) {
            return orderableResultList.find(function(orderable) {
                return orderable.id === lineItemOrderableId;
            });
        }

        function getLotInfoById(lotResultList, lineItemLotId) {
            return lotResultList.find(function(lot) {
                return lot.id === lineItemLotId;
            });
        }

        function getQuantityShipped(lineItem, shipmentLineItems) {
            var shipmentDatas = shipmentLineItems.filter(function(shipmentLineItem) {
                return shipmentLineItem.orderable.id === lineItem.orderable.id &&
                    areLotsEqual(shipmentLineItem.lot, lineItem.lot);
            });
            if (shipmentDatas[0]) {
                return shipmentDatas[0].quantityShipped;
            }
            return 0;
        }

        function areLotsEqual(left, right) {
            if (left && right && left.id === right.id) {
                return true;
            } else if (!left && !right)  {
                return true;
            }
            return false;
        }

        function addLineItem(podId, subDraftId, podLineItemId) {
            return this.resource.addLineItem({
                podId: podId,
                subDraftId: subDraftId
            }, {
                podLineItemId: podLineItemId
            }).$promise;
        }

        function removeLineItem(podId, subDraftId, lineItemId) {
            return this.resource.removeLineItem({
                podId: podId,
                subDraftId: subDraftId,
                lineItemId: lineItemId
            }).$promise;
        }

        function addLineItemWithLocation(podId, subDraftId, podLineItemId) {
            return this.resource.addLineItemWithLocation({
                podId: podId,
                subDraftId: subDraftId
            }, {
                podLineItemId: podLineItemId
            }).$promise;
        }

        function removeLineItemWithLocation(podId, subDraftId, lineItemId) {
            return this.resource.removeLineItemWithLocation({
                podId: podId,
                subDraftId: subDraftId,
                lineItemId: lineItemId
            }).$promise;
        }

        function getOrderableLots(facilityId, orderableId) {
            return this.resource.getOrderableLots({
                id: facilityId,
                orderableIds: orderableId
            }).$promise;
        }

    }
})();
