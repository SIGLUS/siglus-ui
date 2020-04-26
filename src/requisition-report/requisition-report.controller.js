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
        .module('requisition-report')
        .controller('RequisitionReportController', RequisitionReportController);

    RequisitionReportController.$inject = [
        '$state', 'requisition', 'requisitionValidator', 'requisitionService', 'loadingModalService', 'alertService',
        'notificationService', 'confirmService', '$window', 'requisitionUrlFactory', '$filter',
        '$scope', 'RequisitionWatcher', 'accessTokenFactory', 'messageService', 'stateTrackerService',
        'RequisitionStockCountDateModal', 'localStorageFactory', 'canSubmit', 'canSubmitAndAuthorize', 'canAuthorize',
        'canDelete', 'hasAuthorizeRight', 'canApproveAndReject', 'canSync', 'signatureModalService', 'processingPeriod',
        'program', 'facility'
    ];

    function RequisitionReportController($state, requisition, requisitionValidator, requisitionService,
                                         loadingModalService, alertService, notificationService, confirmService,
                                         $window, requisitionUrlFactory, $filter, $scope, RequisitionWatcher,
                                         accessTokenFactory, messageService, stateTrackerService,
                                         RequisitionStockCountDateModal, localStorageFactory, canSubmit,
                                         canSubmitAndAuthorize, canAuthorize, canDelete, hasAuthorizeRight,
                                         canApproveAndReject, canSync, signatureModalService, processingPeriod,
                                         program, facility) {

        var vm = this,
            watcher = new RequisitionWatcher($scope, requisition, localStorageFactory('requisitions'));

        vm.requisition = requisition;
        vm.processingPeriod = processingPeriod;
        vm.program = program;
        vm.facility = facility;
        vm.requisitionType = undefined;
        vm.requisitionTypeClass = undefined;
        vm.displaySubmitButton = undefined;
        vm.displaySubmitAndAuthorizeButton = undefined;
        vm.displayAuthorizeButton = undefined;
        vm.displayDeleteButton = undefined;
        // vm.displayApproveAndRejectButtons = undefined;
        // vm.displaySkipButton = undefined;
        vm.displaySyncButton = undefined;
        vm.commentsRequired = false;
        vm.forceOpen = false;

        // Functions
        vm.$onInit = onInit;
        vm.syncRnr = syncRnr;
        vm.submitRnr = submitRnr;
        vm.authorizeRnr = authorizeRnr;
        vm.submitAndAuthorizeRnr = submitAndAuthorizeRnr;
        vm.removeRnr = removeRnr;
        vm.approveRnr = approveRnr;
        vm.rejectRnr = rejectRnr;
        vm.skipRnr = skipRnr;

        function onInit() {
            setTypeAndClass();
            vm.displaySubmitButton = canSubmit && !hasAuthorizeRight;
            vm.displaySubmitAndAuthorizeButton = canSubmitAndAuthorize;
            vm.displayAuthorizeButton = canAuthorize;
            vm.displayDeleteButton = canDelete;
            // vm.displayApproveAndRejectButtons = canApproveAndReject;
            // vm.displayRejectButton = canApproveAndReject && !(vm.requisition.extraData
            //     && vm.requisition.extraData.originalRequisition);
            // vm.displaySkipButton = canSkip;
            vm.displaySyncButton = canSync;
        }

        function setTypeAndClass() {
            vm.requisitionType = vm.program.name;
            vm.requisitionTypeClass = 'regular';
        }

        function syncRnr() {
            var loadingPromise = loadingModalService.open();
            saveRnr().then(function() {
                loadingPromise.then(function() {
                    notificationService.success('requisitionView.usageReport.sync.success');
                });
                $state.go($state.current, {
                    rnr: vm.requisition.id,
                    requisition: undefined
                }, {
                    reload: true
                });
            }, function(response) {
                handleSaveError(response.status);
            });
        }

        function saveRnr() {
            vm.requisition.$modified = false;
            return vm.requisition.$save();
        }

        function validateTotalOfRegiment() {
            vm.commentsRequired = !requisitionValidator.validateTotalOfRegiment(requisition);
            vm.forceOpen = vm.commentsRequired;
        }

        function submitRnr() {
            validateTotalOfRegiment();
            if (requisitionValidator.validateUsageReport(requisition)) {
                signatureModalService.confirm('requisitionView.usageReport.submit.confirmWithSignature')
                    .then(function(signature) {
                        vm.requisition.extraData.signaure = {
                            submit: signature
                        };
                        if (vm.requisition.program.enableDatePhysicalStockCountCompleted) {
                            var modal = new RequisitionStockCountDateModal(vm.requisition);
                            modal.then(saveThenSubmit);
                        } else {
                            saveThenSubmit();
                        }
                    });
            } else {
                $scope.$broadcast('openlmis-form-submit');
                if (requisitionValidator.isEmptyTable(requisition)) {
                    failWithMessage('requisitionViewReport.emptyTable')();
                } else if (requisitionValidator.isOnlyAPES(requisition)) {
                    failWithMessage('requisitionViewReport.apeOnly')();
                } else {
                    failWithMessage('requisitionView.rnrHasErrors')();
                }
            }

            function saveThenSubmit() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$submit().then(function() {
                        watcher.disableWatcher();
                        loadingPromise.then(function() {
                            notificationService.success('requisitionView.usageReport.submit.success');
                        });
                        stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                    }, loadingModalService.close);
                }, function(response) {
                    handleSaveError(response.status);
                });
            }
        }

        function authorizeRnr() {
            confirmService.confirm(
                'requisitionView.authorize.confirm',
                'requisitionView.authorize.label'
            ).then(function() {
                validateTotalOfRegiment();
                if (requisitionValidator.validateUsageReport(requisition)) {
                    signatureModalService.confirm('requisitionView.usageReport.submit.confirmWithSignature')
                        .then(function(signature) {
                            vm.requisition.extraData.signaure.authorize = signature;
                            if (vm.requisition.program.enableDatePhysicalStockCountCompleted) {
                                var modal = new RequisitionStockCountDateModal(vm.requisition);
                                modal.then(saveThenAuthorize);
                            } else {
                                saveThenAuthorize();
                            }
                        });
                } else {
                    $scope.$broadcast('openlmis-form-submit');
                    if (requisitionValidator.isEmptyTable(requisition)) {
                        failWithMessage('requisitionViewReport.emptyTable')();
                    } else if (requisitionValidator.isOnlyAPES(requisition)) {
                        failWithMessage('requisitionViewReport.apeOnly')();
                    } else {
                        failWithMessage('requisitionView.rnrHasErrors')();
                    }
                }
            });

            function saveThenAuthorize() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$authorize().then(function() {
                        watcher.disableWatcher();
                        loadingPromise.then(function() {
                            notificationService.success('requisitionView.usageReport.authorize.success');
                        });
                        stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                    }, loadingModalService.close);
                }, function(response) {
                    handleSaveError(response.status);
                });
            }
        }

        function submitAndAuthorizeRnr() {
            validateTotalOfRegiment();
            if (requisitionValidator.validateUsageReport(requisition)) {
                signatureModalService.confirm('requisitionView.usageReport.submit.confirmWithSignature')
                    .then(function(signature) {
                        vm.requisition.extraData.signaure = {
                            submit: signature,
                            authorize: signature
                        };
                        if (vm.requisition.program.enableDatePhysicalStockCountCompleted) {
                            var modal = new RequisitionStockCountDateModal(vm.requisition);
                            modal.then(saveThenSubmitThenAuthorize);
                        } else {
                            saveThenSubmitThenAuthorize();
                        }
                    });
            } else {
                $scope.$broadcast('openlmis-form-submit');
                if (requisitionValidator.isEmptyTable(requisition)) {
                    failWithMessage('requisitionViewReport.emptyTable')();
                } else if (requisitionValidator.isOnlyAPES(requisition)) {
                    failWithMessage('requisitionViewReport.apeOnly')();
                } else {
                    failWithMessage('requisitionView.rnrHasErrors')();
                }
            }

            function saveThenSubmitThenAuthorize() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$save().then(function() {
                    vm.requisition.$submit().then(function() {
                        vm.requisition.$authorize().then(function() {
                            watcher.disableWatcher();
                            loadingPromise.then(function() {
                                notificationService.success('requisitionView.usageReport.authorize.success');
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

        function removeRnr() {
            confirmService.confirmDestroy(
                'requisitionView.delete.confirm',
                'requisitionView.delete.label'
            ).then(function() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$remove().then(function() {
                    watcher.disableWatcher();
                    loadingPromise.then(function() {
                        notificationService.success('requisitionView.usageReport.delete.success');
                    });
                    stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                }, loadingModalService.close);
            });
        }

        function approveRnr() {
            confirmService.confirm(
                'requisitionView.approve.confirm',
                'requisitionView.approve.label'
            ).then(function() {
                validateTotalOfRegiment();
                if (requisitionValidator.validateUsageReport(requisition)) {
                    var loadingPromise = loadingModalService.open();
                    vm.requisition.$save().then(function() {
                        vm.requisition.$approve().then(function() {
                            watcher.disableWatcher();
                            loadingPromise.then(function() {
                                notificationService.success('requisitionView.usageReport.approve.success');
                            });
                            stateTrackerService.goToPreviousState('openlmis.requisitions.approvalList');
                        }, loadingModalService.close);
                    }, function(response) {
                        handleSaveError(response.status);
                    });
                } else {
                    $scope.$broadcast('openlmis-form-submit');
                    if (requisitionValidator.isEmptyTable(requisition)) {
                        failWithMessage('requisitionViewReport.emptyTable')();
                    } else if (requisitionValidator.isOnlyAPES(requisition)) {
                        failWithMessage('requisitionViewReport.apeOnly')();
                    } else {
                        failWithMessage('requisitionView.rnrHasErrors')();
                    }
                }
            });
        }

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
                        notificationService.success('requisitionView.usageReport.reject.success');
                        stateTrackerService.goToPreviousState('openlmis.requisitions.approvalList');
                    })
                    .catch(loadingModalService.close);
            });
        }

        function skipRnr() {
            confirmService.confirm(
                'requisitionView.usageReport.skip.confirm',
                'requisitionView.skip.label'
            ).then(function() {
                var loadingPromise = loadingModalService.open();
                vm.requisition.$skip().then(function() {
                    watcher.disableWatcher();
                    loadingPromise.then(function() {
                        notificationService.success('requisitionView.usageReport.skip.success');
                    });
                    stateTrackerService.goToPreviousState('openlmis.requisitions.initRnr');
                }, failWithMessage('requisitionView.usageReport.skip.failure'));
            });
        }

        function handleSaveError(status) {
            if (status === 409) {
                // in case of conflict, use the server version
                notificationService.error('requisitionView.usageReport.versionMismatch');
                reloadState();
            } else if (status === 403) {
                // 403 means user lost rights or requisition changed status
                notificationService.error('requisitionView.usageReport.updateForbidden');
                reloadState();
            } else {
                failWithMessage('requisitionView.usageReport.sync.failure')();
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
