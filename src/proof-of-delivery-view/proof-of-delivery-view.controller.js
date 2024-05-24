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
        .controller('ProofOfDeliveryViewController', ProofOfDeliveryViewController);

    ProofOfDeliveryViewController.$inject = [
        '$scope', 'proofOfDelivery', 'order', 'reasons', 'messageService', 'VVM_STATUS',
        'orderLineItems', 'canEdit', 'ProofOfDeliveryPrinter', '$q', 'loadingModalService',
        'proofOfDeliveryService', 'notificationService',
        '$stateParams', 'alertConfirmModalService', '$state',
        'PROOF_OF_DELIVERY_STATUS', 'confirmService',
        'confirmDiscardService', 'proofOfDeliveryManageService',
        'openlmisDateFilter', 'fulfillingLineItemFactory',
        'facilityFactory', 'siglusDownloadLoadingModalService', 'user', 'moment',
        'alertService', 'siglusSignatureWithLimitDateModalService', 'facility'
    ];

    function ProofOfDeliveryViewController(
        $scope, proofOfDelivery, order, reasons, messageService, VVM_STATUS,
        orderLineItems, canEdit, ProofOfDeliveryPrinter, $q, loadingModalService,
        proofOfDeliveryService, notificationService,
        $stateParams, alertConfirmModalService, $state,
        PROOF_OF_DELIVERY_STATUS, confirmService,
        confirmDiscardService, proofOfDeliveryManageService,
        openlmisDateFilter, fulfillingLineItemFactory,
        facilityFactory, siglusDownloadLoadingModalService, user, moment,
        alertService, siglusSignatureWithLimitDateModalService, facility
    ) {
        var vm = this;

        var NEWLY_ADDED_LOT_REASON_NAME = 'Lote não especificado na Guia de Remessa';

        vm.$onInit = onInit;
        vm.getStatusDisplayName = getStatusDisplayName;
        vm.getReasonName = getReasonName;
        // vm.printProofOfDelivery = printProofOfDelivery;
        vm.save = save;
        vm.submit = submit;
        vm.deleteDraft = deleteDraft;
        vm.returnBack = returnBack;
        vm.disableReasonSelect = disableReasonSelect;
        vm.onAcceptedQuantityChanged = onAcceptedQuantityChanged;
        vm.getLineItemReasonOptions = getLineItemReasonOptions;
        vm.calculateValueByShippedQuantityAndPrice = calculateValueByShippedQuantityAndPrice;
        vm.addItem = addItem;
        vm.removeItem = removeItem;
        vm.facilityId = facility.id;
        vm.isMerge = undefined;
        vm.isView = undefined;
        this.ProofOfDeliveryPrinter = ProofOfDeliveryPrinter;
        vm.maxDate = undefined;
        vm.minDate = undefined;
        vm.newlyAddedLotReasonOptions = undefined;

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
            vm.newlyAddedLotReasonOptions = _.filter(vm.excessReasons, function(reason) {
                return reason.name === NEWLY_ADDED_LOT_REASON_NAME;
            });
            // SIGLUS-REFACTOR: ends here
            vm.proofOfDelivery = proofOfDelivery;
            vm.orderLineItems = orderLineItems;
            vm.vvmStatuses = VVM_STATUS;
            vm.showVvmColumn = proofOfDelivery.hasProductsUseVvmStatus();
            vm.canEdit = canEdit;
            vm.orderCode = order.orderCode;
            vm.currentDate = moment().format('YYYY-MM-DD');
            vm.facilityId = facility.id;
            facilityFactory.getUserHomeFacility()
                .then(function(res) {
                    vm.facility = res;
                });
            siglusSignatureWithLimitDateModalService.getMovementDate(
                vm.currentDate, facility.id
            ).then(
                function(result) {
                    vm.minDate = result;
                }
            );

            vm.isMerge = $stateParams.actionType === 'MERGE' || $stateParams.actionType === 'VIEW';
            vm.isView = $stateParams.actionType === 'VIEW';

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
                $scope.needToConfirm = !angular.equals(newValue, oldValue);
            }, true);
            confirmDiscardService.register($scope,
                'openlmis.stockmanagement.stockCardSummaries');
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

        vm.getErrorMsg = function() {
            return 'proofOfDeliveryView.invalidForm';
        };

        function save(notReload) {
            $scope.needToConfirm = false;
            loadingModalService.open();
            proofOfDeliveryService.updateSubDraft($stateParams.podId,
                $stateParams.subDraftId, vm.proofOfDelivery, 'SAVE').then(
                function() {
                    if (!notReload) {
                        notificationService.success(
                            'proofOfDeliveryView.proofOfDeliveryHasBeenSaved'
                        );
                    }
                    if (notReload) {
                        var stateParams = angular.copy($stateParams);
                        stateParams.actionType = 'DRAFT';
                        $state.go($state.current.name, stateParams, {
                            location: 'replace'
                        });
                    }
                }
            )
                .catch(function() {
                    notificationService.error(
                        'proofOfDeliveryView.failedToSaveProofOfDelivery'
                    );
                })
                .finally(loadingModalService.close);
        }

        function submit() {
            $scope.needToConfirm = false;
            $scope.$broadcast('openlmis-form-submit');
            var copy = angular.copy(vm.proofOfDelivery),
                errors = copy.validate(vm.isMerge);
            if (errors) {
                return $q.reject(errors);
            }
            if (vm.isMerge) {
                submitDraft();
            } else {
                submitSubDraft();
            }
        }

        // submit subDraft
        function submitSubDraft() {
            loadingModalService.open();
            proofOfDeliveryService.updateSubDraft($stateParams.podId,
                $stateParams.subDraftId, vm.proofOfDelivery, 'SUBMIT').then(
                function() {
                    notificationService.success(
                        'proofOfDeliveryView.proofOfDeliveryHasBeenSaved'
                    );
                    $state.go('^', $stateParams, {
                        reload: true
                    });
                }
            )
                .catch(function() {
                    notificationService.error(
                        'proofOfDeliveryView.failedToSaveProofOfDelivery'
                    );
                })
                .finally(loadingModalService.close);
        }

        // final merge and submit
        function submitDraft() {
            confirmService.confirm(
                'proofOfDeliveryView.confirm.message',
                'proofOfDeliveryView.confirm.label'
            )
                .then(function() {
                    loadingModalService.open();
                    var copy = angular.copy(vm.proofOfDelivery);
                    copy.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;
                    var pod = {
                        podDto: copy,
                        conferredBy: copy.conferredBy,
                        preparedBy: copy.preparedBy
                    };
                    proofOfDeliveryService.submitDraft($stateParams.podId,
                        pod).then(function() {
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

        function deleteDraft() {
            $scope.needToConfirm = false;
            alertConfirmModalService.error(
                'proofOfDeliveryView.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel',
                    'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                proofOfDeliveryService.deleteSubDraft($stateParams.podId,
                    $stateParams.subDraftId).then(function() {
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
                $state.current.label = messageService.get(
                    'stockPhysicalInventoryDraft.mergeDraft'
                );
            } else {
                $state.current.label =
            messageService.get('stockPhysicalInventoryDraft.draft')
            + ' '
            + $stateParams.draftNum;
            }
        }

        function disableReasonSelect(lineItem) {
            return lineItem.isQuantityAcceptedEmpty() || lineItem.quantityAccepted === lineItem.quantityShipped ||
                lineItem.isNewlyAdded;
        }

        function calculateValueByShippedQuantityAndPrice(lineItem) {
            return _.get(lineItem, ['price']) ?
                (lineItem.quantityShipped * (lineItem.price * 100).toFixed(2)) / 100 + ' MZM' : '';
        }

        function onAcceptedQuantityChanged(lineItem) {
            lineItem.updateQuantityRejected();
            if (disableReasonSelect(lineItem) && !lineItem.isNewlyAdded) {
                lineItem.rejectionReasonId = undefined;
            }
        }

        function getLineItemReasonOptions(lineItem) {
            if (!lineItem.isQuantityAcceptedEmpty() && lineItem.quantityAccepted > lineItem.quantityShipped) {
                return vm.excessReasons;
            } else if (!lineItem.isQuantityAcceptedEmpty() && lineItem.quantityAccepted < lineItem.quantityShipped) {
                return vm.rejectionReasons;
            }
        }

        function addItem(groupLineItems) {
            var lineItemTemplate = angular.copy(groupLineItems[0]);
            var lineItemLotTemplate = angular.copy(lineItemTemplate.lot);
            var newlyAddedLot = _.assign(lineItemLotTemplate, {
                id: undefined,
                active: undefined,
                lotCode: null,
                expirationDate: null,
                manufactureDate: undefined
            });
            groupLineItems.push(_.assign(lineItemTemplate, {
                $errors: {},
                id: undefined,
                quantityShipped: 0,
                quantityAccepted: 0,
                quantityRejected: 0,
                isNewlyAdded: true,
                rejectionReasonId: vm.newlyAddedLotReasonOptions[0].id,
                lot: newlyAddedLot
            }));
        }

        function removeItem(groupLineItems, indexToRemove) {
            groupLineItems.splice(indexToRemove, 1);
        }

        function validateLotCode(currentLineItem, lineItems) {
            if (!currentLineItem.isNewlyAdded) {
                return;
            }

            currentLineItem.$errors.lotCodeInvalid = undefined;
            if (isEmpty(_.get(currentLineItem, ['lot', 'lotCode']))) {
                currentLineItem.$errors.lotCodeInvalid = 'proofOfDeliveryView.lotCodeRequired';
            } else {
                validateDuplicateLotCode(currentLineItem, lineItems);
            }
        }

        function validateDuplicateLotCode(currentLineItem, lineItems) {
            var currentLotCode = _.get(currentLineItem, ['lot', 'lotCode']);
            var duplicateLineItems = lineItems.filter(function(lineItem) {
                return _.get(lineItem, ['lot', 'lotCode']) === currentLotCode;
            });
            if (duplicateLineItems.length > 1) {
                duplicateLineItems.forEach(function(lineItem) {
                    if (lineItem.isNewlyAdded) {
                        lineItem.$errors.lotCodeInvalid = 'proofOfDeliveryView.lotCodeDuplicate';
                    }
                });
            }
        }

        function isEmpty(data) {
            return data === undefined || data === null || data === '';
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            var lineItems = data.lineItems;
            validateLotCode(lineItem, lineItems);
        });

    }
}());
