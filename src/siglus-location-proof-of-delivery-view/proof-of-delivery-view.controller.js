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
        'orderLineItems', 'canEdit', 'ProofOfDeliveryPrinter', 'loadingModalService',
        'proofOfDeliveryService', 'notificationService', '$stateParams',
        'alertConfirmModalService', '$state', 'PROOF_OF_DELIVERY_STATUS', 'confirmService',
        'confirmDiscardService', 'proofOfDeliveryManageService',
        'facilityFactory', 'user', 'moment', 'facility', 'locations', 'areaLocationInfo',
        'addAndRemoveLineItemService', 'SiglusLocationCommonUtilsService', 'alertService',
        'printInfo', 'siglusSignatureWithLimitDateModalService', 'orderNumberUpdateService'
    ];

    function ProofOfDeliveryViewControllerWithLocation(
        $scope, proofOfDelivery, order, reasons, messageService, VVM_STATUS,
        orderLineItems, canEdit, ProofOfDeliveryPrinter, loadingModalService,
        proofOfDeliveryService, notificationService, $stateParams,
        alertConfirmModalService, $state, PROOF_OF_DELIVERY_STATUS, confirmService,
        confirmDiscardService, proofOfDeliveryManageService,
        facilityFactory, user, moment, facility, locations, areaLocationInfo,
        addAndRemoveLineItemService, SiglusLocationCommonUtilsService, alertService,
        printInfo, siglusSignatureWithLimitDateModalService, orderNumberUpdateService
    ) {

        if (canEdit) {
            orderLineItems.forEach(function(orderLineItem) {
                orderLineItem.groupedLineItems.forEach(function(fulfillingLineItem) {
                    addAndRemoveLineItemService.fillMovementOptions(
                        fulfillingLineItem, locations, areaLocationInfo
                    );
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
        vm.calculateTotalValue = calculateTotalValue;
        vm.changeAcceptQuantity = changeAcceptQuantity;
        vm.isCurrentItemNewlyAdded = isCurrentItemNewlyAdded;
        vm.getSumOfQuantityShipped = getSumOfQuantityShipped;
        vm.getSumOfLot = getSumOfLot;
        vm.getRejectedQuantity = getRejectedQuantity;
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
        vm.checkCellType = checkCellType;
        vm.displayOrderLineItems = undefined;
        vm.cellType = {
            EMPTY: 'empty',
            PLANE_TEXT: 'planeText',
            INPUT: 'input'
        };

        vm.cellName = {
            LOT_CODE: 'lotCode',
            EXPIRATION_DATE: 'expirationDate',
            LOCATION: 'location',
            REASON: 'reason',
            PRICE_VALUE: 'priceValue'
        };

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
            vm.updatedOrderNumber = orderNumberUpdateService.updateOrderNumber(
                order.orderCode, _.get(order, ['facility', 'type', 'code'], '')
            );
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
            vm.proofOfDelivery = proofOfDelivery;
            vm.orderLineItems = orderLineItems;
            vm.displayOrderLineItems = wrapGroupedLineItemsWithArray();
            vm.vvmStatuses = VVM_STATUS;
            vm.showVvmColumn = proofOfDelivery.hasProductsUseVvmStatus();
            vm.canEdit = canEdit;
            vm.facility = facility;
            vm.locations = locations;
            vm.areaLocationInfo = areaLocationInfo;
            vm.fileName = printInfo.fileName;
            vm.currentDate = moment().format('YYYY-MM-DD');
            vm.isMerge = $stateParams.actionType === 'MERGE' || $stateParams.actionType === 'VIEW';
            siglusSignatureWithLimitDateModalService.getMovementDate(vm.currentDate, vm.facility.id)
                .then(function(result) {
                    var shippedDate = _.get(proofOfDelivery, ['shipment', 'shippedDate'], result);
                    var shippedDateMoment = moment(shippedDate);
                    var movementDateMoment = moment(result);
                    var laterDateMovement = shippedDateMoment.isAfter(movementDateMoment) ?
                        shippedDateMoment : movementDateMoment;
                    vm.minDate = laterDateMovement.format('YYYY-MM-DD');
                })
                .catch(function(error) {
                    if (error.data.messageKey === 'siglusapi.error.stockManagement.movement.date.invalid') {
                        alertService.error('openlmisModal.dateConflict');
                    }
                });

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
                return '';
            }
            var reason = reasons.find(function(reason) {
                return reason.id === id;
            });
            return _.get(reason, 'name', '');
        }

        function getSumOfLot(currentLineItem, lotGroup) {
            var currentOrderableId = _.get(currentLineItem, ['orderable', 'id'], '');
            var currentLotId =  _.get(currentLineItem, ['lot', 'id'], '');
            var currentLotCode =  _.get(currentLineItem, ['lot', 'lotCode'], '');

            if (!currentLotId && currentLotCode) {
                var lineItemsToSumForLotCode = lotGroup.filter(function(lineItem) {
                    return !lineItem.isMainGroup && currentOrderableId === _.get(lineItem, ['orderable', 'id'], '') &&
                        currentLotCode === _.get(lineItem, ['lot', 'lotCode'], '');
                });
                return lineItemsToSumForLotCode.reduce(function(acc, lineItem) {
                    var quantityAccepted = _.get(lineItem, 'quantityAccepted', 0);
                    return acc + quantityAccepted;
                }, 0);
            }
            var lineItemsToSum = lotGroup.filter(function(lineItem) {
                return !lineItem.isMainGroup && currentOrderableId === _.get(lineItem, ['orderable', 'id'], '') &&
                    currentLotId === _.get(lineItem, ['lot', 'id'], '');
            });
            return lineItemsToSum.reduce(function(acc, lineItem) {
                var quantityAccepted = _.get(lineItem, 'quantityAccepted', 0);
                return acc + quantityAccepted;
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

        function getSumOfQuantityShipped(groupedLineItems) {
            var mainGroupOrOnlyLineItems = _.flatten(groupedLineItems).filter(function(lineItem) {
                return lineItem.isMainGroup || lineItem.isFirst;
            });
            return mainGroupOrOnlyLineItems.reduce(function(sumQuantity, lineItem) {
                var quantityShipped = _.get(lineItem, 'quantityShipped', 0);
                return sumQuantity + quantityShipped;
            }, 0);
        }

        function removeLocationItem(index, groupedLineItems) {
            var lineItem = groupedLineItems[index];
            $scope.needToConfirm = true;
            addAndRemoveLineItemService.removeItemForPod(lineItem, index, groupedLineItems);
        }

        vm.changeArea = function(lineItem, groupedLineItems) {
            $scope.needToConfirm = true;
            lineItem.$error.areaError = isEmpty(_.get(lineItem.moveTo, 'area')) ? 'openlmisForm.required' : '';
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

        function updateAcceptedAndRejectedQuantityForMainAndFirstItem(lotGroup) {
            var lineItemsToUpdate = lotGroup.filter(function(lineItem) {
                return lineItem.isMainGroup || lineItem.isFirst;
            });
            lineItemsToUpdate.forEach(function(lineItem) {
                lineItem.quantityAccepted = getSumOfLot(lineItem, lotGroup);
                lineItem.quantityRejected = getRejectedQuantity(lineItem, lotGroup);
            });
        }

        function changeAcceptQuantity(lineItem, groupedLineItems) {
            $scope.needToConfirm = true;
            lineItem.$error.rejectionReasonIdError = undefined;
            validateAcceptedQuantityEmpty(lineItem);
            // update accept & reject quantity
            updateAcceptedAndRejectedQuantityForMainAndFirstItem(groupedLineItems);
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
            if (lineItem.isMainGroup) {
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
            mainLine.rejectionReasonId = isCurrentItemNewlyAdded(mainLine) ?
                _.get(vm.newlyAddedLotReason, 'id') : undefined;
            mainLine.$error.rejectionReasonIdError = '';
        }

        function getRejectedQuantity(lineItem, lotGroup) {
            if (!lineItem.isMainGroup && !lineItem.isFirst) {
                return 0;
            }
            var quantityAccepted = getSumOfLot(lineItem, lotGroup);
            var diff = _.get(lineItem, 'quantityShipped', 0) - quantityAccepted;
            return diff < 0 ? - diff : diff;
        }

        function getPodMainOrFirstLineItems() {
            console.log('vm.displayOrderLineItems', vm.displayOrderLineItems);
            // update accepted & rejected quantity first
            vm.displayOrderLineItems.forEach(function(productGroup) {
                productGroup.groupedLineItems.forEach(function(lotGroup) {
                    updateAcceptedAndRejectedQuantityForMainAndFirstItem(lotGroup);
                });
            });
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
                validateLotCodeEmptyAndDuplicate(lineItem);
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
                    proofOfDeliveryService.submitDraftWithLocation($stateParams.podId, copy, podLineItemLocation)
                        .then(function() {
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
                            if (_.get(error, ['data', 'messageKey']) ===
                                'siglusapi.error.stockManagement.movement.date.invalid') {
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
            var allLineItems = getAllLineItems();
            // TODO mainGroupItems MISSING,case mainGroupItem can NOT find below in LM
            // var mainGroupItems = getPodMainOrFirstLineItems();
            var locationItems = getPodLocationLineItems();
            console.log('mainGroupItems', allLineItems);
            console.log('locationItems', locationItems);
            // change vm.printLineItems would trigger $scope.$watch in siglus-print-pallet-label.controller to print
            vm.printLineItems = _.chain(locationItems)
                .map(function(locationItem) {
                    var mainGroupItem = _.find(allLineItems, function(mainGroupItem) {
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

        function calculateTotalValue(lineItem) {
            return _.get(lineItem, ['price']) ?
                (lineItem.quantityAccepted * (lineItem.price * 100).toFixed(2)) / 100 + ' MZM' : '';
        }

        function disableReasonSelect(lineItem, locationGroup) {
            var emptyAcceptedLine = getFirstEmptyAcceptedLine(locationGroup);
            return emptyAcceptedLine !== undefined ||
                getSumOfLot(lineItem, locationGroup) === lineItem.quantityShipped ||
                isCurrentItemNewlyAdded(lineItem);
        }

        function getLineItemReasonOptions(lineItem, locationGroup) {
            if (isCurrentItemNewlyAdded(lineItem)) {
                lineItem.rejectionReasonId = _.get(vm.newlyAddedLotReason, 'id');
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
            console.log('After added groupedLineItems', groupedLineItems);
        }

        function addLotGroup(lotGroupLineItems) {
            loadingModalService.open();
            var originalLineItem = lotGroupLineItems[0][0];
            var podId = vm.proofOfDelivery.id;
            var subDraftId = originalLineItem.subDraftId;
            var podLineItemId = originalLineItem.id;
            proofOfDeliveryService.addLineItem(podId, subDraftId, podLineItemId, true)
                .then(function(lineItemData) {
                    $scope.needToConfirm = true;
                    var lineItemTemplate = angular.copy(originalLineItem);
                    var lotTemplate = angular.copy(lineItemTemplate.lot);
                    var lotForFirstLineItem = _.assign({}, lotTemplate, {
                        id: undefined,
                        active: undefined,
                        lotCode: null,
                        expirationDate: null,
                        manufactureDate: undefined
                    });
                    var lineItemToAdd = _.assign({}, lineItemTemplate, {
                        $error: {},
                        // for siglus-stock-input-select validate
                        $errors: {},
                        id: lineItemData.id,
                        subDraftId: lineItemData.subDraftId,
                        lot: lotForFirstLineItem,
                        isMainGroup: false,
                        isFirst: true,
                        isNewlyAddedLot: true,
                        moveTo: {},
                        notes: null,
                        quantity: lineItemTemplate.quantity,
                        quantityShipped: 0,
                        quantityAccepted: 0,
                        quantityRejected: 0,
                        rejectionReasonId: _.get(vm.newlyAddedLotReason, 'id'),
                        lotOptions: lineItemData.lots
                    });
                    lotGroupLineItems.push([lineItemToAdd]);
                    loadingModalService.close();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    alertService.error(error.message);
                });
        }

        function removeLotGroup(lotIndex, lotGroup) {
            loadingModalService.open();
            var firstLineItemInGroup = lotGroup[lotIndex][0];
            var podId = vm.proofOfDelivery.id;
            var subDraftId = firstLineItemInGroup.subDraftId;
            var lineItemId = firstLineItemInGroup.id;
            proofOfDeliveryService.removeLineItem(podId, subDraftId, lineItemId, true)
                .then(function() {
                    lotGroup.splice(lotIndex, 1);
                    loadingModalService.close();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    alertService.error(error.message);
                });
        }

        function wrapGroupedLineItemsWithArray() {
            var orderLineItemsCopy = angular.copy(vm.orderLineItems);
            orderLineItemsCopy.forEach(function(orderLineItem) {
                // this productGroup is 1-dimensional array, including different lot lineItems
                var productGroup = angular.copy(orderLineItem.groupedLineItems);

                // each lotGroup(lineItems with same lot & different location) should be an array
                var lineItemsMapById = _.groupBy(productGroup, function(lineItem) {
                    return lineItem.id;
                });
                orderLineItem.groupedLineItems = Object.keys(lineItemsMapById)
                    .map(function(lineItemId) {
                        if (!isEmpty(lineItemId)) {
                            return lineItemsMapById[lineItemId];
                        }
                    });
            });
            return orderLineItemsCopy;
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            validateLotCodeEmptyAndDuplicate(lineItem);
        });

        function validateLotCodeEmptyAndDuplicate(lineItem) {
            lineItem.$errors = {
                lotCodeInvalid: ''
            };
            if (!isCurrentItemNewlyAdded(lineItem) || (!lineItem.isMainGroup && !lineItem.isFirst)) {
                return;
            }
            if (isEmpty(_.get(lineItem, ['lot', 'lotCode']))) {
                lineItem.$errors.lotCodeInvalid = 'proofOfDeliveryView.lotCodeRequired';
            } else {
                validateDuplicateLotCode(lineItem);
            }
        }

        function  validateDuplicateLotCode(lineItem) {
            var currentLotCode = _.get(lineItem, ['lot', 'lotCode']);
            var lineItemsToCheck = getAllLineItems().filter(function(lineItem) {
                return (lineItem.isMainGroup || lineItem.isFirst) &&
                    _.get(lineItem, ['lot', 'lotCode']) === currentLotCode;
            });
            if (lineItemsToCheck.length > 1) {
                lineItemsToCheck.forEach(function(lineItem) {
                    if (isCurrentItemNewlyAdded(lineItem)) {
                        lineItem.$errors.lotCodeInvalid = 'proofOfDeliveryView.lotCodeDuplicate';
                    }
                });
            }
        }

        function validateExpirationDateEmpty(lineItem) {
            lineItem.$error.expirationDateEmpty = undefined;
            if (isCurrentItemNewlyAdded(lineItem) && (lineItem.isFirst || lineItem.isMainGroup)) {
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

        function isCurrentItemNewlyAdded(lineItem) {
            // frontend use isNewlyAddedLot to mark newlyAdded lineItem while backend use added
            return lineItem.isNewlyAddedLot || lineItem.added;
        }

        // eslint-disable-next-line complexity
        function checkCellType(lineItem, cellName) {
            var isKit = _.get(lineItem, ['orderable', 'isKit'], false);
            var shouldDisplayLotOrReason = lineItem.isMainGroup || lineItem.isFirst;
            var shouldDisplayPriceValue = lineItem.isMainGroup || lineItem.isFirst;
            var shouldDisplayLocation = !lineItem.isMainGroup;
            if (vm.canEdit) {
                if (cellName === vm.cellName.LOT_CODE || cellName === vm.cellName.EXPIRATION_DATE) {
                    if (!shouldDisplayLotOrReason || isKit) {
                        return vm.cellType.EMPTY;
                    }
                    return isCurrentItemNewlyAdded(lineItem) ? vm.cellType.INPUT : vm.cellType.PLANE_TEXT;
                } else if (cellName === vm.cellName.REASON) {
                    return shouldDisplayLotOrReason ? vm.cellType.INPUT : vm.cellType.EMPTY;
                } else if (cellName === vm.cellName.LOCATION) {
                    return shouldDisplayLocation ? vm.cellType.INPUT : vm.cellType.EMPTY;
                } else if (cellName === vm.cellName.PRICE_VALUE) {
                    return shouldDisplayPriceValue ?  vm.cellType.PLANE_TEXT : vm.cellType.EMPTY;
                }
            }
            // !vm.canEdit (View):
            if (cellName === vm.cellName.LOT_CODE || cellName === vm.cellName.EXPIRATION_DATE) {
                if (!shouldDisplayLotOrReason || isKit) {
                    return vm.cellType.EMPTY;
                }
                return vm.cellType.PLANE_TEXT;
            } else if (cellName === vm.cellName.REASON) {
                return shouldDisplayLotOrReason ? vm.cellType.PLANE_TEXT : vm.cellType.EMPTY;
            } else if (cellName === vm.cellName.LOCATION) {
                return shouldDisplayLocation ? vm.cellType.PLANE_TEXT : vm.cellType.EMPTY;
            } else if (cellName === vm.cellName.PRICE_VALUE) {
                return shouldDisplayPriceValue ? vm.cellType.PLANE_TEXT : vm.cellType.EMPTY;
            }
        }

    }
}());
