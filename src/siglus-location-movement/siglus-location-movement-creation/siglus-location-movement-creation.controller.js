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
     * @name stock-adjustment.controller:StockAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('siglus-location-movement-creation')
        .controller('SiglusLocationMovementCreationController', controller);

    controller.$inject = ['draftInfo', 'areaLocationInfo', '$scope', 'addedLineItems', '$state', 'orderableGroups',
        '$filter', 'paginationService', '$stateParams',
        'addAndRemoveLineItemService', 'displayItems', 'locations',
        'SiglusLocationCommonUtilsService', 'siglusLocationMovementService', 'alertConfirmModalService',
        'loadingModalService', 'notificationService', 'siglusLocationCommonApiService', 'facility', 'user',
        'siglusSignatureWithDateModalService', 'confirmDiscardService', 'siglusLocationMovementUpgradeService',
        'siglusPrintPalletLabelComfirmModalService'];

    function controller(draftInfo, areaLocationInfo, $scope, addedLineItems, $state, orderableGroups,
                        $filter, paginationService, $stateParams,
                        addAndRemoveLineItemService, displayItems, locations,
                        SiglusLocationCommonUtilsService,
                        siglusLocationMovementService, alertConfirmModalService, loadingModalService,
                        notificationService, siglusLocationCommonApiService, facility, user,
                        siglusSignatureWithDateModalService, confirmDiscardService,
                        siglusLocationMovementUpgradeService, siglusPrintPalletLabelComfirmModalService) {

        var vm = this;

        vm.orderableGroups = null;

        vm.selectedOrderableGroup = null;

        vm.addedLineItems = [];

        vm.facility = facility;

        vm.displayItems = displayItems || [];

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations)
            );
        };

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)
            );
        };

        vm.$onInit = function() {
            // TODO make '00000' as constant
            var draftLines = _.get(draftInfo, 'lineItems', []);
            if (draftLines.length > 0) {
                vm.isVirtual = _.every(draftLines, function(line) {
                    return _.get(line, 'srcLocationCode') === '00000';
                });
            }
            vm.addedLineItems = addedLineItems;
            vm.displayItems = displayItems;
            vm.keyword = $stateParams.keyword;
            filterOrderableGroups();
            updateStateParams();

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue, oldValue) {
                $scope.needToConfirm = !angular.equals(newValue, oldValue);
            }, true);

            confirmDiscardService.register($scope, 'openlmis.locationManagement.movement.creation');
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

            paginationService.registerList(validator, angular.copy($stateParams), function() {
                return vm.displayItems;
            });
        };

        function filterOrderableGroups() {

            var addedOrderableIds = _.map(vm.addedLineItems, function(group) {
                return _.first(group).orderableId;
            });
            vm.orderableGroups = _.chain(orderableGroups)
                .map(function(group) {
                    return _.first(group);
                })
                .filter(function(item) {
                    return !_.isEmpty(item) && !_.includes(addedOrderableIds, item.orderable.id);
                })
                .value();
        }

        vm.addProduct = function() {
            var orderable = vm.selectedOrderableGroup.orderable;
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                isAdjustment: false,
                extraData: true
            }, [orderable.id])
                .then(function(locationsInfo) {
                    locations = locations.concat(locationsInfo);
                    var firstRow = addAndRemoveLineItemService.getAddProductRow(orderable);
                    vm.addedLineItems.unshift([firstRow]);
                    searchList();
                })
                .finally(function() {
                    loadingModalService.close();
                });

        };

        function updateStateParams() {
            $stateParams.locations = locations;
            $stateParams.areaLocationInfo = areaLocationInfo;
            $stateParams.keyword = vm.keyword;
            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.orderableGroups = orderableGroups;
            $stateParams.draftInfo = draftInfo;
            $stateParams.user = user;
            $stateParams.facility = facility;
            $stateParams.page = getPageNumber();
        }

        function searchList() {
            updateStateParams();
            reloadPage();
        }

        vm.search = function() {
            searchList();
        };

        function emitQuantityChange(lineItem, lineItems) {
            if (lineItem.lot && lineItem.location && !lineItem.isKit) {
                var map = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
                var locationLotList = _.get(map[lineItem.orderableId], [lineItem.location.locationCode]);
                var locationLot = _.find(locationLotList, function(l) {
                    return l.id === _.get(lineItem, ['lot', 'id']);
                });
                lineItem.stockOnHand = _.get(locationLot, 'stockOnHand', 0);
            } else if (lineItem.location && lineItem.isKit) {
                var mapKit = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
                lineItem.stockOnHand = _.get(mapKit[lineItem.orderableId],
                    [lineItem.location.locationCode, 0, 'stockOnHand'], 0);
            } else {
                lineItem.stockOnHand = 0;
            }
            lineItem.quantity = lineItem.stockOnHand;

            vm.changeQuantity(lineItem, lineItems);
        }

        vm.changeLot = function(lineItem, lineItems) {
            lineItem.$error.lotCodeError = _.isEmpty(lineItem.lot) ? 'openlmisForm.required' : '';
            emitQuantityChange(lineItem, lineItems);
            lineItem.srcLocationOptions = SiglusLocationCommonUtilsService.getLocationList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations)
            );
        };

        vm.changeLocation = function(lineItem, lineItems) {
            lineItem.$error.locationError = _.isEmpty(lineItem.location) ? 'openlmisForm.required' : '';
            emitQuantityChange(lineItem, lineItems);
            lineItem.lotCodeOptions = SiglusLocationCommonUtilsService.getLotList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)
            );
        };

        vm.changeArea = function(lineItem, lineItems) {
            lineItem.$error.areaError = _.isEmpty(_.get(lineItem.moveTo, 'area')) ? 'openlmisForm.required' : '';
            lineItem.destLocationOptions = SiglusLocationCommonUtilsService
                .getDesLocationList(lineItem, areaLocationInfo);
            if (lineItem.$error.areaError !== 'openlmisForm.required' && vm.isVirtual) {
                validateRelatedLineItemsForVirtual(lineItem, lineItems);
            }
        };

        vm.changeMoveToLocation = function(lineItem, lineItems) {
            lineItem.$error.moveToLocationError = _.isEmpty(_.get(lineItem.moveTo, 'locationCode'))
                ? 'openlmisForm.required' : '';
            lineItem.destAreaOptions = SiglusLocationCommonUtilsService.getDesAreaList(lineItem, areaLocationInfo);
            if (lineItem.$error.moveToLocationError !== 'openlmisForm.required' && vm.isVirtual) {
                validateRelatedLineItemsForVirtual(lineItem, lineItems);
            }
        };

        vm.getStockOnHand = function(lineItem, lineItems, index) {
            if (index === 0) {
                var mappedData = _.map(lineItems, function(item) {
                    return {
                        lotCode: _.get(item.lot, 'lotCode', ''),
                        locationCode: _.get(item.location, 'locationCode', ''),
                        lotLocationCode: _.get(item.lot, 'lotCode') + _.get(item.location, 'locationCode'),
                        stockOnHand: item.stockOnHand
                    };
                });
                var filerLineItems = _.uniq(mappedData, false, function(item) {
                    return item.lotLocationCode;
                });
                return _.reduce(filerLineItems, function(sum, item) {
                    return sum + item.stockOnHand;
                }, 0);
            }
            return lineItem.stockOnHand;
        };

        vm.changeQuantity = function(lineItem, lineItems) {
            var isNumberEmpty = _.isNumber(lineItem.quantity) ? lineItem.quantity < 0 : true;
            lineItem.$error.quantityError = isNumberEmpty ? 'openlmisForm.required' : '';

            if (!lineItem.$error.quantityError) {
                if (vm.isVirtual) {
                    validateRelatedLineItemsForVirtual(lineItem, lineItems);
                } else {
                    validateQuantityGtSoh(lineItems);
                }
            }

        };

        vm.addItem = function(lineItem, lineItems) {
            if (vm.isVirtual) {
                addAndRemoveLineItemService.addLineItemForVirtual(lineItem, lineItems);
            } else {
                addAndRemoveLineItemService.addLineItem(lineItem, lineItems);
            }
            lineItems.forEach(function(line) {
                addAndRemoveLineItemService.fillMovementOptions(line, locations, areaLocationInfo);
            });
        };

        vm.removeItem = function(lineItems, index) {
            addAndRemoveLineItemService.removeItem(lineItems, index);
            validateQuantityGtSoh(lineItems);
            if (lineItems.length === 0) {
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
                $stateParams.addedLineItems = vm.addedLineItems;
                vm.displayItems = _.filter(vm.displayItems, function(item) {
                    return !_.isEmpty(item);
                });
                filterOrderableGroups();
            }
        };

        function validateRelatedLineItemsForVirtual(lineItem, lineItems) {
            var targets = lineItems.filter(function(line) {
                return _.get(line, 'orderableId') === _.get(lineItem, 'orderableId')
                    && _.get(line, ['lot', 'id']) === _.get(lineItem.lot, 'id');
            });
            validateQuantityGtSoh(targets);
            validateDuplicateDesLocation(targets);
        }

        function validateQuantityGtSoh(lineItems) {
            _.forEach(lineItems, function(item) {
                var filterLineItems = _.filter(lineItems, function(data) {
                    return _.get(item, ['lot', 'lotCode']) === _.get(data.lot, 'lotCode')
                        && _.get(item, ['location', 'locationCode']) === _.get(data.location, 'locationCode');
                });
                var totalQuantity = _.reduce(filterLineItems, function(result, row) {
                    return result + _.get(row, 'quantity', 0);
                }, 0);

                if (item.$error.quantityError === 'locationMovement.gtSoh') {
                    item.$error.quantityError = '';
                }

                if (totalQuantity > item.stockOnHand) {
                    item.$error.quantityError = 'locationMovement.gtSoh';
                } else if (totalQuantity < item.stockOnHand && vm.isVirtual && item.quantity) {
                    item.$error.quantityError = 'locationMovement.ltSoh';
                } else if (item.$error.quantityError === 'locationMovement.gtSoh'
                    || item.$error.quantityError === 'locationMovement.ltSoh') {
                    item.$error.quantityError = '';
                }

            });
        }

        function validateDuplicateDesLocation(lineItems) {
            _.forEach(lineItems, function(item) {
                var filterLineItems = _.filter(lineItems, function(data) {
                    return _.get(item, 'orderableId') === _.get(data, 'orderableId')
                    && _.get(item, ['lot', 'id']) === _.get(data.lot, 'id')
                        && (_.get(data.moveTo, 'locationCode')
                            && _.get(item, ['moveTo', 'locationCode']) === _.get(data.moveTo, 'locationCode'))
                        && (_.get(data.moveTo, 'area')
                            && _.get(item, ['moveTo', 'area']) === _.get(data.moveTo, 'area'));
                });

                if (filterLineItems.length > 1) {
                    item.$error.moveToLocationError = 'locationMovement.duplicateDesLocation';
                    item.$error.areaError = 'locationMovement.duplicateDesLocation';
                } else {
                    if (item.$error.moveToLocationError === 'locationMovement.duplicateDesLocation') {
                        item.$error.moveToLocationError = '';
                    }
                    if (item.$error.areaError === 'locationMovement.duplicateDesLocation') {
                        item.$error.areaError = '';
                    }
                }

            });
        }

        function reloadPage() {
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        vm.getTotalQuantity = function(lineItems) {
            return _.reduce(lineItems, function(sum, item) {
                return sum + (item.quantity || 0);
            }, 0);
        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return lineItem.isKit || (lineItems.length > 1 && index === 0);
        };

        vm.showEmptyBlock = function(lineItem, lineItems, index) {
            return (lineItems.length > 1 && index === 0);
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

        function validateRequiredFields(lineItem) {
            if (_.isEmpty(_.get(lineItem.lot, 'lotCode')) && !lineItem.isKit && !vm.isVirtual) {
                lineItem.$error.lotCodeError = 'openlmisForm.required';
            }

            if (_.isEmpty(lineItem.location)) {
                lineItem.$error.locationError = 'openlmisForm.required';
            }

            if (!_.isNumber(lineItem.quantity)) {
                lineItem.$error.quantityError = 'openlmisForm.required';
            }

            if (_.isEmpty(_.get(lineItem.moveTo, 'locationCode'))) {
                lineItem.$error.moveToLocationError = 'openlmisForm.required';
            }

            if (_.isEmpty(_.get(lineItem.moveTo, 'area'))) {
                lineItem.$error.areaError = 'openlmisForm.required';
            }
        }

        function validateForm() {
            _.forEach(vm.addedLineItems, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    lineItem.$error = {};
                    if (lineItems.length > 1 && index === 0) {
                        return;
                    }
                    validateRequiredFields(lineItem);
                    validateQuantityGtSoh(lineItems);
                    if (vm.isVirtual) {
                        validateDuplicateDesLocation(lineItems);
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

        function isValid() {
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

        function getLineItems() {
            return _.chain(vm.addedLineItems)
                .map(function(group) {
                    if (group.length === 1) {
                        return group;
                    }
                    if (group.length > 1) {
                        var cloneGroup = _.clone(group);
                        cloneGroup.splice(0, 1);
                        return cloneGroup;
                    }
                })
                .flatten()
                .value();
        }

        function getBaseInfo() {
            return {
                id: draftInfo.id,
                programId: $stateParams.programId,
                facilityId: facility.id,
                userId: user.user_id
            };
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($stateParams.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        vm.save = function() {
            loadingModalService.open();
            siglusLocationMovementService.saveMovementDraft(getBaseInfo(), getLineItems(), locations)
                .then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success('stockIssueCreation.saved');
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        vm.submit = function() {
            validateForm();
            if (isValid()) {
                if (vm.isVirtual) {
                    siglusSignatureWithDateModalService
                        .confirm('stockUnpackKitCreation.signature', null, null, true).
                        then(function(data) {
                            var baseInfo = _.extend(getBaseInfo(), {
                                occurredDate: data.occurredDate,
                                signature: data.signature
                            });
                            loadingModalService.open();
                            var lineItems = getLineItems();
                            if (vm.isVirtual) {
                                lineItems.forEach(function(line) {
                                    line.isKit = _.isEmpty(_.get(line, ['lot', 'id']));
                                });
                            }
                            siglusLocationMovementService.submitMovementDraft(baseInfo, lineItems, locations)
                                .then(function() {
                                    $scope.needToConfirm = false;
                                    if (vm.isVirtual) {
                                        siglusLocationMovementUpgradeService.doneUpgrade();
                                        $state.go('openlmis.home');
                                    } else {
                                        $state.go('^', $stateParams, {
                                            reload: true
                                        });
                                    }
                                    loadingModalService.close();
                                })
                                .catch(function() {
                                    loadingModalService.close();
                                });

                        });
                } else {
                    siglusPrintPalletLabelComfirmModalService.show()
                        .then(function(result) {
                            if (result) {
                                vm.downloadPrint();
                            }
                            siglusSignatureWithDateModalService
                                .confirm('stockUnpackKitCreation.signature', null, null, true).
                                then(function(data) {
                                    var baseInfo = _.extend(getBaseInfo(), {
                                        occurredDate: data.occurredDate,
                                        signature: data.signature
                                    });
                                    loadingModalService.open();
                                    var lineItems = getLineItems();
                                    if (vm.isVirtual) {
                                        lineItems.forEach(function(line) {
                                            line.isKit = _.isEmpty(_.get(line, ['lot', 'id']));
                                        });
                                    }
                                    siglusLocationMovementService.submitMovementDraft(baseInfo, lineItems, locations)
                                        .then(function() {
                                            $scope.needToConfirm = false;
                                            if (vm.isVirtual) {
                                                siglusLocationMovementUpgradeService.doneUpgrade();
                                                $state.go('openlmis.home');
                                            } else {
                                                $state.go('^', $stateParams, {
                                                    reload: true
                                                });
                                            }
                                            loadingModalService.close();
                                        })
                                        .catch(function() {
                                            loadingModalService.close();
                                        });

                                });
                        });
                }

            } else {
                vm.keyword = '';
                searchList();
            }
        };

        vm.downloadPrint = function() {
            var increaseLineItems = _.chain(angular.copy(getLineItems()))
                .map(function(item) {
                    item.locationLotOrderableId =
                        _.get(item, ['moveTo', 'locationCode'])
                        + '_' + _.get(item, ['lot', 'lotCode'])
                        + '_' + _.get(item, ['orderableId']);
                    item.moveType = 'increase';
                    return item;
                })
                .groupBy('locationLotOrderableId')
                .values()
                .flatten()
                .map(function(item) {
                    return getPrintItem(item);
                })
                .value();
            var decreaseLineItems = _.chain(angular.copy(getLineItems()))
                .map(function(item) {
                    item.locationLotOrderableId =
                        _.get(item, ['location', 'locationCode'])
                        + '_' + _.get(item, ['lot', 'lotCode'])
                        + '_' + _.get(item, ['orderableId']);
                    item.moveType = 'decrease';
                    return item;
                })
                .groupBy('locationLotOrderableId')
                .values()
                .flatten()
                .map(function(item) {
                    return getPrintItem(item);
                })
                .value();
            var newPrintLineItems = _.chain(increaseLineItems.concat(decreaseLineItems))
                .groupBy('locationLotOrderableId')
                .values()
                .map(function(item) {

                    var result = _.first(item);
                    var map = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);

                    var stockOnHand = _.chain(map)
                        .get([result.orderableId, result.location])
                        .find(function(findItem) {
                            return findItem.lotCode === result.lotCode;
                        })
                        .get(['stockOnHand'], 0)
                        .value();

                    result.pallet = calculatePallet(stockOnHand, item);
                    return result;
                })
                .filter(function(item) {
                    return item.pallet > 0;
                })
                .value();
            vm.printLineItems = newPrintLineItems;

        };
        function getPrintItem(item) {
            var result = {};
            result.orderableId = _.get(item, ['orderableId']);
            if (_.get(item, ['moveType']) === 'increase') {
                result.location = _.get(item, ['moveTo', 'locationCode']);
            } else {
                result.location = _.get(item, ['location', 'locationCode']);
            }
            result.lotCode = _.get(item, ['lot', 'lotCode']);
            result.expirationDate = _.get(item, ['lot', 'expirationDate']);
            result.productName = _.get(item, ['productName']);
            result.productCode = _.get(item, ['productCode']);
            result.locationLotOrderableId = _.get(item, ['locationLotOrderableId']);
            result.quantity = _.get(item, ['quantity']);
            result.moveType = _.get(item, ['moveType']);
            return result;
        }
        function calculatePallet(stockOnHand, lineItem) {
            return _.reduce(lineItem, function(sum, item) {
                if (item.moveType === 'decrease') {
                    return sum - item.quantity;
                }

                return sum + item.quantity;
            }, stockOnHand);
        }

        vm.deleteDraft = function() {
            alertConfirmModalService.error(
                'locationMovement.deleteMovementWarning',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusLocationMovementService.deleteMovementDraft($stateParams.draftId)
                    .then(function() {
                        $scope.needToConfirm = false;
                        notificationService.success('stockIssueCreation.deleted');
                        if (vm.isVirtual) {
                            $state.go('openlmis.home');
                        } else {
                            $state.go('^', $stateParams, {
                                reload: true
                            });
                        }
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });

            });
        };
    }

})();
