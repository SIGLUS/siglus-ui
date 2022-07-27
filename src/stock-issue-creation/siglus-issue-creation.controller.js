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
   * @name stock-issue-creation.controller:SiglusStockIssueCreationController
   *
   * @description
   * Controller for managing stock issue creation.
   */
    angular
        .module('stock-issue-creation')
        .controller('SiglusStockIssueCreationController', controller);

    controller.$inject = [
        '$scope', 'draft', 'mergedItems', 'initialDraftInfo', '$state', '$stateParams', '$filter',
        'confirmDiscardService', 'program', 'facility', 'orderableGroups', 'reasons', 'confirmService',
        'messageService', 'isMerge', 'srcDstAssignments',
        'stockAdjustmentCreationService', 'notificationService', 'orderableGroupService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'loadingModalService', 'alertService', 'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE',
        'siglusSignatureModalService', 'stockAdjustmentService', 'openlmisDateFilter',
        'siglusRemainingProductsModalService', 'siglusStockIssueService', 'alertConfirmModalService',
        'siglusStockUtilsService'
    ];

    function controller($scope, draft, mergedItems, initialDraftInfo, $state, $stateParams, $filter,
                        confirmDiscardService, program, facility, orderableGroups, reasons, confirmService,
                        messageService, isMerge, srcDstAssignments, stockAdjustmentCreationService, notificationService,
                        orderableGroupService, MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService, alertService,
                        dateUtils, displayItems, ADJUSTMENT_TYPE, siglusSignatureModalService, stockAdjustmentService,
                        openlmisDateFilter, siglusRemainingProductsModalService, siglusStockIssueService,
                        alertConfirmModalService, siglusStockUtilsService) {
        var vm = this,
            previousAdded = {};

        vm.initialDraftInfo = initialDraftInfo;

        vm.destinationName = '';

        vm.isMerge = isMerge;

        vm.key = function(secondaryKey) {
            return 'stockIssueCreation.' + secondaryKey;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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

        vm.returnBack = function() {
            $state.go('openlmis.stockmanagement.issue.draft', $stateParams);
        };

        vm.setProductGroups = function() {
            var addedLotIds = _.chain(vm.addedLineItems)
                .map(function(item) {
                    return _.get(item, ['lot', 'id']);
                })
                .compact()
                .value();
            var existingKitProductId = _.chain(vm.addedLineItems)
                .filter(function(item) {
                    return item.orderable.isKit || isEmpty(item.lot);
                })
                .map(function(item) {
                    return item.orderable.id;
                })
                .value();

            vm.orderableGroups = _.chain(orderableGroups)
                .map(function(group) {
                    return _.filter(group, function(item) {
                        return isEmpty(addedLotIds) || !_.include(addedLotIds, _.get(item, ['lot', 'id']));
                    });
                })
                .filter(function(group) {
                    var orderableId = _.get(group, [0, 'orderable', 'id']);
                    return !_.include(existingKitProductId, orderableId);
                })
                .filter(function(item) {
                    return !_.isEmpty(item);
                })
                .value();

            $stateParams.orderableGroups = vm.orderableGroups;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name addProduct
     *
     * @description
     * Add a product for stock adjustment.
     */
        vm.addProduct = function() {
            if (vm.selectedLot && isDateBeforeToday(vm.selectedLot.expirationDate)) {
                alertService.error('stockIssueCreation.issueExpiredLot');
                return;
            }
            var selectedItem = orderableGroupService
                .findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);

            var item = _.extend(
                {
                    $errors: {},
                    $previewSOH: selectedItem.stockOnHand
                },
                selectedItem, copyDefaultValue()
            );
            vm.addedLineItems.unshift(item);

            if (_.get(vm.selectedLot, 'id')) {
                vm.setProductGroups();
                vm.selectedOrderableGroup = _.filter(vm.selectedOrderableGroup, function(item) {
                    return _.get(item, ['lot', 'id']) !== vm.selectedLot.id;
                });

                vm.setLots();
                vm.setLotSelectionStatus();
            } else {
                vm.setProductGroups();
                vm.selectedOrderableGroup = [];
            }

            previousAdded = vm.addedLineItems[0];

            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
        };

        // if reason Contains correction then show input
        vm.isReasonCorrection = function(lineItem) {
            if (lineItem.reason && lineItem.reason.name) {
                lineItem.reason.isFreeTextAllowed = lineItem.reason.name.toLowerCase().indexOf('correcção') >= 0;
            }
        };

        vm.filterByProgram = function(items, orderable) {
            var programIds = [];
            orderable.programs.forEach(function(program) {
                programIds.push(program.programId);
            });
            var updatedItems = [];
            items.forEach(function(item) {
                if (programIds.indexOf(item.programId) !== -1) {
                    updatedItems.push(item);
                }
            });
            if (orderable.isKit && orderable.children.length === 0) {
                return _.filter(updatedItems, function(item) {
                    return item.name === 'APE';
                });
            }
            return _.filter(updatedItems, function(item) {
                return item.name !== 'APE';
            });
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

        vm.setSelectedOrderableGroup = function(key, id) {
            vm.selectedOrderableGroup = _.find(vm.orderableGroups, function(group) {
                var lotId = _.map(group, function(item) {
                    return _.get(item, [key, 'id']);
                });
                return _.include(lotId, id);
            });
        };

        vm.setLots = function() {
            var addedLotIds = _.chain(vm.addedLineItems).map(function(item) {
                return _.get(item.lot, 'id');
            })
                .compact()
                .value();
            vm.lots = _.filter(orderableGroupService.lotsOf(vm.selectedOrderableGroup), function(item) {
                return addedLotIds.length === 0 || !_.include(addedLotIds, item.id);
            });
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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
            vm.setProductGroups();
            var productId = _.get(vm, ['selectedOrderableGroup', 0, 'orderable', 'id']);
            var isRemoveItemInCurrentProduct = lineItem.orderable.id === productId;

            if (isRemoveItemInCurrentProduct) {
                vm.setSelectedOrderableGroup('lot', _.get(lineItem, ['lot', 'id']));
                vm.setLots();
            }

            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name removeDisplayItems
     *
     * @description
     * Remove all displayed line items.
     */
        vm.removeDisplayItems = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusStockIssueService.resetDraft($stateParams.draftId).then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success(vm.key('deleted'));
                    $state.go('openlmis.stockmanagement.issue.draft', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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
            } else if (lineItem.quantity > lineItem.$previewSOH) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberLargerThanSOH');
            } else if ((!_.isNull(lineItem.quantity)) && lineItem.quantity >= 0) {
                lineItem.$errors.quantityInvalid = false;
            } else {
                lineItem.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
            }
            return lineItem;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name validateReason
     *
     * @description
     * Validate line item reason and returns self.
     *
     * @param {Object} lineItem line item to be validated.
     */
        vm.validateReason = function(lineItem) {
            return lineItem;
        };

        vm.validateLot = function(lineItem) {
            if ((lineItem.lot && lineItem.lot.lotCode) || lineItem.lotId) {
                lineItem.$errors.lotCodeInvalid = false;
            } else {
                lineItem.$errors.lotCodeInvalid = true;
            }
            return lineItem;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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
         * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
         * @name submit
         *
         * @description
         * Submit all added items.
         */
        // function getPdfName(date, facilityName, id) {
        //     return (
        //         'Requi' + id
        //         + '_' + facilityName + '_'
        //         + openlmisDateFilter(date, 'MMM') + ' '
        //         + openlmisDateFilter(date, 'dd') + '_'
        //         + openlmisDateFilter(date, 'yyyy')
        //         + '_MMIT.pdf'
        //     );
        // }
        // function downloadPdf() {
        //     var node = document.getElementById('waitDownload');
        //     var contentWidth = node.offsetWidth;
        //     var contentHeight = node.scrollHeight;
        //     var imgWidth = 595.28;
        //     var imgHeight = 592.28 / contentWidth * contentHeight;
        //     // var rate = contentWidth / 595.28;
        //     // var imgY = contentHeight / rate;
        //     // eslint-disable-next-line no-undef
        //     domtoimage.toPng(node, {
        //         scale: 1,
        //         width: contentWidth,
        //         height: contentHeight
        //     }).then(function(data) {
        //         var pageData = data;
        //         // eslint-disable-next-line no-undef
        //         var PDF = new jsPDF('', 'pt', 'a4');
        //         // 595×842 a4纸
        //         PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);

        //         PDF.save('test.pdf');
        //         // PDF.save(
        //         //     getPdfName(
        //         //         requisition.processingPeriod.startDate,
        //         //         facility.name,
        //         //         requisition.id.substring(0, 6)
        //         //     )
        //         // );
        //     });
        // };

        function confirmMergeSubmit(signature, addedLineItems) {
            var subDrafts = _.uniq(_.map(draft.lineItems, function(item) {
                return item.subDraftId;
            }));

            siglusStockIssueService.mergeSubmitDraft($stateParams.programId, addedLineItems,
                signature, vm.initialDraftInfo, facility.id, subDrafts)
                .then(function() {
                    $state.go('openlmis.stockmanagement.stockCardSummaries', {
                        facility: facility.id,
                        program: program
                    });
                })
                .catch(function(error) {
                    loadingModalService.close();
                    if (error.data && error.data.businessErrorExtraData === 'subDrafts quantity not match') {
                        alertService.error('stockIssueCreation.draftHasBeenUpdated');
                    }
                });
        }

        function confirmSubmit(signature, addedLineItems) {
            siglusStockIssueService.submitDraft($stateParams.initialDraftId, $stateParams.draftId, signature,
                addedLineItems)
                .then(function() {
                    loadingModalService.close();
                    notificationService.success(vm.key('submitted'));
                    $scope.needToConfirm = false;
                    vm.returnBack();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    productDuplicatedHandler(error);
                });
        }

        vm.submit = function() {
            // TODO after submit, download this pdf
            // downloadPdf();
            $scope.$broadcast('openlmis-form-submit');

            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            var addedLineItems = angular.copy(vm.addedLineItems);
            addedLineItems.forEach(function(lineItem) {
                lineItem.programId = _.first(lineItem.orderable.programs).programId;
                lineItem.reason = _.find(reasons, {
                    name: capitalize($stateParams.draftType || '')
                });
            });
            if (validateAllAddedItems()) {
                if (vm.isMerge) {
                    siglusSignatureModalService.confirm('stockUnpackKitCreation.signature').then(function(signature) {
                        loadingModalService.open();
                        confirmMergeSubmit(signature, addedLineItems);
                    });
                } else {
                    loadingModalService.open();
                    confirmSubmit('', addedLineItems);
                }

            } else {
                if ($stateParams.keyword) {
                    cancelFilter();
                }
                alertService.error('stockAdjustmentCreation.submitInvalid');
            }
        };

        // SIGLUS-REFACTOR: starts here
        vm.doCancelFilter = function() {
            if ($stateParams.keyword) {
                cancelFilter();
            }
        };

        $scope.$watch(function() {
            return vm.keyword;
        }, function(newValue, oldValue) {
            if (oldValue && !newValue && $stateParams.keyword) {
                cancelFilter();
            }
        });
        // SIGLUS-REFACTOR: ends here

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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
            vm.setSelectedOrderableGroup('orderable', _.get(vm, ['selectedOrderableGroup', 0, 'orderable', 'id']));
            vm.setLots();
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        };

        vm.setLotSelectionStatus = function() {
            vm.selectedOrderableHasLots = vm.lots.length > 0;
            if (vm.lots.length === 0) {
                vm.selectedOrderableGroup = [];
            }
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
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

        function productDuplicatedHandler(error) {
            if (_.get(error, ['data', 'isBusinessError'])) {
                var data = _.map(_.get(error, ['data', 'businessErrorExtraData']), function(item) {
                    item.conflictWith = messageService.get('stockIssue.draft') + ' ' + item.conflictWith;
                    return item;
                });
                siglusRemainingProductsModalService.show(data).then(function() {
                    var lineItems = _.clone(vm.addedLineItems);
                    _.forEach(lineItems, function(lineItem) {
                        var hasDuplicated = _.some(data, function(item) {
                            return item.orderableId === lineItem.orderable.id;
                        });
                        if (hasDuplicated) {
                            vm.remove(lineItem);
                        }
                    });
                });
            }
        }

        vm.save = function() {
            var addedLineItems = angular.copy(vm.addedLineItems);

            if ($stateParams.keyword) {
                cancelFilter();
            }

            loadingModalService.open();
            siglusStockIssueService.saveDraft($stateParams.draftId, addedLineItems, $stateParams.draftType)
                .then(function() {
                    notificationService.success(vm.key('saved'));
                    $scope.needToConfirm = false;
                    $stateParams.isAddProduct = false;
                    vm.search(true);
                })
                .catch(function(error) {
                    productDuplicatedHandler(error);
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        vm.selectedLotLabel = function(lot) {
            var expirationDate = lot.expirationDate ? openlmisDateFilter(lot.expirationDate) : '';
            return lot.lotCode + '(' + expirationDate + ')';
        };

        function isDateBeforeToday(date) {
            var currentDate = new Date();
            return date.getFullYear() < currentDate.getUTCFullYear()
        || isMonthInYearBeforeCurrentUTCMonth(date, currentDate)
        || isDayInYearAndMonthBeforeCurrentUTCDay(date, currentDate);
        }

        function isMonthInYearBeforeCurrentUTCMonth(date, currentDate) {
            return date.getFullYear() === currentDate.getUTCFullYear()
        && date.getMonth() < currentDate.getUTCMonth();
        }

        function isDayInYearAndMonthBeforeCurrentUTCDay(date, currentDate) {
            return date.getFullYear() === currentDate.getUTCFullYear()
        && date.getMonth() === currentDate.getUTCMonth()
        && date.getDate() < currentDate.getUTCDate();
        }

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value);
        }

        function validateAllAddedItems() {
            _.each(vm.addedLineItems, function(item) {
                vm.validateQuantity(item);
                vm.validateDate(item);
                vm.validateReason(item);
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

        function onInit() {

            $state.current.label = isMerge
                ? messageService.get('stockIssueCreation.mergedDraft')
                : messageService.get('stockIssue.draft') + ' ' + draft.draftNumber;

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

            vm.destinationName = siglusStockUtilsService
                .getInitialDraftName(vm.initialDraftInfo, $stateParams.draftType);
            vm.facility = facility;
            vm.reasons = reasons;
            vm.srcDstAssignments = srcDstAssignments;
            vm.addedLineItems = $stateParams.addedLineItems || [];
            $stateParams.displayItems = displayItems;
            vm.displayItems = $stateParams.displayItems || [];
            vm.keyword = $stateParams.keyword;
            vm.orderableGroups = _.clone(orderableGroups);
            vm.setProductGroups();
            vm.hasLot = false;
            vm.orderableGroups.forEach(function(group) {
                vm.hasLot = vm.hasLot || orderableGroupService.lotsOf(group).length > 0;
            });
        }

        function initStateParams() {
            $stateParams.page = getPageNumber();
            $stateParams.programId = program;
            $stateParams.facility = facility;
            $stateParams.reasons = reasons;
            $stateParams.srcDstAssignments = srcDstAssignments;
            $stateParams.mergedItems = mergedItems;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.draft = draft;
            // SIGLUS-REFACTOR: starts here
            // $stateParams.orderableGroups = orderableGroups;
            $stateParams.hasLoadOrderableGroups = true;
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

        function cancelFilter() {
            reorderItems();
            vm.keyword = null;
            $stateParams.keyword = null;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.page = 0;
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name,
                notify: false
            });
        }

        onInit();

    }

})();
