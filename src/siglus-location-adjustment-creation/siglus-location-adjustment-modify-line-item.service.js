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
        'dateUtils', 'REASON_TYPES', 'SiglusLocationCommonUtilsService' ];

    function siglusLocationAdjustmentModifyLineItemService(
        $filter, LotRepositoryImpl, $q, orderableGroupService, dateUtils,
        REASON_TYPES, SiglusLocationCommonUtilsService
    ) {

        function getRowTemplateData(lineItem, isFirstRowToLineItem) {
            return  {
                $errors: angular.copy(lineItem.$errors),
                orderable: lineItem.orderable,
                orderableId: lineItem.orderableId,
                lot: angular.copy(lineItem.lot),
                lotOptions: isFirstRowToLineItem
                    ? angular.copy(lineItem.lotOptions)
                    : angular.copy(lineItem.lotOptionsClone),
                lotOptionsClone: angular.copy(lineItem.lotOptionsClone),
                isKit: lineItem.isKit,
                isMainGroup: false,
                programId: lineItem.programId,
                location: angular.copy(lineItem.location),
                locationOptions:
                isFirstRowToLineItem
                    ? angular.copy(lineItem.locationOptions)
                    : angular.copy(lineItem.locationOptionsClone),
                locationOptionsClone: angular.copy(lineItem.locationOptionsClone),
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
                getRowTemplateData(tableLineItem, isFirstRowToLineItem));
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
                var location =  item.locationCode ? _.find(item.locationOptions, function(locationItem) {
                    return locationItem.locationCode === item.locationCode;
                }) : null;

                var baseInfo = _.omit(item, ['lotCode', 'lotId', 'expirationDate']);
                return _.extend(baseInfo, {
                    $errors: {},
                    lot: lot,
                    stockOnHand: _.get(lot, ['stockOnHand'], 0),
                    location: location,
                    isMainGroup: isMainGroup,
                    programId: getProgramId(orderableGroups, item)
                });
            });
        }

        /* todo  add lotoption locationOption and locationsInfo to item */
        this.prepareAddedLineItems = function(draftInfo, locations,  orderableGroups, reasons, areaLocationInfo) {
            var $this = this;
            var lineItems = _.get(draftInfo, 'lineItems', []);
            var mapOfIdAndOrderable = getMapOfIdAndOrderable(orderableGroups);
            return getMapOfIdAndLot(lineItems).then(function(mapOfIdAndLot) {
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
                        newItem.orderableId = orderableId;

                        var newItemCopy = angular.copy(newItem);

                        delete newItemCopy.location;
                        var lotOptions = SiglusLocationCommonUtilsService.getLotList(
                            newItemCopy,
                            SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)
                        );

                        newItem.lotOptionsClone = _.clone(lotOptions);
                        newItem.locationOptionsClone = _.clone(areaLocationInfo);
                        newItem.isKit = !!(newItem.orderable && newItem.orderable.isKit);
                        var locationsClone = angular.copy(locations);
                        var locationsInfo = _.chain(locationsClone).map(function(location) {
                            location.lots =  _.filter(location.lots, function(lotItem) {
                                return lotItem.orderableId === orderableId;
                            });
                            return location;
                        })
                            .filter(function(location) {
                                return location.lots.length  > 0;
                            })
                            .value();

                        newItem.locationsInfo = locationsInfo;
                        newItem = _.extend(draftLineItem, newItem);
                        var filteredReasons = filterReasonsByProduct(reasons, newItem.orderable.programs);
                        newItem.reason = _.find(filteredReasons, function(reason) {
                            return reason.id === draftLineItem.reasonId;
                        });
                        var locationsGroup = [], lotsGroup = [];

                        if (_.get(newItem, ['reason', 'reasonType']) === REASON_TYPES.DEBIT) {

                            var locationsInfoCopy =  _.filter(angular.copy(locationsInfo), function(locationsInfoItem) {
                                locationsInfoItem.lots = _.filter(locationsInfoItem.lots, function(
                                    lotItem
                                ) {
                                    return lotItem.stockOnHand > 0;
                                });
                                return locationsInfoItem.lots.length > 0;
                            });
                            _.each(locationsInfoCopy, function(item) {
                                var newLocation = {};
                                newLocation.locationCode = item.locationCode;
                                newLocation.area = item.area;
                                locationsGroup.push(newLocation);
                                _.each(_.get(item, ['lots']), function(lotItem) {
                                    lotsGroup.push(lotItem);
                                });
                            });

                            lotsGroup = _.uniq(lotsGroup, function(lotItem) {
                                return lotItem.lotId;
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
                                return mapDataToDisplay(group, true, locations, orderableGroups);
                            }
                            var firstRow = $this.getMainGroupRow(group[0]);
                            var result = [];
                            result.push(firstRow);

                            var childrenLineItems =
                        mapDataToDisplay(group, false, locations, orderableGroups);
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
