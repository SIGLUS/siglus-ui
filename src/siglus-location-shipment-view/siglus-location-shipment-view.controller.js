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
        'shipment', 'loadingModalService', '$state', '$window', 'fulfillmentUrlFactory',
        'messageService', 'accessTokenFactory', 'updatedOrder', 'QUANTITY_UNIT',
        'VVM_STATUS',
        'selectProductsModalService', 'OpenlmisArrayDecorator', 'alertService', '$q',
        'stockCardSummaries', 'SiglusLocationShipmentViewLineItemFactory', 'orderService',
        'displayTableLineItems',
        '$stateParams', 'order', 'moment', 'SiglusLocationViewService',
        'orderableLotsLocationMap', 'orderableLocationLotsMap', 'SiglusLocationCommonUtilsService'
    ];

    function SiglusLocationShipmentViewController($scope, shipment, loadingModalService, $state, $window,
                                                  fulfillmentUrlFactory, messageService, accessTokenFactory,
                                                  updatedOrder, QUANTITY_UNIT, VVM_STATUS,
                                                  selectProductsModalService, OpenlmisArrayDecorator, alertService, $q,
                                                  stockCardSummaries, SiglusLocationShipmentViewLineItemFactory,
                                                  orderService,
                                                  displayTableLineItems, $stateParams,
                                                  order, moment,
                                                  SiglusLocationViewService, orderableLotsLocationMap,
                                                  orderableLocationLotsMap,
                                                  SiglusLocationCommonUtilsService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;

        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;

        // #264: warehouse clerk can add product to orders
        vm.addProducts = addProducts;
        // #264: ends here
        // #287: Warehouse clerk can skip some products in order
        vm.changeSkipStatus = changeSkipStatus;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;
        vm.canSkip = canSkip;
        // #287: ends here

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name order
         * @type {Object}
         *
         * @description
         * Holds order that will be displayed on the screen.
         */
        vm.order = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name shipment
         * @type {Object}
         *
         * @description
         * Holds shipment that will be displayed on the screen.
         */
        vm.shipment = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name quantityUnit
         * @type {Object}
         *
         * @description
         * Holds quantity unit.
         */
        vm.quantityUnit = undefined;

        vm.displayTableLineItems = undefined;

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(lineItem, orderableLocationLotsMap);
        };

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(lineItem, orderableLotsLocationMap);
        };

        function onInit() {
            vm.order = updatedOrder;
            vm.shipment = _.clone(shipment);
            vm.displayTableLineItems = displayTableLineItems;

            $stateParams.order = order;
            $stateParams.stockCardSummaries = stockCardSummaries;
            $stateParams.shipment = shipment;
            $stateParams.displayTableLineItems = vm.displayTableLineItems;
        }

        function resetFirstRow(currentItem) {
            currentItem.lot = null;
            currentItem.shipmentLineItem = {};
            currentItem.location = null;
        }

        function getRowTemplateData(currentItem, lineItems, isFirstRowToLineItem) {
            var lot = lineItems.length === 1 && currentItem.lot;
            var location = lineItems.length === 1 && currentItem.location;
            var shipmentLineItem =  _.clone(_.find(shipment.lineItems, function(item) {
                return item.orderable.id === currentItem.orderableId;
            }) || {});
            shipmentLineItem.quantityShipped = isFirstRowToLineItem
                ? currentItem.shipmentLineItem.quantityShipped : null;

            return {
                $error: isFirstRowToLineItem ? currentItem.$error : {},
                $hint: isFirstRowToLineItem ? currentItem.$hint : {},
                productCode: currentItem.productCode,
                productName: currentItem.fullProductName,
                id: currentItem.id,
                shipmentLineItem: shipmentLineItem,
                orderQuantity: 0,
                lot: lot,
                isKit: currentItem.isKit,
                location: location,
                netContent: currentItem.netContent,
                // #287: Warehouse clerk can skip some products in order
                skipped: currentItem.skipped,
                orderableId: currentItem.orderableId
                // #287: ends here
            };
        }

        function addRow(tableLineItem, lineItems, isFirstRowToLineItem) {
            lineItems.splice(1, 0,
                getRowTemplateData(tableLineItem, lineItems, isFirstRowToLineItem));
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
                    orderableLocationLotsMap), function(lot) {
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
            var hasQuantityShippedFilled = !_.isNull(_.get(lineItem.shipmentLineItem, 'quantityShipped'));
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
            var quantityShipped = _.get(currentItem.shipmentLineItem, 'quantityShipped');
            if (isEmpty(quantityShipped)) {
                currentItem.$error.quantityShippedError = 'openlmisForm.required';
                return;
            }

            if (quantityShipped > getSohByOrderableLocation(currentItem)) {
                currentItem.$error.quantityShippedError = 'shipment.fillQuantityCannotExceedStockOnHand';
            }
        }

        function getSohByOrderableLocation(lineItem) {
            var lot = _.chain(orderableLocationLotsMap[lineItem.orderableId])
                .get(_.get(lineItem.location, 'locationCode'))
                .find(function(item) {
                    return item.lotCode === _.get(lineItem.lot, 'lotCode');
                })
                .value();
            return _.get(lot, 'stockOnHand', 0);
        }

        vm.changeFillQuantity = validateFillQuantity;

        vm.addLot = function(currentItem, lineItems) {
            if (lineItems.length === 1) {
                addRow(currentItem, lineItems, true);
                resetFirstRow(currentItem);
            }
            addRow(currentItem, lineItems, false);
        };

        vm.removeItem = function(lineItems, index) {
            if (lineItems.length === 1) {
                lineItems.splice(0, 1);
            } else if (lineItems.length === 3) {
                var remainRowData = index > 1 ? lineItems[1] : lineItems[2];
                lineItems[0].lot = remainRowData.lot;
                lineItems[0].location = remainRowData.location;
                lineItems[0].shipmentLineItem = remainRowData.shipmentLineItem;
                lineItems[0].$error = remainRowData.$error;
                lineItems[0].$hint = remainRowData.$hint;
                lineItems.splice(1, 2);
            } else if (lineItems.length > 3) {
                lineItems.splice(index, 1);
            }

            validateBase(lineItems, function(item) {
                item.$error.lotCodeError = '';
                item.$hint.lotCodeHint = '';
            });

            vm.displayTableLineItems = _.filter(vm.displayTableLineItems, function(item) {
                return !_.isEmpty(item);
            });
            $stateParams.displayTableLineItems = _.clone(vm.displayTableLineItems);
            reloadParams();
        };

        function reloadParams() {
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name,
                notify: false
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
                var quantity = _.reduce(lineItems, function(orderQuantity, item) {
                    return orderQuantity + _.get(item, 'orderQuantity', 0);
                }, 0);
                return recalculateQuantity(quantity, lineItems[index]);
            }
            return recalculateQuantity(_.get(lineItems[index], 'orderQuantity', 0), lineItems[index]);
        };

        vm.getFillQuantity = function(lineItems, index) {
            if (index === 0) {
                return _.reduce(lineItems, function(fillQuantity, item) {
                    return fillQuantity + _.get(item.shipmentLineItem, 'quantityShipped', 0);
                }, 0);
            }
            return _.get(lineItems[index], ['shipmentLineItem', 'quantityShipped'], 0);

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

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name showInDoses
         *
         * @description
         * Returns whether the screen is showing quantities in doses.
         *
         * @return {boolean} true if the quantities are in doses, false otherwise
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
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

        // #264: warehouse clerk can add product to orders
        function addProducts() {
            var availableProducts = getAvailableProducts();
            selectProducts({
                products: availableProducts
            })
                .then(function(selectedProducts) {

                    var addedShipmentLineItems = prepareShipmentLineItems(selectedProducts);
                    var addedOrderLineItems = prepareOrderLineItems(selectedProducts);
                    var addedOrderLineItemsShipment = Object.assign({}, shipment, {
                        lineItems: addedShipmentLineItems,
                        order: {
                            orderLineItems: addedOrderLineItems
                        }
                    });
                    var addedTableLineItems = new SiglusLocationShipmentViewLineItemFactory()
                        .createFrom(addedOrderLineItemsShipment);
                    addedShipmentLineItems.forEach(function(shipmentLineItem) {
                        shipment.lineItems.push(shipmentLineItem);
                    });
                    vm.order.orderLineItems = vm.order.orderLineItems.concat(addedOrderLineItems);
                    vm.displayTableLineItems = vm.displayTableLineItems.concat(
                        _.map(addedTableLineItems, function(item) {
                            return [item];
                        })
                    );
                    $stateParams.displayTableLineItems = _.clone(vm.displayTableLineItems);
                    $stateParams.order = vm.order;
                    reloadParams();
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
                    partialFulfilledQuantity: 0
                };
            });
        }

        // #374: confirm shipment effect soh
        function prepareShipmentLineItems(selectedProducts) {
            var addedShipmentLineItems = [];
            var stockCardDetailMap = mapStockCardDetail(stockCardSummaries);
            selectedProducts.forEach(function(orderable) {
                var stockCardDetailByOrderable = stockCardDetailMap[orderable.id];
                orderable.versionNumber = orderable.meta.versionNumber;
                Object.values(stockCardDetailByOrderable).forEach(function(stockCardDetail) {
                    addedShipmentLineItems.push({
                        id: '',
                        lot: stockCardDetail.lot,
                        orderable: orderable,
                        quantityShipped: 0,
                        skipped: undefined
                    });
                });
            });
            return addedShipmentLineItems;
        }

        function mapStockCardDetail(summaries) {
            var stockCardDetailMap = {};
            summaries.forEach(function(summary) {
                summary.stockCardDetails.forEach(function(stockCardDetail) {
                    var orderableId = stockCardDetail.orderable.id,
                        lotId = stockCardDetail.lot ? stockCardDetail.lot.id : undefined;
                    if (!stockCardDetailMap[orderableId]) {
                        stockCardDetailMap[orderableId] = {};
                    }
                    stockCardDetailMap[orderableId][lotId] = stockCardDetail;
                });
            });
            return stockCardDetailMap;
        }
        // #374: ends here

        // #287: Warehouse clerk can skip some products in order
        function skipAllLineItems() {
            vm.displayTableLineItems.forEach(function(lineItemGroup) {
                _.forEach(lineItemGroup, function(lineItem) {
                    if (!lineItem.skipped && lineItemGroup.length === 1 && canSkip(lineItemGroup)) {
                        lineItem.skipped = true;
                        changeSkipStatus(lineItem);
                    }
                });
            });
        }

        function unskipAllLineItems() {
            vm.displayTableLineItems.forEach(function(lineItemGroup) {
                _.forEach(lineItemGroup, function(lineItem) {
                    if (lineItem.skipped && canSkip(lineItemGroup)) {
                        lineItem.skipped = false;
                        changeSkipStatus(lineItem);
                    }
                });

            });
        }

        function changeSkipStatus(currentItem, lineItems) {
            _.forEach(lineItems, function(lineItem) {
                lineItem.skipped = currentItem.skipped;
                if (!isEmpty(lineItem.shipmentLineItem)) {
                    lineItem.shipmentLineItem.skipped = lineItem.skipped;
                }
            });
            vm.shipment.order.orderLineItems.forEach(function(orderLineItem) {
                if (orderLineItem.orderable.productCode === currentItem.productCode) {
                    orderLineItem.skipped = currentItem.skipped;
                }
            });
        }

        function canSkip(lineItems) {
            return  _.every(lineItems, function(lineItem) {
                return isEmpty(_.get(lineItem.shipmentLineItem, 'quantityShipped'));
            });
        }

        function isEmpty(value) {
            return !value || !value.toString().trim();
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
            if (lineItem.isKit) {
                return _.size(vm.getLocationList(lineItem)) === 0;
            }
            return (_.size(vm.getLotList(lineItem)) === 0 || _.size(vm.getLocationList(lineItem)) === 0)
              && index === lineItems.length - 1;
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

        vm.submit = function() {
            if (isTableFormValid()) {
                console.log('submit');
            }
        };

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

        function buildSaveParams() {

            var lineItems = _.chain(vm.displayTableLineItems)
                .map(function(group) {
                    var data =  _.filter(group, function(lineItem) {
                        return (group.length > 1 && !lineItem.isMainGroup)
                         || (group.length === 1 && lineItem.isMainGroup);
                    });
                    return data;
                })
                .flatten()
                .map(function(lineItem) {
                    var lot = lineItem.lot;
                    var locationId = _.get(lineItem.location, 'id');

                    return {
                        lot: _.isEmpty(lot) ? null : _.pick(lineItem.lot, ['id']),
                        location: _.isEmpty(locationId) ? null : {
                            id: locationId
                        },
                        id: lineItem.id,
                        orderable: lineItem.shipmentLineItem.orderable,
                        quantityShipped: lineItem.shipmentLineItem.quantityShipped,
                        stockOnHand: getSohByOrderableLocation(lineItem)
                    };
                })
                .value();
            updateOrderSkipStatus();
            return {
                id: shipment.id,
                order: vm.order,
                notes: null,
                lineItems: lineItems
            };
        }

        vm.delete = function() {
            SiglusLocationViewService.deleteDraft({
                id: '123123'
            }).then(function() {

            });
        };

        vm.save = function() {
            SiglusLocationViewService.saveDraft(buildSaveParams()).then(function() {
            });
        };

    }
})();
