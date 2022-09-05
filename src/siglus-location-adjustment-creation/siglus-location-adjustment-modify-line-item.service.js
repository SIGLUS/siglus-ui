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
   * @name siglus-location-adjustment-creation.siglusLocationAdjustmentModifyLineItemService
   *
   * @description
   * Application layer service that prepares domain objects to be used on the view.
   */
    angular
        .module('siglus-location-adjustment-creation')
        .service('siglusLocationAdjustmentModifyLineItemService', siglusLocationAdjustmentModifyLineItemService);

    siglusLocationAdjustmentModifyLineItemService.inject =
    ['$filter', 'LotRepositoryImpl', '$q', 'orderableGroupService',
        'dateUtils', 'REASON_TYPES', 'siglusLocationCommonApiService'];

    function siglusLocationAdjustmentModifyLineItemService(
        $filter, LotRepositoryImpl, $q, orderableGroupService, dateUtils,
        REASON_TYPES, siglusLocationCommonApiService
    ) {

        function getRowTemplateData(lineItem) {
            return  {
                $errors: _.clone(lineItem.$errors),
                orderable: lineItem.orderable,
                orderableId: lineItem.orderableId,
                lot: _.clone(lineItem.lot),
                lotOptions: _.clone(lineItem.lotOptions),
                lotOptionsClone: _.clone(lineItem.lotOptions),
                isKit: lineItem.isKit,
                isMainGroup: false,
                programId: lineItem.programId,
                location: _.clone(lineItem.location),
                locationOptions: _.clone(lineItem.locationOptions),
                locationOptionsClone: _.clone(lineItem.locationOptions),
                locationsInfo: lineItem.locationsInfo,
                stockOnHand: lineItem.stockOnHand,
                quantity: lineItem.quantity,
                reason: lineItem.reason,
                reasonFreeText: lineItem.reasonFreeText,
                documentNumber: lineItem.documentationNo,
                occurredDate: lineItem.occurredDate
            };
        }

        function addRow(tableLineItem, lineItems, isFirstRowToLineItem) {
            lineItems.splice(1, 0,
                getRowTemplateData(tableLineItem, lineItems, isFirstRowToLineItem));
        }

        function resetFirstRow(lineItem) {
            lineItem.$errors = {};
            lineItem.isMainGroup = true;
            lineItem.lot = null;
            lineItem.expirationDate = null;
            lineItem.location = null;
            lineItem.quantity = null;
            lineItem.stockOnHand =  0;
            lineItem.reason = null;
            lineItem.reasonFreeText = null;
            lineItem.documentNumber = null;
        }

        this.addLineItem = function(lineItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(lineItem, lineItems, true);
                resetFirstRow(lineItem);
            }
            addRow(lineItem, lineItems, false);
        };

        this.removeItem = function(lineItems, index) {
            if (lineItems.length === 1) {
                lineItems.splice(0, 1);
            } else if (lineItems.length === 3) {
                var remainRowData = index > 1 ? lineItems[1] : lineItems[2];
                _.extend(lineItems[0], remainRowData, {
                    isMainGroup: true
                });
                lineItems.splice(1, 2);
            } else if (lineItems.length > 3) {
                lineItems.splice(index, 1);
            }
        };

        this.getMainGroupRow = function(lineItem) {
            return {
                $errors: {},
                orderableId: lineItem.orderableId,
                orderable: lineItem.orderable,
                lot: null,
                stockOnHand: 0,
                isKit: lineItem.isKit,
                isMainGroup: true,
                location: null,
                reason: null,
                reasonFreeText: null,
                documentNumber: null,
                quantity: null
            };
        };

        this.getAddProductRow = function(orderable) {
            return {
                $errors: {},
                orderable: orderable,
                orderableId: orderable.id,
                productCode: orderable.productCode,
                productName: $filter('productName')(orderable),
                lot: null,
                stockOnHand: 0,
                isKit: orderable.isKit,
                isMainGroup: true,
                location: null,
                programId: _.get(orderable.programs, [0, 'programId'], ''),
                reason: null,
                reasonFreeText: null,
                documentNumber: null,
                quantity: null,
                occurredDate: dateUtils.toStringDate(new Date())
            };
        };

        function updateStockOnHand(locations, lineItem) {
            var stockOnHand = 0;
            if (lineItem.lot && lineItem.location) {
                _.forEach(locations, function(loc) {
                    _.forEach(loc.lots, function(lot) {
                        if (lineItem.lot && lineItem.location
                          && lot.lotCode === lineItem.lot.lotCode
                          && loc.locationCode === lineItem.location.locationCode) {
                            stockOnHand = lot.stockOnHand;
                        }
                    });
                });
            }
            return stockOnHand;

        }

        function getProgramId(orderableGroups, lineItem) {
            var items = _.find(orderableGroups, function(group) {
                return _.get(_.first(group), ['orderable', 'id']) === lineItem.orderableId;
            });
            return _.get(_.first(items), ['orderable', 'programs', 0, 'programId'], '');
        }

        function mapDataToDisplay(group, isMainGroup, locations, orderableGroups) {
            return _.map(group, function(item) {
                var lot = item.lotCode ? {
                    id: item.lotId,
                    lotCode: item.lotCode,
                    expirationDate: item.expirationDate,
                    stockOnHand: updateStockOnHand(locations, item)
                } : null;
                var location =  item.locationCode ? _.find(item.locationOptions, function(location) {
                    return location.locationCode === item.locationCode;
                }) : null;

                var baseInfo = _.omit(item, ['lotCode', 'lotId', 'expirationDate']);
                return _.extend(baseInfo, {
                    $errors: {},
                    lot: lot,
                    location: location,
                    isMainGroup: isMainGroup,
                    programId: getProgramId(orderableGroups, item)
                });
            });
        }

        // todo  add lotoption locationOption and locationsInfo to item
        this.prepareAddedLineItems = function(draftInfo, locations,  orderableGroups, reasons, areaLocationInfo) {
            var $this = this;
            var lineItems = _.get(draftInfo, 'lineItems', []);
            var mapOfIdAndOrderable = getMapOfIdAndOrderable(orderableGroups);
            return getMapOfIdAndLot(lineItems).then(function(mapOfIdAndLot) {
                //var newLineItems = [];
                var lineItemList =  lineItems.map(function(draftLineItem) {
                    return $q(function(resolve) {
                        // set default value for orderable
                        var orderable = mapOfIdAndOrderable[draftLineItem.orderableId] || {
                            programs: [],
                            dispensable: {}
                        };
                        var lot = mapOfIdAndLot[draftLineItem.lotId] || {};
                        lot.lotCode = draftLineItem.lotCode;
                        lot.expirationDate = draftLineItem.expirationDate;
                        var soh =  0;
                        var newItem = {
                            $errors: {},
                            $previewSOH: soh,
                            orderable: orderable,
                            lot: lot,
                            stockOnHand: soh,
                            occurredDate: draftLineItem.occurredDate,
                            programId: draftLineItem.programId,
                            documentationNo: draftLineItem.documentationNo || draftLineItem.documentNumber
                        };

                        var orderableId = draftLineItem.orderableId;
                        var selectedOrderableGroup = getOrderableGroup(orderableId, orderableGroups);
                        var lotOptions = orderableGroupService.lotsOfWithNull(selectedOrderableGroup);
                        newItem.orderableId = orderableId;

                        newItem.lotOptionsClone = _.clone(lotOptions);
                        newItem.locationOptionsClone = _.clone(areaLocationInfo);
                        newItem.isKit = !!(newItem.orderable && newItem.orderable.isKit);
                        var locationsClone = angular.copy(locations);
                        var locationsInfo = _.chain(locationsClone).map(function(location) {
                            location.lots =  _.filter(location.lots, function(lot) {
                                return lot.orderableId === orderableId;
                            });
                            return location;
                        })
                            .filter(function(location) {

                                return location.lots.length  > 0;
                            })
                            .value();

                        newItem.locationsInfo = locationsInfo;

                        newItem = _.extend(draftLineItem, newItem);

                        var filteredReasons = reasons;
                        filteredReasons = filterReasonsByProduct(reasons, newItem.orderable.programs);
                        newItem.reason = _.find(filteredReasons, function(reason) {
                            return reason.id === draftLineItem.reasonId;
                        });
                        if (_.get(newItem, ['reason', 'reasonType']) === REASON_TYPES.DEBIT) {
                            var locationsGroup = [], lotsGroup = [];
                            _.each(_.get(newItem, ['locationsInfo'], []), function(item) {
                                var newLocation = {};
                                newLocation.locationCode = item.locationCode;
                                newLocation.area = item.area;
                                locationsGroup.push(newLocation);

                                _.each(_.get(item, ['lots']), function(lot) {
                                    lotsGroup.push(lot);
                                });
                            });

                            lotsGroup = _.uniq(lotsGroup, function(lot) {
                                return lot.lotId;
                            });

                            addIdToLotItem(lotsGroup);

                            locationsGroup = _.uniq(locationsGroup, function(location) {
                                return location.locationCode;
                            });

                            newItem.lotOptions = lotsGroup;
                            newItem.locationOptions = locationsGroup;

                            if (newItem.locationCode) {
                                newItem.location = _.find(locationsGroup, function(item) {
                                    return item.locationCode === newItem.locationCode;
                                });
                            }
                            resolve(newItem);

                        } else if (_.get(newItem, ['reason', 'reasonType']) === REASON_TYPES.CREDIT) {
                            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                                extraData: true,
                                isAdjustment: true
                            }, [newItem.orderableId]).then(function(locationInfo) {
                                var lotsGroup = [];
                                _.each(locationInfo, function(item) {
                                    lotsGroup = lotsGroup.concat(item.lots);
                                });
                                lotsGroup = _.uniq(lotsGroup, function(lot) {
                                    return lot.lotId;
                                });
                                addIdToLotItem(lotsGroup);
                                newItem.lotOptions = lotsGroup;
                                newItem.locationOptions = areaLocationInfo;
                                resolve(newItem);
                            });
                        } else {
                            newItem.lotOptions = lotOptions;
                            newItem.locationOptions = areaLocationInfo;
                            if (newItem.locationCode) {
                                newItem.location = _.find(areaLocationInfo, function(item) {
                                    return item.locationCode === newItem.locationCode;
                                });
                            }
                            resolve(newItem);
                        }

                    });

                });

                return $q.all(lineItemList).then(function(results) {

                    return  _.chain(results)
                        .groupBy('orderableId')
                        .values()
                        .map(function(group) {
                            if (group.length === 1) {
                                return mapDataToDisplay(group, true, locations, orderableGroups, areaLocationInfo);
                            }
                            var firstRow = $this.getMainGroupRow(group[0]);
                            var result = [];
                            result.push(firstRow);

                            var childrenLineItems =
                        mapDataToDisplay(group, false, locations, orderableGroups, areaLocationInfo);
                            return result.concat(childrenLineItems);
                        })
                        .value();
                });

            });
        };

        function addIdToLotItem(lotOptions) {
            _.each(lotOptions, function(item) {
                item.id = item.lotId;
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

        function getOrderableGroup(orderableId, orderableGroups) {
            for (var i = 0 ; i < orderableGroups.length ; i++) {
                if (orderableGroups[i][0].orderable.id === orderableId) {
                    return orderableGroups[i];
                }
            }
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
    }

})();
