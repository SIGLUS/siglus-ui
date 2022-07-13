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
        .module('stockmanagement')
        .service('siglusStockIssueService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function service($resource, stockmanagementUrlFactory) {

        var urlBasePath = '/api/siglusapi/drafts/initial';
        var resource = $resource(stockmanagementUrlFactory(urlBasePath), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/multi'),
                isArray: true
            },
            queryDraft: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/initial'),
                isArray: false
            },
            post: {
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/multi'),
                method: 'POST'
            },
            update: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/update')
            },
            delete: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:id')
            },
            resetDraft: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/info')
            },
            getDraftById: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:id'),
                isArray: false
            },
            saveDraft: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:id')
            }
        });

        this.createIssueDraft = createIssueDraft;
        this.getIssueDrafts = getIssueDrafts;
        this.removeIssueDraft = removeIssueDraft;
        this.initIssueDraft = initIssueDraft;
        this.queryIssueToInfo = queryIssueToInfo;
        this.updateDraftStatus = updateDraftStatus;
        this.getDraftById = getDraftById;
        this.resetDraft = resetDraft;

        this.saveDraft = saveDraft;

        function createIssueDraft(data) {
            return resource.post(data).$promise;
        }

        function getIssueDrafts(data) {
            return resource.get(data).$promise;
        }

        function queryIssueToInfo(programId, facilityId, adjustmentTypeState) {
            return resource.queryDraft({
                programId: programId,
                facility: facilityId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function initIssueDraft(formData) {
            return resource.save(formData).$promise;
        }

        function removeIssueDraft(draftId) {
            return resource.delete({
                id: draftId
            }).$promise;
        }

        function resetDraft(draftId) {
            return resource.resetDraft({
                id: draftId
            }).$promise;
        }

        function updateDraftStatus(draftId, operator) {
            return resource.update({
                id: draftId,
                operator: operator
            }).$promise;
        }

        function saveDraft(draftId, lineItems) {
            var drafts = _.map(lineItems, buildLine);
            return resource.saveDraft({
                id: draftId
            }, {
                id: draftId,
                lineItems: drafts
            }).$promise;
        }

        function getDraftById(draftId) {
            return resource.getDraftById({
                id: draftId
            }).$promise;
        }

        function buildLine(item) {
            return {
                orderableId: item.orderable.id,
                lotId: _.get(item.lot, 'id', null),
                lotCode: _.get(item.lot, 'lotCode', null),
                expirationDate: item.lot && item.lot.expirationDate ? item.lot.expirationDate : null,
                quantity: item.quantity,
                extraData: {
                    vvmStatus: item.vvmStatus
                },
                occurredDate: item.occurredDate,
                reasonId: _.get(item.reason, 'id', null),
                reasonFreeText: _.get(item, 'reasonFreeText', null),
                productCode: item.orderable.productCode,
                productName: item.orderable.displayProductName
            };
        }
    }
})();
