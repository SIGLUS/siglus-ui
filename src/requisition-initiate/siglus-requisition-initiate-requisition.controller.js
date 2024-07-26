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
        .controller('SiglusRequisitionInitiateRequisitionController', Controller);

    Controller.$inject = [
        'requisitionService', '$state', 'loadingModalService',
        'notificationService', 'REQUISITION_RIGHTS',
        'permissionService', 'authorizationService', '$stateParams', 'periods',
        'canInitiateRnr', 'UuidGenerator',
        'confirmService', 'siglusRequisitionInitiateService',
        'REQUISITION_STATUS',
        'siglusRequisitionDatePickerService', 'alertService', 'dateUtils',
        'moment',
        'inventoryDates', 'program',
        'hasAuthorizeRight', 'siglusHomeFacilityService'
    ];

    function Controller(requisitionService, $state, loadingModalService,
                        notificationService, REQUISITION_RIGHTS,
                        permissionService, authorizationService, $stateParams, periods,
                        canInitiateRnr, UuidGenerator,
                        confirmService, siglusRequisitionInitiateService, REQUISITION_STATUS,
                        siglusRequisitionDatePickerService, alertService, dateUtils, moment,
                        inventoryDates, program,
                        hasAuthorizeRight, siglusHomeFacilityService) {
        var vm = this,
            uuidGenerator = new UuidGenerator(),
            key = uuidGenerator.generate();

        vm.$onInit = onInit;
        vm.initRnr = initRnr;
        vm.periodHasRequisition = periodHasRequisition;
        vm.goToRequisition = goToRequisition;
        vm.checkProceedButton = checkProceedButton;
        vm.checkSubmitDuration = checkSubmitDuration;

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

        vm.hasAuthorizeRight = undefined;

        vm.program = undefined;

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
            vm.hasAuthorizeRight = hasAuthorizeRight;
            vm.inventoryDates = inventoryDates;
            vm.program = program;
        }

        function isCurrentSubmitDuration(period) {
            var today = moment();
            return (today.isSameOrAfter(period.submitStartDate, 'day')
          && today.isSameOrBefore(period.submitEndDate, 'day'));
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
            var startDate = dateUtils.toStringDate(
                selectedPeriod.submitStartDate
            );
            var endDate = dateUtils.toStringDate(selectedPeriod.submitEndDate);
            var datesDisabled = getDiffDates(startDate, endDate,
                vm.inventoryDates);
            loadingModalService.open();
            siglusRequisitionDatePickerService.show(startDate, endDate,
                datesDisabled)
                .then(function(inventoryDate) {
                    initiate(selectedPeriod, inventoryDate);
                }, function() {
                    loadingModalService.close();
                });
        }

        function initiate(selectedPeriod, inventoryDate) {
            loadingModalService.open();
            requisitionService.initiate(
                $stateParams.facility, $stateParams.program, selectedPeriod.id, vm.emergency, key, inventoryDate
            )
                .then(function(requisition) {
                    $state.go('openlmis.requisitions.requisition.fullSupply', {
                        rnr: requisition.id,
                        requisition: requisition
                    });
                })
                .catch(function() {
                    notificationService.error(
                        'requisitionInitiate.couldNotInitiateRequisition'
                    );
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
            vm.error = '';

            if (!vm.canInitiateRnr) {
                notificationService.error(
                    'requisitionInitiate.noPermissionToInitiateRequisition'
                );
                return;
            }
            if (isCurrentSubmitDuration(selectedPeriod) || vm.emergency) {
                loadingModalService.open();
                var programId = $stateParams.replaceId || vm.program.id;
                siglusRequisitionInitiateService.getLatestPhysicalInventory(
                    $stateParams.facility, programId
                )
                    .then(function(result) {
                        var today = dateUtils.toStringDate(new Date());
                        if (result.occurredDate === today) {
                            initiate(selectedPeriod, today);
                        } else {
                            confirmService.confirm(
                                'requisitionInitiate.confirm.label',
                                'requisitionInitiate.confirm.button'
                            )
                                .then(function() {
                                    siglusHomeFacilityService.getLocationEnableStatus().then(
                                        function(enableLocationManagement) {
                                            if (enableLocationManagement) {
                                                goToPhysicalInventoryWithLocation();
                                            } else {
                                                goToPhysicalInventory();
                                            }
                                        }
                                    );

                                }, function() {
                                    loadingModalService.close();
                                });
                        }
                    })
                    .catch(function() {
                        loadingModalService.close();
                    });
            } else {
                pickInventoryDate(selectedPeriod);
            }
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
            return !!period.rnrId;
        }

        function goToRequisition(id) {
            loadingModalService.open();
            $state.go('openlmis.requisitions.requisition.fullSupply', {
                rnr: id,
                isExpiredEmergency: vm.emergency && isAfterSubmitEndDate(vm.periods[0])
            });
        }

        function goToPhysicalInventory() {
            $state.go('openlmis.stockmanagement.physicalInventory', {
                programId: $stateParams.replaceId || vm.program.id
            });
        }

        function goToPhysicalInventoryWithLocation() {
            $state.go('openlmis.locationManagement.physicalInventory');
        }

        function checkProceedButton(period, idx) {
            if (vm.emergency) {
                return period.currentPeriodRegularRequisitionAuthorized;
            }

            if ($stateParams.program && $stateParams.facility) {
                if (idx > 0 || Date.now() < period.startDate.getTime() || !checkRnrStatus(period.rnrStatus)) {
                    return false;
                }
            }

            return true;
        }

        function checkRnrStatus(status) {
            if (!$stateParams.program || !$stateParams.facility) {
                return false;
            }
            if (status === REQUISITION_STATUS.INITIATED && !vm.canInitiateRnr) {
                return false;
            }
            if (status === REQUISITION_STATUS.SUBMITTED
          && !vm.hasAuthorizeRight) {
                return false;
            }
            return true;
        }

        function checkSubmitDuration(period) {
            if (vm.emergency) {
                return isInSubmitDuration(period);
            }
            return isAfterSubmitStartDate(period);
        }

        function isInSubmitDuration(period) {
            var today = moment();
            return today.isSameOrAfter(period.submitStartDate, 'day') &&
                today.isSameOrBefore(period.submitEndDate, 'day');
        }

        function isAfterSubmitStartDate(period) {
            var today = moment();
            return today.isSameOrAfter(period.submitStartDate, 'day');
        }

        function isAfterSubmitEndDate(period) {
            var today = moment();
            return today.isAfter(period.submitEndDate, 'day');
        }
    }
})();
