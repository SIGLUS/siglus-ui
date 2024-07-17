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
     * @name siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
     *
     * @description
     * Controller for managing physical inventory draft.
     */
    angular
        .module('siglus-locatioin-physical-inventory-draft')
        .controller('LocationPhysicalInventoryDraftController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', 'addProductsModalService', 'messageService',
        'notificationService', 'alertService', 'confirmDiscardService', 'chooseDateModalService',
        'program', 'facility', 'physicalInventoryService', 'MAX_INTEGER_VALUE', 'VVM_STATUS',
        'stockReasonsCalculations', 'loadingModalService', '$window', 'accessTokenFactory',
        'orderableGroupService', '$filter', '$q', 'REASON_TYPES', 'SIGLUS_MAX_STRING_VALUE',
        'currentUserService', 'navigationStateService', 'siglusArchivedProductService',
        'siglusOrderableLotMapping', 'physicalInventoryDataService', 'SIGLUS_TIME',
        'siglusRemainingProductsModalService', 'subDraftIds', 'alertConfirmModalService',
        'allLocationAreaMap', 'localStorageService', 'SiglusAddProductsModalWithLocationService',
        'siglusOrderableLotService', 'siglusPrintPalletLabelComfirmModalService',
        'siglusLocationCommonApiService', 'reasons', 'draft', 'displayLineItemsGroup',
        'siglusOrderableLotListService'
    ];

    function controller(
        $scope, $state, $stateParams, addProductsModalService, messageService,
        notificationService, alertService, confirmDiscardService, chooseDateModalService,
        program, facility, physicalInventoryService, MAX_INTEGER_VALUE, VVM_STATUS,
        stockReasonsCalculations, loadingModalService, $window, accessTokenFactory,
        orderableGroupService, $filter,  $q, REASON_TYPES, SIGLUS_MAX_STRING_VALUE,
        currentUserService, navigationStateService, siglusArchivedProductService,
        siglusOrderableLotMapping, physicalInventoryDataService, SIGLUS_TIME,
        siglusRemainingProductsModalService, subDraftIds, alertConfirmModalService,
        allLocationAreaMap, localStorageService, SiglusAddProductsModalWithLocationService,
        siglusOrderableLotService, siglusPrintPalletLabelComfirmModalService,
        siglusLocationCommonApiService, reasons, draft, displayLineItemsGroup,
        siglusOrderableLotListService
    ) {
        var vm = this;
        vm.$onInit = onInit;
        vm.quantityChanged = quantityChanged;
        vm.checkUnaccountedStockAdjustments = checkUnaccountedStockAdjustments;
        vm.lotCodeChanged = lotCodeChanged;
        vm.expirationDateChanged = expirationDateChanged;
        vm.reasonChanged = reasonChanged;
        vm.reasonTextChanged = reasonTextChanged;
        vm.focusedRowChanged = focusedRowChanged;
        vm.addLot = addLot;
        vm.addLotByLocation = addLotByLocation;
        vm.removeLot = removeLot;
        vm.isEmpty = isEmpty;
        vm.print = print;
        vm.actionType = $stateParams.actionType;
        vm.isMergeDraft = $stateParams.isMerged === 'true';
        vm.locationManagementOption = $stateParams.locationManagementOption;

        vm.updateProgress = function() {
            vm.itemsWithQuantity = _.filter(vm.displayLineItemsGroup, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    var flag = false;
                    if (lineItem.orderable && lineItem.orderable.isKit || !isEmpty(lineItem.stockOnHand)) {
                        flag = !isEmpty(lineItem.quantity) &&
                            !(vm.isFreeTextAllowed(lineItem) && isEmpty(lineItem.reasonFreeText)) || lineItem.skipped;
                    } else {
                        flag = updateInitialInventory(lineItem);
                    }
                    return flag;
                });
            });
        };

        function updateInitialInventory(lineItem) {
            if (vm.isInitialInventory) {
                return hasLot(lineItem)
                    && !isEmpty(lineItem.lot.expirationDate)
                    && !isEmpty(lineItem.quantity) || lineItem.skipped;
            }
            return hasLot(lineItem) && !isEmpty(lineItem.lot.expirationDate) && !isEmpty(lineItem.quantity)
                && !(vm.isFreeTextAllowed(lineItem) && isEmpty(lineItem.reasonFreeText)) || lineItem.skipped;
        }

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds current program info.
         */
        vm.program = program;

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds home facility info.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name keyword
         * @type {String}
         *
         * @description
         * Holds keywords for searching.
         */
        vm.keyword = $stateParams.keyword;

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name groupedCategories
         * @type {Object}
         *
         * @description
         * Holds line items grouped by category.
         */
        vm.groupedCategories = false;

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be visible.
         */
        vm.showVVMStatusColumn = false;

        // SIGLUS-REFACTOR: starts here
        vm.existLotCode = [];
        vm.isInitialInventory = $stateParams.canInitialInventory;

        vm.draft = draft;

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name getStatusDisplay
         *
         * @description
         * Returns VVM status display.
         *
         * @param  {String} status VVM status
         * @return {String}        VVM status display name
         */
        vm.getStatusDisplay = function(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        };

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name addProducts
         *
         * @description
         * Pops up a modal for users to add products for physical inventory.
         */
        vm.addProducts = function() {
            loadingModalService.open();
            physicalInventoryService.getApprovedProducts(facility.id, program.id)
                .then(function(productsForThisProgram) {
                    var existedProducts = _.unique(_.map(draft.lineItems, function(lineItem) {
                        return _.get(lineItem, ['orderable', 'id']);
                    }));
                    var productsCanAdd = productsForThisProgram.filter(function(productInfo) {
                        return !existedProducts.includes(_.get(productInfo, ['orderable', 'id']));
                    });
                    addProductsModalService.show(productsCanAdd, vm.hasLot, true, vm.isInitialInventory)
                        .then(function(addedItems) {
                            if (addedItems.length === 0) {
                                loadingModalService.close();
                                return;
                            }
                            var orderableIds = addedItems.map(function(item) {
                                return _.get(item, ['orderable', 'id']);
                            });
                            siglusOrderableLotListService.getOrderableLots(facility.id, orderableIds)
                                .then(function(lotList) {
                                    loadingModalService.close();
                                    var lotsMapByOrderableId =
                                        siglusOrderableLotListService.getSimplifyLotsMapByOrderableId(lotList);
                                    var lineItemsToAdd = addedItems.map(function(item) {
                                        return _.assign(generateEmptyLineItem(), {
                                            orderable: angular.copy(item.orderable),
                                            quantity: item.quantity || 0,
                                            lotOptions: lotsMapByOrderableId[_.get(item, ['orderable', 'id'])]
                                        });
                                    });
                                    draft.lineItems = draft.lineItems.concat(lineItemsToAdd);
                                    $stateParams.isAddProduct = true;
                                    reload($state.current.name);
                                    siglusArchivedProductService.alterInfo(lineItemsToAdd);
                                });
                        })
                        .catch(loadingModalService.close);
                })
                .catch(function(error) {
                    loadingModalService.close();
                    alertService.error(error);
                });
        };

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name calculate
         *
         * @description
         * Aggregate values of provided field for a group of line items.
         *
         * @param {Object} lineItems line items to be calculate.
         * @param {String} field     property name of line items to be aggregate.
         */
        vm.calculate = function(lineItems, field) {
            var allEmpty = _.every(lineItems, function(lineItem) {
                return isEmpty(lineItem[field]);
            });
            if (allEmpty) {
                return undefined;
            }

            return _.chain(lineItems).map(function(lineItem) {
                return lineItem[field];
            })
                .compact()
                .reduce(function(memo, num) {
                    return parseInt(num) + memo;
                }, 0)
                .value();
        };

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */

        vm.search = function() {
            $stateParams.page = 0;
            $stateParams.keyword = vm.keyword;
            return reload($state.current.name);
        };

        vm.doCancelFilter = function() {
            if ($stateParams.keyword) {
                vm.keyword = null;
                $stateParams.keyword = null;
                reload($state.current.name);
            }
        };

        $scope.$watch(function() {
            return vm.keyword;
        }, function(newValue, oldValue) {
            if (oldValue && !newValue && $stateParams.keyword) {
                $stateParams.keyword = null;
                reload($state.current.name);
            }
        });

        function reload(isReload) {
            loadingModalService.open();
            return delayPromise(SIGLUS_TIME.LOADING_TIME).then(function() {
                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.draft = draft;
                $stateParams.reasons = reasons;
                return $state.go($state.current.name, $stateParams, {
                    reload: isReload
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name saveDraft
         *
         * @description
         * Save physical inventory draft.
         */
        var openRemainingModal = function(type, data) {
            siglusRemainingProductsModalService.show(data).then(function() {
                saveOrSubmit(type, data);
            });
        };

        var saveOrSubmit = function(type, data) {
            var conflictIds = _.map(data, function(item) {
                return item.orderableId;
            });
            draft.lineItems = _.filter(draft.lineItems, function(item) {
                return !_.includes(conflictIds, item.orderable.id);
            });
            if (type === 'save') {
                saveDraft();
            } else {
                submit();
            }
        };

        this.saveOrSubmit = saveOrSubmit;

        var saveDraft = function(notReload) {
            if ($stateParams.keyword) {
                $stateParams.keyword = null;
            }
            loadingModalService.open();
            return physicalInventoryService.saveDraftWithLocation(_.assign({}, draft, {
                subDraftIds: subDraftIds
            }), $stateParams.locationManagementOption).then(function() {
                if (!notReload) {
                    notificationService.success('stockPhysicalInventoryDraft.saved');
                }
                resetWatchItems();

                $stateParams.isAddProduct = false;
                loadingModalService.close();
                if (notReload) {
                    var stateParams = angular.copy($stateParams);
                    stateParams.actionType = 'DRAFT';
                    $state.go($state.current.name, stateParams, {
                        location: 'replace'
                    });
                    return;
                }
                reload($state.current.name);
            })
                .catch(function(error) {
                    loadingModalService.close();
                    if (error.data.isBusinessError) {
                        var data = error.data.businessErrorExtraData;
                        openRemainingModal('save', data);
                    }
                });
        };
        vm.saveDraft = _.throttle(saveDraft, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name saveOnPageChange
         *
         * @description
         * Save physical inventory draft on page change.
         */
        vm.saveOnPageChange = function() {
            // only this works!
            loadingModalService.open();
            return delayPromise(SIGLUS_TIME.LOADING_TIME).then(function() {
                var params = {};
                params.draft = draft;
                return $q.resolve(params);
            });
        };

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name delete
         *
         * @description
         * Delete physical inventory draft.
         */

        var deleteDraft = function() {
            if (vm.isMergeDraft) {
                goBack();
                return;
            }

            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                physicalInventoryService.deleteSubDraftByLocation(
                    subDraftIds,
                    $stateParams.locationManagementOption
                ).then(function() {
                    $scope.needToConfirm = false;
                    if (vm.isInitialInventory) {
                        goBack();
                    } else {
                        $state.go('openlmis.locationManagement.physicalInventory.draftList', $stateParams, {
                            reload: true
                        });
                    }
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };
        vm.delete = _.throttle(deleteDraft, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });
        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name submit
         *
         * @description
         * Submit physical inventory.
         */
        var subDraftSubmit = function() {
            $scope.needToConfirm = false;
            loadingModalService.open();
            physicalInventoryService.submitSubPhysicalInventory(_.assign({}, draft, {
                subDraftIds: subDraftIds
            }), $stateParams.locationManagementOption)
                .then(function() {
                    if (vm.isInitialInventory) {
                        notificationService.success('stockInitialInventoryDraft.submitted');
                    } else {
                        notificationService.success('stockPhysicalInventoryDraft.submitted');
                    }
                    goBack();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    var data = error.data.businessErrorExtraData;
                    openRemainingModal('submit', data);
                });
        };

        vm.downloadPrint = function() {
            vm.printLineItems = _.chain(angular.copy(vm.displayLineItemsGroup))
                .flatten()
                .filter(function(lineItem) {
                    return lineItem.quantity > 0 && lineItem.quantity !== lineItem.stockOnHand;
                })
                .map(function(lineItem) {
                    lineItem.pallet = lineItem.quantity;
                    lineItem.locationLotOrderableId = _.get(lineItem, 'locationCode')
                        + '_' + _.get(lineItem, ['lot', 'lotCode'])
                        + '_' + _.get(lineItem, ['orderable', 'id']);
                    return lineItem;
                })
                .groupBy('locationLotOrderableId')
                .values()
                .flatten()
                .map(getPrintItem)
                .value();

        };

        function getPrintItem(item) {
            var result = {};
            result.orderableId = _.get(item, ['orderable', 'id']);
            result.location = item.locationCode;
            result.lotCode = _.get(item, ['lot', 'lotCode']);
            result.expirationDate = _.get(item, ['lot', 'expirationDate']);
            result.productName = _.get(item, ['orderable', 'fullProductName']);
            result.productCode = _.get(item, ['orderable', 'productCode']);
            result.locationLotOrderableId = _.get(item, ['locationLotOrderableId']);
            result.quantity = _.get(item, ['quantity']);
            // result.moveType = _.get(item, ['moveType']);
            result.isKit = _.get(item, ['orderable', 'isKit']);
            result.pallet = item.pallet;
            return result;
        }

        var submit = function() {
            var anyError = validate();
            if (anyError) {
                if (anyError === 'hasEmptyLocation') {
                    $scope.$broadcast('openlmis-form-submit');
                    alertService.error('stockPhysicalInventoryDraft.hasEmptyLocation');
                } else if (anyError === 'hasDuplicateLotCode') {
                    $scope.$broadcast('openlmis-form-submit');
                    alertService.error('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicateByLocation');
                } else {
                    $scope.$broadcast('openlmis-form-submit');
                    alertService.error('stockPhysicalInventoryDraft.submitInvalid');
                }
            } else {
                vm.printLineItems = [];
                if ($stateParams.draftNum) {
                    subDraftSubmit();
                    return;
                }

                siglusPrintPalletLabelComfirmModalService.show()
                    .then(function(result) {
                        if (result) {
                            vm.downloadPrint();
                        }
                        chooseDateModalService.show(new Date(), true).then(function(resolvedData) {

                            $scope.needToConfirm = false;
                            loadingModalService.open();
                            draft.occurredDate = resolvedData.occurredDate;
                            draft.signature = resolvedData.signature;
                            draft.lineItems = _.filter(draft.lineItems, function(item) {
                                return !item.skipped;
                            });
                            physicalInventoryService.submitPhysicalInventory(
                                draft, true, buildHistoryData(resolvedData)
                            )
                                .then(function() {
                                    if (vm.isInitialInventory) {
                                        currentUserService.clearCache();
                                        navigationStateService.clearStatesAvailability();
                                        notificationService.success('stockInitialInventoryDraft.submitted');
                                    } else {
                                        notificationService.success('stockPhysicalInventoryDraft.submitted');
                                    }

                                    $state.go('openlmis.locationManagement.stockOnHand', {
                                        program: program.id,
                                        facility: facility
                                    }, {
                                        reload: true
                                    });
                                }, function() {
                                    loadingModalService.close();
                                    alertService.error('stockPhysicalInventoryDraft.submitFailed');
                                });
                        });
                    });
            }
        };

        vm.submit = _.throttle(submit, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateQuantity
         *
         * @description
         * Validate line item quantity and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        // SIGLUS-REFACTOR: starts here
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > MAX_INTEGER_VALUE && !lineItem.skipped) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (isEmpty(lineItem.quantity) && !lineItem.skipped) {
                lineItem.$errors.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                lineItem.$errors.quantityInvalid = false;
            }
            return lineItem.$errors.quantityInvalid;
        };

        function print() {
            var PRINT_URL;
            var lineItemsGroupToPrint = minifyDisplayLineItemsForPrint();
            var localStorageSaveSuccess = false;
            if (vm.locationManagementOption === 'product') {
                localStorageSaveSuccess = localStorageService.add(
                    'physicalInventoryCategories', JSON.stringify(lineItemsGroupToPrint)
                );
                PRINT_URL = '#!/locationManagement/physicalInventory/printByProduct?';
            } else {
                localStorageSaveSuccess = localStorageService.add(
                    'locationPhysicalInventory', JSON.stringify(lineItemsGroupToPrint)
                );
                PRINT_URL = '#!/locationManagement/physicalInventory/printByLocation?'
                    + '&isInitialInventory=' + vm.isInitialInventory;
            }
            PRINT_URL = PRINT_URL +
                '&isMerged=' + $stateParams.isMerged +
                '&programId=' + $stateParams.programId +
                '&draftNum=' + $stateParams.draftNum;

            if (localStorageSaveSuccess) {
                $window.open(PRINT_URL, '_blank');
            } else {
                alertService.error('localStorage save data failed');
            }
        }

        function minifyDisplayLineItemsForPrint() {
            return vm.displayLineItemsGroup.map(function(lineItemsGroup) {
                return lineItemsGroup.map(function(lineItem) {
                    return {
                        isFromSelect: false,
                        area: lineItem.area,
                        locationCode: lineItem.locationCode,
                        stockOnHand: lineItem.stockOnHand,
                        quantity: lineItem.quantity,
                        reasonFreeText: lineItem.reasonFreeText,
                        orderable: {
                            productCode: _.get(lineItem, ['orderable', 'productCode']),
                            fullProductName: _.get(lineItem, ['orderable', 'fullProductName'])
                        },
                        lot: {
                            lotCode: _.get(lineItem, ['lot', 'lotCode']),
                            expirationDate: _.get(lineItem, ['lot', 'expirationDate'])
                        }

                    };
                });
            });
        }

        // 校验form表单的Lot Code的地方;
        vm.validateLotCode = function(lineItem) {
            var lotCode = _.get(lineItem, ['lot', 'lotCode']);
            if (!hasLot(lineItem)) {
                lineItem.$errors.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else if (lotCode && lotCode.length > SIGLUS_MAX_STRING_VALUE) {
                lineItem.$errors.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
            } else if (hasDuplicateLotCode(lineItem)) {
                lineItem.$errors.lotCodeInvalid = $stateParams.locationManagementOption === 'location'
                    ? messageService.get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicateByLocation')
                    : messageService.get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicate');
            } else {
                lineItem.$errors.lotCodeInvalid = false;
            }

            return lineItem.$errors.lotCodeInvalid;
        };
        function isErrorEqual(source, error1, error2) {
            return source === error1 || source === error2;
        }
        vm.validateDuplicateLotCode = function(lineItem) {
            var errorByLocation = messageService
                .get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicateByLocation');
            var errorByProduct = messageService.get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicate');
            var isKit = _.get(lineItem, ['orderable', 'isKit']);
            if (isKit) {
                var hasDplicateLocation = getRelatedLineItemsWithSameLocation(lineItem).length > 1;
                if (hasDplicateLocation) {
                    lineItem.$errors.locationInvalid = $stateParams.locationManagementOption === 'location'
                        ? errorByLocation : errorByProduct;
                } else if (isErrorEqual(lineItem.$errors.locationInvalid, errorByLocation, errorByProduct)) {
                    lineItem.$errors.locationInvalid = '';
                }
            } else if (hasDuplicateLotCode(lineItem)) {
                lineItem.$errors.lotCodeInvalid = $stateParams.locationManagementOption === 'location'
                    ? errorByLocation : errorByProduct;
            } else if (isErrorEqual(lineItem.$errors.lotCodeInvalid, errorByLocation, errorByProduct)) {
                lineItem.$errors.lotCodeInvalid = '';
            }

            return isKit ? lineItem.$errors.locationInvalid : lineItem.$errors.lotCodeInvalid;
        };

        vm.validateLocation = function(lineItem) {
            var relatedLineItems = getRelatedLineItems(lineItem);
            _.forEach(relatedLineItems, function(line) {
                vm.validateDuplicateLotCode(line);
            });
            if (lineItem.locationCode &&
                lineItem.$errors.locationInvalid === messageService.get('stockPhysicalInventoryDraft.required')) {
                lineItem.$errors.locationInvalid = '';
            } else if (!lineItem.locationCode) {
                lineItem.$errors.locationInvalid = messageService
                    .get('stockPhysicalInventoryDraft.required');
            }
            return lineItem.$errors.locationInvalid;
        };

        vm.validExpirationDate = function(lineItem) {
            if (isEmpty(lineItem.stockOnHand) && !(lineItem.lot && lineItem.lot.expirationDate)) {
                lineItem.$errors.lotDateInvalid = true;
            } else {
                lineItem.$errors.lotDateInvalid = false;
            }
            return lineItem.$errors.lotDateInvalid;
        };

        vm.validateReasonFreeText = function(lineItem) {
            if (vm.isFreeTextAllowed(lineItem)) {
                lineItem.$errors.reasonFreeTextInvalid = isEmpty(lineItem.reasonFreeText);
            } else {
                lineItem.$errors.reasonFreeTextInvalid = false;
            }
            return lineItem.$errors.reasonFreeTextInvalid;
        };

        vm.isFreeTextAllowed = function(lineItem) {
            var isFreeTextAllowed = _.some(lineItem.stockAdjustments, function(stockAdjustment) {
                return stockAdjustment.reason && stockAdjustment.reason.isFreeTextAllowed;
            });
            if (!isFreeTextAllowed) {
                lineItem.reasonFreeText = undefined;
            }
            return isFreeTextAllowed;
        };

        function isEmpty(value) {
            return value === '' || value === undefined || value === null;
        }

        function hasLot(item) {
            return item.lot && item.lot.lotCode;
        }

        function hasDuplicateLotCode(lineItem) {
            var allLots = getAllLotCode(lineItem.orderable.id, lineItem.area, lineItem.locationCode);
            var duplicatedLineItems = hasLot(lineItem) ? _.filter(allLots, function(lot) {
                return lot === lineItem.lot.lotCode.toUpperCase();
            }) : [];
            return duplicatedLineItems.length > 1;
        }

        function validate() {
            var anyError = false;
            var isByLocation = $stateParams.locationManagementOption;
            var allLineItems = vm.draft.lineItems;

            if (isByLocation === 'location') {
                allLineItems.forEach(function(item) {
                    if (!_.get(item, ['orderable', 'id']) && !item.skipped) {
                        item.$errors.skippedInvalid = 'hasEmptyLocation';
                        anyError = 'hasEmptyLocation';
                    }
                });
            }
            if (!anyError && isByLocation === 'location') {
                allLineItems.forEach(function(item) {
                    if (hasDuplicateLotCode(item)) {
                        item.$errors.lotCodeInvalid = messageService
                            .get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicate');
                        anyError = 'hasDuplicateLotCode';
                    }
                });
            }
            if (!anyError && $stateParams.locationManagementOption === 'product') {
                allLineItems.forEach(function(item) {
                    if (item.orderable && item.orderable.id) {
                        if (!item.orderable.isKit) {
                            anyError = vm.validateLotCode(item) || anyError;
                            anyError = vm.validExpirationDate(item) || anyError;
                        }
                        anyError = vm.validateReasonFreeText(item) || anyError;
                        anyError = vm.validateQuantity(item) || anyError;
                        anyError = vm.validateLocation(item) || anyError;
                    }
                });
            } else if (!anyError && $stateParams.locationManagementOption === 'location') {
                allLineItems.forEach(function(item) {
                    var skipped = _.get(item, 'skipped', false);
                    if (!skipped) {
                        anyError = vm.validateReasonFreeText(item) || anyError;
                        anyError = vm.validateQuantity(item) || anyError;
                    }
                });
            }
            return anyError;
        }

        function getAllLotCode(orderableId, area, locationCode) {
            var draftLots = [];
            _.each(draft.lineItems, function(item) {
                if (
                    item.orderable.id === orderableId
                        && item.lot
                        && item.lot.lotCode
                        && item.area === area
                        && item.locationCode === locationCode
                ) {
                    draftLots.push(item.lot.lotCode.toUpperCase());
                }
            });
            return draftLots;
        }

        function getRelatedLineItems(lineItem) {
            return draft.lineItems.filter(function(line) {
                return _.get(line, ['orderable', 'id']) === _.get(lineItem, ['orderable', 'id']);
            });
        }
        function getRelatedLineItemsWithSameLocation(lineItem) {
            return draft.lineItems.filter(function(line) {
                return _.get(line, ['orderable', 'id']) === _.get(lineItem, ['orderable', 'id'])
                    && _.get(line, 'locationCode') === _.get(lineItem, 'locationCode');
            });
        }
        // SIGLUS-REFACTOR: ends here

        function resetWatchItems() {
            $scope.needToConfirm = false;
        }

        function onInit() {
            updateLabel();
            vm.reasons = reasons;
            vm.stateParams = $stateParams;
            $stateParams.program = undefined;
            $stateParams.facility = undefined;
            // SIGLUS-REFACTOR: starts here
            initiateLineItems();
            vm.hasLot = vm.existLotCode.length > 0;
            $scope.needToConfirm = $stateParams.isAddProduct;
            $scope.focusedRow = undefined;
            // SIGLUS-REFACTOR: starts here

            vm.updateProgress();
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            var orderableGroups = orderableGroupService.groupByOrderableId(draft.lineItems);
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(orderableGroups);
            if ($stateParams.actionType === 'NOT_YET_STARTED') {
                saveDraft(true);
            }
            vm.allLocationAreaMap = allLocationAreaMap;

            // set vm.displayLineItemsGroup
            if (vm.locationManagementOption === 'location') {
                var displayLineItemsMap = _.reduce(displayLineItemsGroup, function(r, c) {
                    if (r[c[0].locationCode]) {
                        r[c[0].locationCode].push(c);
                    } else {
                        r[c[0].locationCode] = [c];
                    }
                    return r;
                }, {});
                var itemsKeyAfterSort = _.sortBy(Object.keys(displayLineItemsMap), function(a) {
                    return a;
                });
                vm.displayLineItemsGroup = _.reduce(itemsKeyAfterSort, function(r, c) {
                    r.push(displayLineItemsMap[c][0]);
                    return r;
                }, []);
            } else {
                vm.displayLineItemsGroup = displayLineItemsGroup;
            }

            $scope.$watchCollection(function() {
                return vm.pagedLineItems;
            }, function(newList) {
                var areaList = _.map(Object.keys(vm.allLocationAreaMap), function(item) {
                    return {
                        code: item,
                        label: item
                    };
                });
                var locationList = _.reduce(Object.keys(vm.allLocationAreaMap), function(r, c) {
                    r = r.concat(_.map(vm.allLocationAreaMap[c], function(_item) {
                        return {
                            code: _item.locationCode,
                            label: _item.locationCode
                        };
                    }));
                    return r;
                }, []);
                var allLocation = _.flatten(Object.values(vm.allLocationAreaMap));
                vm.areaList = areaList;
                vm.allLocationList = locationList;
                _.forEach(newList, function(item) {
                    _.forEach(item, function(itm) {
                        itm.area = itm.area ? itm.area : null;
                        // itm.locationCode = itm.locationCode ? itm.locationCode : null;
                        if (itm.locationCode) {
                            var currentArea = _.find(allLocation, function(location) {
                                return location.locationCode === itm.locationCode;
                            });
                            itm.areaList = currentArea ? [{
                                code: currentArea.area,
                                label: currentArea.area
                            }] : areaList;
                            itm.locationList = currentArea ?
                                _.map(vm.allLocationAreaMap[currentArea.area], function(location) {
                                    return {
                                        code: location.locationCode,
                                        label: location.locationCode
                                    };
                                }) : locationList;
                        } else {
                            itm.locationCode = null;
                            itm.areaList = itm.areaList ? itm.areaList : areaList;
                            itm.locationList = itm.locationList ? itm.locationList : locationList;
                        }
                    });
                });
                // SIGLUS-REFACTOR: starts here

                var categories = $stateParams.locationManagementOption === 'location' ?
                    $filter('siglusGroupByAllProductProgramProductCategoryByLocation')(newList) :
                    $filter('siglusGroupByCategoryDisplayName')(newList);
                vm.groupedCategories = _.isEmpty(categories) ? [] : categories;
                localStorageService.add('physicalInventoryCategories', JSON.stringify(categories));
                // SIGLUS-REFACTOR: ends here
            }, true);
        }

        vm.skipChange = function() {
            _.each(vm.displayLineItemsGroup, function(item) {
                var orderableId = _.get(item[0], ['orderable', 'id']);
                if (!orderableId && item[0].skipped) {
                    item[0].$errors.skippedInvalid = '';
                }
            });
            vm.updateProgress();
        };

        vm.onSelectChange = function(type, lineItem) {
            if (type === 'area') {
                lineItem.locationCode = null;
                lineItem.locationList = lineItem.area ? _.map(vm.allLocationAreaMap[lineItem.area], function(item) {
                    return {
                        code: item.locationCode,
                        label: item.locationCode
                    };
                }) : vm.allLocationList;
                lineItem.areaList = vm.areaList;
                vm.validateLotCode(lineItem);
                vm.validateLocation(lineItem);
            } else {
                if (lineItem.locationCode) {
                    setSohForLineItem(lineItem);
                    lineItem.area = _.find(_.flatten(Object.values(vm.allLocationAreaMap)), function(item) {
                        return item.locationCode === lineItem.locationCode;
                    }).area;
                    lineItem.locationList = _.map(vm.allLocationAreaMap[lineItem.area], function(item) {
                        return {
                            code: item.locationCode,
                            label: item.locationCode
                        };
                    });
                    lineItem.areaList = [{
                        code: lineItem.area,
                        label: lineItem.area
                    }];
                } else {
                    lineItem.$previewSOH = undefined;
                    lineItem.locationList =  lineItem.area
                        ? _.map(vm.allLocationAreaMap[lineItem.area], function(item) {
                            return {
                                code: item.locationCode,
                                label: item.locationCode
                            };
                        }) : vm.allLocationList;
                    lineItem.areaList = vm.areaList;
                }
                vm.validateLotCode(lineItem);
                vm.validateLocation(lineItem);
            }
        };

        function onChange() {
            $scope.needToConfirm = true;
        }

        // SIGLUS-REFACTOR: starts here
        function updateLabel() {
            $stateParams.draft = draft;
            if ($stateParams.isMerged === 'true') {
                $state.current.label = messageService.get('stockPhysicalInventoryDraft.mergeDraft');
            } else {
                $state.current.label =
                        messageService.get('stockPhysicalInventoryDraft.draft')
                        + ' '
                        + $stateParams.draftNum;
            }
        }

        function initiateLineItems() {
            _.forEach(draft.lineItems, function(item) {
                if (!item.$errors) {
                    item.$errors = {};
                }
                if (!item.$diffMessage) {
                    item.$diffMessage = {};
                }
                if (!vm.isInitialInventory && item.quantity !== null) {
                    var diff = stockReasonsCalculations.calculateDifference(item);
                    buildMovementMessage(item, diff);
                    vm.validateReasonFreeText(item);
                }
            });
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name checkUnaccountedStockAdjustments
         *
         * @description
         * Calculates unaccounted and set value to line item.
         *
         * @param   {Object}    lineItem    the lineItem containing stock adjustments
         */
        function checkUnaccountedStockAdjustments(lineItem) {
            lineItem.unaccountedQuantity =
                stockReasonsCalculations.calculateUnaccounted(lineItem, lineItem.stockAdjustments);
        }

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name quantityChanged
         *
         * @description
         * Callback method for quantity change. It will update progress and fire up validations.
         *
         * @param   {Object}    lineItem    the lineItem containing quantity
         */
        // SIGLUS-REFACTOR: starts here
        function quantityChanged(lineItem) {
            vm.validateQuantity(lineItem);
            if (!lineItem.$errors.quantityInvalid) {
                addStockAdjustments(lineItem);
                vm.checkUnaccountedStockAdjustments(lineItem);
            }
            vm.updateProgress();
            onChange();
        }

        function lotCodeChanged(lineItem) {
            if (lineItem.lot && lineItem.lot.lotCode) {
                lineItem.lot.lotCode = lineItem.lot.lotCode.toUpperCase();
            }
            vm.updateProgress();
            onChange();
        }

        function expirationDateChanged(lineItem) {
            vm.updateProgress();
            vm.validExpirationDate(lineItem);
            onChange();
        }

        function reasonChanged(lineItem) {
            vm.checkUnaccountedStockAdjustments(lineItem);
            vm.updateProgress();
            onChange();
        }

        function reasonTextChanged(lineItem) {
            vm.validateReasonFreeText(lineItem);
            vm.updateProgress();
            onChange();
        }

        function focusedRowChanged(lineItem) {
            if ($scope.focusedRow !== undefined && $scope.focusedRow !== lineItem) {
                vm.validateReasonFreeText($scope.focusedRow);
                onChange();
            }
            $scope.focusedRow = lineItem;
        }

        // SIGLUS_REFACTOR: starts here
        function buildMovementMessage(lineItem, diff) {
            if (diff > 0) {
                lineItem.$diffMessage.movementPopoverMessage = messageService.get(
                    'stockPhysicalInventoryDraft.PositiveAdjustment', {
                        diff: diff
                    }
                );
            } else if (diff < 0) {
                lineItem.$diffMessage.movementPopoverMessage = messageService.get(
                    'stockPhysicalInventoryDraft.NegativeAdjustment', {
                        diff: -diff
                    }
                );
            } else {
                lineItem.$diffMessage.movementPopoverMessage = '';
            }
        }
        // SIGLUS_REFACTOR: ends here

        function addStockAdjustments(lineItem) {
            // SIGLUS-REFACTOR: starts here
            var diff = stockReasonsCalculations.calculateDifference(lineItem);
            if (!vm.isInitialInventory) {
                buildMovementMessage(lineItem, diff);
            }
            if (vm.isInitialInventory || diff === 0) {
                lineItem.stockAdjustments = [];
                return;
            }
            var reason;
            if (diff > 0) {
                reason = _.find(vm.reasons[lineItem.programId], function(item) {
                    return item.reasonType === REASON_TYPES.CREDIT;
                });
            } else {
                reason = _.find(vm.reasons[lineItem.programId], function(item) {
                    return item.reasonType === REASON_TYPES.DEBIT;
                });
            }
            var adjustment = {
                reason: reason,
                quantity: Math.abs(diff)
            };
            lineItem.stockAdjustments = [adjustment];
            // SIGLUS-REFACTOR: ends here
        }

        function setSohForLineItem(lineItem) {
            var lotId = _.get(lineItem, ['lot', 'id'], null);
            var locationCode = _.get(lineItem, 'locationCode');
            if ((lotId || lineItem.orderable.isKit) && locationCode) {
                if (lineItem.locationSohInfos) {
                    var locationLotsList = lineItem.locationSohInfos.find(function(locationSohInfo) {
                        return locationSohInfo.locationCode === locationCode;
                    });
                    var lotSoh = _.find(_.get(locationLotsList, 'lots', []), function(lot) {
                        return lot.lotId === lotId;
                    });
                    lineItem.$previewSOH = _.get(lotSoh, 'stockOnHand', undefined);
                    lineItem.stockOnHand = lineItem.$previewSOH;
                } else {
                    siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                        isAdjustment: false,
                        extraData: true
                    }, [lineItem.orderable.id]).then(function(locationSohInfos) {
                        lineItem.locationSohInfos = locationSohInfos;
                        var locationLotsList = lineItem.locationSohInfos.find(function(locationSohInfo) {
                            return locationSohInfo.locationCode === locationCode;
                        });
                        var lotSoh = _.find(_.get(locationLotsList, 'lots', []), function(lot) {
                            return lot.lotId === lotId;
                        });
                        lineItem.$previewSOH = _.get(lotSoh, 'stockOnHand', undefined);
                        lineItem.stockOnHand = lineItem.$previewSOH;
                    });
                }
            }
        }

        function addLot(lineItem) {
            var areaList = vm.areaList;
            var locationList = vm.allLocationList;
            var newLineItem = _.assign({}, angular.copy(lineItem), {
                $errors: {},
                $diffMessage: {},
                id: null,
                area: null,
                areaList: areaList,
                locationCode: null,
                locationList: locationList,
                stockCardId: null,
                lot: {},
                quantity: undefined,
                stockAdjustments: [],
                stockOnHand: 0,
                unaccountedQuantity: undefined,
                reasonFreeText: undefined
            });
            draft.lineItems.push(newLineItem);
            $stateParams.isAddProduct = true;
            reload($state.current.name);
        }

        function addLotByLocation(lineItem, lineItems) {
            loadingModalService.open();
            physicalInventoryService.getApprovedProducts(facility.id, program.id)
                .then(function(productsForThisProgram) {
                    SiglusAddProductsModalWithLocationService.show(
                        productsForThisProgram, vm.hasLot, lineItem.locationCode, [], facility
                    )
                        .then(function(addedItems) {
                            var lineItemsToAdd = addedItems.map(function(item) {
                                return _.assign(generateEmptyLineItem(), {
                                    locationCode: item.locationCode,
                                    lot: angular.copy(item.lot),
                                    orderable: angular.copy(item.orderable),
                                    programId: _.get(item, ['program', 'id'])
                                });
                            });
                            var isEmptyLocation = !lineItem.id && !lineItem.lot && !lineItem.orderable
                                && lineItems.length === 1;
                            if (isEmptyLocation) {
                                var lineItemIndex = _.findIndex(draft.lineItems, lineItem);
                                draft.lineItems.splice(lineItemIndex, 1);
                            }
                            draft.lineItems = draft.lineItems.concat(lineItemsToAdd);
                            loadingModalService.close();
                            $stateParams.isAddProduct = true;
                            reload($state.current.name);
                            siglusArchivedProductService.alterInfo(lineItemsToAdd);
                        })
                        .catch(loadingModalService.close);
                })
                .catch(loadingModalService.close);
        }

        function removeLot(lineItem, lineItems) {
            var index = _.findIndex(draft.lineItems, function(item) {
                return _.isEqual(item, lineItem);
            });
            if (index === -1) {
                return;
            }
            if ($stateParams.locationManagementOption === 'location') {
                if (lineItems.length === 1) {
                    draft.lineItems[index].orderable = {};
                    draft.lineItems[index].lot = {};
                    // draft.lineItems.splice(index, 1);
                    $stateParams.isAddProduct = true;
                    reload($state.current.name);
                    return;
                }
            }
            draft.lineItems.splice(index, 1);
            $stateParams.isAddProduct = true;
            _.each(draft.lineItems, function(item) {
                if (hasDuplicateLotCode(item)) {
                    item.$errors.lotCodeInvalid = messageService
                        .get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicateByLocation');
                } else {
                    item.$errors.lotCodeInvalid = '';
                }
            });
            reload($state.current.name);
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            var relatedLineItems = getRelatedLineItems(lineItem);
            _.forEach(relatedLineItems, function(line) {
                vm.validateDuplicateLotCode(line);
            });
            vm.validExpirationDate(lineItem);
            vm.validateLocation(lineItem);
            vm.updateProgress();

            lineItem.$previewSOH = undefined;
            if (vm.locationManagementOption === 'product') {
                setSohForLineItem(lineItem);
            }
        });

        function delayPromise(delay) {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve();
            }, delay);
            return deferred.promise;
        }
        // SIGLUS-REFACTOR: ends here

        function buildHistoryData(resolvedData) {
            var isByProduct = $stateParams.locationManagementOption === 'product';
            return {
                withLocation: true,
                locationManagementOption: $stateParams.locationManagementOption,
                isByProduct: isByProduct,
                program: vm.program.name,
                province: vm.facility.geographicZone.parent.name,
                district: vm.facility.geographicZone.name,
                facilityCode: vm.facility.code,
                healthFacility: vm.facility.name,
                submittedBy: resolvedData.signature,
                signature: resolvedData.signature,
                creationDate: resolvedData.occurredDate,
                lineItemsData: buildLineItemsData(isByProduct)
            };
        }

        function buildLineItemsData(isByProduct) {
            var lineItemsData = [];

            vm.displayLineItemsGroup.forEach(function(displayLineItems) {
                var currentProduct = displayLineItems[0].orderable;
                var currentLocation = displayLineItems[0].locationCode;

                if (displayLineItems.length > 1) {
                    var stockOnHandSum = 0;
                    var currentStockSum = 0;
                    displayLineItems.forEach(function(lineItem) {
                        stockOnHandSum = stockOnHandSum + lineItem.stockOnHand;
                        currentStockSum = currentStockSum + lineItem.quantity;
                    });

                    lineItemsData.push({
                        productCode: isByProduct ? currentProduct.productCode : null,
                        productName: isByProduct ? currentProduct.fullProductName : null,
                        location: isByProduct ? null : currentLocation,
                        lotCode: null,
                        expirationDate: null,
                        stockOnHand: stockOnHandSum,
                        currentStock: currentStockSum,
                        reasons: null,
                        comments: null
                    });
                    lineItemsData = lineItemsData.concat(buildLotItemListData(displayLineItems, isByProduct));
                } else {
                    var lineItem = buildLotItemListData(displayLineItems, isByProduct)[0];
                    var assignData = isByProduct ? {
                        productCode: currentProduct.productCode,
                        productName: currentProduct.fullProductName
                    } : {
                        location: currentLocation
                    };
                    lineItemsData.push(_.assign(lineItem, assignData));
                }
            });
            return lineItemsData;
        }

        function buildLotItemListData(lineItems, isByProduct) {
            return lineItems.map(function(lineItem) {
                return {
                    productCode: isByProduct ? null : lineItem.orderable.productCode,
                    productName: isByProduct ? null : lineItem.orderable.fullProductName,
                    lotCode: lineItem.lot ? lineItem.lot.lotCode : null,
                    expirationDate: lineItem.lot ? lineItem.lot.expirationDate : null,
                    stockOnHand: lineItem.stockOnHand,
                    currentStock: lineItem.quantity,
                    reasons: {
                        reason: lineItem.stockAdjustments[0] ? lineItem.stockAdjustments[0].reason.name : null,
                        message: lineItem.$diffMessage ? lineItem.$diffMessage.movementPopoverMessage : null
                    },
                    comments: lineItem.reasonFreeText,
                    location: isByProduct ? lineItem.area + ' - ' + lineItem.locationCode : null
                };
            });
        }

        function generateEmptyLineItem() {
            return {
                $errors: {},
                $diffMessage: {},
                id: null,
                area: null,
                areaList: vm.areaList,
                locationCode: null,
                locationList: vm.allLocationList,
                extraData: {},
                lot: {},
                lotId: null,
                lotOptions: [],
                orderable: {},
                orderableId: null,
                programId: null,
                quantity: 0,
                reasonFreeText: undefined,
                skipped: false,
                stockOnHand: 0,
                stockAdjustments: [],
                stockCardId: null,
                vvmStatuses: undefined
            };
        }

        function goBack() {
            $state.go('^', {}, {
                reload: true
            });
        }
    }
})();
