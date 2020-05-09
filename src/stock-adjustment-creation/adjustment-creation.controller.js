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
     * @name stock-adjustment-creation.controller:StockAdjustmentCreationController
     *
     * @description
     * Controller for managing stock adjustment creation.
     */
    angular
        .module('stock-adjustment-creation')
        .controller('StockAdjustmentCreationController', controller);
    // SIGLUS-REFACTOR: delete 'UNPACK_REASONS' and add  '$http', 'stockmanagementUrlFactory', 'signatureModalService',
    // '$timeout', 'autoGenerateService', 'orderableLotMapping', 'STOCKMANAGEMENT_RIGHTS', '$location'
    controller.$inject = [
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'program', 'facility',
        'orderableGroups', 'reasons', 'confirmService', 'messageService', 'user', 'adjustmentType',
        'srcDstAssignments', 'stockAdjustmentCreationService', 'notificationService',
        'orderableGroupService', 'MAX_INTEGER_VALUE', 'VVM_STATUS', 'loadingModalService', 'alertService',
        'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE', '$http', 'stockmanagementUrlFactory', 'signatureModalService',
        '$timeout', 'autoGenerateService', 'orderableLotMapping', 'STOCKMANAGEMENT_RIGHTS', '$location'
    ];
    // SIGLUS-REFACTOR: ends here

    function controller($scope, $state, $stateParams, $filter, confirmDiscardService, program,
                        facility, orderableGroups, reasons, confirmService, messageService, user,
                        adjustmentType, srcDstAssignments, stockAdjustmentCreationService, notificationService,
                        orderableGroupService, MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService,
                        alertService, dateUtils, displayItems, ADJUSTMENT_TYPE, $http, stockmanagementUrlFactory,
                        signatureModalService, $timeout, autoGenerateService, orderableLotMapping,
                        STOCKMANAGEMENT_RIGHTS, $location) {
        var vm = this,
            previousAdded = {};

        // SIGLUS-REFACTOR: starts here
        vm.paginationId = 'stock-management-adjustment';

        orderableLotMapping.setOrderableGroups(orderableGroups);

        vm.draft = $stateParams.draft;
        // SIGLUS-REFACTOR: ends here
        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        // SIGLUS-REFACTOR: starts here
        // /**
        //  * @ngdoc property
        //  * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
        //  * @name showReasonDropdown
        //  * @type {boolean}
        //  */
        // vm.showReasonDropdown = true;
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be visible.
         */
        vm.showVVMStatusColumn = false;

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + 'Creation.' + secondaryKey;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */
        // SIGLUS-REFACTOR: starts here
        vm.search = function(isReplace) {
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);

            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
            $stateParams.orderableGroups = vm.orderableGroups;
            $state.go($state.current.name, $stateParams, {
                reload: true,
                notify: false,
                location: isReplace ? 'replace' : true
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name addProduct
         *
         * @description
         * Add a product for stock adjustment.
         */
        // Comments for SOUP-10, use vm.addProductWithoutLot instead
        // vm.addProduct = function() {
        //     var selectedItem = orderableGroupService
        //         .findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);
        //
        //     vm.addedLineItems.unshift(_.extend({
        //         $errors: {},
        //         $previewSOH: selectedItem.stockOnHand
        //     },
        //     selectedItem, copyDefaultValue()));
        //
        //     previousAdded = vm.addedLineItems[0];
        //
        //     vm.search();
        // };

        vm.addProductWithoutLot = function() {
            var selectedItem = orderableGroupService
                .findOneInOrderableGroupWithoutLot(vm.selectedOrderableGroup);

            var lotOptions = angular.copy(vm.lots);

            var item = _.extend(
                {
                    $errors: {},
                    $previewSOH: null,
                    lotOptions: angular.copy(lotOptions),
                    orderableId: vm.selectedOrderableGroup[0].orderable.id,
                    showSelect: false
                },
                selectedItem, copyDefaultValue()
            );

            item.isKit = !!(item.orderable && item.orderable.isKit);
            if (item.isKit) {
                var selectedOrderableGroup =
                    orderableLotMapping.findSelectedOrderableGroupsByOrderableId(item.orderableId);
                var selectedLot = orderableGroupService
                    .findByLotInOrderableGroup(selectedOrderableGroup, null);
                if (selectedLot) {
                    item.$previewSOH = selectedLot.stockOnHand;
                }
            }

            item.reason = null;
            vm.addedLineItems.unshift(item);

            previousAdded = vm.addedLineItems[0];

            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);
        };

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;

            vm.validateLot(lineItem);
            vm.validateLotDate(lineItem);
            validateDuplicatedLotCode(lineItem);
        });

        function validateDuplicatedLotCode(lineItem) {
            if (lineItem.lot && lineItem.lot.lotCode) {
                if (hasInvalidLotCode(lineItem)) {
                    lineItem.$errors.lotCodeInvalid =
                        messageService.get('stockPhysicalInventoryDraft.lotCodeDuplicate');
                } else {
                    lineItem.$errors.lotCodeInvalid = false;
                }
            }
        }

        function hasInvalidLotCode(lineItem) {
            var allLots = getAllLotsOfOtherProducts(lineItem.orderableId);
            for (var i = 0; i < allLots.length; i++) {
                if (allLots[i].lotCode === lineItem.lot.lotCode) {
                    return true;
                }
            }
            return false;
        }

        function getAllLotsOfOtherProducts(orderableId) {
            var ids = orderableLotMapping.findAllOrderableIds();
            var lots = [];
            ids.forEach(function(id) {
                if (id !== orderableId) {
                    var selectedOrderableGroup =
                        orderableLotMapping.findSelectedOrderableGroupsByOrderableId(id);
                    var selectedLots = orderableGroupService.lotsOf(selectedOrderableGroup);
                    lots = lots.concat(selectedLots);
                }
            });
            return lots;
        }

        vm.filterReasonsByProduct = function(reasons, programs) {
            var parentIds = [];
            programs.forEach(function(program) {
                parentIds.push(program.parentId);
            });
            var updatedReasons = [];
            reasons.forEach(function(reason) {
                if (parentIds.indexOf(reason.programId) !== -1) {
                    updatedReasons.push(reason);
                }
            });
            return updatedReasons;
        };
        function copyDefaultValue() {
            var defaultDate;
            if (previousAdded.occurredDate) {
                defaultDate = previousAdded.occurredDate;
            } else {
                defaultDate = dateUtils.toStringDate(new Date());
            }

            return {
                assignment: previousAdded.assignment,
                srcDstFreeText: previousAdded.srcDstFreeText,
                reason: previousAdded.reason,
                reasonFreeText: previousAdded.reasonFreeText,
                occurredDate: defaultDate
            };
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name remove
         *
         * @description
         * Remove a line item from added products.
         *
         * @param {Object} lineItem line item to be removed.
         */
        vm.remove = function(lineItem) {
            var index = vm.addedLineItems.indexOf(lineItem);
            vm.addedLineItems.splice(index, 1);
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name removeDisplayItems
         *
         * @description
         * Remove all displayed line items.
         */
        vm.removeDisplayItems = function() {
            confirmService.confirmDestroy(vm.key('clearAll'), vm.key('clear'))
                .then(function() {
                    loadingModalService.open();
                    vm.addedLineItems = [];
                    vm.displayItems = [];

                    var cb = function() {
                        loadingModalService.close();
                        notificationService.success(vm.key('cleared'));
                        vm.draft = null;
                        $stateParams.draft = null;
                        $stateParams.draftId = null;
                        vm.search(true);
                    };

                    if (vm.draft && vm.draft.id) {
                        stockAdjustmentCreationService.deleteDraft(vm.draft.id).then(cb, cb);
                    } else {
                        cb();
                    }
                });
        };

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
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (lineItem.quantity > lineItem.$previewSOH
                && lineItem.reason && lineItem.reason.reasonType === 'DEBIT') {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberLargerThanSOH');
            } else if ((!_.isNull(lineItem.quantity)) && lineItem.quantity >= 0) {
                lineItem.$errors.quantityInvalid = false;
            }  else {
                lineItem.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
            }
            return lineItem;
        };
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateAssignment
         *
         * @description
         * Validate line item assignment and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateAssignment = function(lineItem) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.ADJUSTMENT.state &&
                adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                lineItem.$errors.assignmentInvalid = isEmpty(lineItem.assignment);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateReason
         *
         * @description
         * Validate line item reason and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateReason = function(lineItem) {
            if (adjustmentType.state === 'adjustment') {
                lineItem.$errors.reasonInvalid = isEmpty(lineItem.reason);
            }
            return lineItem;
        };

        // SIGLUS-REFACTOR: starts here
        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateReasonFreeText
         *
         * @description
         * Validate reason free text.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateReasonFreeText = function(lineItem) {
            if (lineItem.reason && lineItem.reason.isFreeTextAllowed) {
                lineItem.$errors.reasonFreeTextInvalid = isEmpty(lineItem.reasonFreeText);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateLot
         *
         * @description
         * Validate lot.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateLot = function(lineItem) {
            if (!lineItem.isKit) {
                if ((lineItem.lot && lineItem.lot.lotCode) || lineItem.lotId) {
                    lineItem.$errors.lotCodeInvalid = false;
                } else {
                    lineItem.$errors.lotCodeInvalid = messageService.get('openlmisForm.required');
                }
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateLotDate
         *
         * @description
         * Validate lot date.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateLotDate = function(lineItem) {
            if (!lineItem.isKit) {
                if (lineItem.lot && lineItem.lot.expirationDate) {
                    lineItem.$errors.lotDateInvalid = false;
                } else {
                    lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
                }
            }
            return lineItem;
        };
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateDate
         *
         * @description
         * Validate line item occurred date and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateDate = function(lineItem) {
            lineItem.$errors.occurredDateInvalid = isEmpty(lineItem.occurredDate);
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name clearFreeText
         *
         * @description
         * remove free text from given object.
         *
         * @param {Object} obj      given target to be changed.
         * @param {String} property given property to be cleared.
         */
        vm.clearFreeText = function(obj, property) {
            obj[property] = null;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name submit
         *
         * @description
         * Submit all added items.
         */
        vm.submit = function() {
            $scope.$broadcast('openlmis-form-submit');
            if (validateAllAddedItems()) {
                // SIGLUS-REFACTOR: starts here
                // var confirmMessage = messageService.get(vm.key('confirmInfo'), {
                //     username: user.username,
                //     number: vm.addedLineItems.length
                // });
                // confirmService.confirm(confirmMessage, vm.key('confirm')).then(confirmSubmit);

                signatureModalService.confirm('stockUnpackKitCreation.signature').then(function(signature) {
                    loadingModalService.open();
                    confirmSubmit(signature);
                });
            } else {
                cancelFilter();
                // vm.keyword = null;
                // reorderItems();
                // alertService.error('stockAdjustmentCreation.submitInvalid');
                // SIGLUS-REFACTOR: ends here
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name orderableSelectionChanged
         *
         * @description
         * Reset form status and change content inside lots drop down list.
         */
        vm.orderableSelectionChanged = function() {
            //reset selected lot, so that lot field has no default value
            vm.selectedLot = null;

            //same as above
            $scope.productForm.$setUntouched();

            //make form good as new, so errors won't persist
            $scope.productForm.$setPristine();

            // SIGLUS-REFACTOR: starts here
            vm.lots = orderableGroupService.lotsOfWithNull(vm.selectedOrderableGroup);
            // SIGLUS-REFACTOR: ends here
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
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

        // SIGLUS-REFACTOR: starts here
        vm.save = function() {
            var addedLineItems = angular.copy(vm.addedLineItems);
            var draftId = $location.search().draftId;

            if ($stateParams.keyword) {
                cancelFilter();
            }

            if (!_.isString(draftId) || _.isEmpty(vm.draft)) {
                // first save
                $http.post(stockmanagementUrlFactory('/api/siglusintegration/drafts'), {
                    programId: program.id,
                    facilityId: facility.id,
                    userId: user.user_id,
                    draftType: adjustmentType.state
                }).then(function(res) {
                    vm.draft = res.data;
                    var draft = angular.copy(vm.draft);
                    stockAdjustmentCreationService
                        .saveDraft(draft, addedLineItems, adjustmentType)
                        .then(function() {
                            notificationService.success(vm.key('saved'));
                            if (!_.isString(draftId)) {
                                // $location.search('draftId', res.data.id).replace();
                                $stateParams.draftId = res.data.id;
                                vm.search(true);
                            }
                        });

                });
            } else {
                // not first save
                var draft = angular.copy(vm.draft);
                stockAdjustmentCreationService
                    .saveDraft(draft, addedLineItems, adjustmentType)
                    .then(function() {
                        notificationService.success(vm.key('saved'));
                    });
            }
        };

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value) || value === '';
        }

        function validateAllAddedItems() {
            _.each(vm.addedLineItems, function(item) {
                // vm.validateQuantity(item);
                vm.validateDate(item);
                vm.validateAssignment(item);
                vm.validateReason(item);
                vm.validateReasonFreeText(item);
                vm.validateLot(item);
                vm.validateLotDate(item);
                vm.validateQuantity(item);
                // SIGLUS-REFACTOR: ends here
            });
            return _.chain(vm.addedLineItems)
                .groupBy(function(item) {
                    return item.lot ? item.lot.id : item.orderable.id;
                })
                .values()
                .flatten()
                .all(isItemValid)
                .value();
        }

        function isItemValid(item) {
            return _.chain(item.$errors).keys()
                .all(function(key) {
                    return item.$errors[key] === false;
                })
                .value();
        }

        function reorderItems() {
            var sorted = $filter('orderBy')(vm.addedLineItems, ['orderable.productCode', '-occurredDate']);

            vm.displayItems = _.chain(sorted).groupBy(function(item) {
                return item.lot ? item.lot.id : item.orderable.id;
            })
                .sortBy(function(group) {
                    return _.every(group, function(item) {
                        return !item.$errors.quantityInvalid;
                    });
                })
                .flatten(true)
                .value();
        }

        // SIGLUS-REFACTOR: starts here
        function confirmSubmit(signature) {
            loadingModalService.open();

            var addedLineItems = angular.copy(vm.addedLineItems);

            addedLineItems.forEach(function(lineItem) {
                lineItem.programId = findParentId(lineItem);
            });

            generateKitConstituentLineItem(addedLineItems);
            stockAdjustmentCreationService.submitAdjustments(program.id, facility.id,
                addedLineItems, adjustmentType, signature)
                .then(function() {
                    notificationService.success(vm.key('submitted'));
                    if (vm.draft && vm.draft.id) {
                        stockAdjustmentCreationService.deleteDraft(vm.draft.id).then(function() {
                            vm.draft = null;
                            $stateParams.draft = null;
                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                facility: facility.id,
                                program: program.id
                            });
                        });
                    } else {
                        $state.go('openlmis.stockmanagement.stockCardSummaries', {
                            facility: facility.id,
                            program: program.id
                        });
                    }
                    // SIGLUS-REFACTOR: ends here
                }, function(errorResponse) {
                    loadingModalService.close();
                    alertService.error(errorResponse.data.message);
                });
        }

        function generateKitConstituentLineItem(addedLineItems) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                return;
            }

            // SIGLUS-REFACTOR: CREDIT reason ID
            var creditReason = reasons
                .filter(function(reason) {
                    return reason.reasonType === 'CREDIT';
                })
                .pop();
            // SIGLUS-REFACTOR: ends here

            var constituentLineItems = [];

            addedLineItems.forEach(function(lineItem) {
                lineItem.orderable.children.forEach(function(constituent) {
                    constituent.reason = creditReason;
                    constituent.occurredDate = lineItem.occurredDate;
                    constituent.quantity = lineItem.quantity * constituent.quantity;
                    constituentLineItems.push(constituent);
                });
            });

            addedLineItems.push.apply(addedLineItems, constituentLineItems);
        }

        // SIGLUS-REFACTOR: starts here
        function findParentId(lineItem) {
            if (lineItem && lineItem.orderable && lineItem.orderable.programs) {
                for (var i = 0; i < lineItem.orderable.programs.length; i++) {
                    if (lineItem.orderable.programs[i] && lineItem.orderable.programs[i].parentId) {
                        return lineItem.orderable.programs[i].parentId;
                    }
                }
            }

            return null;
        }
        // SIGLUS-REFACTOR: ends here

        function onInit() {
            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            initViewModel();
            initStateParams();
            // SIGLUS-REFACTOR: starts here
            recoveryDraft();
            // SIGLUS-REFACTOR: ends here

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue) {
                $scope.needToConfirm = newValue.length > 0;
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            $scope.$on('$stateChangeStart', function() {
                angular.element('.popover').popover('destroy');
            });
        }

        function initViewModel() {
            //Set the max-date of date picker to the end of the current day.
            vm.maxDate = new Date();
            vm.maxDate.setHours(23, 59, 59, 999);

            vm.program = program;
            vm.facility = facility;
            vm.reasons = reasons;
            // SIGLUS-REFACTOR: starts here
            // vm.showReasonDropdown = (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state);
            // SIGLUS-REFACTOR: ends here
            vm.srcDstAssignments = srcDstAssignments;
            vm.addedLineItems = $stateParams.addedLineItems || [];
            $stateParams.displayItems = displayItems;
            vm.displayItems = $stateParams.displayItems || [];
            vm.keyword = $stateParams.keyword;

            vm.orderableGroups = orderableGroups;
            vm.hasLot = false;
            vm.orderableGroups.forEach(function(group) {
                vm.hasLot = vm.hasLot || orderableGroupService.lotsOf(group).length > 0;
            });
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(vm.orderableGroups);
        }

        function initStateParams() {
            $stateParams.page = getPageNumber();
            $stateParams.program = program;
            $stateParams.facility = facility;
            $stateParams.reasons = reasons;
            $stateParams.srcDstAssignments = srcDstAssignments;
            $stateParams.orderableGroups = orderableGroups;
            // SIGLUS-REFACTOR: starts here
            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.displayItems = vm.displayItems;
            // SIGLUS-REFACTOR: ends here
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        // SIGLUS-REFACTOR: starts here
        function recoveryDraft() {
            // if no draftId or has LineItem will not recover draft
            if (!$stateParams.draftId || (vm.addedLineItems && vm.addedLineItems.length > 0)) {
                return;
            }

            function recovery() {
                var draftId = $location.search().draftId;
                if (_.isString(draftId) && vm.draft && vm.draft.lineItems && vm.draft.lineItems.length > 0) {

                    var mapOfIdAndOrderable = stockAdjustmentCreationService.getMapOfIdAndOrderable(vm.orderableGroups);
                    var mapOfIdAndLot = {};
                    var stockCardSummaries = {};
                    var srcDstAssignments = vm.srcDstAssignments || [];

                    loadingModalService.open();
                    stockAdjustmentCreationService.getMapOfIdAndLot(vm.draft.lineItems).then(function(ret) {
                        mapOfIdAndLot = ret;

                        $http.get(stockmanagementUrlFactory('/api/siglusintegration/stockCardSummaries'), {
                            params: {
                                programId: vm.draft.programId,
                                facilityId: vm.draft.facilityId
                            }
                        }).then(function(res) {
                            loadingModalService.close();
                            stockCardSummaries = res.data.content;

                            vm.draft.lineItems.forEach(function(draftLineItem) {
                                var orderable = mapOfIdAndOrderable[draftLineItem.orderableId] || {};
                                var lot = mapOfIdAndLot[draftLineItem.lotId] || {};
                                lot.lotCode = draftLineItem.lotCode;
                                lot.expirationDate = draftLineItem.expirationDate;
                                var soh = stockAdjustmentCreationService.getStochOnHand(
                                    stockCardSummaries,
                                    draftLineItem.orderableId,
                                    draftLineItem.lotId
                                );
                                var program = orderable.programs && orderable.programs[0];
                                var parentId = program && program.parentId;

                                var orderableId = draftLineItem.orderableId;
                                var selectedOrderableGroup =
                                    orderableLotMapping.findSelectedOrderableGroupsByOrderableId(orderableId);
                                var lotOptions = orderableGroupService.lotsOfWithNull(selectedOrderableGroup);

                                var newItem = {
                                    $errors: {},
                                    $previewSOH: soh,
                                    orderable: orderable,
                                    orderableId: draftLineItem.orderableId,
                                    lotOptions: lotOptions,
                                    lot: lot,
                                    stockOnHand: soh,
                                    occurredDate: draftLineItem.occurredDate,
                                    documentationNo: draftLineItem.documentationNo || draftLineItem.documentNumber
                                };

                                newItem.isKit = !!(newItem.orderable && newItem.orderable.isKit);

                                // newItem.displayLotMessage = orderableGroupService
                                //     .determineLotMessage(draftLineItem, );

                                newItem.displayLotMessage = lot.lotCode;

                                newItem = _.extend(draftLineItem, newItem);

                                var srcDstId = null;
                                if (adjustmentType.state === 'receive') {
                                    srcDstId = draftLineItem.sourceId;
                                } else if (adjustmentType.state === 'issue') {
                                    srcDstId = draftLineItem.destinationId;
                                }

                                newItem.assignment = stockAdjustmentCreationService.getAssignmentById(
                                    srcDstAssignments,
                                    srcDstId,
                                    parentId
                                );

                                var filteredReasons = vm.filterReasonsByProduct(vm.reasons, newItem.orderable.programs);
                                newItem.reason = _.find(filteredReasons, function(reason) {
                                    return reason.id === draftLineItem.reasonId;
                                });

                                vm.addedLineItems.push(newItem);
                            });
                            vm.search();

                        }, function(err) {
                            loadingModalService.close();
                            alertService.error(JSON.stringify(err));
                        });
                    }, function(err) {
                        loadingModalService.close();
                        alertService.error(JSON.stringify(err));
                    });
                }
            }

            if (_.isEmpty(vm.draft)) {
                stockAdjustmentCreationService.getDraftById(
                    $stateParams.draftId,
                    adjustmentType,
                    program.id,
                    facility.id,
                    user.user_id
                ).then(function(res) {
                    vm.draft = res;
                    recovery();
                }, function(err) {
                    alertService.error(JSON.stringify(err));
                });
            } else {
                recovery();
            }
        }

        function cancelFilter() {
            reorderItems();
            vm.keyword = null;
            $stateParams.keyword = null;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.page = 0;
            $stateParams.draft = vm.draft;
            $state.go($state.current.name, $stateParams);
        }
        // SIGLUS-REFACTOR: ends here

        onInit();
    }
})();
