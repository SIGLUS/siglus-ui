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
     * @name stock-physical-inventory.physicalInventoryFactory
     *
     * @description
     * Allows the user to retrieve physical inventory enhanced informations.
     */
    angular
        .module('stock-physical-inventory')
        .factory('physicalInventoryFactory', factory);

    factory.$inject = [
        '$q', 'physicalInventoryService', 'SEARCH_OPTIONS', '$filter', 'StockCardSummaryRepository',
        'FullStockCardSummaryRepositoryImpl',
        // SIGLUS-REFACTOR: starts here
        'loadingModalService', '$state', 'alertService', 'currentUserService', 'navigationStateService',
        'STOCKMANAGEMENT_RIGHTS'
        // SIGLUS-REFACTOR: ends here
    ];

    function factory($q, physicalInventoryService, SEARCH_OPTIONS, $filter, StockCardSummaryRepository,
                     FullStockCardSummaryRepositoryImpl, loadingModalService, $state, alertService,
                     currentUserService, navigationStateService, STOCKMANAGEMENT_RIGHTS) {
        var mmcProgramId = 'a6257d40-58c5-11ed-b15f-acde48001122';
        var viaProgramId = 'dce17f2e-af3e-40ad-8e00-3496adef44c3';

        return {
            getDrafts: getDrafts,
            getDraft: getDraft,
            getDraftByProgramAndFacility: getDraftByProgramAndFacility,
            getPhysicalInventory: getPhysicalInventory,
            getPhysicalInventorySubDraft: getPhysicalInventorySubDraft,
            saveDraft: saveDraft,
            getLocationPhysicalInventorySubDraft: getLocationPhysicalInventorySubDraft,
            // SIGLUS-REFACTOR: starts here
            getInitialInventory: getInitialInventory
            // SIGLUS-REFACTOR: ends here
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getDrafts
         *
         * @description
         * Retrieves physical inventory drafts by facility and program.
         *
         * @param  {Array}   programIds An array of program UUID
         * @param  {String}  facility   Facility UUID
         * @return {Promise}            Physical inventories promise
         */
        function getDrafts(programIds, facility) {
            var promises = [];
            angular.forEach(programIds, function(program) {
                promises.push(getDraftByProgramAndFacility(program, facility));
            });
            return $q.all(promises);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getDraftByProgramAndFacility
         *
         * @description
         * Retrieves simple physical inventory draft by facility and program.
         *
         * @param  {String}  programId  Program UUID
         * @param  {String}  facilityId Facility UUID
         * @return {Promise}          Physical inventory promise
         */
        function getDraftByProgramAndFacility(programId, facilityId) {
            return physicalInventoryService.getDraft(programId, facilityId)
                .then(function(response) {
                    var draft = response,
                        draftToReturn = {
                            programId: programId,
                            facilityId: facilityId,
                            lineItems: []
                        };
                    // no saved draft
                    if (draft.length === 0) {
                        draftToReturn.isStarter = true;
                    }

                    return draftToReturn;
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getDraft
         *
         * @description
         * Retrieves physical inventory draft by facility and program.
         *
         * @param  {String}  programId  Program UUID
         * @param  {String}  facilityId Facility UUID
         * @return {Promise}          Physical inventory promise
         */
        function getDraft(programId, facilityId) {
            return $q.all([
                getStockProducts(programId, facilityId),
                physicalInventoryService.getDraft(programId, facilityId)
            ]).then(function(responses) {
                var summaries = responses[0],
                    draft = responses[1].data,
                    draftToReturn = {
                        programId: programId,
                        facilityId: facilityId,
                        lineItems: []
                    };
                // no saved draft
                if (draft.length === 0) {
                    // SIGLUS-REFACTOR: starts here
                    prepareLineItems(undefined, summaries, draftToReturn);
                    // SIGLUS-REFACTOR: ends here
                    // draft was saved
                } else {
                    prepareLineItems(draft[0], summaries, draftToReturn);
                    draftToReturn.id = draft[0].id;
                }
                return draftToReturn;
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getPhysicalInventory
         *
         * @description
         * Retrieves physical inventory by id.
         *
         * @param  {String}  id       Draft UUID
         * @return {Promise}          Physical inventory promise
         */
        function getPhysicalInventory(id) {
            return physicalInventoryService.getPhysicalInventory(id)
                .then(function(physicalInventory) {
                    return getStockProducts(physicalInventory.programId, physicalInventory.facilityId)
                        .then(function(summaries) {
                            var draftToReturn = {
                                programId: physicalInventory.programId,
                                facilityId: physicalInventory.facilityId,
                                lineItems: []
                            };
                            prepareLineItems(physicalInventory, summaries, draftToReturn);
                            draftToReturn.id = physicalInventory.id;

                            return draftToReturn;
                        });
                });
        }

        function getPhysicalInventorySubDraft(id, flag) {
            return physicalInventoryService.getPhysicalInventorySubDraft(id)
                .then(function(physicalInventory) {
                    var allLineOrderableIds = physicalInventory.lineItems.map(function(line) {
                        return line.orderableId;
                    });
                    return getStockProducts(
                        physicalInventory.programId,
                        physicalInventory.facilityId,
                        id,
                        flag,
                        allLineOrderableIds
                    )
                        .then(function(summaries) {
                            var draftToReturn = {
                                programId: physicalInventory.programId,
                                facilityId: physicalInventory.facilityId,
                                lineItems: []
                            };
                            prepareLineItems(
                                physicalInventory,
                                summaries,
                                draftToReturn,
                                false,
                                'product'
                            );
                            draftToReturn.id = physicalInventory.id;
                            return draftToReturn;
                        });
                });
        }

        function  getLocationPhysicalInventorySubDraft(subDraftIdList, isMerged, locationManagementOption) {
            return physicalInventoryService.getLocationPhysicalInventorySubDraft(
                subDraftIdList, locationManagementOption
            )
                .then(function(physicalInventory) {
                    var allLineOrderableIds = physicalInventory.lineItems.map(function(line) {
                        return line.orderableId;
                    });
                    allLineOrderableIds = _.filter(allLineOrderableIds, function(item) {
                        return item;
                    });
                    return getStockProducts(
                        physicalInventory.programId,
                        physicalInventory.facilityId,
                        subDraftIdList,
                        isMerged,
                        allLineOrderableIds,
                        locationManagementOption
                    )
                        .then(function(summaries) {
                            var draftToReturn = {
                                programId: physicalInventory.programId,
                                facilityId: physicalInventory.facilityId,
                                lineItems: []
                            };
                            prepareLineItems(
                                physicalInventory,
                                summaries,
                                draftToReturn,
                                true,
                                locationManagementOption
                            );
                            draftToReturn.id = physicalInventory.id;
                            return draftToReturn;
                        });
                });
        }

        // SIGLUS-REFACTOR: starts here
        function getInitialInventory(programId, facilityId, locationManagementOption) {
            var result =  {};
            if (locationManagementOption === 'location') {
                result = physicalInventoryService.getDraftByLocation(facilityId, programId)
                    .then(function(drafts) {
                        var draft = _.first(drafts);
                        var allLineOrderableIds = draft.lineItems.map(function(line) {
                            return line.orderableId;
                        });
                        allLineOrderableIds = _.filter(allLineOrderableIds, function(item) {
                            return item;
                        });
                        return getStockProducts(
                            draft.programId,
                            draft.facilityId,
                            undefined,
                            undefined,
                            allLineOrderableIds,
                            locationManagementOption
                        )
                            .then(function(summaries) {
                                // summaries = summaries.content.reduce(function(items, summary) {
                                //     summary.canFulfillForMe.forEach(function(fulfill) {
                                //         items.push(fulfill);
                                //     });
                                //     return items;
                                // }, []);
                                var initialInventory = {
                                    programId: draft.programId,
                                    facilityId: draft.facilityId,
                                    lineItems: []
                                };
                                prepareLineItems(
                                    draft,
                                    summaries,
                                    initialInventory,
                                    true,
                                    locationManagementOption
                                );
                                initialInventory.id = draft.id;
                                return initialInventory;
                            })
                            .catch(function(err) {
                                console.log('### err', err);
                            });
                    }, function(err) {
                        if (err.status === 406) {
                            currentUserService.clearCache();
                            navigationStateService.clearStatesAvailability();
                            $state.go('openlmis.home', {}, {
                                reload: true
                            });
                            loadingModalService.close();
                            alertService.error('stockInitialInventory.initialFailed');
                        }
                    });
            } else {
                result = physicalInventoryService.getInitialDraft(programId, facilityId)
                    .then(function(drafts) {
                        var draft = _.first(drafts);
                        var allLineOrderableIds = draft.lineItems.map(function(line) {
                            return line.orderableId;
                        });
                        return getStockProducts(draft.programId, draft.facilityId, undefined, undefined,
                            allLineOrderableIds)
                            .then(function(summaries) {
                                var initialInventory = {
                                    programId: draft.programId,
                                    facilityId: draft.facilityId,
                                    lineItems: []
                                };
                                prepareLineItems(draft, summaries, initialInventory);
                                initialInventory.id = draft.id;

                                return initialInventory;
                            });
                    }, function(err) {
                        if (err.status === 406) {
                            currentUserService.clearCache();
                            navigationStateService.clearStatesAvailability();
                            $state.go('openlmis.home', {}, {
                                reload: true
                            });
                            loadingModalService.close();
                            alertService.error('stockInitialInventory.initialFailed');
                        }
                    });
            }
            return result;
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name saveDraft
         *
         * @description
         * Performs logic on physical inventory draft and calls save method from draft service.
         *
         * @param  {draft}   draft Physical Inventory Draft to be saved
         * @return {Promise}       Saved draft
         */
        function saveDraft(draft) {
            var physicalInventory = angular.copy(draft);

            // SIGLUS-REFACTOR: Filter not added items
            physicalInventory.lineItems = _.map(draft.lineItems, function(item) {
                var result = {};
                if (item.id) {
                    result = {
                        id: item.id,
                        orderableId: item.orderable.id,
                        lotId: item.lot ? item.lot.id : null,
                        lotCode: item.lot ? item.lot.lotCode : null,
                        expirationDate: item.lot ? item.lot.expirationDate : null,
                        quantity: item.quantity,
                        extraData: {
                            vvmStatus: item.vvmStatus
                        },
                        stockAdjustments: item.stockAdjustments,
                        reasonFreeText: item.reasonFreeText,
                        stockCardId: item.stockCardId,
                        programId: item.programId,
                        area: item.area,
                        locationCode: item.locationCode
                    };
                } else {
                    result = {
                        orderableId: item.orderable.id,
                        lotId: item.lot ? item.lot.id : null,
                        lotCode: item.lot ? item.lot.lotCode : null,
                        expirationDate: item.lot ? item.lot.expirationDate : null,
                        quantity: item.quantity,
                        extraData: {
                            vvmStatus: item.vvmStatus
                        },
                        stockAdjustments: item.stockAdjustments,
                        reasonFreeText: item.reasonFreeText,
                        stockCardId: item.stockCardId,
                        programId: item.programId,
                        area: item.area,
                        locationCode: item.locationCode
                    };
                }
                return result;
            });
            // SIGLUS-REFACTOR: ends here

            return physicalInventoryService.saveDraft(physicalInventory);
        }

        function getProgramId(physicalInventory, summary) {
            return physicalInventory.programId === mmcProgramId ?
                mmcProgramId : _.first(summary.orderable.programs).programId;
        }

        // SIGLUS-REFACTOR: starts here
        function prepareLineItems(
            physicalInventory,
            summaries,
            draftToReturn,
            isWithLocation,
            locationManagementOption
        ) {
            var draftLineItems = physicalInventory && angular.copy(physicalInventory.lineItems);
            var stockCardLineItems = [];
            angular.forEach(summaries, function(summary) {
                var stockCardId = summary.stockCard && summary.stockCard.id;
                var programId = getProgramId(physicalInventory, summary);
                stockCardLineItems.push({
                    stockOnHand: summary.stockOnHand,
                    lot: summary.lot,
                    orderable: summary.orderable,
                    area: summary.area,
                    locationCode: summary.locationCode,
                    quantity: null,
                    vvmStatus: null,
                    stockAdjustments: [],
                    stockCardId: stockCardId,
                    programId: programId
                });
                summary.stockAdjustments = [];
                summary.stockCardId = stockCardId;
                summary.programId = programId;
            });
            draftToReturn.summaries = summaries;
            if (!isWithLocation && _.isEmpty(draftLineItems)) {
                draftToReturn.lineItems = _.filter(stockCardLineItems, function(item) {
                    return item.stockCardId && !item.orderable.archived;
                });
            } else {
                angular.forEach(draftLineItems, function(item) {
                    var summary = _.find(summaries, function(summary) {
                        if (item.stockCardId) {
                            return item.stockCardId === (summary.stockCard && summary.stockCard.id);
                        } else if (item.lotId) {
                            return item.lotId === (summary.lot && summary.lot.id) &&
                                item.orderableId === summary.orderable.id;
                        }
                        return summary.orderable.id === item.orderableId;
                    });
                    if ((
                        !locationManagementOption
                            || _.contains(['location', 'product'], locationManagementOption))
                            && summary
                    ) {
                        draftToReturn.lineItems.push({
                            stockOnHand: item.stockCardId || item.lotId ? summary.stockOnHand : undefined,
                            lot: getLot(summary, item),
                            orderable: summary.orderable,
                            quantity: item.quantity,
                            vvmStatus: item.extraData ?  item.extraData.vvmStatus : null,
                            stockAdjustments: item.stockAdjustments || [],
                            reasonFreeText: item.reasonFreeText,
                            stockCardId: _.get(item, ['extraData', 'stockCardId'], null),
                            area: item.area,
                            id: item.id,
                            locationCode: item.locationCode,
                            programId: getProgramId(physicalInventory, summary)
                        });
                    } else if (locationManagementOption === 'location' && !summary) {
                        var newItem = angular.merge(item, {
                            stockCardId: _.get(item, ['extraData', 'stockCardId'], null),
                            extraData: {},
                            orderable: {
                                dispensable: {}
                            }
                        });
                        draftToReturn.lineItems.push(newItem);
                    }
                });
                draftToReturn.lineItems = _.sortBy(draftToReturn.lineItems, function(kit) {
                    return !kit.stockCardId;
                });
            }
        }

        function getLot(summary, item) {
            var draftLOt = item.lotCode || item.expirationDate ? {
                lotCode: item.lotCode,
                expirationDate: item.expirationDate
            } : null;
            if (item.extraData && item.extraData.lotCode && !item.lotId) {
                draftLOt = item.extraData;
            }
            if (item.lotId) {
                draftLOt = angular.copy(summary.lot);
            }
            return draftLOt;
        }

        /*function identityOfLines(identifiable) {
            return identifiable.orderableId + (identifiable.lotId ? identifiable.lotId : '');
        }

        function identityOf(identifiable) {
            return identifiable.orderable.id + (identifiable.lot ? identifiable.lot.id : '');
        }

        function getStockAdjustments(lineItems, summary) {
            var filtered;

            if (summary.lot) {
                filtered = $filter('filter')(lineItems, {
                    orderableId: summary.orderable.id,
                    lotId: summary.lot.id
                });
            } else {
                filtered = $filter('filter')(lineItems, function(lineItem) {
                    return lineItem.orderableId === summary.orderable.id && !lineItem.lotId;
                });
            }

            if (filtered.length === 1) {
                return filtered[0].stockAdjustments;
            }

            return [];
        }*/
        // SIGLUS-REFACTOR: ends here

        function getStockProducts(programId, facilityId, subDraftIds, flag, orderableIds, locationManagementOption) {
            var repository = new StockCardSummaryRepository(
                new FullStockCardSummaryRepositoryImpl(locationManagementOption)
            );

            if (programId === mmcProgramId) {
                programId = viaProgramId;
            }
            // #225: cant view detail page when not have stock view right
            return repository.query(flag ? {
                programId: programId,
                facilityId: facilityId,
                rightName: STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT,
                subDraftIds: subDraftIds,
                orderableIds: orderableIds
            } : {
                programId: programId,
                facilityId: facilityId,
                rightName: STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT,
                subDraftIds: subDraftIds,
                orderableIds: orderableIds
            }).then(function(summaries) {
                // #225: ends here
                return summaries.content.reduce(function(items, summary) {
                    summary.canFulfillForMe.forEach(function(fulfill) {
                        items.push(fulfill);
                    });
                    return items;
                }, []);
            });
        }
    }
})();
