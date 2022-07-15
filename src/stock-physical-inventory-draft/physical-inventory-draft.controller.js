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
        '$scope', '$state', '$stateParams', 'addProductsModalService',
        'messageService', 'physicalInventoryFactory', 'notificationService', 'alertService',
        'confirmDiscardService', 'chooseDateModalService', 'program', 'facility',
        'confirmService', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'stockReasonsCalculations', 'loadingModalService', '$window',
        'stockmanagementUrlFactory', 'accessTokenFactory', 'orderableGroupService', '$filter', '$q',
        // SIGLUS-REFACTOR: starts here
        'REASON_TYPES', 'SIGLUS_MAX_STRING_VALUE', 'currentUserService', 'navigationStateService',
        'siglusArchivedProductService', 'siglusOrderableLotMapping', 'physicalInventoryDataService',
        'SIGLUS_TIME', 'siglusRemainingProductsModalService', 'subDraftIds', 'alertConfirmModalService'
        // SIGLUS-REFACTOR: ends here
    ];

    function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                        physicalInventoryFactory, notificationService, alertService, confirmDiscardService,
                        chooseDateModalService, program, facility,
                        confirmService, physicalInventoryService, MAX_INTEGER_VALUE, VVM_STATUS,
                        stockReasonsCalculations, loadingModalService, $window,
                        stockmanagementUrlFactory, accessTokenFactory, orderableGroupService, $filter,  $q,
                        REASON_TYPES, SIGLUS_MAX_STRING_VALUE, currentUserService, navigationStateService,
                        siglusArchivedProductService, siglusOrderableLotMapping, physicalInventoryDataService,
                        SIGLUS_TIME, siglusRemainingProductsModalService, subDraftIds, alertConfirmModalService) {
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
        var draft = physicalInventoryDataService.getDraft(facility.id);
        var reasons = physicalInventoryDataService.getReasons(facility.id);
        var displayLineItemsGroup = physicalInventoryDataService.getDisplayLineItemsGroup(facility.id);
        siglusOrderableLotMapping.setOrderableGroups(orderableGroupService.groupByOrderableId(draft.summaries));
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
        vm.back = function() {
            $state.go('^', {}, {
                reload: true
            });
        };
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
        vm.groupedCategories = false;

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
            // var notYetAddedItems = _.chain(draft.lineItems)
            //     .difference(_.flatten(vm.displayLineItemsGroup))
            //     .value();
            // var addedLotsId = getAddedLots();
            var addedLotIdAndOrderableId = getAddedLotIdAndOrderableId();
            var notYetAddedItems = _.filter(draft.summaries, function(summary) {
                var lotId = summary.lot && summary.lot.id ? summary.lot && summary.lot.id : null;
                var orderableId = summary.orderable && summary.orderable.id;
                var isInAdded = _.findWhere(addedLotIdAndOrderableId, {
                    lotId: lotId,
                    orderableId: orderableId
                });
                return !isInAdded;
            });
            addProductsModalService.show(notYetAddedItems, vm.hasLot).then(function(addedItems) {
                draft.lineItems = draft.lineItems.concat(addedItems);
                refreshLotOptions();
                // $stateParams.program = vm.program;
                // $stateParams.facility = vm.facility;
                // $stateParams.draft = draft;
                //
                // $stateParams.isAddProduct = true;
                //
                // //Only reload current state and avoid reloading parent state
                // $state.go($state.current.name, $stateParams, {
                //     reload: $state.current.name
                // });
                $stateParams.isAddProduct = true;
                reload($state.current.name);

                // #105: activate archived product
                siglusArchivedProductService.alterInfo(addedItems);
                // #105: ends here
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
            // $stateParams.program = vm.program;
            // $stateParams.facility = vm.facility;
            // $stateParams.draft = draft;
            //
            // //Only reload current state and avoid reloading parent state
            // $state.go($state.current.name, $stateParams, {
            //     reload: $state.current.name
            // });
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
        function reload(reload) {
            loadingModalService.open();
            return delayPromise(SIGLUS_TIME.LOADING_TIME).then(function() {
                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.draft = draft;
                return $state.go($state.current.name, $stateParams, {
                    reload: reload
                });
            });
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveDraft
         *
         * @description
         * Save physical inventory draft.
         */
        // SIGLUS-REFACTOR: starts here
        // TODO name
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
            return physicalInventoryFactory.saveDraft(_.extend({}, draft, {
                summaries: [],
                subDraftIds: subDraftIds
            })).then(function() {
                notificationService.success('stockPhysicalInventoryDraft.saved');
                resetWatchItems();

                $stateParams.isAddProduct = false;
                // $stateParams.program = vm.program;
                // $stateParams.facility = vm.facility;
                // $stateParams.draft = draft;
                // //Reload parent state and current state to keep data consistency.
                // $state.go($state.current.name, $stateParams, {
                //     reload: true
                // });
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
         * @name delete
         *
         * @description
         * Delete physical inventory draft.
         */

        // todo wait for #56
        var deleteDraft = function() {
            if (vm.isMergeDraft) {
                // SIGLUS-REFACTOR: starts here: back to draftlist page whatever is physical or initial
                //$state.go('openlmis.stockmanagement.physicalInventory.draftList');
                $state.go('^', {}, {
                    reload: true
                });
                // SIGLUS-REFACTOR: ends here
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
                    // SIGLUS-REFACTOR: starts here
                    vm.isInitialInventory ?
                        $state.go('^', {}, {
                            reload: true
                        }) : $state.go('openlmis.stockmanagement.physicalInventory.draftList', $stateParams, {
                            reload: true
                        });
                    // SIGLUS-REFACTOR: ends here
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
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name submit
         *
         * @description
         * Submit physical inventory.
         */
        var subDraftSubmit = function() {
            $scope.needToConfirm = false;
            loadingModalService.open();
            physicalInventoryService.submitSubPhysicalInventory(_.extend({}, draft, {
                summaries: [],
                subDraftIds: subDraftIds
            }))
                .then(function() {
                    notificationService.success('stockPhysicalInventoryDraft.submitted');
                    $state.go('^', {}, {
                        reload: true
                    });
                    // $state.go('openlmis.stockmanagement.physicalInventory.draftList', {
                    //     program: program.id,
                    //     facility: facility.id
                    // }, {
                    //     reload: true
                    // });
                })
                .catch(function(error) {
                    loadingModalService.close();
                    var data = error.data.businessErrorExtraData;
                    openRemainingModal('submit', data);
                });
        };
        var submit = function() {
            if (validate()) {
                // SIGLUS-REFACTOR: starts here
                if ($stateParams.keyword) {
                    $stateParams.keyword = null;
                    // reload($state.current.name);
                }
                // SIGLUS-REFACTOR: ends here
                $scope.$broadcast('openlmis-form-submit');
                alertService.error('stockPhysicalInventoryDraft.submitInvalid');
            } else {
                if (
                    $stateParams.draftNum
                ) {
                    subDraftSubmit();
                    return;
                }
                chooseDateModalService.show(new Date(), true).then(function(resolvedData) {
                    loadingModalService.open();

                    draft.occurredDate = resolvedData.occurredDate;
                    draft.signature = resolvedData.signature;
                    // TODO merge \ subDraft Submit
                    physicalInventoryService.submitPhysicalInventory(_.extend({}, draft, {
                        summaries: []
                    }))
                        .then(function() {
                            // rep logic
                            if (vm.isInitialInventory) {
                                currentUserService.clearCache();
                                navigationStateService.clearStatesAvailability();
                            }
                            notificationService.success('stockPhysicalInventoryDraft.submitted');
                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                program: program.id,
                                facility: facility.id
                            }, {
                                reload: true
                            });
                        }, function() {
                            loadingModalService.close();
                            alertService.error('stockPhysicalInventoryDraft.submitFailed');
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
            var allLots = getAllLotCode(lineItem.orderable.id);
            var duplicatedLineItems = hasLot(lineItem) ? _.filter(allLots, function(lot) {
                return lot === lineItem.lot.lotCode.toUpperCase();
            }) : [];
            return duplicatedLineItems.length > 1;
        }

        function validate() {
            var anyError = false;
            _.chain(vm.draft.lineItems).flatten()
                .each(function(item) {
                    if (!(item.orderable && item.orderable.isKit)) {
                        anyError = vm.validateLotCode(item) || anyError;
                        anyError = vm.validExpirationDate(item) || anyError;
                    }
                    anyError = vm.validateReasonFreeText(item) || anyError;
                    anyError = vm.validateQuantity(item) || anyError;
                });
            return anyError;
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

        function resetWatchItems() {
            $scope.needToConfirm = false;
        }

        function onInit() {
            // SIGLUS-REFACTOR: starts here
            // $state.current.label = messageService.get('stockPhysicalInventoryDraft.title', {
            //     facilityCode: facility.code,
            //     facilityName: facility.name,
            //     program: program.name
            // });
            updateLabel();
            // SIGLUS-REFACTOR: ends here

            vm.reasons = reasons;
            vm.stateParams = $stateParams;
            $stateParams.program = undefined;
            $stateParams.facility = undefined;
            // SIGLUS-REFACTOR: starts here
            initiateLineItems();
            refreshLotOptions();
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
            // if (!vm.isInitialInventory) {
            // var data = messageService.get('stockPhysicalInventoryDraft.title', {
            //     facilityCode: facility.code,
            //     facilityName: facility.name,
            //     program: program.name
            // });
            if ($stateParams.isMerged === 'true') {
                $state.current.label = messageService.get('stockPhysicalInventoryDraft.mergeDraft');
            } else {
                $state.current.label =
                        messageService.get('stockPhysicalInventoryDraft.draft')
                        + ' '
                        + $stateParams.draftNum;
            }
            // }
        }

        function initiateLineItems() {
            _.forEach(draft.lineItems, function(item) {
                if (!item.$errors) {
                    item.$errors = {};
                }
            });
            _.forEach(draft.lineItems, function(item) {
                if (!item.$diffMessage) {
                    item.$diffMessage = {};
                }
            });
            _.forEach(draft.summaries, function(summary) {
                if (!summary.$errors) {
                    summary.$errors = {};
                }
                if (summary.lot && summary.lot.id) {
                    vm.existLotCode.push(summary.lot.lotCode.toUpperCase());
                }
            });
            _.forEach(draft.lineItems, function(item) {
                if (!vm.isInitialInventory && item.quantity !== null) {
                    var diff = stockReasonsCalculations.calculateDifference(item);
                    buildMovementMessage(item, diff);
                    vm.validateReasonFreeText(item);
                }

            });
        }

        function getLotOptions() {
            var addedLotsId = getAddedLots();
            var notAddedLotItemGroup = _.chain(draft.summaries)
                .filter(function(summary) {
                    // #105: activate archived product
                    return (!summary.stockCardId || summary.orderable.archived)
                        && summary.lot && !_.contains(addedLotsId, summary.lot.id);
                    // #105: ends here
                })
                .groupBy(function(item) {
                    return item.orderable.id;
                })
                .value();
            var lotOptions = {};
            for (var i in notAddedLotItemGroup) {
                lotOptions[i] = angular.copy(orderableGroupService.lotsOfWithNull(notAddedLotItemGroup[i]));
            }
            return lotOptions;
        }

        function getAddedLots() {
            var addedLotsId = [];
            _.forEach(draft.lineItems, function(item) {
                if (item.lot && item.lot.id) {
                    addedLotsId.push(item.lot.id);
                }
            });
            return addedLotsId;
        }
        // if no lot defined, then lot code is null
        // same lot code but different lot id? is that possible?
        function getAddedLotIdAndOrderableId() {
            var addedlotIdAndOrderableId = [];
            _.forEach(draft.lineItems, function(item) {
                addedlotIdAndOrderableId.push({
                    lotId: item.lot && item.lot.id ? item.lot.id : null,
                    orderableId: item.orderable.id
                });
            });
            return addedlotIdAndOrderableId;
        }
        // SIGLUS-REFACTOR: ends here

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
                reason = _.find(vm.reasons[lineItem.programId], function(reason) {
                    return reason.reasonType === REASON_TYPES.CREDIT;
                });
            } else {
                reason = _.find(vm.reasons[lineItem.programId], function(reason) {
                    return reason.reasonType === REASON_TYPES.DEBIT;
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
            var newLineItem = _.assign({}, angular.copy(lineItem), {
                stockCardId: null,
                displayLotMessage: undefined,
                lot: null,
                quantity: undefined,
                shouldOpenImmediately: false,
                stockAdjustments: [],
                stockOnHand: null,
                unaccountedQuantity: undefined,
                $errors: {},
                reasonFreeText: undefined
            });
            draft.lineItems.push(newLineItem);
            $stateParams.isAddProduct = true;
            reload($state.current.name);
        }

        function removeLot(lineItem) {
            var index = _.findIndex(draft.lineItems, function(item) {
                return _.isEqual(item, lineItem);
            });
            if (index === -1) {
                return;
            }
            draft.lineItems.splice(index, 1);
            $stateParams.isAddProduct = true;
            reload($state.current.name);
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            refreshLotOptions();
            vm.validateLotCode(lineItem);
            vm.validExpirationDate(lineItem);
            vm.updateProgress();
        });

        function refreshLotOptions() {
            var lotOptions = getLotOptions();
            _.forEach(draft.lineItems, function(displayLineItem) {
                var orderableId = displayLineItem.orderable.id;
                displayLineItem.lotOptions = lotOptions[orderableId];
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name getPrintUrl
         *
         * @description
         * Prepares a print URL for the given physical inventory.
         *
         * @return {String} the prepared URL
         */
        /*function getPrintUrl(id) {
            return stockmanagementUrlFactory('/api/physicalInventories/' + id + '?format=pdf');
        }*/

        /*
        function reorderItems() {
            var sorted = $filter('orderBy')(vm.draft.lineItems, ['orderable.productCode', '-occurredDate']);
            var groups = _.chain(sorted).groupBy(function(item) {
                return item.orderable.id;
            })
                .sortBy(function(group) {
                    return _.every(group, function(item) {
                        return !item.$errors.quantityInvalid;
                    });
                })
                .values()
                .value();

            groups.forEach(function(group) {
                group.forEach(function(lineItem) {
                    orderableGroupService.determineLotMessage(lineItem, group);
                });
            });
            vm.displayLineItemsGroup = groups;
        }
        */
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
    }
})();
