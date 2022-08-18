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
     * Allows the user to retrieve adjustment/issue/receive enhanced information.
     */
    angular
        .module('stock-adjustment')
        .factory('stockAdjustmentFactory', factory);

    factory.$inject = [
        '$q', 'stockAdjustmentService', 'orderableGroupService', 'LotRepositoryImpl'
    ];

    function factory($q, stockAdjustmentService, orderableGroupService, LotRepositoryImpl) {

        return {
            getDrafts: getDrafts,
            getDraft: getDraft,
            prepareLineItems: prepareLineItems,
            getDraftById: getDraftById
        };

        function getDrafts(user, programIds, facility, adjustmentType) {
            var promises = [];
            angular.forEach(programIds, function(programId) {
                promises.push(getDraft(user.user_id, programId, facility.id, adjustmentType.state));
            });
            return $q.all(promises);
        }

        function getDraft(userId, programId, facilityId, adjustmentTypeState) {
            return stockAdjustmentService.getDrafts(userId, programId, facilityId, adjustmentTypeState)
                .then(function(drafts) {
                    return drafts[0];
                });
        }

        function getDraftById(userId, programId, facilityId, adjustmentTypeState, draftId) {
            return stockAdjustmentService.getDrafts(userId, programId, facilityId, adjustmentTypeState)
                .then(function(drafts) {
                    return _.find(drafts, function(draft) {
                        return draft.id === draftId;
                    });
                });
        }

        function prepareLineItems(draft, orderableGroups, assignments, reasons) {
            var mapOfIdAndOrderable = getMapOfIdAndOrderable(orderableGroups);
            var srcDstAssignments = assignments || [];
            return getMapOfIdAndLot(draft.lineItems).then(function(mapOfIdAndLot) {
                var newLineItems = [];
                draft.lineItems.forEach(function(draftLineItem) {
                    // set default value for orderable
                    var orderable = mapOfIdAndOrderable[draftLineItem.orderableId] || {
                        programs: [],
                        dispensable: {}
                    };
                    var lot = mapOfIdAndLot[draftLineItem.lotId] || {};
                    lot.lotCode = draftLineItem.lotCode;
                    lot.expirationDate = draftLineItem.expirationDate;
                    var soh = getStockOnHand(
                        orderableGroups,
                        draftLineItem.orderableId,
                        draftLineItem.lotId
                    );
                    var newItem = {
                        $errors: {},
                        $previewSOH: soh,
                        orderable: orderable,
                        lot: lot,
                        stockOnHand: soh,
                        occurredDate: draftLineItem.occurredDate,
                        documentationNo: draftLineItem.documentationNo || draftLineItem.documentNumber
                    };

                    if (draft.draftType === 'adjustment' || draft.draftType === 'receive') {
                        var orderableId = draftLineItem.orderableId;
                        var selectedOrderableGroup = getOrderableGroup(orderableId, orderableGroups);
                        var lotOptions = orderableGroupService.lotsOfWithNull(selectedOrderableGroup);

                        newItem.orderableId = orderableId;
                        newItem.lotOptions = lotOptions;
                        newItem.isKit = !!(newItem.orderable && newItem.orderable.isKit);
                    }

                    newItem.displayLotMessage = lot.lotCode;

                    newItem = _.extend(draftLineItem, newItem);

                    var srcDstId = getSrcDstId(draft.draftType, draftLineItem);

                    newItem.assignment = getAssignmentById(
                        srcDstAssignments,
                        srcDstId,
                        _.first(orderable.programs).programId
                    );

                    var filteredReasons = reasons;
                    if (draft.draftType === 'adjustment') {
                        filteredReasons = filterReasonsByProduct(reasons, newItem.orderable.programs);
                    }
                    newItem.reason = _.find(filteredReasons, function(reason) {
                        return reason.id === draftLineItem.reasonId;
                    });
                    newLineItems.push(newItem);
                });
                return newLineItems;
            });
        }

        function getMapOfIdAndOrderable(orderableGroups) {
            var mapOfIdAndOrderable = {};
            _.forEach(orderableGroups, function(og) {
                og.forEach(function(orderableWrapper) {
                    var orderable = orderableWrapper.orderable;
                    var id = orderableWrapper.orderable.id;
                    mapOfIdAndOrderable[id] = orderable;
                });
            });
            return mapOfIdAndOrderable;
        }

        function getMapOfIdAndLot(lineItems) {
            var ids = _
                .chain(lineItems)
                .map(function(draftLineItem) {
                    return draftLineItem.lotId;
                })
                .uniq()
                .filter(function(id) {
                    return !(_.isEmpty(id));
                })
                .value();
            if (_.isEmpty(ids)) {
                return $q.resolve({});
            }
            return new LotRepositoryImpl().query({
                id: ids
            }).
                then(function(data) {
                    var mapOfIdAndLot = {};
                    _.forEach(data.content, function(lot) {
                        mapOfIdAndLot[lot.id] = lot;
                    });
                    return mapOfIdAndLot;
                });
        }

        function getStockOnHand(orderableGroups, orderableId, lotId) {
            var stockOnHand = null;
            _.forEach(orderableGroups, function(orderableGroup) {
                _.forEach(orderableGroup, function(orderable) {
                    if (_.isEmpty(lotId)) {
                        if (_.isEmpty(orderable.lot) && orderable.orderable && orderable.orderable.id === orderableId) {
                            stockOnHand = orderable.stockOnHand;
                        }
                    } else if (orderable.lot && orderable.lot.id === lotId && orderable.orderable &&
                        orderable.orderable.id === orderableId) {
                        stockOnHand = orderable.stockOnHand;
                    }
                });
            });
            return stockOnHand;
        }

        function getAssignmentById(srcDstAssignments, srcDstId, programId) {
            var assignment = null;
            _.forEach(srcDstAssignments, function(item) {
                if (item.programId === programId && item.node && item.node.id === srcDstId) {
                    assignment = item;
                }
            });
            return assignment;
        }

        function filterReasonsByProduct(reasons, programs) {
            var programIds = [];
            programs.forEach(function(program) {
                programIds.push(program.programId);
            });
            var updatedReasons = [];
            reasons.forEach(function(reason) {
                if (programIds.indexOf(reason.programId) !== -1) {
                    updatedReasons.push(reason);
                }
            });
            return updatedReasons;
        }

        function getOrderableGroup(orderableId, orderableGroups) {
            for (var i = 0 ; i < orderableGroups.length ; i++) {
                if (orderableGroups[i][0].orderable.id === orderableId) {
                    return orderableGroups[i];
                }
            }
        }

        function getSrcDstId(draftType, draftLineItem) {
            var srcDstId = null;
            if (draftType === 'receive') {
                srcDstId = draftLineItem.sourceId;
            } else if (draftType === 'issue') {
                srcDstId = draftLineItem.destinationId;
            }
            return srcDstId;
        }

    }
})();
