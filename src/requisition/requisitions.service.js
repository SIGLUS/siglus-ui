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
     * @name requisition.requisitionService
     *
     * @description
     * Responsible for retrieving all information from server.
     */
    angular
        .module('requisition')
        .service('requisitionService', service);

    service.$inject = [
        '$q', '$resource', 'requisitionUrlFactory', 'Requisition', 'dateUtils', 'localStorageFactory', 'offlineService',
        '$filter', 'requisitionCacheService',
        // SIGLUS-REFACTOR: starts here
        'OrderableResource', 'FacilityTypeApprovedProductResource', 'periodService'
        // SIGLUS-REFACTOR: ends here
    ];

    function service($q, $resource, requisitionUrlFactory, Requisition, dateUtils, localStorageFactory, offlineService,
                     $filter, requisitionCacheService,
                     OrderableResource, FacilityTypeApprovedProductResource, periodService) {

        var onlineOnlyRequisitions = localStorageFactory('onlineOnly'),
            offlineStatusMessages = localStorageFactory('statusMessages');

        // SIGLUS-REFACTOR: starts here
        var resource = $resource(requisitionUrlFactory('/api/siglusintegration/requisitions/:id'), {}, {
        // SIGLUS-REFACTOR: ends here
            get: {
                method: 'GET',
                transformResponse: transformGetResponse
            },
            // SIGLUS-REFACTOR: starts here
            initiate: {
                headers: {
                    'Idempotency-Key': getIdempotencyKey
                },
                url: requisitionUrlFactory('/api/siglusintegration/requisitions/initiate'),
                method: 'POST'
            },
            // SIGLUS-REFACTOR: ends here
            search: {
                url: requisitionUrlFactory('/api/requisitions/search'),
                method: 'GET',
                transformResponse: transformRequisitionSearchResponse
            },
            forApproval: {
                url: requisitionUrlFactory('/api/requisitions/requisitionsForApproval'),
                method: 'GET',
                transformResponse: transformRequisitionListResponse
            },
            forConvert: {
                url: requisitionUrlFactory('/api/requisitions/requisitionsForConvert'),
                method: 'GET',
                transformResponse: transformResponseForConvert
            },
            batchRelease: {
                headers: {
                    'Idempotency-Key': getIdempotencyKey
                },
                url: requisitionUrlFactory('/api/requisitions/batchReleases'),
                method: 'POST',
                transformRequest: transformRequest
            },
            getStatusMessages: {
                url: requisitionUrlFactory('/api/requisitions/:id/statusMessages'),
                method: 'GET',
                isArray: true
            },
            // SIGLUS-REFACTOR: starts here
            getOrderableLineItem: {
                url: requisitionUrlFactory('/api/v2/requisitions/createLineItem'),
                method: 'POST'
            }
            // SIGLUS-REFACTOR: ends here
        });

        var service = {
            get: get,
            initiate: initiate,
            search: search,
            forApproval: forApproval,
            forConvert: forConvert,
            convertToOrder: convertToOrder,
            releaseWithoutOrder: releaseWithoutOrder,
            removeOfflineRequisition: removeOfflineRequisition,
            // SIGLUS-REFACTOR: starts here
            getOrderableLineItem: getOrderableLineItem
            // SIGLUS-REFACTOR: ends here
        };

        return service;

        // SIGLUS-REFACTOR: starts here
        function getOrderableLineItem(requisitionId, orderableIds) {
            return resource.getOrderableLineItem({
                requisitionId: requisitionId
            }, orderableIds).$promise;
        }
        // SIGLUS-REFACTOR: ends here
        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name get
         *
         * @description
         * Retrieves requisition by id.
         *
         * @param  {String}  id Requisition UUID
         * @param  {Boolean}  isHistory history flag
         * @return {Promise}    requisition promise
         */
        // SIGLUS-REFACTOR: starts here
        function get(id, isHistory) {
        // SIGLUS-REFACTOR: ends here
            var requisition,
                statusMessages;

            requisition = getOfflineRequisition(id);

            if (requisition && offlineService.isOffline()) {
                statusMessages = offlineStatusMessages.search({
                    requisitionId: requisition.id
                });
                return extendLineItemsWithOrderablesAndFtaps(requisition, statusMessages);
            } else if (requisition && requisition.$modified) {
                return getRequisition(id).then(prepareRequisition);
            }
            return getRequisition(id).then(function(requisition) {
                // SIGLUS-REFACTOR: starts here
                requisition.isHistory = isHistory;
                // SIGLUS-REFACTOR: ends here
                filterRequisitionStockAdjustmentReasons(requisition);

                requisition.$availableOffline = !onlineOnlyRequisitions.contains(id);
                return getStatusMessages(requisition).then(function(response) {
                    if (requisition.$availableOffline) {
                        storeResponses(requisition, response);
                    }
                    return extendLineItemsWithOrderablesAndFtaps(requisition, response);
                }, function() {
                    if (requisition.$availableOffline) {
                        requisitionCacheService.cacheRequisition(requisition);
                    }
                    return extendLineItemsWithOrderablesAndFtaps(requisition);
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name initiate
         *
         * @description
         * Initiates new requisition for program in facility with given period.
         *
         * @param  {String}  facility        Facility UUID
         * @param  {String}  program         Program UUID
         * @param  {String}  suggestedPeriod Period UUID
         * @param  {Boolean} emergency       Indicates if requisition is emergency or not
         * @param  {String}  key             Idempotency key for initiating requisition
         * @return {Promise}                 requisition promise
         */
        // SIGLUS-REFACTOR: starts here
        function initiate(facility, program, suggestedPeriod, emergency, key, inventoryDate) {
        // SIGLUS-REFACTOR: ends here
            return resource.initiate({
                facility: facility,
                program: program,
                suggestedPeriod: suggestedPeriod,
                emergency: emergency,
                idempotencyKey: key,
                // SIGLUS-REFACTOR: starts here
                physicalInventoryDate: inventoryDate
                // SIGLUS-REFACTOR: ends here
            }, {}).$promise
                .then(function(requisition) {
                    filterRequisitionStockAdjustmentReasons(requisition);
                    // SIGLUS-REFACTOR: starts here
                    requisition.$modified = false;
                    // SIGLUS-REFACTOR: ends here
                    requisition.$availableOffline = true;
                    requisitionCacheService.cacheRequisition(requisition);

                    return prepareRequisition(requisition);
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name search
         *
         * @description
         * Search requisitions by criteria from parameters.
         *
         * @param {Boolean} offline      Indicates if searching in offline requisitions
         * @param {Object}  searchParams Contains parameters for searching requisitions, i.e.
         * {
         *      program: 'programID',
         *      facility: 'facilityID',
         *      initiatedDateFrom: 'startDate',
         *      initiatedDateTo: 'endDate',
         *      requisitionStatus: ['status1', 'status2'],
         *      emergency: false
         * }
         * @return {Array}               Array of requisitions for given criteria
         */
        function search(offline, searchParams) {
            return offline ?
                requisitionCacheService.search(searchParams) :
                resource.search(searchParams).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name forApproval
         *
         * @description
         * Retrieves all requisitions with authorized status for approve.
         *
         * @return {Array} Array of requisitions for approval
         */
        function forApproval(params) {
            return resource.forApproval(params).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name forConvert
         *
         * @description
         * Search requisitions for convert to order by given criteria.
         *
         * @param  {Object} params Request params, contains i.e.: filterBy, filterValue, sortBy, descending
         * @return {Array}         Array of requisitions for convert
         */
        function forConvert(params) {
            return resource.forConvert(params).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name convertToOrder
         *
         * @description
         * Converts given requisitions into orders.
         *
         * @param  {Array}   requisitions Array of requisitions to convert
         * @param  {String}  key          Idempotency key for request
         * @return {Promise}              requisitions processing status
         */
        function convertToOrder(requisitions, key) {
            return resource.batchRelease({
                idempotencyKey: key
            },
            {
                createOrder: true,
                requisitions: requisitions
            }).$promise
                .then(function() {
                    requisitions.forEach(function(requisition) {
                        requisitionCacheService.removeById(requisition.requisition.id);
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name releaseWithoutOrder
         *
         * @description
         * Release given requisitions without orders.
         *
         * @param  {Array}   requisitions Array of requisitions release
         * @param  {String}  key          Idempotency key for request
         * @return {Promise}              requisitions processing status
         */
        function releaseWithoutOrder(requisitions, key) {
            return resource.batchRelease({
                idempotencyKey: key
            },
            {
                createOrder: false,
                requisitions: requisitions
            }).$promise
                .then(function() {
                    requisitions.forEach(function(requisition) {
                        requisitionCacheService.removeById(requisition.requisition.id);
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionService
         * @name removeOfflineRequisition
         *
         * @description
         * Removes a specific requistion from the offline store.
         *
         * @param {String} requisitionId Id of requisition to remove
         */
        function removeOfflineRequisition(requisitionId) {
            requisitionCacheService.removeById(requisitionId);
        }

        function getRequisition(id) {
            return resource.get({
                id: id
            }).$promise;
        }

        function getOfflineRequisition(id) {
            return requisitionCacheService.getRequisition(id);
        }

        function getStatusMessages(requisition) {
            return resource.getStatusMessages({
                id: requisition.id
            }).$promise;
        }

        function storeResponses(requisition, statusMessages) {
            requisition.$modified = false;
            requisitionCacheService.cacheRequisition(requisition);

            statusMessages.forEach(function(statusMessage) {
                offlineStatusMessages.put(statusMessage);
            });
        }

        function transformRequest(request) {
            var body = {
                createOrder: request.createOrder,
                requisitionsToRelease: []
            };
            request.requisitions.forEach(function(requisitionWithDepots) {
                body.requisitionsToRelease.push({
                    requisitionId: requisitionWithDepots.requisition.id,
                    supplyingDepotId: requisitionWithDepots.requisition.supplyingFacility
                });
            });

            return angular.toJson(body);
        }

        function transformGetResponse(data, headers, status) {
            return transformResponse(data, headers, status, function(response) {
                if (response.modifiedDate) {
                    response.modifiedDate = dateUtils.toDate(response.modifiedDate);
                }
                if (response.processingPeriod.startDate) {
                    response.processingPeriod.startDate = dateUtils.toDate(response.processingPeriod.startDate);
                }
                if (response.processingPeriod.endDate) {
                    response.processingPeriod.endDate = dateUtils.toDate(response.processingPeriod.endDate);
                }
                response.eTag = headers('eTag');
                transformRequisitionOffline(response);
                return response;
            });
        }

        function transformRequisitionSearchResponse(data, headers, status) {
            return transformResponse(data, headers, status, function(response) {
                angular.forEach(response.content, transformRequisition);
                return response;
            });
        }

        function transformRequisitionListResponse(data, headers, status) {
            return transformResponse(data, headers, status, function(response) {
                angular.forEach(response.content, transformRequisition);
                return response;
            });
        }

        function transformResponseForConvert(data, headers, status) {
            return transformResponse(data, headers, status, function(response) {
                angular.forEach(response.content, function(item) {
                    transformRequisition(item.requisition);
                });
                return response;
            });
        }

        function transformResponse(data, headers, status, transformer) {
            if (status === 200) {
                return transformer(angular.fromJson(data));
            }
            return data;
        }

        function transformRequisition(requisition) {
            if (requisition.modifiedDate) {
                requisition.modifiedDate = dateUtils.toDate(requisition.modifiedDate);
            }

            if (requisition.createdDate) {
                requisition.createdDate = dateUtils.toDate(requisition.createdDate);
            }

            requisition.processingPeriod.startDate = dateUtils.toDate(
                requisition.processingPeriod.startDate
            );

            requisition.processingPeriod.endDate = dateUtils.toDate(
                requisition.processingPeriod.endDate
            );

            if (requisition.processingPeriod.processingSchedule) {
                requisition.processingPeriod.processingSchedule.modifiedDate = dateUtils.toDate(
                    requisition.processingPeriod.processingSchedule.modifiedDate
                );
            }

            transformRequisitionOffline(requisition);
        }

        function transformRequisitionOffline(requisition) {
            var offlineRequisition = requisitionCacheService.getRequisition(requisition.id),
                offlineBatchRequisition = requisitionCacheService.getBatchRequisition(requisition.id);

            if (offlineRequisition || offlineBatchRequisition) {
                requisition.$availableOffline = true;
            }

            if (requisition.modifiedDate && requisition.modifiedDate.getTime) {

                if (offlineRequisition) {
                    markIfOutdated(requisition, offlineRequisition);
                    requisitionCacheService.cacheRequisition(offlineRequisition);
                }

                if (offlineBatchRequisition) {
                    markIfOutdated(requisition, offlineBatchRequisition);
                    requisitionCacheService.cacheBatchRequisition(offlineBatchRequisition);
                }
            }
        }

        function markIfOutdated(requisition, offlineRequisition) {
            var offlineDate = offlineRequisition.modifiedDate && offlineRequisition.modifiedDate.getTime ?
                offlineRequisition.modifiedDate :
                dateUtils.toDate(offlineRequisition.modifiedDate);

            if (!offlineDate || offlineDate.getTime() !== requisition.modifiedDate.getTime()) {
                offlineRequisition.$outdated = true;
            } else {
                delete offlineRequisition.$outdated;
            }
        }

        function filterRequisitionStockAdjustmentReasons(requisition) {
            requisition.stockAdjustmentReasons =  $filter('filter')(
                requisition.stockAdjustmentReasons, {
                    hidden: '!true'
                }
            );
        }

        function getIdempotencyKey(config) {
            var key = config.params.idempotencyKey;
            if (key) {
                delete config.params.idempotencyKey;
                return key;
            }
        }

        function prepareRequisition(requisition) {
            var offlineRequisition = getOfflineRequisition(requisition.id);
            requisition = offlineRequisition ? offlineRequisition : requisition;

            var statusMessages = offlineStatusMessages.search({
                requisitionId: requisition.id
            });

            return extendLineItemsWithOrderablesAndFtaps(requisition, statusMessages);
        }

        function extendLineItemsWithOrderablesAndFtaps(requisition, statusMessages) {
            return $q.all([getByVersionIdentities(requisition.availableProducts, new OrderableResource()),
                periodService.get(requisition.processingPeriod.id)])
                .then(function(result) {
                    // SIGLUS-REFACTOR: starts here
                    requisition.availableFullSupplyProducts =  result[0];
                    // SIGLUS-REFACTOR: ends here
                    requisition.availableNonFullSupplyProducts =
                        filterOrderables(false, result[0], requisition.program.id);

                    requisition.processingPeriod = result[1];
                    return requisition;
                })
                .then(function(requisition) {
                    var indentities = getResourcesFromLineItems(requisition.requisitionLineItems);
                    return $q.all([
                        getByVersionIdentities(indentities.orderables, new OrderableResource()),
                        getByVersionIdentities(indentities.ftaps, new FacilityTypeApprovedProductResource())
                    ])
                        .then(function(result) {
                            requisition.requisitionLineItems.forEach(function(lineItem) {
                                result[0].forEach(function(orderable) {
                                    if (lineItem.orderable.id === orderable.id) {
                                        lineItem.orderable = orderable;
                                    }
                                });
                                result[1].forEach(function(ftap) {
                                    if (lineItem.approvedProduct && lineItem.approvedProduct.id === ftap.id) {
                                        lineItem.approvedProduct = ftap;
                                    }
                                });
                            });
                            return new Requisition(requisition, statusMessages);
                        });
                });
        }

        function getResourcesFromLineItems(lineItems) {
            var orderableIdentities = [],
                ftapIdentities = [];
            lineItems.forEach(function(item) {
                orderableIdentities.push(item.orderable);
                if (item.approvedProduct) {
                    ftapIdentities.push(item.approvedProduct);
                }
            });

            return {
                ftaps: ftapIdentities,
                orderables: orderableIdentities
            };
        }

        function getByVersionIdentities(identities, resource) {
            return resource.getByVersionIdentities(identities);
        }

        function filterOrderables(fullSupply, availableProducts, programId) {
            return availableProducts.filter(function(product) {
                var requisitionProgram = getProgramById(product.programs, programId);
                return requisitionProgram && requisitionProgram.fullSupply === fullSupply;
            });
        }

        function getProgramById(programs, programId) {
            var match;
            programs.forEach(function(program) {
                if (program.programId === programId) {
                    match = program;
                }
            });
            return match;
        }

    }
})();
