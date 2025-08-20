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

    angular
        .module('siglus-location-issue-creation')
        .controller('siglusLocationIssueCreationController', siglusLocationIssueCreationController);

    siglusLocationIssueCreationController.$inject = [
        '$stateParams', '$scope', '$state', 'DRAFT_TYPE', 'draftInfo', 'facility', 'reasons',
        'initialDraftInfo', 'locations', 'addedLineItems', 'productList', 'siglusStockUtilsService',
        'displayItems', 'siglusLocationCommonApiService', 'SiglusLocationCommonUtilsService',
        'siglusStockDispatchService', 'addAndRemoveIssueLineItemIssueService',
        'alertConfirmModalService', 'loadingModalService', 'notificationService', 'paginationService',
        'messageService', 'isMerge', 'moment', 'siglusStockIssueLocationService',
        'siglusRemainingProductsModalService', 'alertService', 'siglusSignatureWithDateModalService',
        'program', 'confirmDiscardService', 'openlmisDateFilter', 'siglusPrintPalletLabelComfirmModalService',
        'orderablesPrice', 'SiglusIssueOrReceiveReportService', '$q',
        'siglusOrderableLotMapping', 'orderableGroups'
    ];

    function siglusLocationIssueCreationController(
        $stateParams, $scope, $state, DRAFT_TYPE, draftInfo, facility, reasons,
        initialDraftInfo, locations, addedLineItems, productList, siglusStockUtilsService,
        displayItems, siglusLocationCommonApiService, SiglusLocationCommonUtilsService,
        siglusStockDispatchService, addAndRemoveIssueLineItemIssueService,
        alertConfirmModalService, loadingModalService, notificationService, paginationService,
        messageService, isMerge, moment, siglusStockIssueLocationService,
        siglusRemainingProductsModalService, alertService, siglusSignatureWithDateModalService,
        program, confirmDiscardService, openlmisDateFilter, siglusPrintPalletLabelComfirmModalService,
        orderablesPrice, SiglusIssueOrReceiveReportService, $q,
        siglusOrderableLotMapping, orderableGroups
    ) {
        var vm = this;
        var orderablesPriceMap = orderablesPrice.data;
        var ReportService = new SiglusIssueOrReceiveReportService();

        vm.keyword = $stateParams.keyword;

        vm.productList = null;

        vm.facility = facility;

        vm.initialDraftInfo = initialDraftInfo;

        vm.addedLineItems = [];

        vm.displayItems = displayItems;

        vm.selectedProduct = null;

        vm.destinationName = '';

        vm.isMerge = isMerge;

        siglusOrderableLotMapping.setOrderableGroups(orderableGroups);

        vm.$onInit = function() {
            $state.current.label = isMerge
                ? messageService.get('stockIssueCreation.mergedDraft')
                : messageService.get('stockIssue.draft') + ' ' + draftInfo.draftNumber;
            vm.addedLineItems = addedLineItems || [];
            vm.destinationName = siglusStockUtilsService
                .getInitialDraftName(vm.initialDraftInfo, $stateParams.draftType);
            filterProductList();

            var validator = function(lineItems) {
                return _.every(lineItems, function(lineItem, index) {
                    if (lineItems.length > 1 && index === 0) {
                        return true;
                    }
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            };

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue, oldValue) {
                $scope.needToConfirm =  !angular.equals(newValue, oldValue);
            }, true);
            confirmDiscardService.register($scope, 'openlmis.locationManagement.issue.draft.creation');
            paginationService.registerList(validator, $stateParams, function() {
                return vm.displayItems;
            });
            cacheParams();
            loadingModalService.close();
        };

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations));
        };

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations));
        };

        vm.addProduct = function() {
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                isAdjustment: false,
                extraData: true
            }, [vm.selectedProduct.orderableId]).then(function(locationsInfo) {
                locations = locations.concat(locationsInfo);
                vm.addedLineItems.unshift([
                    addAndRemoveIssueLineItemIssueService.getAddProductRow(vm.selectedProduct)
                ]);
                reloadPage();
            });
        };

        function validateLocationDuplicatedForRemove(lineItems) {
            _.forEach(lineItems, function(item, index) {
                item.$error = _.assign(item.$error, {
                    locationError: ''
                });
                if (lineItems.length > 1 && index === 0) {
                    return;
                }
                if (_.isEmpty(item.location)) {
                    item.$error = _.assign(item.$error, {
                        locationError: 'openlmisForm.required'
                    });
                    return;
                }
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.location
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
                })) > 1;
                if (hasDuplicated) {
                    item.$error = _.assign(item.$error, {
                        locationError: 'issueLocationCreation.locationDuplicated'
                    });
                }
            });
        }

        vm.removeItem = function(lineItems, index) {
            var isKit = lineItems[index].isKit;
            addAndRemoveIssueLineItemIssueService.removeItem(lineItems, index);
            if (lineItems.length === 0) {
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
                $stateParams.addedLineItems = vm.addedLineItems;
                vm.displayItems = _.filter(vm.displayItems, function(item) {
                    return !_.isEmpty(item);
                });
                filterProductList();
            }
            if (isKit) {
                validateLocationDuplicatedForRemove(lineItems);
            } else {
                validateBase(lineItems, function(item) {
                    item.$error = _.assign(item.$error, {
                        lotCodeError: ''
                    });
                    item.$hint.lotCodeHint = '';
                });
            }
        };

        vm.addItem = function(lineItem, lineItems) {
            addAndRemoveIssueLineItemIssueService.addLineItem(lineItem, lineItems);
        };

        function validateLotExpired(item) {
            if (!_.get(item, ['$errors', 'lotCodeError'], undefined) && item.lot) {
                var lotExpiredDate = moment(item.lot.expirationDate);
                if (moment().isAfter(lotExpiredDate)) {
                    item.$error = _.assign(item.$error, {
                        lotCodeError: 'issueLocationCreation.lotExpired'
                    });
                }
            }
        }

        function validateNotFirstToExpire(item) {
            if (!_.get(item, ['$errors', 'lotCodeError'])) {
                var lotOptions = _.filter(SiglusLocationCommonUtilsService.getLotList(item,
                    SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)), function(lot) {
                    return moment().isBefore(moment(lot.expirationDate));
                });
                var hasOldLotCode = _.some(lotOptions, function(lotOption) {
                    return item.lot && moment(item.lot.expirationDate)
                        .isAfter(moment(lotOption.expirationDate));
                });

                if (hasOldLotCode) {
                    item.$hint.lotCodeHint = 'locationShipmentView.notFirstToExpire';
                }
            }
        }

        function validateBase(lineItems, callback) {
            _.forEach(lineItems, function(item, $index) {
                if (lineItems.length > 1 && $index === 0) {
                    return;
                }
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.lot && data.location && _.get(item, ['lot', 'lotCode']) === data.lot.lotCode
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
                })) > 1;

                if (hasDuplicated) {
                    item.$error = _.assign(item.$error, {
                        lotCodeError: 'issueLocationCreation.lotDuplicated'
                    });
                } else {
                    callback(item, $index);

                    validateLotExpired(item);

                    validateNotFirstToExpire(item);
                }
            });
        }

        function lotOrLocationChangeEmitValidation(lineItem) {
            var hasKitLocation = lineItem.isKit && !_.isEmpty(lineItem.location);
            var hasBothLocationAndLot = !lineItem.isKit && !_.isEmpty(lineItem.location)
              && !_.isEmpty(lineItem.lot);
            var hasQuantityShippedFilled = !_.isNull(_.get(lineItem, 'quantityShipped'));
            if ((hasKitLocation || hasBothLocationAndLot) && hasQuantityShippedFilled) {
                validateQuantity(lineItem);
            }
        }

        function validateQuantity(currentItem) {
            currentItem.$error = _.assign(currentItem.$error, {
                quantityError: ''
            });
            var quantity = currentItem.quantity;
            if (!_.isNumber(currentItem.quantity) || currentItem.quantity === 0) {
                currentItem.$error = _.assign(currentItem.$error, {
                    quantityError: 'issueLocationCreation.inputPositiveNumber'
                });
                return;
            }
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            if (quantity > getSoh(currentItem, orderableLocationLotsMap)) {
                currentItem.$error = _.assign(currentItem.$error, {
                    quantityError: 'issueLocationCreation.moreThanSoh'
                });
            }
        }

        vm.changeQuantity = function(currentItem) {
            validateQuantity(currentItem);
        };

        function validateLot(lineItem, lineItems, index) {
            lineItem.$error = _.assign(lineItem.$error, {
                lotCodeError: ''
            });

            validateBase(lineItems, function(item, $index) {
                if (index === $index && _.isEmpty(item.lot)) {
                    item.$error = _.assign(item.$error, {
                        lotCodeError: 'openlmisForm.required'
                    });
                    return ;
                }
                item.$error = _.assign(item.$error, {
                    lotCodeError: ''
                });
                item.$hint.lotCodeHint = '';
            });
            lotOrLocationChangeEmitValidation(lineItem);
        }

        vm.changeLot = function(lineItem, lineItems, index) {
            validateLot(lineItem, lineItems, index);
            setStockOnHand(lineItem);
        };

        vm.changeLocation = function(lineItem, lineItems, index) {
            lineItem.$error = _.assign(lineItem.$error, {
                locationError: ''
            });
            if (lineItem.isKit) {
                if (_.isEmpty(_.get(lineItem.location, 'locationCode'))) {
                    lineItem.$error = _.assign(lineItem.$error, {
                        locationError: 'openlmisForm.required'
                    });
                }
                validateLocationDuplicated(lineItems);
            } else {
                validateBase(lineItems, function(item, $index) {
                    if (_.isEmpty(lineItem.location) && $index === index) {
                        lineItem.$error = _.assign(lineItem.$error, {
                            locationError: 'openlmisForm.required'
                        });
                    }
                    item.$error = _.assign(item.$error, {
                        lotCodeError: ''
                    });
                    item.$hint.lotCodeHint = '';

                    if (_.isEmpty(item.lot) && $index === index) {
                        item.$error = _.assign(item.$error, {
                            lotCodeError: 'openlmisForm.required'
                        });
                    }
                });
            }
            validateQuantity(lineItem);
            setStockOnHand(lineItem);
        };

        function setStockOnHand(lineItem) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            lineItem.stockOnHand = getSoh(lineItem, orderableLocationLotsMap);
        }

        function validateLocationDuplicated(lineItems) {
            _.forEach(lineItems, function(item) {
                if (_.get(item, ['$errors', 'locationError'], '') === 'openlmisForm.required') {
                    return;
                }
                item.$error = _.assign(item.$error, {
                    locationError: ''
                });
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.location
                      && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
                })) > 1;
                if (hasDuplicated) {
                    item.$error = _.assign(item.$error, {
                        locationError: 'issueLocationCreation.locationDuplicated'
                    });
                }
            });
        }

        function getSoh(lineItem, orderableLocationLotsMap) {
            var lot = _.chain(orderableLocationLotsMap[lineItem.orderableId])
                .get(_.get(lineItem.location, 'locationCode'))
                .find(function(item) {
                    return lineItem.isKit ? _.isEmpty(item.lotCode)
                        : item.lotCode === _.get(lineItem.lot, 'lotCode');
                })
                .value();
            return _.get(lot, 'stockOnHand', 0);
        }

        vm.getStockOnHand = function(lineItems, index) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            if (index === 0) {
                return _.reduce(lineItems, function(availableSoh, lineItem) {
                    return availableSoh + getSoh(lineItem, orderableLocationLotsMap);
                }, 0);
            }
            return getSoh(lineItems[index], orderableLocationLotsMap);
        };

        vm.getQuantity = function(lineItems) {
            return _.reduce(lineItems, function(quantity, item) {
                return quantity + _.get(item, 'quantity') || 0;
            }, 0);

        };
        vm.getRequestedQuantity = function(lineItems) {
            return _.reduce(lineItems, function(quantity, item) {
                return quantity + _.get(item, 'requestedQuantity') || 0;
            }, 0);

        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return lineItem.isKit || (lineItems.length > 1 && index === 0);
        };

        vm.showEmptyBlock = function(lineItems, index) {
            return (lineItems.length > 1 && index === 0);
        };

        vm.removeDisplayItems = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusStockDispatchService.resetDraft($stateParams.initialDraftId, $stateParams.draftId,
                    $stateParams.moduleType).then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success('stockIssueCreation.deleted');
                    $state.go('^', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        function searchList() {
            reloadPage();
        }

        vm.search = function() {
            searchList();
        };

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

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

        function getLineItems() {
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            var reason = _.find(reasons, {
                name: capitalize($stateParams.draftType || '')
            });
            return _.chain(vm.addedLineItems)
                .map(function(group) {
                    return _.filter(group, function(lineItem) {
                        return !lineItem.isMainGroup || (lineItem.isMainGroup && group.length === 1);
                    });
                })
                .flatten()
                .each(function(item) {
                    item.reason = reason;
                })
                .value();
        }

        vm.save = function() {

            loadingModalService.open();
            siglusStockDispatchService.saveDraft($stateParams.initialDraftId,
                $stateParams.draftId, getLineItems(),
                DRAFT_TYPE[$stateParams.moduleType][$stateParams.draftType], $stateParams.moduleType)
                .then(function() {
                    notificationService.success('stockIssueCreation.saved');
                    $scope.needToConfirm = false;
                    reloadPage();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    productDuplicatedHandler(error);
                });
        };

        function validateRequired(lineItem) {
            if (_.isEmpty(lineItem.lot) && !lineItem.isKit) {
                lineItem.$error = _.assign(lineItem.$error, {
                    lotCodeError: 'openlmisForm.required'
                });
            }

            if (_.isEmpty(lineItem.location)) {
                lineItem.$error = _.assign(lineItem.$error, {
                    locationError: 'openlmisForm.required'
                });
            }
        }

        function validateDuplicated(lineItems, item) {
            var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                return data.lot && data.location && _.get(item, ['lot', 'lotCode']) === data.lot.lotCode
                  && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
            })) > 1;

            if (hasDuplicated) {
                item.$error = _.assign(item.$error, {
                    lotCodeError: 'issueLocationCreation.lotDuplicated'
                });
            }
        }

        function validateKitLocationDuplicated(lineItems, item) {
            var hasKitLocationDuplicated = _.size(_.filter(lineItems, function(data) {
                return data.location
                  && _.get(item, ['location', 'locationCode']) === data.location.locationCode;
            })) > 1;

            if (hasKitLocationDuplicated) {
                item.$error = _.assign(item.$error, {
                    locationError: 'issueLocationCreation.locationDuplicated'
                });
            }
        }

        function isTableFormValid() {
            _.forEach(vm.addedLineItems, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    if (index === 0 && lineItems.length !== 1) {
                        lineItem.$error = {};
                    } else {
                        validateRequired(lineItem);
                        validateLotExpired(lineItem);
                        if (lineItem.isKit) {
                            validateKitLocationDuplicated(lineItems, lineItem);
                        } else {
                            validateDuplicated(lineItems, lineItem);
                        }
                        validateQuantity(lineItem);
                    }
                });
            });

            return _.every(vm.addedLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            });
        }

        function productDuplicatedHandler(error) {
            if (_.get(error, ['data', 'isBusinessError'])) {
                var data = _.map(_.get(error, ['data', 'businessErrorExtraData']), function(item) {
                    item.conflictWith = messageService.get('stockIssue.draft') + ' ' + item.conflictWith;
                    return item;
                });
                siglusRemainingProductsModalService.show(data).then(function() {
                    var addedLineItemsClone = angular.copy(vm.addedLineItems);
                    _.forEach(addedLineItemsClone, function(group, index) {
                        var orderableId = _.get(group, [0, 'orderableId']);

                        var orderableIds = _.map(data, function(data) {
                            return data.orderableId;
                        });
                        if (_.includes(orderableIds, orderableId)) {
                            vm.addedLineItems[index] = [];
                        }
                    });
                    vm.addedLineItems = _.filter(vm.addedLineItems, function(group) {
                        return !_.isEmpty(group);
                    });
                    productList = null;
                    reloadPage();
                });
            }
        }

        vm.cancelMerge = function() {
            $state.go('^', $stateParams);
        };

        vm.submit = function() {
            if (!isTableFormValid()) {
                alertService.error(messageService.get('openlmisForm.formInvalid'));
                return;
            }

            if (isMerge) {
                siglusPrintPalletLabelComfirmModalService.show()
                    .then(function(shouldDownloadPallet) {
                        siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature')
                            .then(function(signatureInfo) {
                                loadingModalService.open();
                                var subDrafts = _.uniq(_.map(draftInfo.lineItems, function(item) {
                                    return item.subDraftId;
                                }));
                                var momentNow = moment();
                                var fileName = 'Saída_' + vm.destinationName + '_' + momentNow.format('YYYY-MM-DD');
                                setIssuePDFInfo(signatureInfo, momentNow);

                                submitMergedDraft(subDrafts, signatureInfo, function() {
                                    if (shouldDownloadPallet) {
                                        vm.downloadPrint();
                                    }
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
                    });
            } else {
                // isMerged === false
                loadingModalService.open();
                submitSubDraftAndBackToList();
            }
        };

        function submitSubDraftAndBackToList() {
            siglusStockIssueLocationService.submitDraft($stateParams.initialDraftId, $stateParams.draftId,
                getLineItems(), DRAFT_TYPE[$stateParams.moduleType][$stateParams.draftType])
                .then(function() {

                    loadingModalService.close();
                    notificationService.success('issueLocationCreation.submitSuccessfully');
                    $scope.needToConfirm = false;
                    $state.go('^', $stateParams);
                })
                .catch(function(error) {
                    loadingModalService.close();
                    productDuplicatedHandler(error);
                });
        }

        function setIssuePDFInfo(signatureInfo, momentNow) {
            var lineItemsToPrint = getLineItemsToPrint();
            vm.reportPDFInfo = {
                type: ReportService.REPORT_TYPE.ISSUE,
                addedLineItems: lineItemsToPrint,
                documentNumberWithItemsNo: vm.initialDraftInfo.documentNumber,
                documentNumber: vm.initialDraftInfo.documentNumber,
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
                totalPriceValue: _.reduce(lineItemsToPrint, function(acc, lineItem) {
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

        function getLineItemsToPrint() {
            var flattenedLineItemsToPrint = [];
            vm.addedLineItems.forEach(function(productGroup) {
                if (productGroup.length === 1) {
                    var lineItemToPrint = minifyLineItemDataToPrint(productGroup[0]);
                    flattenedLineItemsToPrint.push(lineItemToPrint);
                } else {
                    var lineItemsWithoutMainGroup = productGroup.filter(function(lineItem) {
                        return !lineItem.isMainGroup;
                    });
                    // merge lineItems with same lot
                    var lineItemsMapByLotId = _.groupBy(lineItemsWithoutMainGroup, function(lineItem) {
                        return _.get(lineItem, ['lot', 'id']);
                    });
                    Object.keys(lineItemsMapByLotId).map(function(lotId) {
                        var lineItemAfterMerge;
                        var lineItemsWithSameLot = lineItemsMapByLotId[lotId];
                        if (lineItemsWithSameLot.length === 1) {
                            lineItemAfterMerge = lineItemsWithSameLot[0];
                        } else {
                            // only quantity needs merge
                            lineItemAfterMerge = _.assign({}, lineItemsWithSameLot[0], {
                                quantity: lineItemsWithSameLot.reduce(function(acc, lineItem) {
                                    return acc + lineItem.quantity;
                                }, 0)
                            });
                        }
                        var lineItemToPrint = minifyLineItemDataToPrint(lineItemAfterMerge);
                        flattenedLineItemsToPrint.push(lineItemToPrint);
                    });
                }
            });
            return flattenedLineItemsToPrint;
        }

        function minifyLineItemDataToPrint(lineItem) {
            return {
                productCode: lineItem.productCode,
                productName: lineItem.productName,
                lotCode: _.get(lineItem, ['lot', 'lotCode']),
                expirationDate: _.get(lineItem, ['lot', 'expirationDate']),
                quantity: lineItem.quantity,
                price: orderablesPriceMap[_.get(lineItem, ['orderable', 'id'])] || null
            };
        }

        function submitMergedDraft(subDrafts, signatureInfo, callback) {
            siglusStockIssueLocationService
                .mergeSubmitDraft($stateParams.programId, getLineItems(),
                    signatureInfo.signature, vm.initialDraftInfo, facility.id, subDrafts,
                    signatureInfo.occurredDate)
                .then(function() {
                    $scope.needToConfirm = false;
                    if (callback) {
                        callback().then(function() {
                            $state.go('openlmis.locationManagement.stockOnHand', {
                                facility: facility.id,
                                program: program
                            });
                        });
                    } else {
                        $state.go('openlmis.locationManagement.stockOnHand', {
                            facility: facility.id,
                            program: program
                        });
                    }
                })
                .catch(function(error) {
                    loadingModalService.close();
                    if (error.data &&
                        error.data.businessErrorExtraData === 'subDrafts quantity not match') {
                        alertService.error('stockIssueCreation.draftHasBeenUpdated');
                    } else if (
                        // eslint-disable-next-line max-len
                        _.get(error, ['data', 'messageKey']) === 'siglusapi.error.stockManagement.movement.date.invalid'
                    ) {
                        alertService.error('openlmisModal.dateConflict');
                    }
                });
        }

        vm.downloadPrint = function() {
            var printLineItems = getLineItems();
            var newPrintLineItems = _.chain(printLineItems)
                .map(function(item) {
                    var result = {};
                    result.productName = _.get(item, ['productName']);
                    result.productCode = _.get(item, ['productCode']);
                    result.lotCode = _.get(item, ['lot', 'lotCode'], null);
                    result.expirationDate = _.get(item, ['lot', 'expirationDate'], null);
                    result.location = _.get(item, ['location', 'locationCode']);
                    var orderableLocationLotsMap = SiglusLocationCommonUtilsService
                        .getOrderableLocationLotsMap(locations);
                    var totalQuantity = getSoh(item, orderableLocationLotsMap);
                    result.pallet = Number(totalQuantity) -  _.get(item, ['quantity']);
                    result.pack = null;
                    return result;
                })
                .filter(function(item) {
                    return item.pallet > 0;
                })
                .value();
            vm.printLineItems = newPrintLineItems;
        };

        function filterProductList() {
            var addedOrderableIds = _.map(vm.addedLineItems, function(group) {
                return _.first(group).orderableId;
            });
            vm.productList = _.filter(productList, function(item) {
                return !_.includes(addedOrderableIds, item.orderableId);
            });
        }

        function cacheParams() {
            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.locations = locations;
            $stateParams.draftInfo = draftInfo;
            $stateParams.reasons = reasons;
            $stateParams.productList = productList;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.facility = facility;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
        }

        function reloadPage() {
            cacheParams();
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        }

    }

})();
