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
     * @name stock-receive-creation.controller:SiglusStockReceiveCreationController
     *
     * @description
     * Controller for managing stock receive creation.
     */
    angular
        .module('stock-receive-creation')
        .controller('SiglusStockReceiveCreationController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'program', 'facility',
        'orderableGroups', 'reasons', 'confirmService', 'messageService', 'adjustmentType', 'srcDstAssignments',
        'stockAdjustmentCreationService', 'notificationService', 'orderableGroupService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'loadingModalService', 'alertService', 'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE',
        'siglusSignatureModalService', 'orderableLotMapping', 'stockAdjustmentService', 'draft',
        'siglusArchivedProductService'
    ];

    function controller($scope, $state, $stateParams, $filter, confirmDiscardService, program,
                        facility, orderableGroups, reasons, confirmService, messageService, adjustmentType,
                        srcDstAssignments, stockAdjustmentCreationService, notificationService, orderableGroupService,
                        MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService, alertService, dateUtils, displayItems,
                        ADJUSTMENT_TYPE, siglusSignatureModalService, orderableLotMapping, stockAdjustmentService,
                        draft, siglusArchivedProductService) {
        var vm = this,
            previousAdded = {};

        vm.draft = draft;

        orderableLotMapping.setOrderableGroups(orderableGroups);

        /**
         * @ngdoc property
         * @propertyOf stock-receive-creation.controller:SiglusStockReceiveCreationController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */
        vm.search = function(reload) {
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);

            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
            $state.go($state.current.name, $stateParams, {
                reload: reload || $state.current.name,
                notify: false
            });
        };

        // first add without lot
        vm.addProductWithoutLot = function() {
            var selectedItem = orderableGroupService
                .findOneInOrderableGroupWithoutLot(vm.selectedOrderableGroup);

            var item = _.extend(
                {
                    $errors: {},
                    $previewSOH: null,
                    lotOptions: angular.copy(vm.lots),
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

            vm.addedLineItems.unshift(item);

            previousAdded = vm.addedLineItems[0];

            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
            // #105: activate archived product
            siglusArchivedProductService.alterInfo([item]);
            // #105: ends here
        };

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            // var globalIndex = getPageNumber() * parseInt($stateParams.size) + data.index;
            // vm.addedLineItems[globalIndex] = lineItem;
            // vm.search();
            vm.validateLot(lineItem);
            vm.validateLotDate(lineItem);
        });

        vm.filterDestinationsByProduct = function(destinations, programs) {
            var parentIds = [];
            programs.forEach(function(program) {
                parentIds.push(program.parentId);
            });
            var updatedDst = [];
            destinations.forEach(function(destination) {
                if (parentIds.indexOf(destination.programId) !== -1) {
                    updatedDst.push(destination);
                }
            });
            return updatedDst;
        };

        function copyDefaultValue() {
            var defaultDate;
            if (previousAdded.occurredDate) {
                defaultDate = previousAdded.occurredDate;
            } else {
                defaultDate = dateUtils.toStringDate(new Date());
            }
            return {
                /*assignment: previousAdded.assignment,*/
                srcDstFreeText: previousAdded.srcDstFreeText,
                reason: previousAdded.reason,
                reasonFreeText: previousAdded.reasonFreeText,
                occurredDate: defaultDate
            };
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

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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

            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
        };

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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
                    loadingModalService.close();
                    notificationService.success(vm.key('cleared'));
                    $stateParams.isAddProduct = true;
                    vm.search($state.current.name);
                });
        };

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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
            } else if ((!_.isNull(lineItem.quantity)) && lineItem.quantity >= 0) {
                lineItem.$errors.quantityInvalid = false;
            } else {
                lineItem.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
         * @name submit
         *
         * @description
         * Submit all added items.
         */
        vm.submit = function() {
            $scope.$broadcast('openlmis-form-submit');
            if (validateAllAddedItems()) {
                siglusSignatureModalService.confirm('stockUnpackKitCreation.signature').then(function(signature) {
                    loadingModalService.open();
                    confirmSubmit(signature);
                });
            } else {
                if ($stateParams.keyword) {
                    cancelFilter();
                }
                alertService.error('stockAdjustmentCreation.submitInvalid');
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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

            //vm.lots = orderableGroupService.lotsOf(vm.selectedOrderableGroup);
            vm.lots = orderableGroupService.lotsOfWithNull(vm.selectedOrderableGroup);
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        };

        /**
         * @ngdoc method
         * @methodOf stock-receive-creation.controller:SiglusStockReceiveCreationController
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

        vm.save = function() {
            var addedLineItems = angular.copy(vm.addedLineItems);

            if ($stateParams.keyword) {
                cancelFilter();
            }

            stockAdjustmentService
                .saveDraft(vm.draft, addedLineItems, adjustmentType)
                .then(function() {
                    notificationService.success(vm.key('saved'));
                    $scope.needToConfirm = false;
                    $stateParams.isAddProduct = false;
                    vm.search(true);
                });

        };

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value);
        }

        function validateAllAddedItems() {
            _.each(vm.addedLineItems, function(item) {
                vm.validateQuantity(item);
                vm.validateDate(item);
                vm.validateAssignment(item);
                vm.validateReason(item);
                vm.validateLot(item);
                vm.validateLotDate(item);
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

        function confirmSubmit(signature) {
            loadingModalService.open();

            var addedLineItems = angular.copy(vm.addedLineItems);

            addedLineItems.forEach(function(lineItem) {
                lineItem.programId = findParentId(lineItem);
                lineItem.reason = _.find(reasons, {
                    name: 'Receive'
                });
            });

            generateKitConstituentLineItem(addedLineItems);
            stockAdjustmentCreationService.submitAdjustments(program.id, facility.id,
                addedLineItems, adjustmentType, signature)
                .then(function() {
                    notificationService.success(vm.key('submitted'));

                    $state.go('openlmis.stockmanagement.stockCardSummaries', {
                        facility: facility.id,
                        program: program.id
                    });
                }, function(errorResponse) {
                    loadingModalService.close();
                    alertService.error(errorResponse.data.message);
                });
        }

        function generateKitConstituentLineItem(addedLineItems) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                return;
            }

            //CREDIT reason ID
            var creditReason = reasons
                .filter(function(reason) {
                    return reason.reasonType === 'CREDIT';
                })
                .pop();

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

        function onInit() {
            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            initViewModel();
            initStateParams();

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue, oldValue) {
                $scope.needToConfirm = ($stateParams.isAddProduct || !angular.equals(newValue, oldValue));
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
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        function cancelFilter() {
            reorderItems();
            vm.keyword = null;
            $stateParams.keyword = null;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.page = 0;
            $state.go($state.current.name, $stateParams);
        }

        onInit();

    }

})();
