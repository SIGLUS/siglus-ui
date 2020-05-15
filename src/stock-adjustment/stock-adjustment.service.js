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
     * @name stock-adjustment.stockAdjustmentService
     *
     * @description
     * Responsible for retrieving adjustment/issue/receive information from server.
     */
    angular
        .module('stock-adjustment')
        .service('stockAdjustmentService', service);

    service.$inject = [
        '$resource', 'stockmanagementUrlFactory'
    ];

    function service($resource, stockmanagementUrlFactory) {

        var resource = $resource(stockmanagementUrlFactory('/api/siglusintegration/drafts'), {}, {
            update: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusintegration/drafts/:id')
            },
            delete: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusintegration/drafts/:id')
            }
        });

        this.createDraft = createDraft;
        this.getDrafts = getDrafts;
        this.saveDraft = saveDraft;
        this.deleteDraft = deleteDraft;

        function createDraft(userId, programId, facilityId, adjustmentTypeState) {
            return resource.save({
                programId: programId,
                facilityId: facilityId,
                userId: userId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function getDrafts(userId, programId, facilityId, adjustmentTypeState) {
            return resource.query({
                program: programId,
                facility: facilityId,
                isDraft: true,
                userId: userId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function saveDraft(draft, lineItems, adjustmentType) {
            draft.lineItems = _.map(lineItems, function(item) {
                var newLine = buildLine(item);

                var nodeId = null;
                // var name = null;
                if (item.assignment) {
                    nodeId = item.assignment.node && item.assignment.node.id;
                    // name = item.assignment.name;
                }

                if (adjustmentType.state === 'receive') {
                    newLine.sourceId = nodeId;
                    newLine.sourceFreeText = item.srcDstFreeText;
                } else if (adjustmentType.state === 'issue') {
                    newLine.destinationId = nodeId;
                    newLine.destinationFreeText = item.srcDstFreeText;
                }

                return newLine;
            });
            return resource.update({
                id: draft.id
            }, draft).$promise;
        }

        function deleteDraft(draftId) {
            return resource.delete({
                id: draftId
            }).$promise;
        }

        function buildLine(item) {
            return {
                orderableId: item.orderable.id,
                lotId: item.lot ? item.lot.id : null,
                lotCode: item.lot && item.lot.lotCode ? item.lot.lotCode : null,
                expirationDate: item.lot && item.lot.expirationDate ? item.lot.expirationDate : null,
                quantity: item.quantity,
                extraData: {
                    vvmStatus: item.vvmStatus
                },
                occurredDate: item.occurredDate,
                reasonId: item.reason ? item.reason.id : null,
                reasonFreeText: item.reasonFreeText ? item.reasonFreeText : null,
                documentNumber: item.documentationNo
            };
        }
    }
})();
