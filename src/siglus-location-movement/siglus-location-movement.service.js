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
   * @name stockmanagement.siglusStockIssueService
   *
   * @description
   * provide issue draft save delete create get request
   */
    angular
        .module('siglus-location-movement')
        .service('siglusLocationMovementService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function service($resource, stockmanagementUrlFactory) {

        var resource = $resource('', {}, {
            getMovementDrafts: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovementDrafts'),
                isArray: true
            },
            initVirtualMovementDrafts: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovementDrafts/:id/virtualLocationDrafts')
            },
            getMovementDraftById: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovementDrafts/:id'),
                isArray: false
            },
            getMovementLocationAreaInfo: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/locations/facility'),
                isArray: true
            },
            deleteMovementDraft: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovementDrafts/:id')
            },
            saveMovementDraft: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovementDrafts/:id')
            },
            submitMovementDraft: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovements')
            },
            createMovementDraft: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/locationMovementDrafts')
            }
        });

        this.initVirtualMovementDrafts = initVirtualMovementDrafts;
        this.getMovementDrafts = getMovementDrafts;
        this.getMovementDraftById = getMovementDraftById;
        this.getMovementLocationAreaInfo = getMovementLocationAreaInfo;
        this.deleteMovementDraft = deleteMovementDraft;
        this.saveMovementDraft = saveMovementDraft;
        this.createMovementDraft = createMovementDraft;
        this.submitMovementDraft = submitMovementDraft;

        function initVirtualMovementDrafts(emptyDraft) {
            return resource.initVirtualMovementDrafts({
                id: emptyDraft.id
            }, emptyDraft).$promise;
        }

        function getMovementDrafts(programId) {
            return resource.getMovementDrafts({
                programId: programId
            }).$promise;
        }

        function getMovementDraftById(draftId) {
            return resource.getMovementDraftById({
                id: draftId
            }).$promise;
        }
        // TODO why draftId ?
        function getMovementLocationAreaInfo(draftId, isEmpty) {
            return resource.getMovementLocationAreaInfo({
                id: draftId,
                isEmpty: isEmpty
            }).$promise;
        }

        function deleteMovementDraft(draftId) {
            return resource.deleteMovementDraft({
                id: draftId
            }).$promise;
        }

        function saveMovementDraft(baseInfo, lineItems, locations) {
            var params = buildSaveParams(baseInfo, lineItems, locations);
            return resource.saveMovementDraft({
                id: baseInfo.id
            }, params).$promise;
        }

        function submitMovementDraft(baseInfo, lineItems, locations) {
            var params = buildSubmitParams(baseInfo, lineItems, locations);
            return resource.submitMovementDraft(params).$promise;
        }

        function createMovementDraft(params) {
            return resource.createMovementDraft(params).$promise;
        }

        function getSrcArea(lineItem, locations) {
            var srcArea = '';
            _.forEach(locations, function(loc) {
                if (lineItem.location && loc.locationCode === lineItem.location.locationCode) {
                    srcArea = loc.area;
                }
            });
            return srcArea;

        }

        function buildLineItems(lineItems, locations) {

            return _.map(lineItems, function(lineItem) {
                return {
                    orderableId: lineItem.orderableId,
                    productCode: lineItem.productCode,
                    productName: lineItem.productName,
                    lotId: _.get(lineItem.lot, 'id'),
                    lotCode: _.get(lineItem.lot, 'lotCode'),
                    isKit: lineItem.isKit,
                    srcArea: getSrcArea(lineItem, locations),
                    srcLocationCode: _.get(lineItem.location, 'locationCode'),
                    destArea: _.get(lineItem.moveTo, 'area'),
                    destLocationCode: _.get(lineItem.moveTo, 'locationCode'),
                    expirationDate: _.get(lineItem.lot, 'expirationDate'),
                    quantity: lineItem.quantity,
                    stockOnHand: lineItem.stockOnHand
                };
            });
        }
        function buildSubmitLineItems(lineItems, locations) {

            return _.map(lineItems, function(lineItem) {
                return {
                    programId: lineItem.programId,
                    orderableId: lineItem.orderableId,
                    lotId: _.get(lineItem.lot, 'id'),
                    isKit: lineItem.isKit,
                    srcArea: getSrcArea(lineItem, locations),
                    srcLocationCode: _.get(lineItem.location, 'locationCode'),
                    destArea: _.get(lineItem.moveTo, 'area'),
                    destLocationCode: _.get(lineItem.moveTo, 'locationCode'),
                    quantity: lineItem.quantity,
                    stockOnHand: lineItem.stockOnHand
                };
            });
        }

        function buildSaveParams(baseInfo, lineItems, locations) {
            return _.extend(baseInfo, {
                lineItems: buildLineItems(lineItems, locations)
            });
        }

        function buildSubmitParams(baseInfo, lineItems, locations) {
            return _.extend(baseInfo, {
                movementLineItems: buildSubmitLineItems(lineItems, locations)
            });
        }

    }
})();
