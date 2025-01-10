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
     * @ngdoc controller
     * @name shipment-view.controller:ShipmentViewController
     *
     * @description
     * Responsible for managing shipment view screen.
     */
    angular
        .module('siglus-location-shipment-view')
        .controller('SiglusLocationShipmentViewController', SiglusLocationShipmentViewController);

    SiglusLocationShipmentViewController.$inject = [
        '$scope',
        'shipment', 'loadingModalService', '$state', 'fulfillmentUrlFactory',
        'messageService', 'updatedOrder', 'QUANTITY_UNIT',
        'selectProductsModalService', 'OpenlmisArrayDecorator', 'alertService', '$q',
        'stockCardSummaries', 'orderService',
        'displayTableLineItems', 'filterDisplayTableLineItems',
        '$stateParams', 'order', 'moment', 'SiglusLocationViewService',
        'prepareRowDataService', 'SiglusLocationCommonUtilsService',
        'notificationService', 'confirmService',
        'locations', 'siglusLocationCommonApiService',
        'localStorageService', '$window', 'facility', 'siglusPrintPalletLabelComfirmModalService',
        'suggestedQuatity', 'siglusShipmentConfirmModalService', 'SIGLUS_TIME',
        'alertConfirmModalService', 'StockCardSummaryRepositoryImpl', 'summaryRequestBody'
    ];

    function SiglusLocationShipmentViewController(
        $scope, shipment, loadingModalService, $state,
        fulfillmentUrlFactory, messageService,
        updatedOrder, QUANTITY_UNIT,
        selectProductsModalService, OpenlmisArrayDecorator, alertService, $q,
        stockCardSummaries,
        orderService,
        displayTableLineItems, filterDisplayTableLineItems, $stateParams,
        order, moment,
        SiglusLocationViewService,
        prepareRowDataService,
        SiglusLocationCommonUtilsService,
        notificationService, confirmService,
        locations, siglusLocationCommonApiService,
        localStorageService, $window, facility,
        siglusPrintPalletLabelComfirmModalService,
        suggestedQuatity, siglusShipmentConfirmModalService, SIGLUS_TIME,
        alertConfirmModalService, StockCardSummaryRepositoryImpl, summaryRequestBody
    ) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.addProducts = addProducts;
        vm.changeSkipStatus = changeSkipStatus;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;
        vm.canSkip = canSkip;
        vm.saveAndPrintShipment = saveAndPrintShipment;
        vm.order = undefined;
        vm.facility = undefined;
        vm.summaries = undefined;

        vm.shipment = undefined;
        vm.quantityUnit = undefined;

        vm.displayTableLineItems = undefined;
        vm.keyword = '';

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getValidLotList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations));
        };

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations));
        };

        function sortLineItemLotsByExpiryDate(displayLineItems) {
            return displayLineItems.map(function(lineItemGroup) {
                if (lineItemGroup.length === 1) {
                    return lineItemGroup;
                }
                var sortedLineItems = lineItemGroup.slice(1).sort(function(item1, item2) {
                    var item1Date = _.get(item1, ['lot', 'expirationDate'], 0);
                    var item2Date = _.get(item2, ['lot', 'expirationDate'], 0);
                    return new Date(item1Date) - new Date(item2Date);
                });
                return [lineItemGroup[0]].concat(sortedLineItems);
            });
        }

        function onInit() {
            vm.order = updatedOrder;
            vm.shipment = _.clone(shipment);
            vm.displayTableLineItems = suggestedQuatity.orderableIdToSuggestedQuantity ?
                setSuggestedQuantity(displayTableLineItems) :
                displayTableLineItems;
            vm.filterDisplayTableLineItems = sortLineItemLotsByExpiryDate(filterDisplayTableLineItems);
            vm.isShowSuggestedQuantity = suggestedQuatity.showSuggestedQuantity;
            vm.orderableIdToSuggestedQuantity = suggestedQuatity.orderableIdToSuggestedQuantity;
            vm.facility = facility;
            vm.keyword = $stateParams.keyword;
            vm.summaries = stockCardSummaries;
            $stateParams.order = order;
            $stateParams.stockCardSummaries = stockCardSummaries;
            $stateParams.shipment = shipment;
            $stateParams.displayTableLineItems = vm.displayTableLineItems;
        }

        function setSuggestedQuantity(items) {
            var suggestedQuatityMap = suggestedQuatity.orderableIdToSuggestedQuantity;
            _.forEach(items, function(item) {
                _.forEach(item, function(lineItem) {
                    lineItem.suggestedQuantity =
                        _.includes([null, undefined], suggestedQuatityMap[lineItem.orderable.id]) ?
                            '' :
                            suggestedQuatityMap[lineItem.orderable.id];
                });
            });
            return items;
        }

        function validateNotFirstToExpire(item) {
            if (!item.$error.lotCodeError) {
                var lotOptions = _.filter(SiglusLocationCommonUtilsService.getLotList(item,
                    SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)), function(lot) {
                    return moment().isBefore(moment(lot.expirationDate));
                });

                var hasOldLotCode = _.some(lotOptions, function(lotOption) {
                    return item.lot && moment(item.lot.expirationDate)
                        .isAfter(moment(lotOption.expirationDate));
                });

                if (hasOldLotCode) {
                    item.$hint.lotCodeHint = 'locationShipmentView.notFirstToExpire';
                }
            }
        }

        function validateBase(lineItems, callback) {
            _.forEach(lineItems, function(item, $index) {
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.lot && data.location && _.get(item, ['lot', 'lotCode']) === data.lot.lotCode
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
                })) > 1;

                if (hasDuplicated) {
                    item.$error.lotCodeError = 'locationShipmentView.lotDuplicated';
                } else {
                    callback(item, $index);

                    validateNotFirstToExpire(item);
                }
            });
        }

        function validateLot(lineItem, lineItems, index) {
            lineItem.$error.lotCodeError = '';

            validateBase(lineItems, function(item, $index) {
                if (index === $index && _.isEmpty(item.lot)) {
                    item.$error.lotCodeError = 'openlmisForm.required';
                    return;
                }
                item.$error.lotCodeError = '';
                item.$hint.lotCodeHint = '';
            });
            lotOrLocationChangeEmitValidation(lineItem, lineItems, index);
        }

        vm.changeLot = function(lineItem, lineItems, index) {
            validateLot(lineItem, lineItems, index);
        };

        function lotOrLocationChangeEmitValidation(lineItem, lineItems, index) {
            var hasKitLocation = lineItem.isKit && !_.isEmpty(lineItem.location);
            var hasBothLocationAndLot = !lineItem.isKit && !_.isEmpty(lineItem.location)
              && !_.isEmpty(lineItem.lot);
            var hasQuantityShippedFilled = !_.isNull(_.get(lineItem, 'quantityShipped'));
            if ((hasKitLocation || hasBothLocationAndLot) && hasQuantityShippedFilled) {
                validateFillQuantity(lineItems, index);
            }
        }

        function validateLocationDuplicated(lineItems) {
            _.forEach(lineItems, function(item) {
                if (item.$error.locationError === 'openlmisForm.required') {
                    return;
                }
                item.$error.locationError = '';
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.location
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
                })) > 1;
                if (hasDuplicated) {
                    item.$error.locationError = 'locationShipmentView.locationDuplicated';
                }
            });
        }

        function validateLocationDuplicatedForRemove(lineItems) {
            _.forEach(lineItems, function(item) {
                item.$error.locationError = '';
                if (_.isEmpty(item.location)) {
                    item.$error.locationError = 'openlmisForm.required';
                    return;
                }
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.location
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
                })) > 1;
                if (hasDuplicated) {
                    item.$error.locationError = 'locationShipmentView.locationDuplicated';
                }
            });
        }

        vm.changeLocation = function(lineItem, lineItems, index) {
            lineItem.$error.locationError = '';
            if (lineItem.isKit) {
                if (_.isEmpty(_.get(lineItem.location, 'locationCode'))) {
                    lineItem.$error.locationError = 'openlmisForm.required';
                }
                validateLocationDuplicated(lineItems);
            } else {
                validateBase(lineItems, function(item, $index) {
                    if (_.isEmpty(lineItem.location) && $index === index) {
                        lineItem.$error.locationError = 'openlmisForm.required';
                    }
                    item.$error.lotCodeError = '';
                    item.$hint.lotCodeHint = '';

                    if (_.isEmpty(item.lot) && $index === index) {
                        item.$error.lotCodeError = 'openlmisForm.required';
                    }
                });
            }
            validateFillQuantity(lineItems, index);
        };

        function validateFillQuantity(lineItems, index) {
            var currentItem = lineItems[index];
            currentItem.$error.quantityShippedError = '';
            if (!_.isNumber(currentItem.quantityShipped)) {
                currentItem.$error.quantityShippedError = 'locationShipmentView.inputPositiveNumber';
                return;
            }

            if (vm.getReservedSoh(lineItems, index) > getSohByOrderableLocation(currentItem)) {
                currentItem.$error.quantityShippedError = 'shipment.fillQuantityCannotExceedStockOnHand';
            }
        }

        function getSohByOrderableLocation(lineItem) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            var lot = _.chain(orderableLocationLotsMap[lineItem.orderableId])
                .get(_.get(lineItem.location, 'locationCode'))
                .find(function(item) {
                    return lineItem.isKit ? _.isEmpty(item.lotCode)
                        : item.lotCode === _.get(lineItem.lot, 'lotCode');
                })
                .value();
            return _.get(lot, 'stockOnHand', 0);
        }

        vm.changeFillQuantity = validateFillQuantity;

        vm.addLot = function(currentItem, lineItems) {
            prepareRowDataService.addLot(currentItem, lineItems);
        };

        vm.removeItem = function(lineItems, index) {
            var isKit = lineItems[index].isKit;
            if (lineItems.length === 1) {
                vm.order.orderLineItems = _.filter(vm.order.orderLineItems, function(orderLineItem) {
                    return orderLineItem.orderable.id !== lineItems[0].orderableId;
                });
                lineItems.splice(0, 1);
            } else if (lineItems.length === 3) {
                var remainRowData = index > 1 ? lineItems[1] : lineItems[2];
                lineItems[0].lot = remainRowData.lot;
                lineItems[0].location = remainRowData.location;
                lineItems[0].quantityShipped = remainRowData.quantityShipped;
                lineItems[0].$error = remainRowData.$error;
                lineItems[0].$hint = remainRowData.$hint;
                lineItems.splice(1, 2);
            } else if (lineItems.length > 3) {
                lineItems.splice(index, 1);
            }

            if (isKit) {
                validateLocationDuplicatedForRemove(lineItems);
            } else {
                validateBase(lineItems, function(item) {
                    item.$error.lotCodeError = '';
                    item.$hint.lotCodeHint = '';
                });
            }

            vm.displayTableLineItems = _.filter(vm.displayTableLineItems, function(item) {
                return !_.isEmpty(item);
            });
            $stateParams.displayTableLineItems = _.clone(vm.displayTableLineItems);
            reloadParams();
        };

        function reloadParams() {
            $stateParams.page = 0;
            $stateParams.keyword = vm.keyword;
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        function recalculateQuantity(quantity, lineItem) {
            if (vm.showInDoses()) {
                var netContent =  _.get(lineItem, 'netContent', 1);
                return quantity * netContent;
            }
            return quantity;
        }

        vm.getOrderQuantity = function(lineItems, index) {
            if (index === 0) {
                var quantity = _.reduce(lineItems, function(orderedQuantity, item) {
                    return orderedQuantity + _.get(item, 'orderedQuantity', 0);
                }, 0);
                return recalculateQuantity(quantity, lineItems[index]);
            }
            return recalculateQuantity(_.get(lineItems[index], 'orderedQuantity', 0), lineItems[index]);
        };

        vm.getFillQuantity = function(lineItems, index) {
            if (index === 0) {
                return _.reduce(lineItems, function(fillQuantity, item) {
                    return fillQuantity + _.get(item, 'quantityShipped') || 0;
                }, 0);
            }
            return _.get(lineItems[index], 'quantityShipped', 0);

        };

        function getSohByOrderableAndLocation(lineItem) {
            return recalculateQuantity(getSohByOrderableLocation(lineItem));
        }

        vm.getAvailableSoh = function(lineItems, index) {
            if (index === 0) {
                return _.reduce(lineItems, function(availableSoh, lineItem) {
                    return availableSoh + getSohByOrderableAndLocation(lineItem);

                }, 0);
            }
            return getSohByOrderableAndLocation(lineItems[index]);

        };

        vm.getRemainingSoh = function(lineItems, index) {
            var quantity = vm.getAvailableSoh(lineItems, index) - vm.getReservedSoh(lineItems, index);
            return quantity < 0 ? 0 : quantity;
        };

        vm.getReservedSoh = function(lineItems, index) {
            var currentLineItem = lineItems[index];
            if (!currentLineItem.lot || !_.get(currentLineItem, ['location', 'locationCode'])) {
                return 0;
            }
            var currentOrderableId = currentLineItem.orderableId;
            var currentLotId = currentLineItem.lot.id;
            var currentLocationCode = currentLineItem.location.locationCode;

            // for main group with multiple lineItems
            if (index === 0 && lineItems.length > 1) {
                return _.reduce(lineItems.slice(1), function(reservedStockSum, _, index) {
                    return reservedStockSum + vm.getFillQuantity(lineItems, index) +
                        getReservedSohFromSummaries(
                            vm.summaries, currentOrderableId, currentLotId, currentLocationCode
                        );
                }, 0);
            }
            // for one location-lot lineItem
            return vm.getFillQuantity(lineItems, index) +
                getReservedSohFromSummaries(
                    vm.summaries, currentOrderableId, currentLotId, currentLocationCode
                );
        };

        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        function printShipment() {
            var cachedData =  _.chain(vm.displayTableLineItems)
                .map(function(group) {
                    return _.filter(group, function(lineItem) {
                        return (lineItem.isMainGroup && group.length > 1) ||
                            lineItem.quantityShipped > 0 && (lineItem.isKit || lineItem.lot
                                && moment().isBefore(moment(lineItem.lot.expirationDate)));
                    });
                })
                .filter(function(group) {
                    return _.size(group) > 0;
                })
                .value();
            localStorageService.add('shipmentViewData', JSON.stringify(cachedData));
            localStorageService.add('locations', JSON.stringify(locations));
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'orders/fulfillment/report?id='
                + $stateParams.id;
            $window.open(
                PRINT_URL,
                '_blank'
            );
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name getSelectedQuantityUnitKey
         *
         * @description
         * Returns message key for selected quantity unit.
         */
        function getSelectedQuantityUnitKey() {
            return QUANTITY_UNIT.$getDisplayName(vm.quantityUnit);
        }

        function addProducts() {
            var availableProducts = getAvailableProducts();
            selectProducts({
                products: availableProducts
            })
                .then(function(selectedProducts) {
                    loadingModalService.open();
                    siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                        isAdjustment: false,
                        extraData: true
                    }, _.map(selectedProducts, function(orderable) {
                        return orderable.id;
                    }))
                        .then(function(locationsInfo) {
                            locations = locations.concat(locationsInfo);
                            var addedProductRows = prepareRowDataService.prepareAddProductLineItem(selectedProducts);
                            var addedOrderLineItems = prepareOrderLineItems(selectedProducts);
                            vm.order.orderLineItems = vm.order.orderLineItems.concat(addedOrderLineItems);
                            vm.displayTableLineItems = vm.displayTableLineItems.concat(
                                _.map(addedProductRows, function(item) {
                                    return [item];
                                })
                            );
                            $stateParams.displayTableLineItems = angular.copy(vm.displayTableLineItems);
                            $stateParams.order = vm.order;
                            $stateParams.locations = locations;
                            reloadParams();
                        })
                        .finally(function() {
                            loadingModalService.close();
                        });

                });
        }

        function selectProducts(availableProducts) {
            var decoratedAvailableProducts = new OpenlmisArrayDecorator(availableProducts.products);
            decoratedAvailableProducts.sortBy('productCode');

            if (!availableProducts.products.length) {
                alertService.error(
                    'shipmentView.noProductsToAdd.label',
                    'shipmentView.noProductsToAdd.message'
                );
                return $q.reject();
            }

            return selectProductsModalService.show({
                products: decoratedAvailableProducts,
                stateParams: _.clone($stateParams),
                limit: vm.order.emergency ? {
                    max: 10 - vm.order.orderLineItems.length,
                    errorMsg: 'shipmentView.selectTooMany'
                } : undefined
            });
        }

        function getAvailableProducts() {
            var existedOrderableMap = {};
            vm.order.orderLineItems.forEach(function(lineItem) {
                existedOrderableMap[lineItem.orderable.id] = lineItem.orderable;
            });
            return vm.order.availableProducts.filter(function(orderable) {
                return !(orderable.id in existedOrderableMap);
            });
        }

        function prepareOrderLineItems(selectedProducts) {
            return selectedProducts.map(function(orderable) {
                return {
                    orderedQuantity: 0,
                    orderable: orderable,
                    partialFulfilledQuantity: 0,
                    added: true,
                    skipped: false
                };
            });
        }

        function skipAllLineItems() {
            vm.displayTableLineItems.forEach(function(lineItemGroup) {
                _.forEach(lineItemGroup, function(lineItem) {
                    if (!lineItem.skipped && lineItemGroup.length === 1 && canSkip(lineItemGroup)) {
                        lineItem.skipped = true;
                        clearErrorAndHint(lineItem);
                        updateOrderSkipStatus();
                    }
                });
            });
        }

        function unskipAllLineItems() {
            vm.displayTableLineItems.forEach(function(lineItemGroup) {
                _.forEach(lineItemGroup, function(lineItem) {
                    if (lineItem.skipped && canSkip(lineItemGroup)) {
                        lineItem.skipped = false;
                        updateOrderSkipStatus();
                    }
                });
            });
        }

        function clearErrorAndHint(lineItem) {
            lineItem.$error = {};
            lineItem.$hint = {};
        }

        function changeSkipStatus(currentItem, lineItems) {
            _.forEach(lineItems, function(lineItem) {
                lineItem.skipped = currentItem.skipped;
                updateOrderSkipStatus();
                if (currentItem.skipped) {
                    clearErrorAndHint(lineItem);
                }
            });
        }

        function canSkip(lineItems) {
            return  _.every(lineItems, function(lineItem) {
                return !_.isNumber(lineItem.quantityShipped) || lineItem.quantityShipped === 0;
            });
        }

        vm.showEmptyBlockWithKit = function(lineItem, lineItems) {
            return vm.showEmptyBlock(lineItem, lineItems) || lineItem.isKit;
        };

        vm.showEmptyBlock = function(lineItem, lineItems) {
            return lineItem.isMainGroup && lineItems.length > 1;
        };

        vm.showEditableBlockWithLots = function(lineItem, lineItems) {
            return vm.showEditableBlocks(lineItem, lineItems) && !lineItem.isKit;
        };

        vm.showEditableBlocks = function(lineItem, lineItems) {
            return (lineItem.isMainGroup && lineItems.length === 1) || (!lineItem.isMainGroup && lineItems.length > 1);
        };

        vm.isEmptyRow = function(lineItem, lineItems, index) {
            var lots = _.filter(SiglusLocationCommonUtilsService.getLotsByOrderableId(locations, lineItem.orderableId)
                , function(item) {
                    if (lineItem.isKit) {
                        return true;
                    }
                    return moment().isBefore(moment(item.expirationDate));
                });
            var totalSoh = _.reduce(lots, function(sum, lot) {
                return sum + (lot.stockOnHand || 0);
            }, 0);
            return totalSoh === 0 && (lineItems.length - 1 === index);
        };

        function validateRequired(lineItem, lineItems, index) {
            if (vm.isEmptyRow(lineItem, lineItems, index)) {
                return;
            }
            if (lineItem.quantityShipped === 0) {
                lineItem.$error = {};
                return;
            }

            if (_.isEmpty(lineItem.lot) && !lineItem.isKit) {
                lineItem.$error.lotCodeError = 'openlmisForm.required';
            }

            if (_.isEmpty(lineItem.location)) {
                lineItem.$error.locationError = 'openlmisForm.required';
            }

        }

        function validateDuplicated(lineItems, item) {
            var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                return data.lot && data.location && _.get(item, ['lot', 'lotCode']) === data.lot.lotCode
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
            })) > 1;

            if (hasDuplicated) {
                item.$error.lotCodeError = 'locationShipmentView.lotDuplicated';
            }
        }

        function validateKitLocationDuplicated(lineItems, item) {
            var hasKitLocationDuplicated = _.size(_.filter(lineItems, function(data) {
                return data.location
                  && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
            })) > 1;

            if (hasKitLocationDuplicated) {
                item.$error.locationError = 'locationShipmentView.locationDuplicated';
            }
        }

        function isTableFormValid() {
            _.forEach(vm.displayTableLineItems, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    if (index === 0 && lineItems.length !== 1 || lineItem.skipped) {
                        lineItem.$error = {};
                    } else {
                        validateRequired(lineItem, lineItems, index);
                        if (lineItem.isKit) {
                            validateKitLocationDuplicated(lineItems, lineItem);
                        } else {
                            validateDuplicated(lineItems, lineItem);
                        }
                        validateFillQuantity(lineItems, index);
                    }
                });
            });

            return _.every(vm.displayTableLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            });
        }

        function updateOrderSkipStatus() {
            _.forEach(vm.order.orderLineItems, function(orderLineItem) {
                orderLineItem.skipped = _.chain(vm.displayTableLineItems)
                    .flatten()
                    .find(function(item) {
                        return item.orderableId === orderLineItem.orderable.id;
                    })
                    .get('skipped')
                    .value();
            });
        }

        function buildSaveParams(isSubmit) {
            var lineItems = _.chain(vm.displayTableLineItems)
                .map(function(group) {
                    var data =  _.filter(group, function(lineItem) {
                        return (group.length > 1 && !lineItem.isMainGroup)
                         || (group.length === 1 && lineItem.isMainGroup);
                    });
                    return data;
                })
                .flatten()
                .filter(function(lineItem) {
                    return isSubmit ? !lineItem.skipped : true;
                })
                .map(function(lineItem) {
                    var lot = lineItem.lot;
                    return {
                        lot: _.isEmpty(lot) ? null : {
                            id: lot.id
                        },
                        location: lineItem.location,
                        id: lineItem.id,
                        orderable: lineItem.orderable,
                        quantityShipped: lineItem.quantityShipped,
                        stockOnHand: getSohByOrderableLocation(lineItem)
                    };
                })
                .value();
            return {
                id: shipment.id,
                order: vm.order,
                notes: null,
                lineItems: lineItems
            };
        }

        function getPartialFulfilledLineItems(unskippedLineItems) {
            var totalPartialLineItems = 0;
            unskippedLineItems.forEach(function(lineItems) {
                if (!lineItems[0].added) {
                    var totalQuantityShipped = _.reduce(lineItems, function(sum, lineItem) {
                        return sum + (lineItem.quantityShipped || 0);
                    }, 0);
                    if (totalQuantityShipped + lineItems[0].partialFulfilledQuantity < lineItems[0].orderedQuantity) {
                        totalPartialLineItems = totalPartialLineItems + 1;
                    }
                }
            });
            return totalPartialLineItems;
        }

        vm.submit = _.throttle(submit, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        function haveFulfilledLineItem(shipmentList, unskippedLineItems) {
            return _.some(unskippedLineItems, function(lineItem) {
                return getTotalQuantityShipped(lineItem);
            });
        }

        function getTotalQuantityShipped(orderLineItem) {
            var totalQuantityShipped = 0;
            orderLineItem.forEach(function(lineItem) {
                totalQuantityShipped = totalQuantityShipped + lineItem.quantityShipped;
            });
            return totalQuantityShipped;
        }

        function submit() {
            if (!isTableFormValid()) {
                alertService.error(messageService.get('openlmisForm.formInvalid'));
                return;
            }
            var unskippedLineItems = _.filter(vm.displayTableLineItems, function(lineItems) {
                return !lineItems[0].skipped;
            });
            if (unskippedLineItems.length === 0) {
                return alertService.error('shipmentView.allLineItemsSkipped');
            }

            if (!haveFulfilledLineItem(vm.displayTableLineItems, unskippedLineItems)) {
                return alertService.error('shipmentView.allLineItemsNotFulfilled');
            }

            return orderService.getStatus(vm.order.id).then(function(result) {
                if (result.suborder && result.closed) {
                    return alertService.error('shipmentView.closed');
                }

                siglusPrintPalletLabelComfirmModalService.show().then(function(result) {
                    if (result) {
                        downloadPrint();
                    }
                    var totalPartialLineItems = getPartialFulfilledLineItems(unskippedLineItems);
                    var isPartialFulfilled = !result.closed && totalPartialLineItems > 0;

                    var confirmModalText = isPartialFulfilled ?
                        messageService.get('shipmentView.confirmPartialFulfilled.message', {
                            totalPartialLineItems: totalPartialLineItems
                        }) : 'shipmentView.confirmShipment.question';
                    var confirmButtonText = isPartialFulfilled ?
                        'shipmentView.confirmPartialFulfilled.createSuborder' : 'shipmentView.confirmShipment';

                    return siglusShipmentConfirmModalService.confirm(confirmModalText, confirmButtonText)
                        .then(function(signature) {
                            loadingModalService.open();
                            return createOrder(isPartialFulfilled, signature)
                                .then(function() {
                                    notificationService.success('shipmentView.suborderHasBeenConfirmed');
                                    $state.go('openlmis.orders.fulfillment');
                                })
                                .catch(function(error) {
                                    if (_.get(error, ['data', 'messageKey']) ===
                                                'siglusapi.error.order.expired') {
                                        alertConfirmModalService.error(
                                            'orderFulfillment.expiredMessage', '',
                                            ['adminFacilityList.close', 'adminFacilityList.confirm']
                                        )
                                            .then(function() {
                                                $state.go('openlmis.orders.fulfillment', $stateParams, {
                                                    reload: true
                                                });
                                            });
                                    } else if (_.get(error, ['data', 'messageKey']) ===
                                            'siglusapi.error.shipment.order.line items.invalid') {
                                        handleStockError();
                                    } else {
                                        var errorText = isPartialFulfilled ?
                                            'shipmentView.failedToCreateSuborder' :
                                            'shipmentView.failedToConfirmShipment';
                                        notificationService.error(errorText);
                                    }
                                })
                                .finally(function() {
                                    loadingModalService.close();
                                });
                        });
                });
            });
        }

        function createOrder(isPartialFulfilled, signature) {
            if (isPartialFulfilled) {
                return SiglusLocationViewService.createSubOrder(buildSaveParams(true), signature);
            }
            return SiglusLocationViewService.submitOrder(buildSaveParams(true), signature);
        }

        function downloadPrint() {
            var printLineItems = _.chain(vm.displayTableLineItems)
                .map(function(group) {
                    var data =  _.filter(group, function(lineItem) {
                        return (group.length > 1 && !lineItem.isMainGroup)
                     || (group.length === 1 && lineItem.isMainGroup);
                    });
                    return data;
                })
                .flatten()
                .filter(function(lineItem) {
                    return !lineItem.skipped;
                })
                .value();
            var newPrintLineItems = _.chain(printLineItems)
                .map(function(item) {
                    var result = {};
                    result.productName = _.get(item, ['productName']);
                    result.productCode = _.get(item, ['productCode']);
                    result.lotCode = _.get(item, ['lot', 'lotCode']);
                    result.expirationDate = _.get(item, ['lot', 'expirationDate']);
                    result.location = _.get(item, ['location', 'locationCode']);
                    result.pallet =
                    Number(getSohByOrderableLocation(item)) -
                    Number(_.get(item, ['quantityShipped']));
                    result.pack = null;
                    return result;
                })
                .filter(function(item) {
                    return item.pallet > 0;
                })
                .value();

            vm.printLineItems = newPrintLineItems;
        }

        vm.delete = function() {
            confirmService.confirmDestroy(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            )
                .then(function() {
                    loadingModalService.open();
                    SiglusLocationViewService.deleteDraft({
                        id: shipment.id
                    })
                        .then(function() {
                            notificationService.success('shipmentView.draftHasBeenDeleted');
                            $state.go('openlmis.orders.fulfillment');
                        })
                        .catch(function() {
                            notificationService.error('shipmentView.failedToDeleteDraft');
                            loadingModalService.close();

                        });
                });
        };

        vm.save = function(shouldPrintShipment) {
            if (!isTableFormValid()) {
                alertService.error(messageService.get('openlmisForm.formInvalid'));
                return;
            }
            loadingModalService.open();
            SiglusLocationViewService.saveDraft(buildSaveParams())
                .then(function() {
                    notificationService.success('shipmentView.draftHasBeenSaved');
                    if (shouldPrintShipment) {
                        printShipment();
                    }
                })
                .catch(function(error) {
                    if (_.get(error, ['data', 'messageKey']) ===
                        'siglusapi.error.shipment.order.line items.invalid') {
                        handleStockError();
                    } else {
                        notificationService.error('shipmentView.failedToSaveDraft');
                    }
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        function saveAndPrintShipment() {
            vm.save(true);
        }

        function handleStockError() {
            alertService.error('shipmentView.saveDraftError.label', '', 'OK')
                .then(function() {
                    loadingModalService.open();
                    new StockCardSummaryRepositoryImpl()
                        .queryWithStockCardsForLocation(summaryRequestBody)
                        .then(function(summaries) {
                            vm.summaries = summaries;
                            $stateParams.stockCardSummaries = summaries;
                            updateLineItemsSoh(summaries);
                            vm.cancelFilter();
                        })
                        .catch(function(error) {
                            notificationService.error(error);
                            throw new Error(error);
                        })
                        .finally(function() {
                            loadingModalService.close();
                        });
                });
        }

        function updateLineItemsSoh(summaries) {
            vm.displayTableLineItems.forEach(function(lineItemGroup) {
                var currentGroupOrderableId = lineItemGroup[0].orderableId;
                var summary = summaries.find(function(summary) {
                    return summary.orderable.id === currentGroupOrderableId;
                });

                lineItemGroup.forEach(function(lineItem) {
                    if (lineItemGroup.length > 1 && lineItem.isMainGroup) {
                        return;
                    }
                    if (!lineItem.lot || !lineItem.location.locationCode) {
                        return;
                    }

                    var locationCode = _.get(lineItem, ['location', 'locationCode']);
                    var currentLotId = _.get(lineItem, ['lot', 'id']);

                    var targetLotDetail = summary.stockCardDetails.find(function(detail) {
                        return detail.lot.id  === currentLotId;
                    });

                    var targetLotDetailWithLocation = targetLotDetail.lotLocationSohDtoList.find(
                        function(detailWithLocation) {
                            return  detailWithLocation.locationCode === locationCode;
                        }
                    );

                    lineItem.lot.stockOnHand = _.get(targetLotDetailWithLocation, ['stockOnHand']);
                });
            });
        }

        function getReservedSohFromSummaries(summaries, orderableId, lotId, locationCode) {
            var summary = summaries.find(function(summary) {
                return summary.orderable.id === orderableId;
            });
            if (!summary) {
                return 0;
            }

            var stockCardDetail = summary.stockCardDetails.find(function(stockCardDetail) {
                return stockCardDetail.lot.id === lotId;
            });
            if (!stockCardDetail) {
                return 0;
            }

            var lotItemWithLocationInfo = stockCardDetail.lotLocationSohDtoList.find(function(lotItemWithLocationInfo) {
                return lotItemWithLocationInfo.locationCode === locationCode;
            });
            return lotItemWithLocationInfo ? lotItemWithLocationInfo.reservedStock : 0;
        }

        vm.search = function() {
            reloadParams();
        };

        vm.cancelFilter = function() {
            vm.keyword = null;
            reloadParams();
        };
    }
})();
