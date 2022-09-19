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
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService',
        'facility', 'orderableGroups', 'reasons', 'confirmService', 'messageService', 'user',
        'adjustmentType', 'notificationService',
        'MAX_INTEGER_VALUE', 'loadingModalService',
        'alertService', 'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE', 'REASON_TYPES',
        'siglusSignatureWithDateModalService', 'draftInfo',
        'siglusArchivedProductService', 'SIGLUS_MAX_STRING_VALUE', 'stockCardDataService',
        'siglusOrderableLotService', 'addedLineItems', 'paginationService',
        'SiglusLocationCommonUtilsService', 'siglusLocationAdjustmentModifyLineItemService',
        'siglusLocationCommonApiService', 'areaLocationInfo', 'siglusLocationAdjustmentService',
        'alertConfirmModalService', 'siglusOrderableLotMapping', 'locations', 'program',
        'siglusPrintPalletLabelComfirmModalService'
    ];

    function controller(
        $scope, $state, $stateParams, $filter, confirmDiscardService,
        facility, orderableGroups, reasons, confirmService, messageService, user,
        adjustmentType, notificationService,
        MAX_INTEGER_VALUE, loadingModalService,
        alertService, dateUtils, displayItems, ADJUSTMENT_TYPE, REASON_TYPES,
        siglusSignatureWithDateModalService, draftInfo,
        siglusArchivedProductService, SIGLUS_MAX_STRING_VALUE, stockCardDataService,
        siglusOrderableLotService, addedLineItems, paginationService,
        SiglusLocationCommonUtilsService, siglusLocationAdjustmentModifyLineItemService,
        siglusLocationCommonApiService, areaLocationInfo, siglusLocationAdjustmentService,
        alertConfirmModalService, siglusOrderableLotMapping, locations, program,
        siglusPrintPalletLabelComfirmModalService
    ) {
        siglusOrderableLotMapping.setOrderableGroups(orderableGroups);
        var vm = this;

        vm.$onInit = function() {

            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            vm.orderableGroups = null;

            vm.selectedOrderableGroup = null;

            vm.addedLineItems = [];

            vm.facility = facility;

            vm.program = program;

            vm.displayItems = displayItems || [];

            vm.reasons = filterReasons(reasons);

            vm.mandatoryReasons = [
                'Empréstimos (para todos níveis) que dão saída do depósito',
                'Devolução dos clientes (US e Depósitos Beneficiários)',
                'Doações ao Depósito',
                'Empréstimos (de todos os níveis) que dão entrada no depósito',
                //eslint-disable-next-line
                'Correcção de inventário, no caso do stock em excesso (stock é superior ao existente na ficha de stock)',
                //eslint-disable-next-line
                'Correcção de inventário, no caso do stock em falta (stock é inferior ao existente na ficha de stock)'
            ];

            vm.ignoreReasons = [
                'Consumido',
                'Recebido',
                'Stock Inicial Excessivo',
                'Stock Inicial Insuficiente',
                'Devolução para o DDM'
            ];
            vm.addedLineItems = addedLineItems;
            vm.displayItems = displayItems;
            vm.keyword = $stateParams.keyword;
            filterOrderableGroups();
            updateStateParams();
            validateForm(true);

            $scope.$watch(function() {
                return vm.addedLineItems;
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
            return paginationService.registerList(validator, angular.copy($stateParams), function() {
                return vm.addedLineItems;
            });
        };

        vm.getProductName = function(lineItem) {
            return lineItem.isMainGroup ? $filter('productName')(lineItem.orderable) : '';
        };

        function filterOrderableGroups() {
            var addedOrderableIds = _.map(vm.addedLineItems, function(group) {
                return _.first(group).orderableId;
            });
            vm.orderableGroups = _.chain(orderableGroups)
                .map(function(group) {
                    return _.first(group);
                })
                .filter(function(item) {
                    return !_.isEmpty(item) && !_.includes(addedOrderableIds, item.orderable.id);
                })
                .value();
        }

        // add locationsInfo to product
        // add locationOptions all locationList to product
        // add cloneOptions to filter lot and location options
        vm.addProduct = function() {
            var orderable = vm.selectedOrderableGroup.orderable;
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                extraData: true,
                isAdjustment: true
            }, [orderable.id])
                .then(function(locationsInfo) {
                    locations = locations.concat(locationsInfo);
                    var firstRow = siglusLocationAdjustmentModifyLineItemService.getAddProductRow(orderable);

                    var lotOptions = SiglusLocationCommonUtilsService.getLotList(
                        firstRow,
                        SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locationsInfo)
                    );
                    firstRow.lotOptions = lotOptions;
                    firstRow.locationOptions = areaLocationInfo;
                    firstRow.locationsInfo = locationsInfo;
                    firstRow.lotOptionsClone = _.clone(firstRow.lotOptions);
                    firstRow.locationOptionsClone = _.clone(areaLocationInfo);
                    firstRow.locationsInfo = locationsInfo;
                    vm.addedLineItems.unshift([firstRow]);
                    searchList();
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        function updateStateParams() {
            $stateParams.locations = locations;
            $stateParams.keyword = vm.keyword;
            $stateParams.areaLocationInfo = areaLocationInfo;
            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.orderableGroups = orderableGroups;
            $stateParams.draftInfo = draftInfo;
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

            emitQuantityChange(lineItem, lineItems);
            vm.validateLot(lineItem);
            vm.validateLotDate(lineItem);

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
            if (lineItem.lotId) {
                lineItem.$errors.lotCodeInvalid
                = lineItem.$errors.lotCodeInvalid
                        ? lineItem.$errors.lotCodeInvalid
                        : false;
            } else if (hasLot(lineItem)) {
                if (lineItem.lot.lotCode.length > SIGLUS_MAX_STRING_VALUE) {
                    lineItem.$errors.lotCodeInvalid =
                        messageService.get('stockPhysicalInventoryDraft.lotCodeTooLong');
                } else {
                    lineItem.$errors.lotCodeInvalid
                    =  lineItem.$errors.lotCodeInvalid
                            ? lineItem.$errors.lotCodeInvalid
                            : false;
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
            lineItem.$errors.locationError = _.isEmpty(lineItem.location) ? 'openlmisForm.required' : '';
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
                            ? false
                            : item.$errors.lotCodeInvalid;
                    }

                    item.$errors.locationError =
                    item.$errors.locationError === duplicateErrorMessage
                        ? false
                        : item.$errors.lotCodeInvalid;
                    item.$errors.reasonInvalid =
                    item.$errors.reasonInvalid === duplicateErrorMessage
                        ? false
                        : item.$errors.lotCodeInvalid;
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
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
                filterOrderableGroups();
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
                lineItem.$errors.lotCodeInvalid = 'openlmisForm.required';
            }

            if (_.isEmpty(_.get(lineItem.lot, 'expirationDate')) && !lineItem.isKit) {
                lineItem.$errors.lotDateInvalid = 'openlmisForm.required';
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
            _.forEach(vm.addedLineItems, function(lineItems) {
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
            return _.every(vm.addedLineItems, function(lineItems) {
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
            return _.chain(vm.addedLineItems)
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

        vm.filterByProgram = function(items, programsList) {
            var programIds = [];
            programsList.forEach(function(program) {
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

        function filterReasons(items) {
            return _.chain(items)
                .filter(function(reason) {
                    return !_.contains(vm.ignoreReasons, reason.name);
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

        // vm.validateReasonFreeText = function(lineItem) {
        //     if (lineItem.reason && lineItem.reason.isFreeTextAllowed) {
        //         var reasonName = lineItem.reason.name;
        //         if (_.contains(vm.mandatoryReasons, reasonName.substr(reasonName.indexOf('] ') + 1).trim())) {
        //             lineItem.$errors.reasonFreeTextInvalid = isEmpty(lineItem.reasonFreeText);
        //         }
        //     }
        //     return lineItem;
        // };

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

        vm.submit = function() {
            validateForm();
            if (isValid()) {
                siglusPrintPalletLabelComfirmModalService.show()
                    .then(function(result) {
                        if (result) {
                            downloadPrint();
                        }
                        siglusSignatureWithDateModalService
                            .confirm('stockUnpackKitCreation.signature', null, null, true)
                            .then(function(data) {
                                var baseInfo = _.extend(getBaseInfo(), {
                                    occurredDate: data.occurredDate,
                                    signature: data.signature
                                });
                                loadingModalService.open();
                                siglusLocationAdjustmentService.submitDraft(baseInfo, getLineItems())
                                    .then(function() {
                                        notificationService.success(vm.key('submitted'));
                                        $scope.needToConfirm = false;
                                        $state.go('openlmis.locationManagement.stockOnHand', {
                                            program: program.id
                                        },
                                        {
                                            location: 'replace'
                                        });
                                        loadingModalService.close();
                                    })
                                    .catch(function() {
                                        loadingModalService.close();
                                    });
                            });

                    });

            } else {
                alertService.error('stockAdjustmentCreation.submitInvalid');
            }
        };

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
