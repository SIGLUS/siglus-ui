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

    service.$inject = ['$resource'];

    function service($resource) {

        var resource = $resource('', {}, {
            getMovementDrafts: {
                method: 'GET',
                url: '/openlmisServer/api/siglusapi/locationMovementDrafts',
                isArray: true
            },
            getMovementDraftById: {
                method: 'GET',
                url: '/openlmisServer/api/siglusapi/locationMovementDrafts/:id',
                isArray: false
            },
            getMovementLocationAreaInfo: {
                method: 'GET',
                url: '/openlmisServer/api/siglusapi/locations/facility',
                isArray: true
            },
            deleteMovementDraft: {
                method: 'DELETE',
                url: '/openlmisServer/api/siglusapi/locationMovementDrafts/:id'
            },
            saveMovementDraft: {
                method: 'PUT',
                url: '/openlmisServer/api/siglusapi/locationMovementDrafts/:id'
            },
            createMovementDraft: {
                method: 'POST',
                url: '/openlmisServer/api/siglusapi/locationMovementDrafts'
            }
        });

        this.getMovementDrafts = getMovementDrafts;
        this.getMovementDraftById = getMovementDraftById;
        this.getMovementLocationAreaInfo = getMovementLocationAreaInfo;
        this.deleteMovementDraft = deleteMovementDraft;
        this.saveMovementDraft = saveMovementDraft;
        this.createMovementDraft = createMovementDraft;

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
        function getMovementLocationAreaInfo(draftId) {
            return resource.getMovementLocationAreaInfo({
                id: draftId
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

        function createMovementDraft(params) {
            return resource.createMovementDraft(params).$promise;
        }

        function getSrcArea(lineItem, locations) {
            var srcArea = '';
            _.forEach(locations, function(loc) {
                _.forEach(loc.lots, function(lot) {
                    if (lineItem.lot && lineItem.location
                      && lot.lotCode === lineItem.lot.lotCode
                      && loc.locationCode === lineItem.location.locationCode) {
                        srcArea = loc.area;
                    }
                });
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
                    occurredDate: '',
                    expirationDate: _.get(lineItem.lot, 'expirationDate'),
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

    }
})();
