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
        'displayTableLineItems',
        '$stateParams', 'order', 'moment', 'SiglusLocationViewService',
        'prepareRowDataService', 'SiglusLocationCommonUtilsService',
        'notificationService', 'confirmService',
        'locations', 'siglusLocationCommonApiService',
        'localStorageService', '$window', 'facility', 'siglusPrintPalletLabelComfirmModalService',
        'suggestedQuatity', 'siglusShipmentConfirmModalService'
    ];

    function SiglusLocationShipmentViewController($scope, shipment, loadingModalService, $state,
                                                  fulfillmentUrlFactory, messageService,
                                                  updatedOrder, QUANTITY_UNIT,
                                                  selectProductsModalService, OpenlmisArrayDecorator, alertService, $q,
                                                  stockCardSummaries,
                                                  orderService,
                                                  displayTableLineItems, $stateParams,
                                                  order, moment,
                                                  SiglusLocationViewService,
                                                  prepareRowDataService,
                                                  SiglusLocationCommonUtilsService,
                                                  notificationService, confirmService,
                                                  locations, siglusLocationCommonApiService,
                                                  localStorageService, $window, facility,
                                                  siglusPrintPalletLabelComfirmModalService,
                                                  suggestedQuatity, siglusShipmentConfirmModalService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.addProducts = addProducts;
        vm.changeSkipStatus = changeSkipStatus;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;
        vm.canSkip = canSkip;
        vm.order = undefined;
        vm.facility = undefined;

        vm.shipment = undefined;
        vm.quantityUnit = undefined;

        vm.displayTableLineItems = undefined;

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations));
        };

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations));
        };

        function onInit() {
            vm.order = updatedOrder;
            vm.shipment = _.clone(shipment);
            vm.displayTableLineItems = displayTableLineItems;
            vm.displayTableLineItems = suggestedQuatity.orderableIdToSuggestedQuantity ?
                setSuggestedQuantity(displayTableLineItems) :
                displayTableLineItems;
            vm.isShowSuggestedQuantity = suggestedQuatity.showSuggestedQuantity;
            vm.orderableIdToSuggestedQuantity = suggestedQuatity.orderableIdToSuggestedQuantity;
            vm.facility = facility;
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

        function validateLotExpired(item) {
            if (!item.$error.lotCodeError && item.lot) {
                var lotExpiredDate = moment(item.lot.expirationDate);
                if (moment().isAfter(lotExpiredDate)) {
                    item.$error.lotCodeError = 'locationShipmentView.lotExpired';
                }
            }
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

                    validateLotExpired(item);

                    validateNotFirstToExpire(item);
                }
            });
        }

        function validateLot(lineItem, lineItems, index) {
            lineItem.$error.lotCodeError = '';

            validateBase(lineItems, function(item, $index) {
                if (index === $index && _.isEmpty(item.lot)) {
                    item.$error.lotCodeError = 'openlmisForm.required';
                    return ;
                }
                item.$error.lotCodeError = '';
                item.$hint.lotCodeHint = '';
            });
            lotOrLocationChangeEmitValidation(lineItem);
        }

        vm.changeLot = function(lineItem, lineItems, index) {
            validateLot(lineItem, lineItems, index);
        };

        function lotOrLocationChangeEmitValidation(lineItem) {
            var hasKitLocation = lineItem.isKit && !_.isEmpty(lineItem.location);
            var hasBothLocationAndLot = !lineItem.isKit && !_.isEmpty(lineItem.location)
              && !_.isEmpty(lineItem.lot);
            var hasQuantityShippedFilled = !_.isNull(_.get(lineItem, 'quantityShipped'));
            if ((hasKitLocation || hasBothLocationAndLot) && hasQuantityShippedFilled) {
                validateFillQuantity(lineItem);
            }
        }

        function validateLocationDuplicated(lineItems) {
            _.forEach(lineItems, function(item) {
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
                if (_.isEmpty(lineItem.location)) {
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
            validateFillQuantity(lineItem);
        };

        function validateFillQuantity(currentItem) {
            currentItem.$error.quantityShippedError = '';
            var quantityShipped = currentItem.quantityShipped;
            if (!_.isNumber(currentItem.quantityShipped) || currentItem.quantityShipped === 0) {
                currentItem.$error.quantityShippedError = 'locationShipmentView.inputPositiveNumber';
                return;
            }

            if (quantityShipped > getSohByOrderableLocation(currentItem)) {
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
            var quantity = vm.getAvailableSoh(lineItems, index) - vm.getFillQuantity(lineItems, index);
            return quantity < 0 ? 0 : quantity;
        };

        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        vm.printShipment = function printShipment() {
            localStorageService.add('shipmentViewData', JSON.stringify(vm.displayTableLineItems));
            localStorageService.add('locations', JSON.stringify(locations));
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'orders/fulfillment/report?id='
                + $stateParams.id;
            $window.open(
                PRINT_URL,
                '_blank'
            );
        };

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
            decoratedAvailableProducts.sortBy('fullProductName');

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
            var lots = SiglusLocationCommonUtilsService.getLotsByOrderableId(locations, lineItem.orderableId);
            var totalSoh = _.reduce(lots, function(sum, lot) {
                return sum + (lot.stockOnHand || 0);
            }, 0);
            return totalSoh === 0 && (lineItems.length - 1 === index);
        };

        function validateRequired(lineItem) {
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
                        validateRequired(lineItem);
                        validateLotExpired(lineItem);
                        if (lineItem.isKit) {
                            validateKitLocationDuplicated(lineItems, lineItem);
                        } else {
                            validateDuplicated(lineItems, lineItem);
                        }
                        validateFillQuantity(lineItem);
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

        vm.submit = function() {
            if (isTableFormValid()) {
                var unskippedLineItems = _.filter(vm.displayTableLineItems, function(lineItems) {
                    return !lineItems[0].skipped;
                });
                if (unskippedLineItems.length === 0) {
                    return alertService.error('shipmentView.allLineItemsSkipped');
                }

                return orderService.getStatus(vm.order.id).then(function(result) {
                    if (result.suborder && result.closed) {
                        return alertService.error('shipmentView.closed');
                    }

                    siglusPrintPalletLabelComfirmModalService.show()
                        .then(function(result) {
                            if (result) {
                                downloadPrint();
                            }
                            var totalPartialLineItems = getPartialFulfilledLineItems(unskippedLineItems);
                            if (!result.closed && totalPartialLineItems) {
                                return siglusShipmentConfirmModalService.confirm(
                                    messageService.get('shipmentView.confirmPartialFulfilled.message', {
                                        totalPartialLineItems: totalPartialLineItems
                                    }), 'shipmentView.confirmPartialFulfilled.createSuborder'
                                )
                                    .then(function(signature) {
                                        loadingModalService.open();
                                        return SiglusLocationViewService.createSubOrder(buildSaveParams(), signature)
                                            .then(function() {
                                                notificationService.success('shipmentView.suborderHasBeenConfirmed');
                                                $state.go('openlmis.orders.fulfillment');
                                            })
                                            .catch(function() {
                                                notificationService.error('shipmentView.failedToCreateSuborder');
                                                loadingModalService.close();
                                            });
                                    });
                            }

                            return siglusShipmentConfirmModalService.confirm(
                                'shipmentView.confirmShipment.question',
                                'shipmentView.confirmShipment'
                            )
                                .then(function(signature) {
                                    loadingModalService.open();
                                    return SiglusLocationViewService.submitOrder(buildSaveParams(true), signature)
                                        .then(function() {
                                            notificationService.success('shipmentView.shipmentHasBeenConfirmed');
                                            $state.go('openlmis.orders.fulfillment');
                                        })
                                        .catch(function() {
                                            notificationService.error('shipmentView.failedToConfirmShipment');
                                            loadingModalService.close();
                                        });
                                });
                        });
                });
            }
            alertService.error(messageService.get('openlmisForm.formInvalid'));

        };

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

        vm.save = function() {
            loadingModalService.open();
            SiglusLocationViewService.saveDraft(buildSaveParams())
                .then(function() {
                    notificationService.success('shipmentView.draftHasBeenSaved');
                    $stateParams.shipment = null;
                    $stateParams.order = null;
                    $stateParams.locations = null;
                    $stateParams.displayTableLineItems = null;
                    $stateParams.stockCardSummaries = null;
                    reloadParams();
                })
                .catch(function() {
                    notificationService.error('shipmentView.failedToSaveDraft');
                    loadingModalService.close();
                });
        };

    }
})();
