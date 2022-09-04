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
     * @name location-adjustment.siglusLocationAdjustmentService
     *
     * @description
     * Responsible for retrieving adjustment/issue/receive information from server.
     */
    angular
        .module('siglus-location-adjustment')
        .service('siglusLocationAdjustmentService', service);

    service.$inject = [
        '$resource', 'siglusLocationManagementUrlFactory'
    ];

    function service($resource, siglusLocationManagementUrlFactory) {

        var resource = $resource(siglusLocationManagementUrlFactory('/api/siglusapi/draftsWithLocation'), {}, {
            saveDraft: {
                method: 'PUT',
                url: siglusLocationManagementUrlFactory('/api/siglusapi/draftsWithLocation/:id')
            },
            deleteDraft: {
                method: 'DELETE',
                url: siglusLocationManagementUrlFactory('/api/siglusapi/drafts/:id')
            },
            submitDraft: {
                method: 'post',
                url: siglusLocationManagementUrlFactory('/api/siglusapi/stockEvents/location')
            },
            createDraft: {
                method: 'post',
                url: siglusLocationManagementUrlFactory('/api/siglusapi/drafts')
            }
        });

        this.createDraft = createDraft;
        this.getDraft = getDraft;

        this.saveDraft = saveDraft;
        this.deleteDraft = deleteDraft;
        this.submitDraft = submitDraft;

        function createDraft(programId, adjustmentTypeState, facilityId, userId) {
            return resource.createDraft({
                facilityId: facilityId,
                userId: userId,
                programId: programId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function getDraft(programId, adjustmentTypeState, facilityId, userId) {
            return resource.query({
                facilityId: facilityId,
                userId: userId,
                program: programId,
                isDraft: true,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function saveDraft(baseInfo, lineItems, locations) {
            var params = buildSaveParams(baseInfo, lineItems, locations);
            return resource.saveDraft({
                id: baseInfo.id
            }, params).$promise;
        }

        function deleteDraft(draftId) {
            return resource.deleteDraft({
                id: draftId
            }).$promise;
        }
        function submitDraft(baseInfo, lineItems, locations) {
            var params = buildSubmitParams(baseInfo, lineItems, locations);
            return resource.submitDraft(params).$promise;
        }

        function buildLineItems(lineItems) {
            return _.map(lineItems, function(lineItem) {
                return {
                    orderableId: lineItem.orderableId,
                    lotId: _.get(lineItem.lot, 'id'),
                    lotCode: _.get(lineItem.lot, 'lotCode'),
                    expirationDate: _.get(lineItem.lot, 'expirationDate'),
                    isKit: lineItem.isKit,
                    area: _.get(lineItem.location, 'area'),
                    locationCode: _.get(lineItem.location, 'locationCode'),
                    reasonId: lineItem.reason ? lineItem.reason.id : null,
                    reasonFreeText: lineItem.reasonFreeText ? lineItem.reasonFreeText : null,
                    documentNumber: lineItem.documentationNo,
                    quantity: lineItem.quantity,
                    stockOnHand: lineItem.stockOnHand,
                    programId: lineItem.programId,
                    occurredDate: lineItem.occurredDate
                };
            });
        }

        function buildSubmitLineItems(lineItems) {
            return _.map(lineItems, function(lineItem) {
                return {
                    orderableId: lineItem.orderableId,
                    lotId: _.get(lineItem.lot, 'id'),
                    lotCode: _.get(lineItem.lot, 'lotCode'),
                    isKit: lineItem.isKit,
                    area: _.get(lineItem.location, 'area'),
                    locationCode: _.get(lineItem.location, 'locationCode'),
                    reasonId: lineItem.reason ? lineItem.reason.id : null,
                    reasonFreeText: lineItem.reasonFreeText ? lineItem.reasonFreeText : null,
                    documentNumber: lineItem.documentationNo,
                    quantity: lineItem.quantity,
                    stockOnHand: lineItem.stockOnHand,
                    programId: lineItem.programId,
                    occurredDate: lineItem.occurredDate
                };
            });
        }

        function buildSaveParams(baseInfo, lineItems) {
            baseInfo.lineItems = [];
            return _.extend(baseInfo, {
                lineItems: buildLineItems(lineItems)
            });
        }

        function buildSubmitParams(baseInfo, lineItems, locations) {
            return _.extend(baseInfo, {
                lineItems: buildSubmitLineItems(lineItems, locations)
            });
        }
    }
})();
