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
     * @name stock-adjustment-creation.stockAdjustmentCreationService
     *
     * @description
     * Responsible for search and submit stock adjustments.
     */
    angular.module('stock-adjustment-creation')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('stockAdjustmentCreationService', decorator);
    }
    decorator.$inject = [
        '$delegate', 'stockEventService', 'ADJUSTMENT_TYPE'
    ];

    function decorator($delegate, stockEventService, ADJUSTMENT_TYPE) {

        $delegate.submitAdjustments = submitAdjustments;

        return $delegate;

        function submitAdjustments(programId, facilityId, lineItems, adjustmentType, signature) {
            var event = {
                programId: programId,
                facilityId: facilityId,
                signature: signature
            };
            event.lineItems = _.map(lineItems, function(item) {
                var isKit = item.isKit || (item.orderable && item.orderable.isKit);
                var lotId = null;
                var lotCode = null;
                var expirationDate = null;

                if (!isKit && item.lot) {
                    var lot = item.lot;
                    if (lot.id) {
                        lotId = lot.id;
                    } else {
                        lotCode = lot.lotCode.toUpperCase();
                    }
                    if (lot.expirationDate) {
                        expirationDate = lot.expirationDate;
                    }
                }
                return angular.merge({
                    orderableId: item.orderable.id,
                    lotId: lotId,
                    lotCode: lotCode,
                    expirationDate: expirationDate,
                    quantity: item.quantity,
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    occurredDate: item.occurredDate,
                    reasonId: item.reason ? item.reason.id : null,
                    reasonFreeText: item.reasonFreeText,
                    documentationNo: item.documentationNo ? item.documentationNo : '',
                    programId: item.programId
                }, buildSourceDestinationInfo(item, adjustmentType));
            });
            return stockEventService.submit(event);
        }

        function buildSourceDestinationInfo(item, adjustmentType) {
            var res = {};
            if (adjustmentType.state === ADJUSTMENT_TYPE.RECEIVE.state) {
                res.sourceId = item.assignment.node.id;
                res.sourceFreeText = item.srcDstFreeText;
            } else if (adjustmentType.state === ADJUSTMENT_TYPE.ISSUE.state) {
                res.destinationId = item.assignment.node.id;
                res.destinationFreeText = item.srcDstFreeText;
            }
            return res;
        }

    }
})();
