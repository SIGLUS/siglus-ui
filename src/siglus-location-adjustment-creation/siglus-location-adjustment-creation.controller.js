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
     * @name siglus-location-adjustment-creation.controller:SiglusLocationAdjustmentCreationController
     *
     * @description
     * Controller for managing location adjustment creation.
     */
    angular
        .module('siglus-location-adjustment-creation')
        .controller('SiglusLocationAdjustmentCreationController', controller);
    controller.$inject = [
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'facility',
        'reasons', 'messageService', 'user', 'adjustmentType', 'notificationService',
        'MAX_INTEGER_VALUE', 'loadingModalService', 'alertService', 'displayItems', 'REASON_TYPES',
        'siglusSignatureWithDateModalService', 'draftInfo', 'SIGLUS_MAX_STRING_VALUE',
        'stockCardDataService', 'allLineItemsAdded', 'paginationService', 'SiglusLocationCommonUtilsService',
        'siglusLocationAdjustmentModifyLineItemService', 'siglusLocationCommonApiService',
        'areaLocationInfo', 'siglusLocationAdjustmentService', 'alertConfirmModalService',
        'locations', 'program', 'siglusPrintPalletLabelComfirmModalService', 'SIGLUS_TIME',
        'productList', 'SiglusIssueOrReceiveReportService', 'moment', 'orderablesPrice'
    ];

    function controller(
        $scope, $state, $stateParams, $filter, confirmDiscardService, facility,
        reasons, messageService, user, adjustmentType, notificationService,
        MAX_INTEGER_VALUE, loadingModalService, alertService, displayItems, REASON_TYPES,
        siglusSignatureWithDateModalService, draftInfo, SIGLUS_MAX_STRING_VALUE,
        stockCardDataService, allLineItemsAdded, paginationService, SiglusLocationCommonUtilsService,
        siglusLocationAdjustmentModifyLineItemService, siglusLocationCommonApiService,
        areaLocationInfo, siglusLocationAdjustmentService, alertConfirmModalService,
        locations, program, siglusPrintPalletLabelComfirmModalService, SIGLUS_TIME,
        productList, SiglusIssueOrReceiveReportService, moment, orderablesPrice
    ) {
        var vm = this;
        var ReportService = new SiglusIssueOrReceiveReportService();

        var IGNORE_REASONS = [
            'Consumido',
            'Recebido',
            'Stock Inicial Excessivo',
            'Stock Inicial Insuficiente',
            'Devolução para o DDM'
        ];

        vm.$onInit = function() {

            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            vm.orderableGroups = null;

            vm.productList = null;

            vm.selectedProduct = null;

            vm.allLineItemsAdded = [];

            vm.facility = facility;

            vm.program = program;

            vm.displayItems = displayItems || [];

            vm.reasons = filterReasons(reasons);

            vm.allLineItemsAdded = allLineItemsAdded;
            vm.displayItems = displayItems;
            vm.keyword = $stateParams.keyword;
            filterProductList();
            updateStateParams();
            validateForm(true);

            $scope.$watch(function() {
                return vm.allLineItemsAdded;
            }, function(newValue, oldValue) {
                $scope.needToConfirm = !angular.equals(newValue, oldValue);
            }, true);

            confirmDiscardService.register($scope, 'openlmis.locationManagement.adjustment.creation');
            var validator = function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$errors)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$errors[key]);
                        })
                        .value();
                });
            };
            loadingModalService.close();
            return paginationService.registerList(validator, angular.copy($stateParams), function() {
                return vm.allLineItemsAdded;
            });
        };

        vm.getProductName = function(lineItem) {
            return lineItem.isMainGroup ? $filter('productName')(lineItem.orderable) : '';
        };

        function filterProductList() {
            var addedOrderableIds = _.map(vm.allLineItemsAdded, function(group) {
                return _.first(group).orderableId;
            });
            vm.productList = _.filter(productList, function(product) {
                return !_.includes(addedOrderableIds, product.orderableId);
            });
        }

        vm.addProduct = function() {
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                extraData: true,
                isAdjustment: true,
                returnNoMovementLots: true
            }, [vm.selectedProduct.orderableId])
                .then(function(locationsInfo) {
                    locations = locations.concat(locationsInfo);
                    var firstRow = siglusLocationAdjustmentModifyLineItemService.getAddProductRow(vm.selectedProduct);

                    var lotOptions = SiglusLocationCommonUtilsService.getLotList(
                        firstRow,
                        SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locationsInfo, true)
                    );
                    firstRow.lotOptions = lotOptions;
                    firstRow.locationOptions = areaLocationInfo;
                    firstRow.locationsInfo = locationsInfo;
                    firstRow.lotOptionsClone = _.clone(firstRow.lotOptions);
                    firstRow.locationOptionsClone = _.clone(areaLocationInfo);
                    firstRow.locationsInfo = locationsInfo;
                    vm.allLineItemsAdded.unshift([firstRow]);
                    searchList();
                });
        };

        function updateStateParams() {
            $stateParams.locations = locations;
            $stateParams.keyword = vm.keyword;
            $stateParams.areaLocationInfo = areaLocationInfo;
            $stateParams.allLineItemsAdded = vm.allLineItemsAdded;
            $stateParams.productList = productList;
            $stateParams.draftInfo = draftInfo;
            $stateParams.reasons = reasons;
            $stateParams.user = user;
            $stateParams.facility = facility;
            $stateParams.program = program;
            $stateParams.page = getPageNumber();
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($stateParams.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        function searchList() {
            updateStateParams();
            reloadPage();
        }

        vm.search = function() {
            searchList();
        };

        $scope.$on('lotCodeChange', function(event, data) {

            var lineItem = data.lineItem;
            var lineItems = data.lineItems;

            vm.validateLot(lineItem);
            vm.validateLotDate(lineItem);
            emitQuantityChange(lineItem, lineItems);
            if (_.get(lineItem, ['reason', 'reasonType'], null) === REASON_TYPES.DEBIT) {

                lineItem.locationOptions = SiglusLocationCommonUtilsService.getLocationList(
                    lineItem,
                    SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(lineItem.locationsInfo)
                );
            }
        });

        vm.validateLot = function(lineItem) {
            if (lineItem.isKit) {
                return;
            }
            if (_.get(lineItem, ['lot', 'id'])) {
                lineItem.$errors.lotCodeInvalid =
                lineItem.$errors.lotCodeInvalid === messageService.get('openlmisForm.required') ?
                    false : lineItem.$errors.lotCodeInvalid;
            } else if (hasLot(lineItem)) {
                if (lineItem.lot.lotCode.length > SIGLUS_MAX_STRING_VALUE) {
                    lineItem.$errors.lotCodeInvalid =
                        messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
                } else {
                    lineItem.$errors.lotCodeInvalid =
                    lineItem.$errors.lotCodeInvalid === messageService.get('openlmisForm.required') ?
                        false : lineItem.$errors.lotCodeInvalid;
                }
            } else {
                lineItem.$errors.lotCodeInvalid = messageService.get('openlmisForm.required');
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

        function hasLot(lineItem) {
            return lineItem.lot && lineItem.lot.lotCode;
        }

        function getLocationLotSohMap(locationsMap) {
            var result = {};
            _.each(locationsMap, function(location) {
                result[location.locationCode] = {};
                _.each(location.lots, function(lot) {
                    result[location.locationCode][lot.lotId] = {};
                    result[location.locationCode][lot.lotId]['stockOnHand'] = lot.stockOnHand;
                });
            });
            return result;
        }

        function emitQuantityChange(lineItem, lineItems) {
            if (lineItem.lot && lineItem.location && !lineItem.isKit) {
                var map = getLocationLotSohMap(lineItem.locationsInfo);
                lineItem.stockOnHand =
                    _.get(map, [
                        _.get(lineItem, ['location', 'locationCode']),
                        _.get(lineItem, ['lot', 'id']),
                        'stockOnHand'
                    ], 0);
                vm.changeQuantity(lineItem, lineItems);
            } else if (lineItem.location && lineItem.isKit) {
                var mapKit = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(lineItem.locationsInfo);
                lineItem.stockOnHand = _.get(mapKit[lineItem.orderableId],
                    [lineItem.location.locationCode, 0, 'stockOnHand'], 0);
                vm.changeQuantity(lineItem, lineItems);
            } else {
                lineItem.stockOnHand = 0;
            }
        }

        vm.changeLocation = function(lineItem, lineItems) {
            lineItem.$errors.locationError = _.isEmpty(lineItem.location) ? 'openlmisForm.required' : false;
            emitQuantityChange(lineItem, lineItems);

            if (_.get(lineItem, ['reason', 'reasonType'], null) === REASON_TYPES.DEBIT) {
                lineItem.lotOptions = SiglusLocationCommonUtilsService.getLotList(
                    lineItem,
                    SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(lineItem.locationsInfo)
                );
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
            lineItem.$errors.quantityInvalid = isNumberEmpty ? messageService.get('openlmisForm.required') : '';
            vm.validateDuplicateLineItem(lineItems);
            if (!lineItem.$errors.quantityInvalid) {
                vm.validateQuantity(lineItems);
            }
        };

        vm.validateQuantity = function(lineItems) {
            _.forEach(lineItems, function(item, index) {
                if (lineItems.length > 1 && index === 0) {
                    return item.$errors = {};
                }
                var filterLineItems = _.filter(lineItems, function(data) {
                    if (item.isKit) {
                        return item.location
                        && _.get(item, ['location', 'locationCode'], null) === _.get(data.location, 'locationCode')
                        && _.get(data, ['reason', 'reasonType'], null) === REASON_TYPES.DEBIT;
                    }
                    return item.lot
                    && item.location
                    && _.get(item, ['lot', 'lotCode'], null) === _.get(data.lot, 'lotCode', null)
                    && _.get(item, ['location', 'locationCode'], null) === _.get(data.location, 'locationCode')
                    && _.get(data, ['reason', 'reasonType'], null) === REASON_TYPES.DEBIT;
                });
                var totalQuantity = _.reduce(filterLineItems, function(result, row) {
                    return result + _.get(row, 'quantity', 0);
                }, 0);
                if (totalQuantity > item.stockOnHand) {
                    item.$errors.quantityInvalid = messageService.get('locationMovement.gtSoh');
                } else if (item.quantity > MAX_INTEGER_VALUE) {
                    item.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
                } else if ((!_.isNull(item.quantity)) && item.quantity >= 0) {
                    item.$errors.quantityInvalid = false;
                } else {
                    item.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
                }
            });
        };

        vm.validateDuplicateLineItem = function(lineItems) {
            _.forEach(lineItems, function(item) {
                var filterLineItems = _.filter(lineItems, function(data) {
                    if (item.isKit) {
                        return item.location
                        && item.reason
                        && _.get(item, ['location', 'locationCode'], null) === _.get(data.location, 'locationCode')
                        && _.get(item, ['reason', 'id'], null) === _.get(data, ['reason', 'id'], null);
                    }
                    return item.lot
                    && item.location
                    && item.reason
                    && _.get(item, ['lot', 'lotCode'], null) === _.get(data.lot, 'lotCode', null)
                    && _.get(item, ['location', 'locationCode'], null) === _.get(data.location, 'locationCode')
                    && _.get(item, ['reason', 'id'], null) === _.get(data, ['reason', 'id'], null);
                });
                var duplicateErrorMessage = 'stockAdjustmentCreationLocation.duplicateError';

                if (filterLineItems.length > 1) {
                    if (!item.isKit) {
                        item.$errors.lotCodeInvalid = messageService.get(duplicateErrorMessage);
                    }

                    item.$errors.locationError = duplicateErrorMessage;
                    item.$errors.reasonInvalid = duplicateErrorMessage;
                } else {
                    if (!item.isKit) {
                        item.$errors.lotCodeInvalid =
                        item.$errors.lotCodeInvalid === messageService.get(duplicateErrorMessage)
                            ? vm.validateLot(item)
                            : item.$errors.lotCodeInvalid;
                    }

                    item.$errors.locationError =
                    item.$errors.locationError === duplicateErrorMessage
                        ? _.isEmpty(item.location) ? 'openlmisForm.required' : false
                        : item.$errors.locationError;
                    item.$errors.reasonInvalid =
                    item.$errors.reasonInvalid === duplicateErrorMessage
                        ? _.isEmpty(item.reason) ? 'openlmisForm.required' : false
                        : item.$errors.reasonInvalid;
                }
            });
        };

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + 'Creation.' + secondaryKey;
        };

        vm.addItem = function(lineItem, lineItems) {
            siglusLocationAdjustmentModifyLineItemService.addLineItem(lineItem, lineItems);
        };

        vm.removeItem = function(lineItems, index) {
            siglusLocationAdjustmentModifyLineItemService.removeItem(lineItems, index);
            if (lineItems.length === 0) {
                vm.allLineItemsAdded = _.filter(vm.allLineItemsAdded, function(item) {
                    return !_.isEmpty(item);
                });
                filterProductList();
            }
            searchList();
        };

        function reloadPage() {
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

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
            if (_.isEmpty(_.get(lineItem.lot, 'lotCode')) && !lineItem.isKit) {
                lineItem.$errors.lotCodeInvalid =  messageService.get('openlmisForm.required');
            }

            if (_.isEmpty(_.get(lineItem.lot, 'expirationDate')) && !lineItem.isKit) {
                lineItem.$errors.lotDateInvalid =  messageService.get('openlmisForm.required');
            }

            if (_.isEmpty(lineItem.location)) {
                lineItem.$errors.locationError = 'openlmisForm.required';
            }

            if (_.isEmpty(lineItem.reason)) {
                lineItem.$errors.reasonInvalid = 'openlmisForm.required';
            }

            if (!_.isNumber(lineItem.quantity)) {
                lineItem.$errors.quantityInvalid = 'openlmisForm.required';
            }

        }

        function validateForm(skipRequired) {
            _.forEach(vm.allLineItemsAdded, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    lineItem.$errors = {};
                    if (lineItems.length > 1 && index === 0) {
                        return;
                    }
                    if (!skipRequired) {
                        validateRequiredFields(lineItem);
                    }
                    vm.validateQuantity(lineItems);
                    vm.validateDuplicateLineItem(lineItems);
                });
            });
        }

        function isValid() {
            return _.every(vm.allLineItemsAdded, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$errors)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$errors[key]);
                        })
                        .value();
                });
            });
        }

        function getLineItems() {
            return _.chain(vm.allLineItemsAdded)
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
            return draftInfo[0];
        }

        vm.filterByProgram = function(reasons, programId) {
            return _.filter(reasons, function(reason) {
                return reason.programId === programId;
            });
        };

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

        vm.validateReason = function(lineItem, lineItems) {
            lineItem.$errors.reasonInvalid = isEmpty(lineItem.reason) ? 'openlmisForm.required' : '';
            if (_.get(lineItem, ['reason', 'reasonType']) === REASON_TYPES.DEBIT) {
                lineItem.locationOptions = SiglusLocationCommonUtilsService.getLocationList(
                    lineItem,
                    SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(lineItem.locationsInfo)
                );
                lineItem.lotOptions = SiglusLocationCommonUtilsService.getLotList(
                    lineItem,
                    SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(lineItem.locationsInfo)
                );
            } else {
                lineItem.lotOptions = _.clone(lineItem.lotOptionsClone);
                lineItem.locationOptions = _.clone(lineItem.locationOptionsClone);
            }
            vm.validateDuplicateLineItem(lineItems);
        };

        vm.getTotalQuantity = function(lineItems) {
            return _.reduce(lineItems, function(sum, item) {
                if (_.get(item, ['reason', 'reasonType']) === REASON_TYPES.DEBIT) {
                    return sum - (item.quantity || 0);
                }
                return sum + (item.quantity || 0);
            }, 0);
        };

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value) || value === '';
        }

        vm.clearFreeText = function(obj, property) {
            obj[property] = null;
        };

        vm.save = function() {
            loadingModalService.open();
            siglusLocationAdjustmentService.saveDraft(getBaseInfo(), getLineItems())
                .then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success('stockIssueCreation.saved');
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        vm.submit = _.throttle(submit, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });
        function submit() {
            validateForm();
            if (!isValid()) {
                alertService.error('stockAdjustmentCreation.submitInvalid');
                return;
            }

            siglusPrintPalletLabelComfirmModalService.show()
                .then(function(shouldDownloadPallet) {
                    siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature', null, null, true)
                        .then(function(signatureInfo) {
                            loadingModalService.open();
                            var baseInfo = _.assign(getBaseInfo(), {
                                occurredDate: signatureInfo.occurredDate,
                                signature: signatureInfo.signature
                            });
                            siglusLocationAdjustmentService.submitDraft(baseInfo, getLineItems())
                                .then(function() {
                                    $scope.needToConfirm = false;
                                    if (shouldDownloadPallet) {
                                        downloadPrint();
                                    }
                                    notificationService.success(vm.key('submitted'));
                                    printPdfForRRIVAndGoStockOnHandPage(signatureInfo);
                                })
                                .catch(function() {
                                    loadingModalService.close();
                                });
                        });
                });
        }

        function printPdfForRRIVAndGoStockOnHandPage(signatureInfo) {
            var receiveLineItemsToPrint = buildLineItemsToPrintPdf(ReportService.RECEIVE_PDF_REASON_NAME_LIST);
            var issueLineItemsToPrint = buildLineItemsToPrintPdf(ReportService.ISSUE_PDF_REASON_NAME_LIST);
            var momentNow = moment();

            if (receiveLineItemsToPrint.length > 0 && issueLineItemsToPrint.length > 0) {
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
                                goToStockOnHandPage(signatureInfo);
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
                        goToStockOnHandPage(signatureInfo);
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
                        goToStockOnHandPage(signatureInfo);
                    }
                );
            } else {
                goToStockOnHandPage(signatureInfo);
            }
        }

        function goToStockOnHandPage() {
            $state.go('openlmis.locationManagement.stockOnHand', {
                program: program.id
            },
            {
                location: 'replace'
            });
        }

        function buildLineItemsToPrintPdf(reasonNameList) {
            var lineItemsToPrint = _.flatten(vm.allLineItemsAdded).filter(function(lineItem) {
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
                    price: orderablesPrice.data[_.get(item, ['orderable', 'orderableId'])] || null
                };
            });
        }

        function uniqueLotForLineItems(lineItems) {
            var itemsMapByLotCode = _.groupBy(lineItems, function(item) {
                return _.get(item, ['lot', 'lotCode']);
            });

            return Object.keys(itemsMapByLotCode).map(function(lotCode) {
                var itemsWithSameLot = itemsMapByLotCode[lotCode];
                if (itemsWithSameLot.length === 1) {
                    return itemsWithSameLot[0];
                }

                var totalQuantity = itemsWithSameLot.reduce(function(acc, item) {
                    return acc + _.get(item, 'quantity', 0);
                }, 0);

                return _.assign({}, itemsWithSameLot[0], {
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

        function downloadPrint() {
            var printLineItems = angular.copy(getLineItems());
            var newPrintLineItems = _.chain(printLineItems)
                .map(function(item) {
                    item.locationLotOrderableId =
                        _.get(item, ['location', 'locationCode'])
                        + '_' + _.get(item, ['lot', 'lotCode'])
                        + '_' + _.get(item, ['orderableId']);
                    return item;
                })
                .groupBy('locationLotOrderableId')
                .values()
                .map(function(item) {
                    var lineItem = _.first(item);
                    var result = {};
                    result.productName = _.get(lineItem, ['orderable', 'fullProductName']);
                    result.productCode = _.get(lineItem, ['orderable', 'productCode']);
                    result.lotCode = _.get(lineItem, ['lot', 'lotCode']);
                    result.expirationDate = _.get(lineItem, ['lot', 'expirationDate']);
                    result.location = _.get(lineItem, ['location', 'locationCode']);
                    var totalQuantity =  vm.getTotalQuantity(item);
                    result.pallet = Number(totalQuantity) + _.get(lineItem, ['stockOnHand']);
                    result.pack = null;
                    return result;
                })
                .filter(function(item) {
                    return item.pallet > 0;
                })
                .value();
            vm.printLineItems = newPrintLineItems;
        }

        vm.deleteDraft = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusLocationAdjustmentService.deleteDraft($stateParams.draftId)
                    .then(function() {
                        notificationService.success('stockIssueCreation.deleted');
                        $scope.needToConfirm = false;
                        $state.go('^', $stateParams, {
                            reload: true
                        });
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });

            });
        };

    }
})();
