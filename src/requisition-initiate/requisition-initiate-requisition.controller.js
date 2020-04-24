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
     * @name requisition-initiate.controller:RequisitionInitiateController
     *
     * @description
     * Controller responsible for actions connected with displaying available periods and
     * initiating or navigating to an existing requisition.
     */
    angular
        .module('requisition-initiate')
        .controller('RequisitionInitiateRequisitionController', RequisitionInitiateRequisitionController);

    RequisitionInitiateRequisitionController.$inject = [
        'requisitionService', '$state', 'loadingModalService', 'notificationService', 'REQUISITION_RIGHTS',
        'permissionService', 'authorizationService', '$stateParams', 'periods', 'canInitiateRnr', 'UuidGenerator',
        'confirmService', 'requisitionInitiateService', 'REQUISITION_STATUS', 'requisitionDatePickerService',
        'alertService', 'dateUtils', 'moment', 'inventoryDates', 'program', 'TEMPLATE_TYPE'
    ];

    function RequisitionInitiateRequisitionController(requisitionService, $state, loadingModalService,
                                                      notificationService, REQUISITION_RIGHTS,
                                                      permissionService, authorizationService, $stateParams,
                                                      periods, canInitiateRnr, UuidGenerator, confirmService,
                                                      requisitionInitiateService, REQUISITION_STATUS,
                                                      requisitionDatePickerService, alertService, dateUtils,
                                                      moment, inventoryDates, program, TEMPLATE_TYPE) {
        var vm = this,
            uuidGenerator = new UuidGenerator(),
            key = uuidGenerator.generate();

        var rights = authorizationService.getRights();
        var createRight = _.find(rights, function(right) {
            return right.name === REQUISITION_RIGHTS.REQUISITION_CREATE;
        });
        var authorizeRight = _.find(rights, function(right) {
            return right.name === REQUISITION_RIGHTS.REQUISITION_AUTHORIZE;
        });

        vm.$onInit = onInit;
        vm.initRnr = initRnr;
        vm.periodHasRequisition = periodHasRequisition;
        vm.goToRequisition = goToRequisition;
        // vm.checkRnrStatus = checkRnrStatus;
        vm.checkProceedButton = checkProceedButton;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name emergency
         * @type {Boolean}
         *
         * @description
         * Holds a boolean indicating if the currently selected requisition type is standard or emergency
         */
        vm.emergency = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name periods
         * @type {List}
         *
         * @description
         * The list of all periods displayed in the table.
         */
        vm.periods = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name canInitiateRnr
         * @type {boolean}
         *
         * @description
         * True if user has permission to initiate requisition.
         */
        vm.canInitiateRnr = undefined;

        vm.program = undefined;

        vm.isUsageReport = undefined;

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name $onInit
         *
         * @description
         * Initialization method of the RequisitionInitiateController controller.
         */
        function onInit() {
            vm.emergency = $stateParams.emergency === 'true';
            vm.periods = periods;
            vm.canInitiateRnr = canInitiateRnr;
            vm.inventoryDates = inventoryDates;
            vm.program = program;
            vm.isUsageReport = (program && program.templateType) === TEMPLATE_TYPE.USAGE_REPORT;
        }

        function isCurrentSubmitDuration(period) {
            var today = moment();
            var isInRange = today.isSameOrAfter(period.submitStartDate, 'day')
                && today.isSameOrBefore(period.submitEndDate, 'day');
            return isInRange;
        }

        function getDiffDates(startDate, endDate, dates) {
            var diffDates = [];
            if (dates && dates.length) {
                var date = moment(startDate);
                while (date.isSameOrBefore(endDate)) {
                    var dateString = dateUtils.toStringDate(date.toDate());
                    diffDates.push(dateString);
                    date.add(1, 'days');
                }
                diffDates = _.difference(diffDates, dates);
            }
            return diffDates;
        }

        function pickInventoryDate(selectedPeriod) {
            var startDate = dateUtils.toStringDate(selectedPeriod.submitStartDate);
            var endDate = dateUtils.toStringDate(selectedPeriod.submitEndDate);
            var datesDisabled = getDiffDates(startDate, endDate, vm.inventoryDates);
            requisitionDatePickerService.show(startDate, endDate, datesDisabled)
                .then(function(inventoryDate) {
                    initiate(selectedPeriod, inventoryDate);
                }, function() {
                    loadingModalService.close();
                });
        }

        function initiate(selectedPeriod, inventoryDate) {
            loadingModalService.open();
            requisitionService.initiate($stateParams.facility, $stateParams.program,
                selectedPeriod.id, vm.emergency, key, inventoryDate)
                .then(function(data) {
                    goToInitiatedRequisition(data);
                })
                .catch(function() {
                    notificationService.error('requisitionInitiate.couldNotInitiateRequisition');
                    loadingModalService.close();
                    key = uuidGenerator.generate();
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name initRnr
         *
         * @description
         * Responsible for initiating a requisition for a specified period. If
         * creating the requisition is successful, then the user is sent to the
         * requisition view page. Otherwise an error message is shown.
         *
         * @param {Object} selectedPeriod a period to initiate or proceed with the requisition for
         */
        function initRnr(selectedPeriod) {
            loadingModalService.open();
            var user = authorizationService.getUser();

            vm.error = '';

            permissionService.hasPermission(user.user_id, {
                right: REQUISITION_RIGHTS.REQUISITION_CREATE,
                programId: $stateParams.program,
                facilityId: $stateParams.facility
            })
                .then(function() {
                    if (isCurrentSubmitDuration(selectedPeriod) || vm.emergency) {
                        requisitionInitiateService.getLatestPhysicalInventory($stateParams.facility)
                            .then(function(result) {
                                var today = dateUtils.toStringDate(new Date());
                                if (result.occurredDate === today) {
                                    initiate(selectedPeriod, today);
                                } else {
                                    confirmService.confirm('requisitionInitiate.confirm.label',
                                        'requisitionInitiate.confirm.button')
                                        .then(function() {
                                            goToPhysicalInventory();
                                        }, function() {
                                            loadingModalService.close();
                                        });
                                }
                            });
                    } else {
                        pickInventoryDate(selectedPeriod);
                    }
                })
                .catch(function() {
                    notificationService.error('requisitionInitiate.noPermissionToInitiateRequisition');
                    loadingModalService.close();
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name periodHasRequisition
         *
         * @description
         * Checks a period object to make sure no requisition is associated with
         * the period.
         *
         * @param {Object} period a period to check if it has a requisition
         */
        function periodHasRequisition(period) {
            if (period.rnrId) {
                return true;
            }
            return false;
        }

        function goToRequisition(id) {
            loadingModalService.open();
            if (vm.isUsageReport) {
                $state.go('openlmis.requisitions.report', {
                    rnr: id
                });
            } else {
                $state.go('openlmis.requisitions.requisition.fullSupply', {
                    rnr: id
                });
            }
        }

        function goToInitiatedRequisition(requisition) {
            if (vm.isUsageReport) {
                $state.go('openlmis.requisitions.report', {
                    rnr: requisition.id,
                    requisition: requisition
                });
            } else {
                $state.go('openlmis.requisitions.requisition.fullSupply', {
                    rnr: requisition.id,
                    requisition: requisition
                });
            }
        }

        function goToPhysicalInventory() {
            $state.go('openlmis.stockmanagement.physicalInventory');
        }

        function checkProceedButton(period, idx) {
            if ($stateParams.program && $stateParams.facility) {
                if (idx > 0) {
                    return false;
                }
                if (Date.now() < period.startDate.getTime()) {
                    return false;
                }
                if (!checkRnrStatus(period.rnrStatus)) {
                    return false;
                }
            }

            if (!vm.isUsageReport && vm.emergency) {
                return period.currentPeriodRegularRequisitionAuthorized;
                //console.log(vm.periods);
            }

            return true;
        }

        function checkRnrStatus(status) {
            if (!$stateParams.program) {
                return false;
            }
            if (!$stateParams.facility) {
                return false;
            }

            var hasCreateRight = getHasCreateRight();
            var hasAuthorizeRight = getHasAuthorizeRight();

            if (status === REQUISITION_STATUS.INITIATED && !hasCreateRight) {
                return false;
            }
            if (status === REQUISITION_STATUS.SUBMITTED && !hasAuthorizeRight) {
                return false;
            }
            return true;
        }

        function getHasCreateRight() {
            return !!createRight && _.some(createRight.programIds, function(id) {
                return id === $stateParams.program;
            }) && _.some(createRight.facilityIds, function(id) {
                return id === $stateParams.facility;
            });
        }

        function getHasAuthorizeRight() {
            return !!authorizeRight && _.some(authorizeRight.programIds, function(id) {
                return id === $stateParams.program;
            }) && _.some(authorizeRight.facilityIds, function(id) {
                return id === $stateParams.facility;
            });
        }

        vm.isAfterSubmitStartDate = function(period) {
            var today = moment();
            return today.isSameOrAfter(period.submitStartDate, 'day');
        };
    }
})();
