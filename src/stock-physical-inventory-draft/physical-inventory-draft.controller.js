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
     * @name stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     *
     * @description
     * Controller for managing physical inventory draft.
     */
    angular
        .module('stock-physical-inventory-draft')
        .controller('PhysicalInventoryDraftController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', 'addProductsModalService', 'messageService',
        'physicalInventoryFactory', 'notificationService', 'alertService', 'confirmDiscardService',
        'chooseDateModalService', 'program', 'facility', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'stockReasonsCalculations', 'loadingModalService', 'orderableGroupService', '$filter',
        '$q', 'REASON_TYPES', 'SIGLUS_MAX_STRING_VALUE', 'currentUserService', 'navigationStateService',
        'siglusArchivedProductService', 'physicalInventoryDataService', 'SIGLUS_TIME',
        'siglusRemainingProductsModalService', 'subDraftIds', 'alertConfirmModalService',
        'siglusOrderableLotService', 'draft', 'displayLineItemsGroup', 'reasons', 'rawLineItems',
        'siglusOrderableLotListService'
    ];

    function controller(
        $scope, $state, $stateParams, addProductsModalService, messageService,
        physicalInventoryFactory, notificationService, alertService, confirmDiscardService,
        chooseDateModalService, program, facility, physicalInventoryService, MAX_INTEGER_VALUE,
        VVM_STATUS, stockReasonsCalculations, loadingModalService, orderableGroupService, $filter,
        $q, REASON_TYPES, SIGLUS_MAX_STRING_VALUE, currentUserService, navigationStateService,
        siglusArchivedProductService, physicalInventoryDataService, SIGLUS_TIME,
        siglusRemainingProductsModalService, subDraftIds, alertConfirmModalService,
        siglusOrderableLotService, draft, displayLineItemsGroup, reasons, rawLineItems,
        siglusOrderableLotListService
    ) {
        var vm = this;

        vm.$onInit = onInit;
        vm.quantityChanged = quantityChanged;
        vm.checkUnaccountedStockAdjustments = checkUnaccountedStockAdjustments;
        // SIGLUS-REFACTOR: starts here
        vm.lotCodeChanged = lotCodeChanged;
        vm.expirationDateChanged = expirationDateChanged;
        vm.reasonChanged = reasonChanged;
        vm.reasonTextChanged = reasonTextChanged;
        vm.addStockAdjustments = addStockAdjustments;
        vm.focusedRowChanged = focusedRowChanged;
        vm.addLot = addLot;
        vm.removeLot = removeLot;
        vm.isEmpty = isEmpty;
        vm.actionType = $stateParams.actionType;
        vm.isMergeDraft = $stateParams.isMerged === 'true';
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name displayLineItemsGroup
         * @type {Array}
         *
         * @description
         * Holds current display physical inventory draft line items grouped by orderable id.
         */
        vm.displayLineItemsGroup = displayLineItemsGroup;

        vm.updateProgress = function() {
            vm.itemsWithQuantity = _.filter(vm.displayLineItemsGroup, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    // SIGLUS-REFACTOR: starts here
                    var flag = false;
                    if (lineItem.orderable && lineItem.orderable.isKit || !isEmpty(lineItem.stockOnHand)) {
                        flag = !isEmpty(lineItem.quantity) &&
                            !(vm.isFreeTextAllowed(lineItem) && isEmpty(lineItem.reasonFreeText));
                    } else {
                        flag = updateInitialInventory(lineItem);
                    }
                    return flag;
                    // SIGLUS-REFACTOR: ends here
                });
            });
        };

        // SIGLUS-REFACTOR: starts here
        function updateInitialInventory(lineItem) {
            if (vm.isInitialInventory) {
                return hasLot(lineItem) && !isEmpty(lineItem.lot.expirationDate) && !isEmpty(lineItem.quantity);
            }
            return hasLot(lineItem) && !isEmpty(lineItem.lot.expirationDate) && !isEmpty(lineItem.quantity)
                && !(vm.isFreeTextAllowed(lineItem) && isEmpty(lineItem.reasonFreeText));
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds current program info.
         */
        vm.program = program;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds home facility info.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name keyword
         * @type {String}
         *
         * @description
         * Holds keywords for searching.
         */
        vm.keyword = $stateParams.keyword;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name groupedCategories
         * @type {Object}
         *
         * @description
         * Holds line items grouped by category.
         */
        vm.groupedCategories = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
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
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
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
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name addProducts
         *
         * @description
         * Pops up a modal for users to add products for physical inventory.
         */
        // SIGLUS-REFACTOR: starts here
        vm.addProducts = function() {
            loadingModalService.open();
            physicalInventoryService.getApprovedProducts(facility.id, program.id)
                .then(function(productsForThisProgram) {
                    var existedProductList = _.unique(rawLineItems.map(function(lineItem) {
                        return _.get(lineItem, ['orderable', 'id']);
                    }));
                    var productsToAdd = productsForThisProgram.filter(function(productInfo) {
                        return !existedProductList.includes(_.get(productInfo, ['orderable', 'id']));
                    });
                    addProductsModalService.show(productsToAdd, vm.hasLot, false, vm.isInitialInventory)
                        .then(function(addedItems) {
                            if (addedItems.length === 0) {
                                loadingModalService.close();
                                return;
                            }
                            var orderableIds = addedItems.map(function(item) {
                                return _.get(item, ['orderable', 'id']);
                            });
                            // TODO: is get lotOptions necessary?
                            siglusOrderableLotListService.getOrderableLots(facility.id, orderableIds)
                                .then(function(lotList) {
                                    loadingModalService.close();
                                    var lotsMapByOrderableId =
                                        siglusOrderableLotListService.getSimplifyLotsMapByOrderableId(lotList);
                                    var lineItemsToAdd = addedItems.map(function(item) {
                                        return _.assign(buildEmptyLineItem(), {
                                            orderable: angular.copy(item.orderable),
                                            quantity: item.quantity,
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
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
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
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */

        vm.search = function() {
            $stateParams.page = 0;
            $stateParams.keyword = vm.keyword;
            // SIGLUS-REFACTOR: starts here
            // Only reload current state and avoid reloading parent state
            return reload($state.current.name);
            // SIGLUS-REFACTOR: ends here
        };

        // SIGLUS-REFACTOR: starts here
        vm.doCancelFilter = function() {
            if ($stateParams.keyword) {
                $stateParams.keyword = null;
                reload($state.current.name);
            }
        };
        // SIGLUS-REFACTOR: ends here

        // SIGLUS-REFACTOR: starts here
        $scope.$watch(function() {
            return vm.keyword;
        }, function(newValue, oldValue) {
            if (oldValue && !newValue && $stateParams.keyword) {
                $stateParams.keyword = null;
                reload($state.current.name);
            }
        });
        // SIGLUS-REFACTOR: ends here

        // SIGLUS-REFACTOR: starts here
        function reload(isReload) {
            loadingModalService.open();
            draft.lineItems = getUpdatedLineItems();
            // TODO: set reason & lotsMap into $stateParams
            $stateParams.program = vm.program;
            $stateParams.facility = vm.facility;
            $stateParams.draft = draft;
            $state.go($state.current.name, $stateParams, {
                reload: isReload
            });
        }
        // SIGLUS-REFACTOR: ends here

        function getUpdatedLineItems() {
            var updatedLineItems = [];
            _.forEach(draft.lineItems, function(draftLineItem) {
                var updatedLineItem = rawLineItems.find(function(updatedLineItem) {
                    if (draftLineItem.id) {
                        return draftLineItem.id === updatedLineItem.id;
                    } else if (draftLineItem.tempId) {
                        return draftLineItem.tempId === updatedLineItem.tempId;
                    }
                    return false;
                });
                updatedLineItems.push(updatedLineItem ? updatedLineItem : draftLineItem);
            });
            return updatedLineItems;
        }

        // SIGLUS-REFACTOR: starts here
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

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveDraft
         *
         * @description
         * Save physical inventory draft.
         */
        var saveDraft = function(notReload) {
            if ($stateParams.keyword) {
                $stateParams.keyword = null;
            }
            loadingModalService.open();
            return physicalInventoryFactory.saveDraft(_.assign({}, draft, {
                summaries: [],
                subDraftIds: subDraftIds
            })).then(function() {
                if (!notReload) {
                    notificationService.success('stockPhysicalInventoryDraft.saved');
                }
                $scope.needToConfirm = false;

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
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveOnPageChange
         *
         * @description
         * Save physical inventory draft on page change.
         */
        // SIGLUS-REFACTOR: starts here: for open loading when reload page
        vm.saveOnPageChange = function() {
            // only this works!
            loadingModalService.open();
            return delayPromise(SIGLUS_TIME.LOADING_TIME).then(function() {
                var params = {};
                params.draft = draft;
                return $q.resolve(params);
            });
        };
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name deleteDraft
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
                physicalInventoryService.deleteDraft(subDraftIds, vm.isInitialInventory).then(function() {
                    $scope.needToConfirm = false;
                    if (vm.isInitialInventory) {
                        goBack();
                    }
                    $state.go('openlmis.stockmanagement.physicalInventory.draftList', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };
        vm.delete = _.throttle(deleteDraft, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        var subDraftSubmit = function() {
            $scope.needToConfirm = false;
            loadingModalService.open();
            physicalInventoryService.submitSubPhysicalInventory(_.assign({}, draft, {
                summaries: [],
                subDraftIds: subDraftIds
            }))
                .then(function() {
                    var notificationText = vm.isInitialInventory ?
                        'stockInitialInventoryDraft.submitted' : 'stockPhysicalInventoryDraft.submitted';
                    notificationService.success(notificationText);
                    goBack();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    if (error.data.isBusinessError) {
                        var data = error.data.businessErrorExtraData;
                        openRemainingModal('submit', data);
                    }
                });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name submit
         *
         * @description
         * Submit physical inventory.
         */
        var submit = function() {
            if (validate()) {
                if ($stateParams.draftNum) {
                    subDraftSubmit();
                    return;
                }
                chooseDateModalService.show(new Date(), true).then(function(resolvedData) {
                    loadingModalService.open();

                    draft.occurredDate = resolvedData.occurredDate;
                    draft.signature = resolvedData.signature;

                    physicalInventoryService.submitPhysicalInventory(_.assign({}, draft, {
                        summaries: []
                    }), false, buildHistoryData(resolvedData))
                        .then(function() {
                            // rep logic
                            if (vm.isInitialInventory) {
                                currentUserService.clearCache();
                                navigationStateService.clearStatesAvailability();
                                notificationService.success('stockInitialInventoryDraft.submitted');
                            } else {
                                notificationService.success('stockPhysicalInventoryDraft.submitted');
                            }

                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                program: program.id,
                                facility: facility.id
                            }, {
                                reload: true
                            });
                        }, function() {
                            loadingModalService.close();
                            if (vm.isInitialInventory) {
                                alertService.error('stockInitialInventoryDraft.submitFailed');
                            } else {
                                alertService.error('stockPhysicalInventoryDraft.submitFailed');
                            }

                        });
                });
            } else {
                // SIGLUS-REFACTOR: starts here
                if ($stateParams.keyword) {
                    $stateParams.keyword = null;
                }
                // SIGLUS-REFACTOR: ends here
                $scope.$broadcast('openlmis-form-submit');
                alertService.error('stockPhysicalInventoryDraft.submitInvalid');
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
            if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (isEmpty(lineItem.quantity)) {
                lineItem.$errors.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                lineItem.$errors.quantityInvalid = false;
            }
            return lineItem.$errors.quantityInvalid;
        };

        vm.validateLotCode = function(lineItem) {
            if (isEmpty(lineItem.stockOnHand) && !(lineItem.lot && lineItem.lot.id)) {
                if (!hasLot(lineItem)) {
                    lineItem.$errors.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.required');
                } else if (lineItem.lot.lotCode.length > SIGLUS_MAX_STRING_VALUE) {
                    lineItem.$errors.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
                } else if (hasDuplicateLotCode(lineItem)) {
                    lineItem.$errors.lotCodeInvalid = messageService
                        .get('stockPhysicalInventoryDraft.lotCodeDuplicate');
                } else {
                    lineItem.$errors.lotCodeInvalid = false;
                }
            } else {
                lineItem.$errors.lotCodeInvalid = false;
            }
            return lineItem.$errors.lotCodeInvalid;
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
            var hasDiffMessage = Boolean(lineItem.$diffMessage.movementPopoverMessage);
            var isFreeTextAllowed = _.some(lineItem.stockAdjustments, function(stockAdjustment) {
                return stockAdjustment.reason && stockAdjustment.reason.isFreeTextAllowed;
            });
            if (!isFreeTextAllowed && !hasDiffMessage) {
                lineItem.reasonFreeText = undefined;
            }
            return isFreeTextAllowed || hasDiffMessage;
        };

        function isEmpty(value) {
            return value === '' || value === undefined || value === null;
        }

        function hasLot(item) {
            return item.lot && item.lot.lotCode;
        }

        function hasDuplicateLotCode(lineItem) {
            var allLots = getAllLotCode(lineItem.orderable.id);
            var duplicatedLineItems = hasLot(lineItem) ? _.filter(allLots, function(lot) {
                return lot === lineItem.lot.lotCode.toUpperCase();
            }) : [];
            return duplicatedLineItems.length > 1;
        }

        function validate() {
            var anyError = false;
            _.forEach(rawLineItems, function(lineItem) {
                if (!(lineItem.orderable && lineItem.orderable.isKit)) {
                    anyError = vm.validateLotCode(lineItem) || anyError;
                    anyError = vm.validExpirationDate(lineItem) || anyError;
                }
                anyError = vm.validateReasonFreeText(lineItem) || anyError;
                anyError = vm.validateQuantity(lineItem) || anyError;
            });
            return !anyError;
        }

        function getAllLotCode(orderableId) {
            var draftLots = [];
            _.each(draft.lineItems, function(item) {
                if (item.orderable.id === orderableId && item.lot && item.lot.lotCode) {
                    draftLots.push(item.lot.lotCode.toUpperCase());
                }
            });
            return draftLots;
        }
        // SIGLUS-REFACTOR: ends here

        function onInit() {
            // SIGLUS-REFACTOR: starts here
            updateLabel();
            // SIGLUS-REFACTOR: ends here

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
            $scope.$watchCollection(function() {
                return vm.pagedLineItems;
            }, function(newList) {
                // SIGLUS-REFACTOR: starts here
                var categories = $filter('siglusGroupByAllProductProgramProductCategory')(newList);
                vm.groupedCategories = _.isEmpty(categories) ? [] : categories;
                // SIGLUS-REFACTOR: ends here
            }, true);
        }

        function onChange() {
            $scope.needToConfirm = true;
        }

        // SIGLUS-REFACTOR: starts here
        function updateLabel() {
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
            // TODO: remove draft.summaries related
            _.forEach(draft.summaries, function(summary) {
                if (!summary.$errors) {
                    summary.$errors = {};
                }
                if (summary.lot && summary.lot.id) {
                    vm.existLotCode.push(summary.lot.id);
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
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
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
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
                vm.addStockAdjustments(lineItem);
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

        function addLot(lineItem) {
            var newLineItem = buildEmptyLineItem(lineItem);
            draft.lineItems.push(newLineItem);
            $stateParams.isAddProduct = true;
            reload($state.current.name);
        }

        function removeLot(lineItem) {
            var index = _.findIndex(draft.lineItems, function(item) {
                if (lineItem.id && item.id) {
                    return lineItem.id === item.id;
                } else if (lineItem.tempId && item.tempId) {
                    return lineItem.tempId === item.tempId;
                }
                return false;
            });
            if (index < 0) {
                return;
            }
            draft.lineItems.splice(index, 1);
            $stateParams.isAddProduct = true;
            reload($state.current.name);
        }

        function buildEmptyLineItem(rawLineItem) {
            return _.assign({}, rawLineItem, {
                $errors: {},
                $diffMessage: {},
                id: null,
                tempId: _.uniqueId(),
                stockCardId: null,
                quantity: undefined,
                stockAdjustments: [],
                stockOnHand: null,
                reasonFreeText: undefined,
                lot: {},
                // deprecated: not used in anywhere
                unaccountedQuantity: undefined
            });
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            vm.validateLotCode(lineItem);
            vm.validExpirationDate(lineItem);
            vm.updateProgress();
        });

        function delayPromise(delay) {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve();
            }, delay);
            return deferred.promise;
        }

        $scope.$on('$stateChangeStart', function(event, toState) {
            if (toState.name !== 'openlmis.stockmanagement.initialInventory.draft'
                && toState.name !== 'openlmis.stockmanagement.physicalInventory.draftList.draft') {
                physicalInventoryDataService.clear();
            }
        });
        // SIGLUS-REFACTOR: ends here

        function buildHistoryData(resolvedData) {
            return {
                program: vm.program.name,
                province: vm.facility.geographicZone.parent.name,
                district: vm.facility.geographicZone.name,
                facilityCode: vm.facility.code,
                healthFacility: vm.facility.name,
                submittedBy: resolvedData.signature,
                signature: resolvedData.signature,
                creationDate: resolvedData.occurredDate,
                lineItemsData: buildLineItemsData()
            };
        }

        function buildLineItemsData() {
            var lineItemsData = [];
            try {
                vm.displayLineItemsGroup.forEach(function(displayLineItems) {
                    var currentProduct = displayLineItems[0].orderable;

                    if (displayLineItems.length > 1) {
                        var stockOnHandSum = 0;
                        var currentStockSum = 0;
                        displayLineItems.forEach(function(lineItem) {
                            stockOnHandSum = stockOnHandSum + lineItem.stockOnHand;
                            currentStockSum = currentStockSum + lineItem.quantity;
                        });

                        lineItemsData.push({
                            productCode: currentProduct.productCode,
                            productName: currentProduct.fullProductName,
                            lotCode: null,
                            expirationDate: null,
                            stockOnHand: stockOnHandSum,
                            currentStock: currentStockSum,
                            reasons: null,
                            comments: null
                        });
                        lineItemsData = lineItemsData.concat(buildLotItemListData(displayLineItems));
                    } else {
                        var lineItem = buildLotItemListData(displayLineItems)[0];
                        lineItemsData.push(_.assign(lineItem, {
                            productCode: currentProduct.productCode,
                            productName: currentProduct.fullProductName
                        }));
                    }
                });
            } catch (err) {
                alertService.error('stockPhysicalInventoryDraft.submitInvalid', err);
            }

            return lineItemsData;
        }

        function buildLotItemListData(lineItems) {
            return lineItems.map(function(lineItem) {
                return {
                    productCode: null,
                    productName: null,
                    lotCode: _.get(lineItem, ['lot', 'lotCode']),
                    expirationDate: _.get(lineItem, ['lot', 'expirationDate']),
                    stockOnHand: lineItem.stockOnHand,
                    currentStock: lineItem.quantity,
                    reasons: {
                        reason: lineItem.stockAdjustments.length > 0 ? lineItem.stockAdjustments[0].reason.name : null,
                        message: _.get(lineItem, ['$diffMessage', 'movementPopoverMessage'], null)
                    },
                    comments: lineItem.reasonFreeText
                };
            });
        }

        function goBack() {
            $state.go('^', {}, {
                reload: true
            });
        }
    }
})();
