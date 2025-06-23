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
    controller.$inject = [
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'program', 'facility',
        'orderableGroups', 'reasons', 'confirmService', 'messageService', 'adjustmentType',
        'srcDstAssignments', 'stockAdjustmentCreationService', 'notificationService',
        'orderableGroupService', 'MAX_INTEGER_VALUE', 'VVM_STATUS', 'loadingModalService', 'alertService',
        'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE', 'REASON_TYPES',
        'siglusSignatureWithDateModalService', 'siglusOrderableLotMapping', 'stockAdjustmentService', 'draft',
        'siglusArchivedProductService', 'SIGLUS_MAX_STRING_VALUE', 'stockCardDataService',
        'siglusOrderableLotService', 'SiglusIssueOrReceiveReportService', 'moment', 'orderablesPrice'
    ];

    function controller(
        $scope, $state, $stateParams, $filter, confirmDiscardService, program,
        facility, orderableGroups, reasons, confirmService, messageService,
        adjustmentType, srcDstAssignments, stockAdjustmentCreationService, notificationService,
        orderableGroupService, MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService,
        alertService, dateUtils, displayItems, ADJUSTMENT_TYPE, REASON_TYPES,
        siglusSignatureWithDateModalService, siglusOrderableLotMapping, stockAdjustmentService, draft,
        siglusArchivedProductService, SIGLUS_MAX_STRING_VALUE, stockCardDataService,
        siglusOrderableLotService, SiglusIssueOrReceiveReportService, moment, orderablesPrice
    ) {
        var vm = this,
            previousAdded = {};
        var ReportService = new SiglusIssueOrReceiveReportService();

        var IGNORE_REASONS = [
            'Consumido',
            'Recebido',
            'Stock Inicial Excessivo',
            'Stock Inicial Insuficiente',
            'Devolução para o DDM'
        ];

        // SIGLUS-REFACTOR: starts here
        siglusOrderableLotMapping.setOrderableGroups(orderableGroups);

        vm.draft = draft;
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
        // SIGLUS-REFACTOR: add parameter
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
        // SIGLUS-REFACTOR: ends here

        vm.addProductWithoutLot = function() {
            loadingModalService.open();
            var selectedItem = orderableGroupService
                .findOneInOrderableGroupWithoutLot(vm.selectedOrderableGroup);

            var item = _.assign({
                $errors: {},
                $previewSOH: null,
                orderableId: vm.selectedOrderableGroup[0].orderable.id,
                showSelect: false
            }, selectedItem, copyDefaultValue());

            item.isKit = !!(item.orderable && item.orderable.isKit)
                || _.contains(['26A02', '26B02'], item.orderable.productCode);
            if (item.isKit) {
                var selectedOrderableGroup =
                    siglusOrderableLotMapping.findSelectedOrderableGroupsByOrderableId(item.orderableId);
                var selectedLot = orderableGroupService
                    .findByLotInOrderableGroup(selectedOrderableGroup, null);
                if (selectedLot) {
                    item.$previewSOH = selectedLot.stockOnHand;
                }
            }

            item.reason = null;

            siglusOrderableLotService.fillLotsToAddedItems([item]).then(function() {
                vm.allLineItemsAdded.unshift(item);
                previousAdded = vm.allLineItemsAdded[0];
                $stateParams.isAddProduct = true;
                vm.search($state.current.name);
                // #105: activate archived product
                siglusArchivedProductService.alterInfo([item]);
                // #105: ends here
            })
                .finally(function() {
                    loadingModalService.close();
                });

        };

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;

            vm.validateLot(lineItem);
            validateLotDate(lineItem);
        });

        function onInit() {
            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            initStateParams();
            initViewModel();

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

            vm.program = program;
            vm.facility = facility;
            vm.reasons = filterReasons(reasons);
            vm.srcDstAssignments = srcDstAssignments;
            vm.allLineItemsAdded = $stateParams.allLineItemsAdded || [];
            vm.displayItems = $stateParams.displayItems || [];
            vm.keyword = $stateParams.keyword;

            vm.orderableGroups = orderableGroups;
            vm.hasLot = _.some(vm.orderableGroups, function(group) {
                return orderableGroupService.lotsOf(group).length > 0;
            });
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(vm.orderableGroups);

            $stateParams.page = getPageNumber();
        }

        function initStateParams() {
            $stateParams.program = program;
            $stateParams.facility = facility;
            $stateParams.reasons = filterReasons(reasons);
            $stateParams.srcDstAssignments = srcDstAssignments;
            // SIGLUS-REFACTOR: starts here
            // $stateParams.orderableGroups = orderableGroups;
            $stateParams.hasLoadOrderableGroups = true;
            // SIGLUS-REFACTOR: ends here
            $stateParams.displayItems = displayItems;
            $stateParams.orderablesPrice = orderablesPrice;
        }

        function hasInvalidLotCode(lineItem) {
            var allLots = getAllLotsSelectedProduct(lineItem.orderableId);
            var duplicatedLots = hasLot(lineItem) ? _.filter(allLots, function(lot) {
                return lot.lotCode.toUpperCase() === lineItem.lot.lotCode.toUpperCase();
            }) : [];
            return duplicatedLots.length > 1 && lineItem.lot && !lineItem.lot.id;
        }

        function hasLot(lineItem) {
            return lineItem.lot && lineItem.lot.lotCode;
        }

        function getAllLotsSelectedProduct(orderableId) {
            var lots = [];
            _.each(vm.allLineItemsAdded, function(item) {
                if (item.orderableId === orderableId && item.lot && item.lot.lotCode && !item.lot.id) {
                    lots.push(item.lot);
                }
            });
            return lots;
        }

        vm.filterByProgram = function(items, programs) {
            var programIds = [];
            programs.forEach(function(program) {
                programIds.push(program.programId);
            });
            var updatedItems = [];
            items.forEach(function(item) {
                if (programIds.indexOf(item.programId) !== -1) {
                    updatedItems.push(item);
                }
            });
            return updatedItems;
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
            var index = vm.allLineItemsAdded.indexOf(lineItem);
            vm.allLineItemsAdded.splice(index, 1);
            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
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
            confirmService.confirmDestroy(vm.key('deleteDraft'), vm.key('delete'))
                .then(function() {
                    loadingModalService.open();
                    stockAdjustmentService.deleteDraft(draft.id).then(function() {
                        $scope.needToConfirm = false;
                        notificationService.success(vm.key('deleted'));
                        $state.go('openlmis.stockmanagement.adjustment', $stateParams, {
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
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateQuantity
         *
         * @description
         * Validate line item quantity and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > lineItem.$previewSOH && lineItem.reason
                && lineItem.reason.reasonType === REASON_TYPES.DEBIT) {
                lineItem.$errors.quantityInvalid = messageService
                    .get('stockAdjustmentCreation.quantityGreaterThanStockOnHand');
            } else if (lineItem.quantity > MAX_INTEGER_VALUE) {
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
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateAssignment
         *
         * @description
         * Validate line item assignment and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        function validateAssignment(lineItem) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.ADJUSTMENT.state &&
                adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                lineItem.$errors.assignmentInvalid = isEmpty(lineItem.assignment);
            }
            return lineItem;
        }

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
            vm.selectedOrderableGroup =
                siglusOrderableLotMapping.findSelectedOrderableGroupsByOrderableId(lineItem.orderableId);
            siglusOrderableLotService.fillLotsToAddedItems([lineItem]).then(function() {
                if (_.get(lineItem, ['reason', 'reasonType']) === REASON_TYPES.DEBIT) {
                    var hasStockLotCodes = _.chain(vm.selectedOrderableGroup)
                        .filter(function(item) {
                            return item.lot && item.stockOnHand > 0;
                        })
                        .map(function(item) {
                            return item.lot.id;
                        })
                        .value();
                    lineItem.lotOptions = _.filter(lineItem.lotOptions, function(item) {
                        return item === null || _.contains(hasStockLotCodes, item.id);
                    });
                }
            });
        };

        // SIGLUS-REFACTOR: starts here
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
            if (lineItem.isKit) {
                return;
            }
            if (lineItem.lotId) {
                lineItem.$errors.lotCodeInvalid = false;
            } else if (hasLot(lineItem)) {
                if (lineItem.lot.lotCode.length > SIGLUS_MAX_STRING_VALUE) {
                    lineItem.$errors.lotCodeInvalid =
                        messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
                } else if (hasInvalidLotCode(lineItem)) {
                    lineItem.$errors.lotCodeInvalid =
                        messageService.get('stockPhysicalInventoryDraft.lotCodeDuplicate');
                } else {
                    lineItem.$errors.lotCodeInvalid = false;
                }
            } else {
                lineItem.$errors.lotCodeInvalid = messageService.get('openlmisForm.required');
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
        function validateLotDate(lineItem) {
            if (!lineItem.isKit) {
                if (lineItem.lot && lineItem.lot.expirationDate) {
                    lineItem.$errors.lotDateInvalid = false;
                } else {
                    lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
                }
            }
            return lineItem;
        }
        // SIGLUS-REFACTOR: ends here

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

            if (!validateAllAddedItems()) {
                cancelFilter();
                alertService.error('stockAdjustmentCreation.submitInvalid');
                return;
            }

            siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature', null, null, true)
                .then(function(signatureInfo) {
                    loadingModalService.open();

                    var allLineItemsAdded = angular.copy(vm.allLineItemsAdded);
                    allLineItemsAdded.forEach(function(lineItem) {
                        lineItem.programId = _.first(lineItem.orderable.programs).programId;
                    });

                    stockAdjustmentCreationService.submitAdjustments(program.id, facility.id,
                        allLineItemsAdded, adjustmentType, signatureInfo.signature, signatureInfo.occurredDate)
                        .then(function() {
                            notificationService.success(vm.key('submitted'));
                            printPdfForRRIVAndGoStockOnHandPage(signatureInfo);

                            // goToStockOnHandPage();
                        }, function(errorResponse) {
                            loadingModalService.close();
                            alertService.error(errorResponse.data.message);
                        });

                });
        };

        function goToStockOnHandPage() {
            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                facility: facility.id,
                program: program.id
            });
        }

        function printPdfForRRIVAndGoStockOnHandPage(signatureInfo) {
            var receiveLineItemsToPrint = buildItemsToPrintWithUniqueLot(ReportService.RECEIVE_PDF_REASON_NAME_LIST);
            var issueLineItemsToPrint = buildItemsToPrintWithUniqueLot(ReportService.ISSUE_PDF_REASON_NAME_LIST);
            var momentNow = moment();

            if (receiveLineItemsToPrint.length > 0 && issueLineItemsToPrint.length > 0) {
                // download both Receive and Issue PFD
                downloadReceiveOrIssuePDF(
                    ReportService.REPORT_TYPE.RECEIVE,
                    receiveLineItemsToPrint,
                    signatureInfo,
                    momentNow,
                    function() {
                        downloadReceiveOrIssuePDF(
                            ReportService.REPORT_TYPE.ISSUE,
                            issueLineItemsToPrint,
                            signatureInfo,
                            momentNow,
                            function() {
                                goToStockOnHandPage();
                            }
                        );
                    }
                );
            } else if (receiveLineItemsToPrint.length > 0) {
                // only download Receive PFD
                downloadReceiveOrIssuePDF(
                    ReportService.REPORT_TYPE.RECEIVE,
                    receiveLineItemsToPrint,
                    signatureInfo,
                    momentNow,
                    function() {
                        goToStockOnHandPage();
                    }
                );
            } else if (issueLineItemsToPrint.length > 0) {
                // only download Issue PFD
                downloadReceiveOrIssuePDF(
                    ReportService.REPORT_TYPE.ISSUE,
                    issueLineItemsToPrint,
                    signatureInfo,
                    momentNow,
                    function() {
                        goToStockOnHandPage();
                    }
                );
            } else {
                goToStockOnHandPage();
            }
        }

        function buildItemsToPrintWithUniqueLot(reasonNameList) {
            var lineItemsToPrint = vm.allLineItemsAdded.filter(function(lineItem) {
                return reasonNameList.includes(_.get(lineItem, ['reason', 'name']));
            });
            var lineItemsWithUniqueLot = uniqueLotForLineItems(lineItemsToPrint);

            return lineItemsWithUniqueLot.map(function(item) {
                return {
                    productCode: _.get(item, ['orderable', 'productCode']),
                    productName: _.get(item, ['orderable', 'fullProductName']),
                    lotCode: _.get(item, ['lot', 'lotCode']),
                    expirationDate: _.get(item, ['lot', 'expirationDate']),
                    quantity: item.quantity,
                    price: orderablesPrice.data[_.get(item, ['orderable', 'id'])] || null,
                    documentationNo: _.get(item, ['documentationNo'], '')
                };
            });
        }

        function uniqueLotForLineItems(lineItems) {
            var itemsMapGroupByLotCode = _.groupBy(lineItems, function(lineItem) {
                return _.get(lineItem, ['lot', 'lotCode']);
            });

            return Object.keys(itemsMapGroupByLotCode).map(function(lotCode) {
                var itemsWithCurrentLotCode = itemsMapGroupByLotCode[lotCode];

                if (itemsWithCurrentLotCode.length === 1) {
                    return itemsWithCurrentLotCode[0];
                }
                var totalQuantity = itemsWithCurrentLotCode.reduce(function(acc, item) {
                    return acc + _.get(item, 'quantity', 0);
                }, 0);
                return _.assign({}, itemsWithCurrentLotCode[0], {
                    quantity: totalQuantity
                });
            });
        }

        function downloadReceiveOrIssuePDF(type, lineItems, signatureInfo, momentNow, callbackAfterDownload) {
            var prefix = type === ReportService.REPORT_TYPE.RECEIVE ? 'RR_' : 'IV_';
            var documentNumberAndFileName = prefix + vm.facility.code + '_' + momentNow.format('DDMMYYYY');

            setPrintPDFInfo(type, lineItems, signatureInfo, momentNow, documentNumberAndFileName);
            ReportService.downloadPdf(
                documentNumberAndFileName,
                callbackAfterDownload
            );
        }

        function setPrintPDFInfo(type, lineItems, signatureInfo, momentNow, documentNumber) {
            vm.reportPDFInfo = {
                type: type,
                addedLineItems: lineItems,
                documentNumber: documentNumber,
                documentNumberWithItemsNo: buildDocumentNumberWithItemsNo(documentNumber, lineItems),
                numberN: documentNumber,
                supplier: type === ReportService.REPORT_TYPE.RECEIVE ? null : vm.facility.name,
                supplierDistrict: vm.facility.geographicZone.name,
                supplierProvince: vm.facility.geographicZone.parent.name,
                client: type === ReportService.REPORT_TYPE.RECEIVE ? vm.facility.name : null,
                requisitionNumber: null,
                requisitionDate: null,
                totalPriceValue: _.reduce(lineItems, function(acc, lineItem) {
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

        function buildDocumentNumberWithItemsNo(documentNumber, lineItems) {
            var lineItemsNo = lineItems.map(function(lineItem) {
                return lineItem.documentationNo;
            });
            var validLineItemsNo = lineItemsNo.filter(function(documentation) {
                return documentation && documentation.length > 0;
            });
            if (validLineItemsNo.length > 0) {
                return documentNumber + '_' + validLineItemsNo.join('_');
            }
            return documentNumber;
        }

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

        vm.save = function() {
            var allLineItemsAdded = angular.copy(vm.allLineItemsAdded);

            if ($stateParams.keyword) {
                cancelFilter();
            }

            stockAdjustmentService
                .saveDraft(vm.draft, allLineItemsAdded, adjustmentType)
                .then(function() {
                    notificationService.success(vm.key('saved'));
                    $scope.needToConfirm = false;
                    $stateParams.isAddProduct = false;
                    vm.search(true);
                });
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

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value) || value === '';
        }

        function validateAllAddedItems() {
            _.each(vm.allLineItemsAdded, function(item) {
                validateAssignment(item);
                vm.validateReason(item);
                vm.validateLot(item);
                validateLotDate(item);
                vm.validateQuantity(item);
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

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        // SIGLUS-REFACTOR: starts here
        function cancelFilter() {
            reorderItems();
            vm.keyword = null;
            $stateParams.keyword = null;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.page = 0;
            $stateParams.draft = vm.draft;
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name,
                notify: false
            });
        }
        // SIGLUS-REFACTOR: ends here

        // SIGLUS-REFACTOR: starts here
        function filterReasons(items) {
            return _.chain(items)
                .filter(function(reason) {
                    return !_.contains(IGNORE_REASONS, reason.name);
                })
                .map(function(reason) {
                    return stockCardDataService.addPrefixForAdjustmentReason(reason);
                })
                .value();
        }
        // SIGLUS-REFACTOR: ends here

        onInit();
    }
})();
