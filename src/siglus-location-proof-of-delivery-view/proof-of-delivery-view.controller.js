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
     * @name proof-of-delivery-view.controller:ProofOfDeliveryViewController
     *
     * @description
     * Controller that drives the POD view screen.
     */
    angular
        .module('proof-of-delivery-view')
        .controller('ProofOfDeliveryViewControllerWithLocation',
            ProofOfDeliveryViewControllerWithLocation);

    ProofOfDeliveryViewControllerWithLocation.$inject = [
        '$scope', 'proofOfDelivery', 'order', 'reasons', 'messageService', 'VVM_STATUS',
        'orderLineItems', 'canEdit', 'ProofOfDeliveryPrinter', '$q', 'loadingModalService',
        'proofOfDeliveryService', 'notificationService', '$stateParams',
        'alertConfirmModalService', '$state', 'PROOF_OF_DELIVERY_STATUS', 'confirmService',
        'confirmDiscardService', 'proofOfDeliveryManageService', 'openlmisDateFilter',
        'fulfillingLineItemFactory', 'facilityFactory', 'siglusDownloadLoadingModalService',
        'user', 'moment', 'orderablesPrice', 'facility', 'locations', 'areaLocationInfo',
        'addAndRemoveLineItemService', 'SiglusLocationCommonUtilsService', 'alertService',
        'printInfo', 'siglusSignatureWithLimitDateModalService'
    ];

    function ProofOfDeliveryViewControllerWithLocation(
        $scope, proofOfDelivery, order, reasons, messageService, VVM_STATUS,
        orderLineItems, canEdit, ProofOfDeliveryPrinter, $q, loadingModalService,
        proofOfDeliveryService, notificationService, $stateParams,
        alertConfirmModalService, $state, PROOF_OF_DELIVERY_STATUS, confirmService,
        confirmDiscardService, proofOfDeliveryManageService, openlmisDateFilter,
        fulfillingLineItemFactory, facilityFactory, siglusDownloadLoadingModalService,
        user, moment, orderablesPrice, facility, locations, areaLocationInfo,
        addAndRemoveLineItemService, SiglusLocationCommonUtilsService, alertService,
        printInfo, siglusSignatureWithLimitDateModalService
    ) {

        if (canEdit) {
            orderLineItems.forEach(function(orderLineItem) {
                orderLineItem.groupedLineItems.forEach(function(fulfillingLineItem) {
                    addAndRemoveLineItemService.fillMovementOptions(fulfillingLineItem,
                        locations, areaLocationInfo);
                });
            });
        }
        var vm = this;

        var NEWLY_ADDED_LOT_REASON_NAME = 'Lote não especificado na Guia de Remessa';

        vm.$onInit = onInit;
        vm.getStatusDisplayName = getStatusDisplayName;
        vm.getReasonName = getReasonName;
        vm.save = save;
        vm.submit = submit;
        vm.deleteDraft = deleteDraft;
        vm.returnBack = returnBack;
        vm.calculateValueByShippedQuantityAndPrice = calculateValueByShippedQuantityAndPrice;
        vm.changeAcceptQuantity = changeAcceptQuantity;
        vm.facilityId = facility.id;
        vm.isMerge = undefined;
        this.ProofOfDeliveryPrinter = ProofOfDeliveryPrinter;
        vm.maxDate = undefined;
        vm.minDate = undefined;
        vm.fileName = undefined;
        vm.newlyAddedLotReason = undefined;
        vm.disableReasonSelect = disableReasonSelect;
        vm.getLineItemReasonOptions = getLineItemReasonOptions;
        vm.addLocationItem = addLocationItem;
        vm.removeLocationItem = removeLocationItem;
        vm.addLotGroup = addLotGroup;
        vm.removeLotGroup = removeLotGroup;
        vm.displayOrderLineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name proofOfDelivery
         * @type {Object}
         *
         * @description
         * Holds Proof of Delivery.
         */
        vm.proofOfDelivery = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name order
         * @type {Object}
         *
         * @description
         * Holds Order from Proof of Delivery.
         */
        vm.order = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name orderLineItems
         * @type {Object}
         *
         * @description
         * Holds a map of Order Line Items with Proof of Delivery Line Items grouped by orderable.
         */
        vm.orderLineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name showVvmColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be shown for current Proof of Delivery.
         */
        vm.showVvmColumn = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name canEdit
         * @type {boolean}
         *
         * @description
         * Indicates if PoD is in initiated status and if user has permission to edit it.
         */
        vm.canEdit = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name reasons
         * @type {Array}
         *
         * @description
         * List of available stock reasons.
         */
        vm.reasons = undefined;

        vm.rejectionReasons = undefined;
        vm.excessReasons = undefined;

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name $onInit
         *
         * @description
         * Initialization method of the ProofOfDeliveryViewController.
         */
        function onInit() {

            vm.order = order;
            // SIGLUS-REFACTOR: starts here
            vm.reasons = _.filter(reasons, function(reason) {
                return _.contains(reason.tags, 'rejection');
            });
            vm.rejectionReasons = _.filter(vm.reasons, function(reason) {
                return reason.reasonType === 'DEBIT';
            });
            vm.excessReasons = _.filter(vm.reasons, function(reason) {
                return reason.reasonType === 'CREDIT';
            });
            vm.newlyAddedLotReason = vm.excessReasons.find(function(reason) {
                return reason.name === NEWLY_ADDED_LOT_REASON_NAME;
            }, {});
            // SIGLUS-REFACTOR: ends here
            vm.proofOfDelivery = proofOfDelivery;

            proofOfDeliveryManageService.getPodInfo(proofOfDelivery.id, order.id).then(function(res) {
                vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
                vm.supplier = res.supplier;
                vm.preparedBy = res.preparedBy;
                vm.conferredBy = res.conferredBy;
                vm.client = res.client;
                vm.supplierDistrict = res.supplierDistrict;
                vm.supplierProvince = res.supplierProvince;
                vm.requisitionDate = openlmisDateFilter(res.requisitionDate, 'yyyy-MM-dd');
                vm.issueVoucherDate = openlmisDateFilter(res.issueVoucherDate, 'yyyy-MM-dd');
                vm.deliveredBy = res.deliveredBy;
                vm.receivedBy = res.receivedBy;
                vm.receivedDate = res.receivedDate;
                vm.podNum = '';
                var flag = order.orderCode.slice(-2) || '';
                if (flag.startsWith('-')) {
                    flag = flag.replace('-', '0');
                }
                if (flag.endsWith('E') || flag.endsWith('R')) {
                    flag = '01';
                }
                if (order.status === 'SHIPPED') {
                    vm.fileName = 'GR.' + res.requisitionNum + '_' + flag;
                    vm.requisitionNo = 'GR.' + res.requisitionNum + '/' + flag;
                }

                if (order.status === 'RECEIVED') {
                    vm.fileName = 'RR.' + res.requisitionNum + '_' + flag;
                    vm.requisitionNo = 'GR.' + res.requisitionNum + '/' + flag;
                    vm.podNum = 'RR.' + res.requisitionNum + '/' + flag;
                }
                vm.requisitionNum = res.requisitionNum;

                vm.requisitionId = res.requisitionId;

            });

            vm.orderLineItems = orderLineItems;
            vm.displayOrderLineItems = buildDisplayOrderLineItems();
            vm.vvmStatuses = VVM_STATUS;
            vm.showVvmColumn = proofOfDelivery.hasProductsUseVvmStatus();
            vm.canEdit = canEdit;
            vm.orderCode = order.orderCode;
            vm.facility = facility;
            vm.facilityId = facility.id;
            vm.locations = locations;
            vm.areaLocationInfo = areaLocationInfo;
            vm.fileName = printInfo.fileName;
            vm.currentDate = moment().format('YYYY-MM-DD');
            facilityFactory.getUserHomeFacility()
                .then(function(res) {
                    vm.facility = res;
                });
            siglusSignatureWithLimitDateModalService.getMovementDate(
                vm.currentDate, vm.facility.id
            ).then(
                function(result) {
                    vm.minDate = result;
                }
            )
                .catch(function(error) {
                    if (error.data.messageKey
            === 'siglusapi.error.stockManagement.movement.date.invalid') {
                        alertService.error('openlmisModal.dateConflict');
                    }
                });
            vm.isMerge = $stateParams.actionType === 'MERGE'
          || $stateParams.actionType === 'VIEW';

            if ($stateParams.actionType === 'NOT_YET_STARTED') {
                save(true);
            }

            if ($stateParams.actionType === 'MERGE') {
                vm.proofOfDelivery.receivedBy = '';
                vm.maxDate = moment().format('YYYY-MM-DD');
            }

            $scope.$watch(function() {
                return vm.proofOfDelivery;
            }, function(newValue, oldValue) {
                $scope.needToConfirm =  !angular.equals(newValue, oldValue);
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
            updateLabel();
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name getStatusDisplayName
         *
         * @description
         * Returns translated status display name.
         */
        function getStatusDisplayName(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name getReasonName
         *
         * @description
         * Returns a name of the reason with the given ID.
         *
         * @param  {string} id the ID of the reason
         * @return {string}    the name of the reason
         */
        function getReasonName(id) {
            if (!id) {
                return;
            }

            return vm.reasons.filter(function(reason) {
                return reason.id === id;
            })[0].name;
        }

        function getSumOfLot(lineItem, groupedLineItems) {
            return groupedLineItems.filter(function(lineItem) {
                return !lineItem.isMainGroup;
            }).filter(function(line) {
                return _.get(lineItem, ['orderable', 'id'], '') === _.get(line, ['orderable', 'id'], '') &&
                    _.get(lineItem, ['lot', 'id'], '') === _.get(line, ['lot', 'id'], '');
            })
                .map(function(line) {
                    return _.get(line, 'quantityAccepted', 0);
                })
                .reduce(function(accumulator, a) {
                    return accumulator + a;
                }, 0);
        }

        vm.getSumOfOrderableAcceptedQuantity = function(locationGroup) {
            var lineItemsToSum = _.flatten(locationGroup).filter(function(lineItem) {
                return !lineItem.isMainGroup;
            });
            return lineItemsToSum.reduce(function(acc, lineItem) {
                return acc + _.get(lineItem, 'quantityAccepted', 0);
            }, 0);
        };
        vm.getSumOfQuantityShipped = function(groupedLineItems) {
            return groupedLineItems[0].filter(function(lineItem) {
                return lineItem.isMainGroup || lineItem.isFirst;
            }).map(function(line) {
                return _.get(line, 'quantityShipped', 0);
            })
                .reduce(function(accumulator, a) {
                    return accumulator + a;
                }, 0);
        };

        function removeLocationItem(index, groupedLineItems) {
            var lineItem = groupedLineItems[index];
            $scope.needToConfirm = true;
            addAndRemoveLineItemService.removeItemForPod(lineItem, index, groupedLineItems);
        }

        vm.changeArea = function(lineItem, groupedLineItems) {
            $scope.needToConfirm = true;
            lineItem.$error.areaError = _.isEmpty(_.get(lineItem.moveTo, 'area')) ? 'openlmisForm.required' : '';
            lineItem.destLocationOptions = SiglusLocationCommonUtilsService
                .getDesLocationList(lineItem, areaLocationInfo);
            // still need to verify all lines
            groupedLineItems.forEach(function(line) {
                validateLocationsEmptyAndDuplicated(line, groupedLineItems);
            });
        };
        vm.changeMoveToLocation = function(lineItem, groupedLineItems) {
            $scope.needToConfirm = true;
            lineItem.$error.moveToLocationError = _.isEmpty(_.get(lineItem.moveTo, 'locationCode'))
                ? 'openlmisForm.required' : '';
            lineItem.destAreaOptions = SiglusLocationCommonUtilsService.getDesAreaList(lineItem, areaLocationInfo);
            // still need to verify all lines
            groupedLineItems.forEach(function(line) {
                validateLocationsEmptyAndDuplicated(line, groupedLineItems);
            });
        };
        $scope.$on('locationCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            var lineItems = data.lineItems;
            lineItem.destAreaOptions = SiglusLocationCommonUtilsService.getDesAreaList(lineItem, areaLocationInfo);
            if (_.get(lineItem.moveTo, 'locationCode')) {
                lineItem.moveTo.area = lineItem.destAreaOptions[0];
            } else {
                lineItem.moveTo.area = undefined;
            }
            vm.changeArea(lineItem, lineItems);
            vm.changeMoveToLocation(lineItem, lineItems);
        });

        function changeAcceptQuantity(lineItem, groupedLineItems) {
            $scope.needToConfirm = true;
            lineItem.$error.rejectionReasonIdError = undefined;
            validateAcceptedQuantityEmpty(lineItem);
            // update rejected quantity
            if (lineItem.isMainGroup || lineItem.isFirst) {
                lineItem.quantityRejected = vm.getRejectedQuantity(lineItem, groupedLineItems);
            }
            // update reason id
            updateReasonIdForLocationGroup(lineItem, groupedLineItems);
        }

        function validateAcceptedQuantityEmpty(lineItem) {
            lineItem.$error.quantityAcceptedError = undefined;
            if (lineItem.isMainGroup) {
                return;
            }
            if (isEmpty(lineItem.quantityAccepted)) {
                lineItem.$error.quantityAcceptedError = 'openlmisForm.required';
            }
        }

        function validateReasonIdEmpty(lineItem, allLineItems) {
            lineItem.$error.rejectionReasonIdError = undefined;
            if (lineItem.isMainGroup || lineItem.isFirst) {
                var locationGroup = getLineItemsWithSameLot(lineItem, allLineItems);
                if (disableReasonSelect(lineItem, locationGroup)) {
                    return;
                }
                if (isEmpty(lineItem.rejectionReasonId)) {
                    lineItem.$error.rejectionReasonIdError = 'openlmisForm.required';
                }
            }
        }

        function validateLocationsEmptyAndDuplicated(lineItem, allLineItems) {
            lineItem.$error.moveToLocationError = undefined;
            lineItem.$error.areaError = undefined;
            if (!lineItem.isNewlyAddedLot || (!lineItem.isMainGroup && !lineItem.isFirst)) {
                return;
            }
            // validate location empty
            if  (isEmpty(_.get(lineItem, ['moveTo', 'locationCode']))) {
                lineItem.$error.moveToLocationError = 'openlmisForm.required';
                return;
            }
            if  (isEmpty(_.get(lineItem, ['moveTo', 'area']))) {
                lineItem.$error.areaError = 'openlmisForm.required';
                return;
            }
            // validate location duplicate
            var sameLotLineItems = allLineItems.filter(function(line) {
                return !line.isMainGroup &&
                    _.get(lineItem, ['orderable', 'id'], '') === _.get(line, ['orderable', 'id'], '') &&
                    _.get(lineItem, ['lot', 'id'], '') === _.get(line, ['lot', 'id'], '');
            });
            var sameLocationLineItems = sameLotLineItems.filter(function(line) {
                return _.get(line, ['moveTo', 'locationCode']) && _.get(line, ['moveTo', 'area']) &&
                    _.get(lineItem, ['moveTo', 'locationCode']) === _.get(line, ['moveTo', 'locationCode']) &&
                    _.get(lineItem, ['moveTo', 'area']) === _.get(line, ['moveTo', 'area']);
            });
            // expected to have only 1 item as lineItem itself, otherwise means the location duplicated
            if (sameLocationLineItems.length > 1) {
                sameLocationLineItems.forEach(function(lineItem) {
                    if (lineItem.lot) {
                        lineItem.$error.moveToLocationError = 'proofOfDeliveryView.duplicateLocation';
                        lineItem.$error.areaError = 'proofOfDeliveryView.duplicateLocation';
                    } else {
                        lineItem.$error.moveToLocationError = 'proofOfDeliveryView.duplicateLocationForKit';
                        lineItem.$error.areaError = 'proofOfDeliveryView.duplicateLocationForKit';
                    }
                });
            }
        }

        function resetError(lineItem) {
            lineItem.$error = {};
            lineItem.$errors = {};
        }

        function getLineItemsWithSameLot(lineItem, allLineItems) {
            return allLineItems.filter(function(line) {
                return _.get(lineItem, ['lot', 'id'], '') === _.get(line, ['lot', 'id'], '');
            });
        }

        function getFirstEmptyAcceptedLine(relatedLines) {
            var linesToCheck = relatedLines.length === 1 ? relatedLines :
                _.filter(relatedLines, function(line) {
                    return !line.isMainGroup;
                });
            return _.find(linesToCheck, function(line) {
                return line.quantityAccepted === null || line.quantityAccepted === undefined;
            });
        }

        function getMainLine(lineItem, relatedLines) {
            return relatedLines.length > 1 ? relatedLines.find(function(line) {
                return line.isMainGroup;
            }) : lineItem;
        }

        function updateReasonIdForLocationGroup(lineItem, locationGroup) {
            var emptyAcceptedLine = getFirstEmptyAcceptedLine(locationGroup);
            var mainLine = lineItem.isFirst ? lineItem : getMainLine(lineItem, locationGroup);

            if (emptyAcceptedLine) {
                emptyAcceptedLine.$error.quantityAcceptedError = 'openlmisForm.required';
                setDisabledReasonId(mainLine);
                return;
            }

            if (!mainLine.rejectionReasonId) {
                mainLine.$error.rejectionReasonIdError = 'openlmisForm.required';
            }
            if (disableReasonSelect(lineItem, locationGroup)) {
                setDisabledReasonId(mainLine);
            }
        }

        function setDisabledReasonId(mainLine) {
            mainLine.rejectionReasonId = mainLine.isNewlyAddedLot ? vm.newlyAddedLotReason.id : undefined;
            mainLine.$error.rejectionReasonIdError = '';
        }

        vm.getRejectedQuantity = function(fulfillingLineItem, groupedLineItems) {
            var quantityAccepted = getSumOfLot(fulfillingLineItem, groupedLineItems);
            var diff = fulfillingLineItem.quantityShipped - quantityAccepted;
            return diff < 0 ? 0 : diff;
        };

        function getPodMainOrFirstLineItems() {
            var allLineItems = getAllLineItems();
            return allLineItems.filter(function(lineItem) {
                return lineItem.isMainGroup || lineItem.isFirst;
            });
        }

        function getPodLocationLineItems() {
            var allLineItems = getAllLineItems();
            var lineItemsWithLocation = allLineItems.filter(function(lineItem) {
                return !lineItem.isMainGroup;
            });
            return lineItemsWithLocation.map(function(lineItem) {
                return {
                    podLineItemId: lineItem.id,
                    locationCode: _.get(lineItem, ['moveTo', 'locationCode']),
                    area: _.get(lineItem, ['moveTo', 'area']),
                    quantityAccepted: lineItem.quantityAccepted
                };
            });
        }

        function save(notReload) {
            loadingModalService.open();
            // only pick main group or isFirst lineItem
            vm.proofOfDelivery.lineItems = getPodMainOrFirstLineItems();
            // only pick lineItems with location
            var podLocationLineItem = getPodLocationLineItems();
            proofOfDeliveryService.updateSubDraftWithLocation(
                $stateParams.podId, $stateParams.subDraftId, vm.proofOfDelivery, 'SAVE', podLocationLineItem
            )
                .then(function() {
                    $scope.needToConfirm = false;
                    if (notReload) {
                        var stateParams = angular.copy($stateParams);
                        stateParams.actionType = 'DRAFT';
                        $state.go($state.current.name, stateParams, {
                            location: 'replace'
                        });
                    } else {
                        notificationService.success('proofOfDeliveryView.proofOfDeliveryHasBeenSaved');
                    }
                })
                .catch(function() {
                    notificationService.error('proofOfDeliveryView.failedToSaveProofOfDelivery');
                })
                .finally(loadingModalService.close);
        }

        function validateForm() {
            var allLineItems = getAllLineItems();

            _.forEach(allLineItems, function(lineItem) {
                resetError(lineItem);
                validateAcceptedQuantityEmpty(lineItem);
                validateReasonIdEmpty(lineItem, allLineItems);
                validateLocationsEmptyAndDuplicated(lineItem, allLineItems);
                validateLotCodeEmptyAndDuplicate(lineItem, allLineItems);
                validateExpirationDateEmpty(lineItem);
            });

            return _.every(allLineItems, function(lineItem) {
                var lineItemError = _.assign({}, lineItem.$error, lineItem.$errors);
                var errorKeys = Object.keys(lineItemError);
                if  (errorKeys.length === 0) {
                    return true;
                }
                return _.every(errorKeys, function(key) {
                    return isEmpty(lineItemError[key]);
                });
            });
        }

        function validateReceivedByAndDateEmpty() {
            vm.proofOfDelivery.receivedByError =
                isEmpty(_.get(vm.proofOfDelivery, 'receivedBy')) ? 'openlmisForm.required' : '';
            vm.proofOfDelivery.receivedDateError =
                isEmpty(_.get(vm.proofOfDelivery, 'receivedDate')) ? 'openlmisForm.required' : '';

            return isEmpty(_.get(vm.proofOfDelivery, 'receivedByError')) &&
                isEmpty(_.get(vm.proofOfDelivery, 'receivedDateError'));
        }

        function submit() {
            $scope.$broadcast('openlmis-form-submit');
            if (validateForm()) {
                if (vm.isMerge) {
                    if (validateReceivedByAndDateEmpty()) {
                        submitDraft();
                    } else {
                        alertService.error(messageService.get('openlmisForm.formInvalid'));
                    }
                } else {
                    submitSubDraft();
                }
            } else {
                alertService.error(messageService.get('openlmisForm.formInvalid'));
            }
        }

        // submit subDraft
        function submitSubDraft() {
            loadingModalService.open();
            vm.proofOfDelivery.lineItems = getPodMainOrFirstLineItems();
            var podLineItemLocation = getPodLocationLineItems();
            proofOfDeliveryService.updateSubDraftWithLocation(
                $stateParams.podId, $stateParams.subDraftId, vm.proofOfDelivery, 'SUBMIT', podLineItemLocation
            )
                .then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success('proofOfDeliveryView.proofOfDeliveryHasBeenSubmitted');
                    $state.go('^', $stateParams, {
                        reload: true
                    });
                })
                .catch(function() {
                    notificationService.error('proofOfDeliveryView.failedToSaveProofOfDelivery');
                })
                .finally(loadingModalService.close);
        }

        // final merge and submit
        function submitDraft() {
            vm.receivedBy = vm.proofOfDelivery.receivedBy;
            vm.receivedDate = vm.proofOfDelivery.receivedDate;
            downloadPrint();
            confirmService.confirm(
                'proofOfDeliveryView.confirm.message',
                'proofOfDeliveryView.confirm.label'
            )
                .then(function() {
                    loadingModalService.open();
                    var copy = angular.copy(vm.proofOfDelivery);
                    copy.lineItems = getPodMainOrFirstLineItems();
                    var podLineItemLocation = getPodLocationLineItems();
                    copy.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;
                    proofOfDeliveryService.submitDraftWithLocation($stateParams.podId,
                        copy, podLineItemLocation).then(function() {
                        $scope.needToConfirm = false;
                        notificationService.success(
                            'proofOfDeliveryView.proofOfDeliveryHasBeenConfirmed'
                        );
                        $state.go('openlmis.orders.podManage', {
                            requestingFacilityId: $stateParams.requestingFacilityId,
                            programId: $stateParams.programId
                        }, {
                            reload: true
                        });
                    })
                        .catch(function(error) {
                            if (
                                // eslint-disable-next-line max-len
                                _.get(error, ['data', 'messageKey']) === 'siglusapi.error.stockManagement.movement.date.invalid'
                            ) {
                                alertService.error('openlmisModal.dateConflict');
                            } else {
                                notificationService.error(
                                    'proofOfDeliveryView.failedToConfirmProofOfDelivery'
                                );
                            }
                        })
                        .finally(loadingModalService.close);
                });

        }

        function downloadPrint() {
            var mainGroupItems = getPodMainOrFirstLineItems();
            var locationItems = getPodLocationLineItems();
            // change vm.printLineItems would trigger $scope.$watch in siglus-print-pallet-label.controller to print
            vm.printLineItems = _.chain(locationItems)
                .map(function(locationItem) {
                    var mainGroupItem = _.find(mainGroupItems, function(mainGroupItem) {
                        return mainGroupItem.id === locationItem.podLineItemId;
                    });

                    // TODO: what if newly added lot is already in the inventory?
                    var stockOnHand = getStockOnHandFromOrderableLocationLotsMap(
                        mainGroupItem, locationItem.locationCode
                    );
                    return _.assign({}, locationItem, {
                        productName: _.get(mainGroupItem, ['orderable', 'fullProductName']),
                        productCode: _.get(mainGroupItem, ['orderable', 'productCode']),
                        lotCode: _.get(mainGroupItem, ['lot', 'lotCode'], null),
                        expirationDate: _.get(mainGroupItem, ['lot', 'expirationDate'], null),
                        location: locationItem.locationCode,
                        pack: null,
                        stockOnHand: stockOnHand,
                        pallet: Number(locationItem.quantityAccepted) + Number(stockOnHand)
                    });
                })
                .filter(function(locationItemAssigned) {
                    return locationItemAssigned.pallet > 0 &&
                        locationItemAssigned.pallet !== locationItemAssigned.stockOnHand;
                })
                .value();
        }

        function getStockOnHandFromOrderableLocationLotsMap(mainGroupItem, locationCode) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            var orderableId = _.get(mainGroupItem, ['orderable', 'id']);
            if  (mainGroupItem.isKit) {
                return _.get(orderableLocationLotsMap[orderableId], [locationCode, 0, 'stockOnHand'], 0);
            }
            var locationLotList = _.get(orderableLocationLotsMap[orderableId], [locationCode]);
            var locationLot = _.find(locationLotList, function(locationLot) {
                return locationLot.id === _.get(mainGroupItem, ['lot', 'id']);
            });
            return _.get(locationLot, 'stockOnHand', 0);
        }

        function deleteDraft() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                proofOfDeliveryService.deleteSubDraftWithLocation($stateParams.podId,
                    $stateParams.subDraftId).then(function() {
                    $scope.needToConfirm = false;
                    $state.go('^', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    })
                    .finally(loadingModalService.close);
            });
        }

        function returnBack() {
            $state.go('^', {}, {
                reload: true
            });
        }

        function updateLabel() {
            if ($stateParams.actionType === 'VIEW') {
                $state.current.label = messageService.get('proofOfDeliveryManage.view');
            } else if ($stateParams.actionType === 'MERGE') {
                $state.current.label = messageService.get('stockPhysicalInventoryDraft.mergeDraft');
            } else {
                $state.current.label =
                        messageService.get('stockPhysicalInventoryDraft.draft')
                        + ' '
                        + $stateParams.draftNum;
            }
        }

        function calculateValueByShippedQuantityAndPrice(lineItem) {
            return _.get(lineItem, ['price']) ?
                (lineItem.quantityShipped * (lineItem.price * 100).toFixed(2)) / 100 : '';
        }

        function disableReasonSelect(lineItem, locationGroup) {
            var emptyAcceptedLine = getFirstEmptyAcceptedLine(locationGroup);
            return emptyAcceptedLine !== undefined ||
                getSumOfLot(lineItem, locationGroup) === lineItem.quantityShipped || lineItem.isNewlyAddedLot;
        }

        function getLineItemReasonOptions(lineItem, locationGroup) {
            if (lineItem.isNewlyAddedLot) {
                return [vm.newlyAddedLotReason];
            }

            var sumOfLot = getSumOfLot(lineItem, locationGroup);
            var mainLine = getMainLine(lineItem, locationGroup);
            var quantityShipped = _.get(mainLine, ['quantityShipped'], 0);

            if (sumOfLot > quantityShipped) {
                return vm.excessReasons;
            } else if (sumOfLot < quantityShipped) {
                return vm.rejectionReasons;
            }
            return [];
        }

        function addLocationItem(index, groupedLineItems) {
            $scope.needToConfirm = true;
            addAndRemoveLineItemService.addItemForPod(groupedLineItems[index], index, groupedLineItems);
            groupedLineItems.forEach(function(line) {
                addAndRemoveLineItemService.fillMovementOptions(line, locations, areaLocationInfo);
            });
        }

        function addLotGroup(lotGroupLineItems) {
            $scope.needToConfirm = true;
            var lineItemTemplate = angular.copy(lotGroupLineItems[0][0]);
            var lineItemToAdd = addAndRemoveLineItemService.getFirstLineItemForPodLocationGroup(
                lineItemTemplate, vm.newlyAddedLotReason.id
            );
            lotGroupLineItems.push([lineItemToAdd]);
        }

        function removeLotGroup(lotIndex, lotGroup) {
            lotGroup.splice(lotIndex, 1);
        }

        function buildDisplayOrderLineItems() {
            var orderLineItemsCopy = angular.copy(vm.orderLineItems);
            orderLineItemsCopy.forEach(function(orderLineItem) {
                var locationLineItems = angular.copy(orderLineItem.groupedLineItems);
                orderLineItem.groupedLineItems = [locationLineItems];
            });
            return orderLineItemsCopy;
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            var lotGroup = data.lineItems;
            validateLotCodeEmptyAndDuplicate(lineItem, lotGroup);
        });

        function validateLotCodeEmptyAndDuplicate(lineItem, allLineItems) {
            lineItem.$errors.lotCodeInvalid = undefined;
            if (!lineItem.isNewlyAddedLot || (!lineItem.isMainGroup && !lineItem.isFirst)) {
                return;
            }

            if (isEmpty(_.get(lineItem, ['lot', 'lotCode']))) {
                lineItem.$errors.lotCodeInvalid = 'proofOfDeliveryView.lotCodeRequired';
            } else {
                // TDOO; same lot
                var lotGroup = getLineItemsWithSameLot(lineItem, allLineItems);
                validateDuplicateLotCode(lineItem, lotGroup);
            }
        }

        function validateDuplicateLotCode(lineItem, lotGroup) {
            var currentLotCode = _.get(lineItem, ['lot', 'lotCode']);
            var duplicateLotGroup = lotGroup.filter(function(locationGroup) {
                var firstLineItem = locationGroup[0];
                return _.get(firstLineItem, ['lot', 'lotCode']) === currentLotCode;
            });
            if (duplicateLotGroup.length > 1) {
                duplicateLotGroup.forEach(function(locationGroup) {
                    var firstLineItem = locationGroup[0];
                    if (firstLineItem.isNewlyAddedLot) {
                        firstLineItem.$errors.lotCodeInvalid = 'proofOfDeliveryView.lotCodeDuplicate';
                    }
                });
            }
        }

        function validateExpirationDateEmpty(lineItem) {
            lineItem.$error.expirationDateEmpty = undefined;
            if (lineItem.isNewlyAddedLot && (lineItem.isFirst || lineItem.isMainGroup)) {
                if (isEmpty(_.get(lineItem, ['lot', 'expirationDate']))) {
                    lineItem.$error.expirationDateEmpty = 'openlmisForm.required';
                }
            }
        }

        function getAllLineItems() {
            return _.flatten(vm.displayOrderLineItems.map(function(productGroup) {
                return productGroup.groupedLineItems;
            }));
        }

        function isEmpty(data) {
            return data === undefined || data === null || data === '';
        }

    }
}());
