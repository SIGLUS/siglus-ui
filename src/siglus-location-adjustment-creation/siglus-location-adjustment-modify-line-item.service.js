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
                documentationNo: lineItem.documentationNo ? lineItem.documentationNo : null,
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
            lineItem.documentationNo = null;
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
                locationsInfo: lineItem.locationsInfo,
                lotOptionsClone: lineItem.lotOptionsClone,
                locationOptionsClone: lineItem.locationOptionsClone,
                lot: null,
                stockOnHand: 0,
                isKit: lineItem.isKit,
                isMainGroup: true,
                location: null,
                reason: null,
                reasonFreeText: null,
                documentationNo: null,
                quantity: null
            };
        };

        this.getAddProductRow = function(product) {
            return {
                $errors: {},
                orderable: product,
                orderableId: product.orderableId,
                productCode: product.productCode,
                productName: $filter('productName')(product),
                lot: null,
                stockOnHand: 0,
                isKit: product.isKit,
                isMainGroup: true,
                location: null,
                programId: product.programId,
                reason: null,
                reasonFreeText: null,
                documentationNo: null,
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

        function getProgramId(productList, lineItem) {
            var item = _.find(productList, function(product) {
                return product.orderableId === lineItem.orderableId;
            });
            return item.programId;
        }

        function mapDataToDisplay(group, isMainGroup, locations, productList) {
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
                    stockOnHand: baseInfo.isKit ? getKitStockOnHand(baseInfo) : _.get(lot, ['stockOnHand'], 0),
                    location: location,
                    isMainGroup: isMainGroup,
                    programId: getProgramId(productList, item)
                });
            });
        }
        function getKitStockOnHand(item) {
            var mapKit = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(item.locationsInfo);
            return _.get(mapKit[item.orderableId],
                [item.location.locationCode, 0, 'stockOnHand'], 0);
        }

        this.prepareAddedLineItems = function(draftInfo, locations,  productList, reasons, areaLocationInfo) {
            var $this = this;
            var lineItems = _.get(draftInfo, 'lineItems', []);
            var lineItemList =  lineItems.map(function(draftLineItem) {
                var product = _.find(productList, function(item) {
                    return item.orderableId === draftLineItem.orderableId;
                }) || {
                    programs: [],
                    dispensable: {}
                };
                var lot =
                          SiglusLocationCommonUtilsService.getLotByLotId(locations, draftLineItem.lotId) || {};
                var soh =  0;
                var newItem = {
                    $errors: {},
                    $previewSOH: soh,
                    orderable: product,
                    orderableId: draftLineItem.orderableId,
                    lot: lot,
                    stockOnHand: soh,
                    occurredDate: draftLineItem.occurredDate,
                    programId: draftLineItem.programId,
                    documentationNo: draftLineItem.documentationNo || draftLineItem.documentNumber,
                    isKit: product.isKit
                };

                var lotOptions = SiglusLocationCommonUtilsService.getAllLotList(product.orderableId,
                    SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations, true));

                newItem.lotOptionsClone = _.clone(lotOptions);
                newItem.locationOptionsClone = _.clone(areaLocationInfo);
                var locationsInfo = _.chain(angular.copy(locations))
                    .map(function(location) {
                        location.lots =  _.filter(location.lots, function(lotItem) {
                            return lotItem.orderableId === product.orderableId;
                        });
                        return location;
                    })
                    .filter(function(location) {
                        return location.lots.length  > 0;
                    })
                    .value();

                newItem.locationsInfo = locationsInfo;
                newItem = _.extend(draftLineItem, newItem);

                newItem.reason = _.find(reasons, function(reason) {
                    return draftLineItem.reasonId === reason.id;
                });

                if (newItem.locationCode) {
                    newItem.location = _.find(areaLocationInfo, function(item) {
                        return item.locationCode === newItem.locationCode;
                    });
                }

                if (_.get(newItem, ['reason', 'reasonType']) === REASON_TYPES.DEBIT) {
                    newItem.locationOptions = SiglusLocationCommonUtilsService.getLocationList(
                        newItem,
                        SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(newItem.locationsInfo)
                    );
                    newItem.lotOptions = SiglusLocationCommonUtilsService.getLotList(
                        newItem,
                        SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(newItem.locationsInfo)
                    );
                } else {
                    newItem.lotOptions = lotOptions;
                    newItem.locationOptions = areaLocationInfo;
                }
                return newItem;

            });

            return _.chain(lineItemList)
                .groupBy('orderableId')
                .values()
                .map(function(group) {
                    if (group.length === 1) {
                        return mapDataToDisplay(group, true, locations, productList);
                    }
                    var firstRow = $this.getMainGroupRow(group[0]);
                    var result = [];
                    result.push(firstRow);

                    var childrenLineItems =
                        mapDataToDisplay(group, false, locations, productList);
                    return result.concat(childrenLineItems);
                })
                .value();
        };
    }

})();
