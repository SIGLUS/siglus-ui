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
    angular
        .module('stock-adjustment-creation')
        .service('stockAdjustmentCreationService', service);

    service.$inject = [
        '$filter', 'openlmisDateFilter', 'messageService', 'productNameFilter', 'dateUtils',
        // SIGLUS-REFACTOR: starts here
        // '$resource', 'stockmanagementUrlFactory',
        'siglusStockEventService', 'ADJUSTMENT_TYPE', 'siglusStockUtilsService'
        // SIGLUS-REFACTOR: ends here
    ];

    function service($filter, openlmisDateFilter, messageService, productNameFilter, dateUtils, siglusStockEventService,
                     ADJUSTMENT_TYPE, siglusStockUtilsService) {
        // SIGLUS-REFACTOR: starts here
        // var resource = $resource(stockmanagementUrlFactory('/api/stockEvents'));
        // SIGLUS-REFACTOR: ends here

        this.search = search;

        this.submitAdjustments = submitAdjustments;

        function search(keyword, items, hasLot) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = items;
            } else {
                keyword = keyword.trim();
                result = _.filter(items, function(item) {
                    var hasStockOnHand = !(_.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand));
                    var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
                    var searchableFields = [
                        item.orderable.productCode,
                        productNameFilter(item.orderable),
                        hasStockOnHand ? item.stockOnHand.toString() : '',
                        item.reason && item.reason.name ? item.reason.name : '',
                        safeGet(item.reasonFreeText),
                        hasQuantity ? item.quantity.toString() : '',
                        getLot(item, hasLot),
                        item.lot ? openlmisDateFilter(item.lot.expirationDate) : '',
                        item.assignment ? item.assignment.name : '',
                        safeGet(item.srcDstFreeText),
                        openlmisDateFilter(dateUtils.toDate(item.occurredDate))
                    ];
                    return _.any(searchableFields, function(field) {
                        // SIGLUS-REFACTOR: starts here
                        if (!field) {
                            return false;
                        }
                        // SIGLUS-REFACTOR: ends here
                        return field.toLowerCase().contains(keyword.toLowerCase());
                    });
                });
            }

            return result;
        }

        // SIGLUS-REFACTOR: starts here
        function submitAdjustments(programId, facilityId, lineItems, adjustmentType, signature, occurredDate) {
            var event = {
                programId: programId,
                facilityId: facilityId,
                signature: signature
            };
            var formattedOccurredDate = siglusStockUtilsService.formatDate(occurredDate);
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
                    occurredDate: formattedOccurredDate,
                    reasonId: item.reason ? item.reason.id : null,
                    reasonFreeText: item.reasonFreeText,
                    documentationNo: item.documentationNo ? item.documentationNo : '',
                    programId: item.programId
                }, buildSourceDestinationInfo(item, adjustmentType));
            });
            return siglusStockEventService.submit(event);
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
        // SIGLUS-REFACTOR: ends here

        function safeGet(value) {
            return value || '';
        }

        function getLot(item, hasLot) {
            return item.lot ?
                item.lot.lotCode :
                (hasLot ? messageService.get('orderableGroupService.noLotDefined') : '');
        }
    }
})();
