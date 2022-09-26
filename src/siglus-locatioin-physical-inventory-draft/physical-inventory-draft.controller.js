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
        '$scope', '$state', '$stateParams', 'addProductsModalService',
        'messageService', 'physicalInventoryFactory', 'notificationService', 'alertService',
        'confirmDiscardService', 'chooseDateModalService', 'program', 'facility',
        'confirmService', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'stockReasonsCalculations', 'loadingModalService', '$window',
        'stockmanagementUrlFactory', 'accessTokenFactory', 'orderableGroupService', '$filter', '$q',
        // SIGLUS-REFACTOR: starts here
        'REASON_TYPES', 'SIGLUS_MAX_STRING_VALUE', 'currentUserService', 'navigationStateService',
        'siglusArchivedProductService', 'siglusOrderableLotMapping', 'physicalInventoryDataService',
        'SIGLUS_TIME', 'siglusRemainingProductsModalService', 'subDraftIds', 'alertConfirmModalService',
        'allLocationAreaMap', 'localStorageService', 'SiglusAddProductsModalWithLocationService',
        'siglusOrderableLotService'
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
                        SIGLUS_TIME, siglusRemainingProductsModalService, subDraftIds, alertConfirmModalService,
                        allLocationAreaMap, localStorageService, SiglusAddProductsModalWithLocationService,
                        siglusOrderableLotService) {
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
        vm.locationManagementOption = $stateParams.locationManagementOption;
        var draft = physicalInventoryDataService.getDraft(facility.id);
        var reasons = physicalInventoryDataService.getReasons(facility.id);
        var displayLineItemsGroup = physicalInventoryDataService.getDisplayLineItemsGroup(facility.id);
        siglusOrderableLotMapping.setOrderableGroups(orderableGroupService.groupByOrderableId(draft.summaries));
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc property
         * @propertyOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
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
        // SIGLUS-REFACTOR: ends here

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
        // SIGLUS-REFACTOR: starts here
        vm.addProducts = function() {
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
            addProductsModalService.show(notYetAddedItems, vm.hasLot, true).then(function(addedItems) {
                siglusOrderableLotService.fillLotsToAddedItems(addedItems).then(function() {
                    draft.lineItems = draft.lineItems.concat(addedItems);
                    refreshLotOptions();
                    $stateParams.isAddProduct = true;
                    reload($state.current.name);
                    // #105: activate archived product
                    siglusArchivedProductService.alterInfo(addedItems);
                    // #105: ends here
                });
            });
        };
        // SIGLUS-REFACTOR: ends here

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
            // SIGLUS-REFACTOR: starts here
            return reload($state.current.name);
            // SIGLUS-REFACTOR: ends here
        };

        // SIGLUS-REFACTOR: starts here
        vm.doCancelFilter = function() {
            if ($stateParams.keyword) {
                vm.keyword = null;
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
            return delayPromise(SIGLUS_TIME.LOADING_TIME).then(function() {
                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.draft = draft;
                return $state.go($state.current.name, $stateParams, {
                    reload: isReload
                });
            });
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name saveDraft
         *
         * @description
         * Save physical inventory draft.
         */
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

        this.saveOrSubmit = saveOrSubmit;

        var saveDraft = function(notReload) {
            if ($stateParams.keyword) {
                $stateParams.keyword = null;
            }
            loadingModalService.open();
            return physicalInventoryService.saveDraftWithLocation(_.extend({}, draft, {
                summaries: [],
                subDraftIds: subDraftIds
            })).then(function() {
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
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
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
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
         * @name delete
         *
         * @description
         * Delete physical inventory draft.
         */

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
                        }) : $state.go('openlmis.locationManagement.physicalInventory.draftList', $stateParams, {
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
         * @methodOf siglus-locatioin-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
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
                    if (vm.isInitialInventory) {
                        notificationService.success('stockInitialInventoryDraft.submitted');
                    } else {
                        notificationService.success('stockPhysicalInventoryDraft.submitted');
                    }

                    $state.go('^', {}, {
                        reload: true
                    });
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
                // if ($stateParams.keyword) {
                //     $stateParams.keyword = null;
                //     // reload($state.current.name);
                // }
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

                    physicalInventoryService.submitPhysicalInventory(_.extend({}, draft, {
                        summaries: []
                    }), true)
                        .then(function() {
                            // rep logic
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
        vm.print = function() {
            localStorageService.add('physicalInventoryCategories', JSON.stringify(displayLineItemsGroup));
            var PRINT_URL = $window.location.href.split('/?')[0]
                + '/draft/report'
                + '?'
                + $window.location.href.split('/?')[1];
            $window.open(
                PRINT_URL,
                '_blank'
            );
        };

        // 校验form表单的Lot Code的地方;
        vm.validateLotCode = function(lineItem) {
            if (isEmpty(lineItem.stockOnHand) && !(lineItem.lot && lineItem.lot.id)) {
                if (!hasLot(lineItem)) {
                    lineItem.$errors.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.required');
                } else if (lineItem.lot.lotCode.length > SIGLUS_MAX_STRING_VALUE) {
                    lineItem.$errors.lotCodeInvalid = messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
                } else if (hasDuplicateLotCode(lineItem)) {
                    lineItem.$errors.lotCodeInvalid = messageService
                        .get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicate');
                } else {
                    lineItem.$errors.lotCodeInvalid = false;
                }
            } else {
                lineItem.$errors.lotCodeInvalid = false;
            }
            return lineItem.$errors.lotCodeInvalid;
        };

        vm.validateLocation = function(lineItem) {
            if (Boolean(lineItem.area) * Boolean(lineItem.locationCode) === 0) {
                lineItem.$errors.locationInvalid = messageService
                    .get('stockPhysicalInventoryDraft.required');
            }
            if (hasDuplicateLotCode(lineItem)) {
                lineItem.$errors.locationInvalid = messageService
                    .get('stockPhysicalInventoryDraft.lotCodeWithLocationDuplicate');
            }
            if (!hasDuplicateLotCode(lineItem) && lineItem.locationCode && lineItem.area) {
                lineItem.$errors.locationInvalid = '';
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
            _.chain(vm.draft.lineItems).flatten()
                .each(function(item) {
                    if (!(item.orderable && item.orderable.isKit)) {
                        anyError = vm.validateLotCode(item) || anyError;
                        anyError = vm.validExpirationDate(item) || anyError;
                    }
                    anyError = vm.validateReasonFreeText(item) || anyError;
                    anyError = vm.validateQuantity(item) || anyError;
                    anyError = vm.validateLocation(item) || anyError;
                });
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
            vm.allLocationAreaMap = allLocationAreaMap;
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
                var categories = $filter('siglusGroupByAllProductProgramProductCategory')(newList);
                vm.groupedCategories = _.isEmpty(categories) ? [] : categories;
                localStorageService.add('physicalInventoryCategories', JSON.stringify(categories));
                // SIGLUS-REFACTOR: ends here
            }, true);
        }

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
                if (summary.lot && summary.lot.id && summary.lot.lotCode) {
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
            // var addedLotsId = getAddedLots();
            var notAddedLotItemGroup = _.chain(draft.summaries)
                .filter(function(summary) {
                    // #105: activate archived product
                    return summary.lot;
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

        // function getAddedLots() {
        //     var addedLotsId = [];
        //     _.forEach(draft.lineItems, function(item) {
        //         if (item.lot && item.lot.id) {
        //             addedLotsId.push(item.lot.id);
        //         }
        //     });
        //     return addedLotsId;
        // }
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
            var areaList = vm.areaList;
            var locationList = vm.allLocationList;
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
                reasonFreeText: undefined,
                id: null,
                areaList: areaList,
                locationList: locationList,
                area: null,
                locationCode: null
            });
            draft.lineItems.push(newLineItem);
            $stateParams.isAddProduct = true;
            reload($state.current.name);
        }

        vm.addLotByLocation = function(lineItem) {
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
            SiglusAddProductsModalWithLocationService.show(
                notYetAddedItems,
                vm.hasLot,
                lineItem.locationCode
            ).then(function(addedItems) {
                draft.lineItems = draft.lineItems.concat(addedItems);
                refreshLotOptions();
                $stateParams.isAddProduct = true;
                reload($state.current.name);

                // #105: activate archived product
                siglusArchivedProductService.alterInfo(addedItems);
                // #105: ends here
            });
        };

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
            vm.validateLocation(lineItem);
            vm.updateProgress();
        });

        function refreshLotOptions() {
            var lotOptions = getLotOptions();
            _.forEach(draft.lineItems, function(displayLineItem) {
                var orderableId = displayLineItem.orderable.id;
                if (lotOptions[orderableId]) {
                    displayLineItem.lotOptions = lotOptions[orderableId];
                }
            });
        }

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
