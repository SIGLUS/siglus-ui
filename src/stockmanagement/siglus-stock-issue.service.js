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

    service.$inject = ['$resource', 'stockmanagementUrlFactory', '$filter', 'moment', 'siglusStockUtilsService'];

    function service($resource, stockmanagementUrlFactory, $filter, moment, siglusStockUtilsService) {

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
            getMergedDraft: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:initialDraftId/subDraft/merge'),
                isArray: true
            },
            saveDraft: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:id')
            },
            deleteAllDraft: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/initial/:initialDraftId')
            },
            mergeAllDraft: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:id')
            },
            submitDraft: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/drafts/:initialDraftId/subDraft/:draftId/submit')
            },
            mergeSubmitDraft: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/stockEvents/multiUser'),
                transformRequest: formatPayload
            }
        });

        this.createDraft = createDraft;
        this.getDrafts = getDrafts;
        this.removeIssueDraft = removeIssueDraft;
        this.initDraft = initDraft;
        this.queryInitialDraftInfo = queryInitialDraftInfo;
        this.updateDraftStatus = updateDraftStatus;
        this.getDraftById = getDraftById;
        this.resetDraft = resetDraft;
        this.deleteAllDraft = deleteAllDraft;
        this.mergeAllDraft = mergeAllDraft;
        this.submitDraft = submitDraft;

        this.saveDraft = saveDraft;

        this.mergeSubmitDraft = mergeSubmitDraft;

        this.getMergedDraft = getMergedDraft;

        function createDraft(data) {
            return resource.post(data).$promise;
        }

        function getMergedDraft(initialDraftId) {
            return resource.getMergedDraft({
                initialDraftId: initialDraftId
            }).$promise;
        }

        function getDrafts(data) {
            return resource.get(data).$promise;
        }

        function queryInitialDraftInfo(programId, facilityId, adjustmentTypeState) {
            var params = {
                programId: programId,
                facility: facilityId,
                draftType: adjustmentTypeState
            };
            return resource.queryDraft(params).$promise;
        }

        function initDraft(formData) {
            return resource.save(formData).$promise;
        }

        function removeIssueDraft(draftId) {
            return resource.delete({
                id: draftId
            }).$promise;
        }

        function deleteAllDraft(initialDraftId) {
            return resource.deleteAllDraft({
                initialDraftId: initialDraftId
            }).$promise;
        }

        function mergeAllDraft() {
            return resource.mergeAllDraft().$promise;
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

        function saveDraft(draftId, lineItems, draftType) {
            var drafts = _.map(lineItems, buildLine);
            return resource.saveDraft({
                id: draftId
            }, {
                id: draftId,
                lineItems: drafts,
                draftType: draftType
            }).$promise;
        }

        function getDraftById(draftId) {
            return resource.getDraftById({
                id: draftId
            }).$promise;
        }

        function submitDraft(initialDraftId, draftId, signature, lineItems, draftType) {
            var drafts = _.map(lineItems, buildLine);
            return resource.submitDraft({
                initialDraftId: initialDraftId,
                draftId: draftId
            }, {
                id: draftId,
                signature: signature,
                lineItems: drafts,
                draftType: draftType
            }).$promise;
        }

        function mergeSubmitDraft(programId, lineItems, signature, initDraftInfo, facilityId, subDrafts, occurredDate) {
            var formattedOccurredDate = siglusStockUtilsService.formatDate(occurredDate);
            var params = {

                subDrafts: subDrafts,
                stockEvent: {
                    programId: programId,
                    signature: signature,
                    facilityId: facilityId,
                    lineItems: _.map(lineItems, function(item) {
                        return buildMergeDraftLine(item, initDraftInfo, formattedOccurredDate);
                    })
                }
            };

            return resource.mergeSubmitDraft(params).$promise;
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
                stockOnHand: item.$previewSOH,
                reasonId: _.get(item.reason, 'id', null),
                reasonFreeText: _.get(item, 'reasonFreeText', null),
                productCode: item.orderable.productCode,
                productName: $filter('productName')(item.orderable)
            };
        }

        function buildMergeDraftLine(item, initialDraftInfo, formattedOccurredDate) {
            var isIssue = !_.isEmpty(_.get(initialDraftInfo, 'destinationId'));
            var data = isIssue ?
                {
                    destinationId: _.get(initialDraftInfo, 'destinationId'),
                    destinationFreeText: _.get(initialDraftInfo, 'locationFreeText') || undefined
                }  : {
                    sourceId: _.get(initialDraftInfo, 'sourceId'),
                    sourceFreeText: _.get(initialDraftInfo, 'locationFreeText') || undefined
                };
            return Object.assign({
                orderableId: item.orderable.id,
                lotId: _.get(item.lot, 'id', null),
                lotCode: _.get(item.lot, 'lotCode', null),
                expirationDate: item.lot && item.lot.expirationDate ? item.lot.expirationDate : null,
                quantity: item.quantity,
                extraData: {
                    vvmStatus: item.vvmStatus
                },
                occurredDate: formattedOccurredDate,
                reasonId: _.get(item.reason, 'id', null),
                reasonFreeText: _.get(item, 'reasonFreeText'),
                programId: item.programId,
                documentationNo: initialDraftInfo.documentNumber
            }, data);
        }

        function formatPayload(payload) {
            _.forEach(payload.stockEvent.lineItems, function(lineItem) {
                if (!lineItem.extraData) {
                    lineItem.extraData = {};
                }
                if (!lineItem.lotId) {
                    lineItem.extraData.lotCode = lineItem.lotCode;
                    lineItem.extraData.expirationDate = siglusStockUtilsService.formatDate(lineItem.expirationDate);
                }
                lineItem.extraData.stockCardId = lineItem.stockCardId;

                delete lineItem.lotCode;
                delete lineItem.expirationDate;
            });

            return angular.toJson(payload);
        }
    }
})();
