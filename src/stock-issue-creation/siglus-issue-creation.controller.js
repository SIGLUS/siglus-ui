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
        'confirmDiscardService', 'program', 'facility', 'orderableGroups', 'reasons', 'messageService',
        'isMerge', 'stockAdjustmentCreationService', 'notificationService', 'orderableGroupService',
        'MAX_INTEGER_VALUE', 'VVM_STATUS', 'loadingModalService', 'alertService', 'dateUtils',
        'displayItems', 'siglusSignatureWithDateModalService', 'openlmisDateFilter',
        'siglusRemainingProductsModalService', 'siglusStockIssueService', 'alertConfirmModalService',
        'siglusStockUtilsService', 'localStorageFactory', 'orderablesPrice', 'moment',
        'SiglusIssueOrReceiveReportService', '$q'
    ];

    function controller(
        $scope, draft, mergedItems, initialDraftInfo, $state, $stateParams, $filter,
        confirmDiscardService, program, facility, orderableGroups, reasons, messageService,
        isMerge, stockAdjustmentCreationService, notificationService, orderableGroupService,
        MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService, alertService, dateUtils,
        displayItems, siglusSignatureWithDateModalService, openlmisDateFilter,
        siglusRemainingProductsModalService, siglusStockIssueService, alertConfirmModalService,
        siglusStockUtilsService, localStorageFactory, orderablesPrice, moment,
        SiglusIssueOrReceiveReportService, $q
    ) {
        var vm = this,
            previousAdded = {};
        var ReportService = new SiglusIssueOrReceiveReportService();
        vm.preparedBy = localStorageFactory('currentUser').getAll('username').username;
        vm.initialDraftInfo = initialDraftInfo;
        vm.destinationName = '';
        vm.isMerge = isMerge;

        vm.lotNotFirstExpireHint = '';
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
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.allLineItemsAdded, vm.hasLot);

            $stateParams.allLineItemsAdded = vm.allLineItemsAdded;
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

        vm.changeLot = function() {
            validateLotNotFirstExpire();
        };

        function validateLotNotFirstExpire() {
            if (!_.isEmpty(vm.lots) && !_.isEmpty(vm.selectedLot)) {
                var resetLotList = _.filter(vm.lots, function(lot) {
                    return lot.id !== _.get(vm.selectedLot, 'id');
                });
                var isNotFirstToExpire = _.some(resetLotList, function(lot) {
                    return moment(lot.expirationDate).isBefore(moment(vm.selectedLot.expirationDate));
                });
                vm.lotNotFirstExpireHint = isNotFirstToExpire ? 'locationShipmentView.notFirstToExpire' : '';
            } else {
                vm.lotNotFirstExpireHint = '';
            }
        }

        vm.setProductGroups = function() {
            var addedLotIds = _.chain(vm.allLineItemsAdded)
                .map(function(item) {
                    return _.get(item, ['lot', 'id']);
                })
                .compact()
                .value();
            var existingKitProductId = _.chain(vm.allLineItemsAdded)
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

            vm.lotNotFirstExpireHint = '';
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

            var item = _.assign(
                {
                    $errors: {},
                    $previewSOH: selectedItem.stockOnHand
                },
                selectedItem, copyDefaultValue()
            );
            item.productCode = item.orderable.productCode;
            item.productName = item.orderable.fullProductName;
            item.lotCode = item.lot && item.lot.lotCode;
            item.expirationDate = item.lot && openlmisDateFilter(item.lot.expirationDate, 'yyyy-MM-dd');
            item.price = orderablesPrice.data[item.orderable.id] || '';
            vm.allLineItemsAdded.unshift(item);

            if (_.get(vm.selectedLot, 'id')) {
                vm.setProductGroups();
                vm.selectedOrderableGroup = _.filter(vm.selectedOrderableGroup, function(data) {
                    return _.get(data, ['lot', 'id']) !== vm.selectedLot.id;
                });

                vm.setLots();
                vm.setLotSelectionStatus();
            } else {
                vm.setProductGroups();
                vm.selectedOrderableGroup = [];
            }

            previousAdded = vm.allLineItemsAdded[0];
            validateLotNotFirstExpire();

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
            var addedLotIds = _.chain(vm.allLineItemsAdded).map(function(item) {
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
            var index = _.indexOf(vm.allLineItemsAdded, lineItem);
            vm.allLineItemsAdded.splice(index, 1);
            vm.setProductGroups();
            var productId = _.get(vm, ['selectedOrderableGroup', 0, 'orderable', 'id']);
            var isRemoveItemInCurrentProduct = lineItem.orderable.id === productId;

            if (isRemoveItemInCurrentProduct) {
                vm.setSelectedOrderableGroup('lot', _.get(lineItem, ['lot', 'id']));
                vm.setLots();
                validateLotNotFirstExpire();
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

        function confirmMergeSubmit(signatureInfo, allLineItemsAdded, callback) {
            var signature = signatureInfo.signature;
            var occurredDate = signatureInfo.occurredDate;
            var subDrafts = _.uniq(_.map(draft.lineItems, function(item) {
                return item.subDraftId;
            }));

            siglusStockIssueService.mergeSubmitDraft($stateParams.programId, allLineItemsAdded,
                signature, vm.initialDraftInfo, facility.id, subDrafts, occurredDate)
                .then(function() {
                    if (callback) {
                        callback().then(function() {
                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                facility: facility.id,
                                program: program
                            });
                        });
                    } else {
                        $state.go('openlmis.stockmanagement.stockCardSummaries', {
                            facility: facility.id,
                            program: program
                        });
                    }
                })
                .catch(function(error) {
                    loadingModalService.close();
                    if (error.data && error.data.businessErrorExtraData === 'subDrafts quantity not match') {
                        alertService.error('stockIssueCreation.draftHasBeenUpdated');
                    } else if (
                        // eslint-disable-next-line max-len
                        _.get(error, ['data', 'messageKey']) === 'siglusapi.error.stockManagement.movement.date.invalid'
                    ) {
                        alertService.error('openlmisModal.dateConflict');
                    }
                });
        }

        function confirmSubmit(signature, allLineItemsAdded) {
            siglusStockIssueService.submitDraft($stateParams.initialDraftId, $stateParams.draftId, signature,
                allLineItemsAdded, $stateParams.draftType)
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
            $scope.$broadcast('openlmis-form-submit');
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            var addedLineItems = angular.copy(vm.allLineItemsAdded);
            addedLineItems.forEach(function(lineItem) {
                lineItem.programId = _.first(lineItem.orderable.programs).programId;
                lineItem.reason = _.find(reasons, {
                    name: capitalize($stateParams.draftType || '')
                });
            });
            if (validateAllAddedItems()) {
                if (vm.isMerge) {
                    siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature')
                        .then(function(signatureInfo) {
                            var momentNow = moment();
                            setIssuePDFInfo(signatureInfo, momentNow);
                            var fileName = 'Saída_' + vm.destinationName + '_' + momentNow.format('YYYY-MM-DD');

                            loadingModalService.open();
                            confirmMergeSubmit(signatureInfo, addedLineItems, function() {
                                var deferred = $q.defer();
                                ReportService.downloadPdf(
                                    fileName,
                                    function() {
                                        setTimeout(function() {
                                            deferred.resolve('Print successful');
                                        }, 2000);
                                    }
                                );
                                return deferred.promise;
                            });
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

        function setIssuePDFInfo(signatureInfo, momentNow) {
            vm.reportPDFInfo = {
                type: ReportService.REPORT_TYPE.ISSUE,
                addedLineItems: vm.allLineItemsAdded,
                documentNumber: vm.initialDraftInfo.documentNumber,
                documentNumberWithItemsNo: vm.initialDraftInfo.documentNumber,
                numberN: vm.initialDraftInfo.documentNumber,
                supplier: vm.facility.name,
                supplierDistrict: vm.facility.geographicZone.name,
                supplierProvince: vm.facility.geographicZone.parent.name,
                client: _.indexOf(vm.destinationName, 'Outros') === 1 ?
                    vm.destinationName.split(':')[1] : vm.destinationName,
                requisitionNumber: null,
                requisitionDate: null,
                issueVoucherDate: moment(signatureInfo.occurredDate).format('YYYY-MM-DD'),
                receptionDate: moment(signatureInfo.occurredDate).format('YYYY-MM-DD'),
                totalPriceValue: _.reduce(vm.allLineItemsAdded, function(acc, lineItem) {
                    var price = lineItem.price ? lineItem.price * 100 : 0;
                    return acc + lineItem.quantity * price;
                }, 0),
                preparedBy: signatureInfo.signature,
                conferredBy: null,
                receivedBy: signatureInfo.signature,
                nowTime: momentNow.format('D MMM YYYY h:mm:ss A'),
                isSupply: true
            };
        }

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
                    var lineItems = _.clone(vm.allLineItemsAdded);
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
            var addedLineItems = angular.copy(vm.allLineItemsAdded);

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
            _.each(vm.allLineItemsAdded, function(item) {
                vm.validateQuantity(item);
                vm.validateReason(item);
            });
            return _.chain(vm.allLineItemsAdded)
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
            var sorted = $filter('orderBy')(vm.allLineItemsAdded, ['orderable.productCode', '-occurredDate']);

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
                return vm.allLineItemsAdded;
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
            vm.allLineItemsAdded = $stateParams.allLineItemsAdded || [];
            _.forEach(vm.allLineItemsAdded, function(item) {
                item.price = orderablesPrice.data[item.orderable.id] || '';
            });
            $stateParams.displayItems = displayItems;
            $stateParams.orderablesPrice = orderablesPrice;
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
            $stateParams.mergedItems = mergedItems;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.initialDraftId = _.get(initialDraftInfo, 'id');
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
