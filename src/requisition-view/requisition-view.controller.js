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
     * @name requisition-view.controller:RequisitionViewController
     *
     * @description
     * Controller for managing requisitions.
     */
    angular
        .module('requisition-view')
        .controller('RequisitionViewController', RequisitionViewController);

    RequisitionViewController.$inject = [
        '$state', 'requisition', 'requisitionValidator', 'requisitionService', 'loadingModalService', 'alertService',
        'notificationService', 'confirmService', 'offlineService', '$window', 'requisitionUrlFactory', '$filter',
        '$scope', 'RequisitionWatcher', 'accessTokenFactory', 'messageService', 'stateTrackerService',
        'RequisitionStockCountDateModal', 'localStorageFactory', 'canSubmit', 'canAuthorize',
        'canApproveAndReject', 'canDelete', 'canSkip', 'canSync', 'program', 'facility', 'processingPeriod',
        // SIGLUS-REFACTOR: starts here
        'hasAuthorizeRight', 'canSubmitAndAuthorize', 'siglusSignatureModalService', 'isCreateForClient',
        'localStorageService', 'TEMPLATE_COLUMNS', 'REQUISITION_STATUS', 'requisitionViewService'
        // SIGLUS-REFACTOR: ends here
    ];

    function RequisitionViewController($state, requisition, requisitionValidator, requisitionService,
                                       loadingModalService, alertService, notificationService, confirmService,
                                       offlineService, $window, requisitionUrlFactory, $filter, $scope,
                                       RequisitionWatcher, accessTokenFactory, messageService, stateTrackerService,
                                       RequisitionStockCountDateModal, localStorageFactory, canSubmit,
                                       canAuthorize, canApproveAndReject, canDelete, canSkip, canSync, program,
                                       facility, processingPeriod, hasAuthorizeRight, canSubmitAndAuthorize,
                                       siglusSignatureModalService, isCreateForClient, localStorageService,
                                       TEMPLATE_COLUMNS, REQUISITION_STATUS, requisitionViewService) {
        // SIGLUS-REFACTOR: starts here
        var storage = localStorageFactory('requisitions');
        storage.put(requisition);
        var vm = this,
            watcher = new RequisitionWatcher($scope, requisition, storage);
        // SIGLUS-REFACTOR: ends here
        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name requisition
         * @type {Object}
         *
         * @description
         * Holds requisition.
         */
        vm.requisition = requisition;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds requisition program.
         */
        vm.program = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds requisition facility.
         */
        vm.facility = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name processingPeriod
         * @type {Object}
         *
         * @description
         * Holds requisition processing period.
         */
        vm.processingPeriod = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name requisitionType
         * @type {String}
         *
         * @description
         * Holds message key to display, depending on the requisition type (regular/emergency/report-only).
         */
        vm.requisitionType = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name requisitionTypeClass
         * @type {String}
         *
         * @description
         * Holds CSS class to use, depending on the requisition type (regular/emergency/report-only).
         */
        vm.requisitionTypeClass = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name invalidNonFullSupply
         * @type {Boolean}
         *
         * @description
         * False if non-full supply tab is valid, true otherwise.
         */
        vm.invalidNonFullSupply = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name invalidFullSupply
         * @type {Boolean}
         *
         * @description
         * False if full supply tab is valid, true otherwise.
         */
        vm.invalidFullSupply = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displaySubmitButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the submit button.
         */
        vm.displaySubmitButton = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displaySubmitAndAuthorizeButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the submit and authorize button.
         */
        vm.displaySubmitAndAuthorizeButton = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displayAuthorizeButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the authorize button.
         */
        vm.displayAuthorizeButton = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displayDeleteButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the delete button.
         */
        vm.displayDeleteButton = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displayApproveAndRejectButtons
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the approve and reject buttons.
         */
        vm.displayApproveAndRejectButtons = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displaySkipButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the skip button.
         */
        vm.displaySkipButton = undefined;

        /**
         * ngdoc property
         * @propertyOf requisition-view.controller:RequisitionViewController
         * @name displaySyncButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether current user should see the sync to server button.
         */
        vm.displaySyncButton = undefined;

        vm.displayExportButton = undefined;

        // Functions
        vm.$onInit = onInit;
        vm.updateRequisition = updateRequisition;
        vm.syncRnr = syncRnr;
        vm.syncRnrAndPrint = syncRnrAndPrint;
        vm.submitRnr = submitRnr;
        vm.authorizeRnr = authorizeRnr;
        // SIGLUS-REFACTOR: starts here
        vm.submitAndAuthorizeRnr = submitAndAuthorizeRnr;
        // SIGLUS-REFACTOR: ends here
        vm.removeRnr = removeRnr;
        vm.approveRnr = approveRnr;
        vm.rejectRnr = rejectRnr;
        vm.skipRnr = skipRnr;
        vm.isOffline = offlineService.isOffline;
        vm.getPrintUrl = getPrintUrl;
        vm.isFullSupplyTabValid = isFullSupplyTabValid;
        vm.isNonFullSupplyTabValid = isNonFullSupplyTabValid;
        vm.exportExcel = exportExcel;

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name $onInit
         *
         * @description
         * Initialization method of the RequisitionViewController.
         */
        function onInit() {
            setTypeAndClass();
            vm.program = program;
            vm.facility = facility;
            vm.processingPeriod = processingPeriod;
            // SIGLUS-REFACTOR: starts here
            vm.displaySubmitButton = canSubmit && !hasAuthorizeRight;
            vm.displaySubmitAndAuthorizeButton = canSubmitAndAuthorize;
            // SIGLUS-REFACTOR: ends here
            vm.displayAuthorizeButton = canAuthorize;
            vm.displayDeleteButton = canDelete;
            vm.displayApproveAndRejectButtons = canApproveAndReject;
            // SIGLUS-REFACTOR: starts here
            vm.displayRejectButton = canApproveAndReject && !(vm.requisition.extraData &&
                vm.requisition.extraData.originalRequisition);
            // SIGLUS-REFACTOR: ends here
            vm.displaySkipButton = canSkip;
            vm.displaySyncButton = canSync;
            vm.displayExportButton = showExportButton();
            // SIGLUS-REFACTOR: starts here
            if (!canSync) {
                watcher.disableWatcher();
            }
            // SIGLUS-REFACTOR: ends here
            if (vm.requisition.isInitForClient) {
                vm.commentsRequired = false;
                vm.forceOpen = false;
                vm.displaySubmitButton = true;
            }
            if (isCreateForClient) {
                vm.displayRejectButton = false;
                vm.displayDeleteButton = vm.requisition.status === REQUISITION_STATUS.IN_APPROVAL;
                vm.displaySubmitButton = false;
            }
        }

        function setTypeAndClass() {
            if (vm.requisition.emergency) {
                vm.requisitionType = 'requisitionView.emergency';
                vm.requisitionTypeClass = 'emergency';
            } else if (vm.requisition.reportOnly) {
                vm.requisitionType = 'requisitionView.reportOnly';
                vm.requisitionTypeClass = 'report-only';
            } else {
                vm.requisitionType = 'requisitionView.regular';
                vm.requisitionTypeClass = 'regular';
            }
        }

        function showExportButton() {
            var supportStatus = [
                REQUISITION_STATUS.APPROVED,
                REQUISITION_STATUS.RELEASED,
                REQUISITION_STATUS.RELEASED_WITHOUT_ORDER
            ];
            var supportPrograms = ['T', 'TR', 'VC', 'MMC', 'TB'];
            return supportStatus.includes(vm.requisition.status)
                && supportPrograms.includes(vm.requisition.program.code);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name updateRequisition
         *
         * @description
         * After confirming with the user, the offline requisition is removed,
         * and the state is reloaded. This will fetch a fresh version of the
         * requisition.
         *
         * If the browser is offline, an error will be thrown, and nothing will
         * change.
         *
         */
        function updateRequisition() {
            if (offlineService.isOffline()) {
                alertService.error('requisitionView.updateOffline');
                return;
            }

            confirmService.confirm('requisitionView.updateWarning', 'requisitionView.update')
                .then(function() {
                    requisitionService.removeOfflineRequisition(requisition.id);
                    $state.reload();
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name syncRnr
         *
         * @description
         * Responsible for syncing requisition with the server. If the requisition fails to sync,
         * an error notification will be displayed. Otherwise, a success notification will be shown.
         * If the error status is 409 (conflict), the requisition will be reloaded, since this
         * indicates a version conflict.
         */
        function syncRnr() {
            var loadingPromise = loadingModalService.open();
            saveRnr().then(function() {
                loadingPromise.then(function() {
                    notificationService.success('requisitionView.sync.success');
                });
                reloadState();
            }, function(response) {
                handleSaveError(response.status);
            });
        }

        function exportExcel() {
            requisitionViewService.exportExcel(vm.requisition.id);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name syncRnrAndPrint
         *
         * @description
         * Responsible for syncing requisition with the server. If the requisition fails to sync,
         * an error notification will be displayed. Otherwise, a success notification will be shown
         * and the requisition will be printed.
         * If the error status is 409 (conflict), the requisition will be reloaded, since this
         * indicates a version conflict.
         */
        function syncRnrAndPrint() {
            if (vm.requisition.isInitForClient) {
                var storageKey = vm.requisition.facility.id + vm.requisition.program.id;
                var copyRequisition = angular.copy(vm.requisition);
                copyRequisition.requisitionLineItems.forEach(function(lineItem) {
                    lineItem[TEMPLATE_COLUMNS.AUTHORIZED_QUANTITY] = lineItem.requestedQuantity;
                    lineItem[TEMPLATE_COLUMNS.APPROVED_QUANTITY] = lineItem.requestedQuantity;
                });
                copyRequisition.availableFullSupplyProducts = [];
                copyRequisition.availableProducts.forEach(function(product) {
                    product.href = null;
                });
                localStorageService.add(storageKey, angular.toJson(copyRequisition));
                vm.requisition.id = storageKey;
            }
            var status = vm.requisition.isInitForClient ? 'APPROVED' : vm.requisition.status;
            if (status === 'APPROVED' || status === 'IN_APPROVAL' || status === 'RELEASED'
                || status === 'RELEASED_WITHOUT_ORDER') {
                var programCodeToReportNameMap = {
                    VC: 'Balance Requisition',
                    TR: 'MMIT',
                    ML: 'Malaria',
                    T: 'MMIA',
                    TB: 'MMTB'
                };
                var printUrl = '#!/'
                    + 'requisitions/'
                    + programCodeToReportNameMap[vm.program.code]
                    + '/'
                    + vm.requisition.id
                    + '?'
                    + 'showBreadCrumb=false';
                if (vm.requisition.isInitForClient) {
                    printUrl = printUrl + '&forClient=' + vm.requisition.isInitForClient;
                }
                $window.open(accessTokenFactory.addAccessToken(printUrl), '_blank');
            } else if (vm.displaySyncButton) {
                var popup = $window.open('', '_blank');
                popup.document.write(messageService.get('requisitionView.sync.pending'));
                var loadingPromise = loadingModalService.open();
                saveRnr().then(function() {
                    watcher.disableWatcher();
                    loadingPromise.then(function() {
                        notificationService.success('requisitionView.sync.success');
                    });
                    popup.location.href = accessTokenFactory.addAccessToken(vm.getPrintUrl());
                    reloadState();
                }, function(response) {
                    handleSaveError(response.status);
                    popup.close();
                });
            } else {
                $window.open(accessTokenFactory.addAccessToken(vm.getPrintUrl()), '_blank');
            }
        }

        function saveRnr() {
            vm.requisition.$modified = false;
            return vm.requisition.$save();
        }

        // #441: Facility user can create requisition with regimen section
        function validateTotalEqualOfRegimen() {
            vm.commentsRequired = !requisitionValidator.validateTotalEqualOfRegimen(requisition);
            vm.forceOpen = vm.commentsRequired;
        }
        // #441: ends here

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name submitRnr
         *
         * @description
         * Responsible for submitting requisition. Displays confirmation dialog, and checks
         * requisition validity before submission. If the requisition is not valid, fails to save or
         * an error occurs during submission, an error notification modal will be displayed.
         * Otherwise, a success notification modal will be shown.
         */
        function submitRnr() {
            // #431: alert before signature pop up
            validateTotalEqualOfRegimen();
            if (requisitionValidator.siglusValidRequisition(requisition)) {
                siglusSignatureModalService.confirm('requisitionView.submit.confirmWithSignature')
                    .then(function(signature) {
                        if (!vm.requisition.extraData.signaure) {
                            vm.requisition.extraData.signaure = {};
                        }
                        vm.requisition.extraData.signaure.submit = signature;
                        if (vm.requisition.isInitForClient) {
                            submitForClient();
                        } else if (vm.program.enableDatePhysicalStockCountCompleted) {
                            var modal = new RequisitionStockCountDateModal(vm.requisition);
                            modal.then(saveThenSubmit);
                        } else {
                            saveThenSubmit();
                        }
                    });
            } else {
                $scope.$broadcast('openlmis-form-submit');
                failWithMessage(vm.requisition.$error)();
            }
            // #431: ends here

            function saveThenSubmit() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$submit().then(function() {
                        watcher.disableWatcher();
                        loadingPromise.then(function() {
                            notificationService.success('requisitionView.submit.success');
                        });
                        stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                    }, loadingModalService.close);
                }, function(response) {
                    handleSaveError(response.status);
                });
            }

            function submitForClient() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$createForClient().then(function() {
                    watcher.disableWatcher();
                    loadingPromise.then(function() {
                        notificationService.success('requisitionView.submit.success');
                    });
                    stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                }, loadingModalService.close);
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name authorizeRnr
         *
         * @description
         * Responsible for authorizing requisition. Displays confirmation dialog, and checks
         * requisition validity before authorization. If the requisition is not valid, fails to
         * save or an error occurs during authorization, an error notification modal will be
         * displayed.
         * Otherwise, a success notification modal will be shown.
         */
        function authorizeRnr() {
            // #431: alert before signature pop up
            validateTotalEqualOfRegimen();
            if (requisitionValidator.siglusValidRequisition(requisition)) {
                siglusSignatureModalService.confirm('requisitionView.submit.confirmWithSignature')
                    .then(function(signature) {
                        vm.requisition.extraData.signaure.authorize = signature;
                        if (vm.program.enableDatePhysicalStockCountCompleted) {
                            var modal = new RequisitionStockCountDateModal(vm.requisition);
                            modal.then(saveThenAuthorize);
                        } else {
                            saveThenAuthorize();
                        }
                    });
            } else {
                $scope.$broadcast('openlmis-form-submit');
                failWithMessage(vm.requisition.$error)();
            }
            // #431: ends here

            function saveThenAuthorize() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$authorize().then(function() {
                        watcher.disableWatcher();
                        loadingPromise.then(function() {
                            notificationService.success('requisitionView.authorize.success');
                        });
                        stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                    }, loadingModalService.close);
                }, function(response) {
                    handleSaveError(response.status);
                });
            }
        }

        // SIGLUS-REFACTOR: starts here
        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name submitAndAuthorizeRnr
         *
         * @description
         * Responsible for submitting and authorizing requisition. Displays confirmation dialog, and checks
         * requisition validity before authorization. If the requisition is not valid, fails to
         * save or an error occurs during authorization, an error notification modal will be
         * displayed.
         * Otherwise, a success notification modal will be shown.
         */
        function submitAndAuthorizeRnr() {
            // #431: alert before signature pop up
            validateTotalEqualOfRegimen();
            if (requisitionValidator.siglusValidRequisition(requisition)) {
                siglusSignatureModalService.confirm('requisitionView.submit.confirmWithSignature')
                    .then(function(signature) {
                        if (!vm.requisition.extraData.signaure) {
                            vm.requisition.extraData.signaure = {
                                submit: signature
                            };
                        }
                        vm.requisition.extraData.signaure.authorize = signature;
                        if (vm.requisition.program.enableDatePhysicalStockCountCompleted) {
                            var modal = new RequisitionStockCountDateModal(vm.requisition);
                            modal.then(saveThenSubmitThenAuthorize);
                        } else {
                            saveThenSubmitThenAuthorize();
                        }
                    });
            } else {
                $scope.$broadcast('openlmis-form-submit');
                failWithMessage(vm.requisition.$error)();
            }
            // #431: ends here

            function saveThenSubmitThenAuthorize() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$submit().then(function() {
                        vm.requisition.$authorize().then(function() {
                            watcher.disableWatcher();
                            loadingPromise.then(function() {
                                notificationService.success('requisitionView.authorize.success');
                            });
                            stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                        }, loadingModalService.close);
                    }, loadingModalService.close);

                }, function(response) {
                    loadingModalService.close();
                    handleSaveError(response.status);
                });
            }
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name removeRnr
         *
         * @description
         * Responsible for removing requisition. Displays confirmation dialog before deletion.
         * If an error occurs during authorization, it will display an error notification modal.
         * Otherwise, a success notification modal will be shown.
         */
        function removeRnr() {
            confirmService.confirmDestroy(
                'requisitionView.delete.confirm',
                'requisitionView.delete.label'
            ).then(function() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$remove().then(function() {
                    watcher.disableWatcher();
                    loadingPromise.then(function() {
                        notificationService.success('requisitionView.delete.success');
                    });
                    stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                }, loadingModalService.close);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name approveRnr
         *
         * @description
         * Responsible for approving requisition. Displays confirmation dialog, and checks
         * requisition validity before approval. If the requisition is not valid or it fails to
         * save, an error notification modal will be displayed.
         * Otherwise, a success notification modal will be shown.
         */
        // #231: there is no signature modal when approve
        function approveRnr() {
            validateTotalEqualOfRegimen();
            if (requisitionValidator.siglusValidRequisition(requisition)) {
                siglusSignatureModalService.confirm('requisitionView.approve.confirmWithSignature')
                    .then(function(signature) {
                        var approveSignatures = vm.requisition.extraData.signaure.approve || [];
                        approveSignatures.push(signature);
                        vm.requisition.extraData.signaure.approve = approveSignatures;
                        if (vm.program.enableDatePhysicalStockCountCompleted) {
                            var modal = new RequisitionStockCountDateModal(vm.requisition);
                            modal.then(saveThenApprove);
                        } else {
                            saveThenApprove();
                        }
                    });
            } else {
                $scope.$broadcast('openlmis-form-submit');
                // #431: alert before signature pop up
                failWithMessage(vm.requisition.$error)();
                // #431: ends here
            }

            function saveThenApprove() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$approve().then(function() {
                        watcher.disableWatcher();
                        loadingPromise.then(function() {
                            notificationService.success('requisitionView.approve.success');
                        });
                        stateTrackerService.goToPreviousState('openlmis.requisitions.approvalList');
                    }, loadingModalService.close);
                }, function(response) {
                    handleSaveError(response.status);
                });
            }
        }
        // #231: ends here

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name rejectRnr
         *
         * @description
         * Responsible for rejecting requisition. Displays confirmation dialog before rejection.
         * If an error occurs during rejecting it will display an error notification modal.
         * Otherwise, a success notification modal will be shown.
         */
        function rejectRnr() {
            confirmService.confirmDestroy(
                'requisitionView.reject.confirm',
                'requisitionView.reject.label'
            ).then(function() {
                loadingModalService.open();
                vm.requisition.$save()
                    .then(function() {
                        return vm.requisition.$reject();
                    })
                    .then(function() {
                        watcher.disableWatcher();
                        notificationService.success('requisitionView.reject.success');
                        stateTrackerService.goToPreviousState('openlmis.requisitions.approvalList');
                    })
                    .catch(loadingModalService.close);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name skipRnr
         *
         * @description
         * Responsible for skipping requisition. Displays confirmation dialog before skipping.
         * If an error occurs during skipping it will display an error notification modal.
         * Otherwise, a success notification modal will be shown.
         */
        function skipRnr() {
            confirmService.confirm(
                'requisitionView.skip.confirm',
                'requisitionView.skip.label'
            ).then(function() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$skip().then(function() {
                    watcher.disableWatcher();
                    loadingPromise.then(function() {
                        notificationService.success('requisitionView.skip.success');
                    });
                    stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                }, failWithMessage('requisitionView.skip.failure'));
            });
        }
        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name getPrintUrl
         *
         * @description
         * Prepares a print URL for the given requisition.
         *
         * @return {String} the prepared URL
         */
        function getPrintUrl() {
            return requisitionUrlFactory('/api/siglusapi/requisitions/' + vm.requisition.id + '/print');
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name isFullSupplyTabValid
         *
         * @description
         * Checks whether full supply tab has any errors. This method ignores skipped line items and
         * does not trigger validation.
         *
         * @return {Boolean} true if full supply tab has any errors, false otherwise
         */
        function isFullSupplyTabValid() {
            var fullSupplyItems = $filter('filter')(vm.requisition.requisitionLineItems, {
                    $program: {
                        fullSupply: true
                    }
                }, true),
                valid = requisitionValidator.areLineItemsValid(fullSupplyItems);

            vm.invalidFullSupply = valid ? undefined : messageService.get('requisitionView.requisition.error');

            return valid;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.controller:RequisitionViewController
         * @name isNonFullSupplyTabValid
         *
         * @description
         * Checks whether non full supply tab has any errors. This method ignores skipped line items
         * and does not trigger validation.
         *
         * @return {Boolean} true if non full supply tab has any errors, false otherwise
         */
        function isNonFullSupplyTabValid() {
            var nonFullSupplyItems = $filter('filter')(vm.requisition.requisitionLineItems, {
                    $program: {
                        fullSupply: false
                    }
                }, true),
                valid = requisitionValidator.areLineItemsValid(nonFullSupplyItems);

            vm.invalidNonFullSupply = valid ? undefined : messageService.get('requisitionView.requisition.error');

            return valid;
        }

        function handleSaveError(status) {
            if (status === 409) {
                // in case of conflict, use the server version
                notificationService.error('requisitionView.versionMismatch');
                reloadState();
            } else if (status === 403) {
                // 403 means user lost rights or requisition changed status
                notificationService.error('requisitionView.updateForbidden');
                reloadState();
            } else {
                failWithMessage('requisitionView.sync.failure')();
            }
        }

        function reloadState() {
            $state.reload();
        }

        function failWithMessage(message) {
            return function() {
                loadingModalService.close();
                alertService.error(message);
            };
        }
    }
})();
