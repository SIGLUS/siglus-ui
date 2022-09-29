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

    angular
        .module('siglus-location-issue-creation')
        .controller('siglusLocationIssueCreationController', controller);

    controller.$inject = ['$stateParams', '$scope', '$state', 'DRAFT_TYPE', 'draftInfo', 'facility', 'reasons',
        'initialDraftInfo', 'locations', 'addedLineItems', 'productList', 'siglusStockUtilsService', 'displayItems',
        'prepareLineItemService', 'siglusLocationCommonApiService', 'SiglusLocationCommonUtilsService',
        'siglusStockDispatchService', 'addAndRemoveIssueLineItemIssueService', 'alertConfirmModalService',
        'loadingModalService', 'notificationService', 'paginationService', 'messageService', 'isMerge', 'moment',
        'siglusStockIssueLocationService', 'siglusRemainingProductsModalService', 'alertService'];

    function controller($stateParams, $scope, $state, DRAFT_TYPE, draftInfo, facility, reasons, initialDraftInfo,
                        locations, addedLineItems, productList,
                        siglusStockUtilsService, displayItems, prepareLineItemService,
                        siglusLocationCommonApiService, SiglusLocationCommonUtilsService, siglusStockDispatchService,
                        addAndRemoveIssueLineItemIssueService, alertConfirmModalService, loadingModalService,
                        notificationService, paginationService, messageService, isMerge, moment,
                        siglusStockIssueLocationService, siglusRemainingProductsModalService, alertService) {
        var vm = this;

        vm.keyword = $stateParams.keyword;

        vm.productList = null;

        vm.facility = facility;

        vm.initialDraftInfo = initialDraftInfo;

        vm.addedLineItems = [];

        vm.displayItems = displayItems;

        vm.selectedProduct = null;

        vm.destinationName = '';

        vm.$onInit = function() {
            $state.current.label = isMerge
                ? messageService.get('stockIssueCreation.mergedDraft')
                : messageService.get('stockIssue.draft') + ' ' + draftInfo.draftNumber;
            vm.addedLineItems = addedLineItems || [];
            vm.destinationName = siglusStockUtilsService
                .getInitialDraftName(vm.initialDraftInfo, $stateParams.draftType);
            filterProductList();

            var validator = function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            };
            paginationService.registerList(validator, $stateParams, function() {
                return vm.displayItems;
            });
            cacheParams();
            loadingModalService.close();
        };

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations));
        };

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations));
        };

        vm.addProduct = function() {
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                isAdjustment: false,
                extraData: true
            }, [vm.selectedProduct.orderableId]).then(function(locationsInfo) {
                locations = locations.concat(locationsInfo);
                vm.addedLineItems.unshift([
                    addAndRemoveIssueLineItemIssueService.getAddProductRow(vm.selectedProduct)
                ]);
                reloadPage();
            });
        };

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

        vm.removeItem = function(lineItems, index) {
            var isKit = lineItems[index].isKit;
            addAndRemoveIssueLineItemIssueService.removeItem(lineItems, index);
            if (lineItems.length === 0) {
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
                $stateParams.addedLineItems = vm.addedLineItems;
                vm.displayItems = _.filter(vm.displayItems, function(item) {
                    return !_.isEmpty(item);
                });
                filterProductList();
            }
            if (isKit) {
                validateLocationDuplicatedForRemove(lineItems);
            } else {
                validateBase(lineItems, function(item) {
                    item.$error.lotCodeError = '';
                    item.$hint.lotCodeHint = '';
                });
            }
        };

        vm.addItem = function(lineItem, lineItems) {
            addAndRemoveIssueLineItemIssueService.addLineItem(lineItem, lineItems);
        };

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

        function lotOrLocationChangeEmitValidation(lineItem) {
            var hasKitLocation = lineItem.isKit && !_.isEmpty(lineItem.location);
            var hasBothLocationAndLot = !lineItem.isKit && !_.isEmpty(lineItem.location)
              && !_.isEmpty(lineItem.lot);
            var hasQuantityShippedFilled = !_.isNull(_.get(lineItem, 'quantityShipped'));
            if ((hasKitLocation || hasBothLocationAndLot) && hasQuantityShippedFilled) {
                validateQuantity(lineItem);
            }
        }

        function validateQuantity(currentItem) {
            currentItem.$error.quantityError = '';
            var quantity = currentItem.quantity;
            if (!_.isNumber(currentItem.quantity) || currentItem.quantity === 0) {
                currentItem.$error.quantityError = 'locationShipmentView.inputPositiveNumber';
                return;
            }
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            if (quantity > getSoh(currentItem, orderableLocationLotsMap)) {
                currentItem.$error.quantityError = 'shipment.fillQuantityCannotExceedStockOnHand';
            }
        }

        vm.changeQuantity = function(currentItem) {
            validateQuantity(currentItem);
        };

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
            validateQuantity(lineItem);
        };

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

        function getSoh(lineItem, orderableLocationLotsMap) {
            var lot = _.chain(orderableLocationLotsMap[lineItem.orderableId])
                .get(_.get(lineItem.location, 'locationCode'))
                .find(function(item) {
                    return lineItem.isKit ? _.isEmpty(item.lotCode)
                        : item.lotCode === _.get(lineItem.lot, 'lotCode');
                })
                .value();
            return _.get(lot, 'stockOnHand', 0);
        }

        vm.getStockOnHand = function(lineItems, index) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            if (index === 0) {
                return _.reduce(lineItems, function(availableSoh, lineItem) {
                    return availableSoh + getSoh(lineItem, orderableLocationLotsMap);
                }, 0);
            }
            return getSoh(lineItems[index], orderableLocationLotsMap);
        };

        vm.getQuantity = function(lineItems) {
            return _.reduce(lineItems, function(quantity, item) {
                return quantity + _.get(item, 'quantity') || 0;
            }, 0);

        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return lineItem.isKit || (lineItems.length > 1 && index === 0);
        };

        vm.showEmptyBlock = function(lineItem, lineItems, index) {
            return (lineItems.length > 1 && index === 0);
        };

        vm.removeDisplayItems = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusStockDispatchService.resetDraft($stateParams.initialDraftId, $stateParams.draftId,
                    $stateParams.moduleType).then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success(vm.key('deleted'));
                    $state.go('openlmis.locationManagement.issue.draft', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        function searchList() {
            cacheParams();
            reloadPage();
        }

        vm.search = function() {
            searchList();
        };

        vm.cancelFilter = function() {
            vm.keyword = '';
            searchList();
        };

        $scope.$watch(function() {
            return vm.keyword;
        }, function(newValue, oldValue) {
            if (oldValue && !newValue && $stateParams.keyword) {
                searchList();
            }
        });

        function getLineItems() {
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            var reason = _.find(reasons, {
                name: capitalize($stateParams.draftType || '')
            });
            return _.chain(vm.addedLineItems)
                .map(function(group) {
                    return _.filter(group, function(lineItem) {
                        return !lineItem.isMainGroup || (lineItem.isMainGroup && group.length === 1);
                    });
                })
                .flatten()
                .each(function(item) {
                    item.reason = reason;
                })
                .value();
        }

        vm.save = function() {

            loadingModalService.open();
            siglusStockDispatchService.saveDraft($stateParams.initialDraftId,
                $stateParams.draftId, getLineItems(),
                DRAFT_TYPE[$stateParams.moduleType][$stateParams.draftType], $stateParams.moduleType)
                .then(function() {
                    notificationService.success('stockIssueCreation.saved');
                    $scope.needToConfirm = false;
                    reloadPage();
                })
                .finally(function() {
                    loadingModalService.close();
                });
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
            _.forEach(vm.addedLineItems, function(lineItems) {
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
                        validateQuantity(lineItem);
                    }
                });
            });

            return _.every(vm.addedLineItems, function(lineItems) {
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

        function productDuplicatedHandler(error) {
            if (_.get(error, ['data', 'isBusinessError'])) {
                var data = _.map(_.get(error, ['data', 'businessErrorExtraData']), function(item) {
                    item.conflictWith = messageService.get('stockIssue.draft') + ' ' + item.conflictWith;
                    return item;
                });
                siglusRemainingProductsModalService.show(data).then(function() {
                    var addedLineItemsClone = angular.copy(vm.addedLineItems);
                    _.forEach(addedLineItemsClone, function(group, index) {
                        var orderableId = _.get(group, [0, 'orderableId']);

                        var orderableIds = _.map(data, function(data) {
                            return data.orderableId;
                        });
                        if (_.includes(orderableIds, orderableId)) {
                            vm.addedLineItems.splice(index, 1);
                            reloadPage();
                        }
                    });
                });
            }
        }

        vm.submit = function() {
            if (isTableFormValid()) {
                loadingModalService.open();
                siglusStockIssueLocationService.submitDraft($stateParams.initialDraftId, $stateParams.draftId,
                    getLineItems(), DRAFT_TYPE[$stateParams.moduleType][$stateParams.draftType])
                    .then(function() {

                        loadingModalService.close();
                        notificationService.success('stockIssueCreation.submitted');
                        $scope.needToConfirm = false;
                        $state.go('^', $stateParams);
                    })
                    .catch(function(error) {
                        loadingModalService.close();
                        productDuplicatedHandler(error);
                    });

            } else {
                alertService.error(messageService.get('openlmisForm.formInvalid'));
            }
        };

        function filterProductList() {
            var addedOrderableIds = _.map(vm.addedLineItems, function(group) {
                return _.first(group).orderableId;
            });
            vm.productList = _.filter(productList, function(item) {
                return !_.includes(addedOrderableIds, item.orderableId);
            });
        }

        function cacheParams() {
            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.locations = locations;
            $stateParams.draftInfo = draftInfo;
            $stateParams.reasons = reasons;
            $stateParams.productList = productList;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.facility = facility;
            $stateParams.keyword = vm.keyword;
        }

        function reloadPage() {
            cacheParams();
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        }

    }

})();
