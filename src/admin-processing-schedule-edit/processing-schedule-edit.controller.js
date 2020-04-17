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
     * @name admin-processing-schedule-edit.controller:ProcessingScheduleEditController
     *
     * @description
     * Provides methods for Edit Processing Schedule modal. Allows returning to previous states and editing Processing
     * Schedule.
     */
    angular
        .module('admin-processing-schedule-edit')
        .controller('ProcessingScheduleEditController', ProcessingScheduleEditController);

    ProcessingScheduleEditController.$inject = [
        'processingSchedule', 'processingPeriods', 'confirmService', 'periodService', 'stateTrackerService',
        '$state', 'loadingModalService', 'notificationService', 'messageService', 'newStartDate',
        // SIGLUS-REFACTOR: add moment
        'moment'
        // SIGLUS-REFACTOR: ends here
    ];

    function ProcessingScheduleEditController(processingSchedule, processingPeriods, confirmService, periodService,
                                              stateTrackerService, $state, loadingModalService, notificationService,
                                              messageService, newStartDate, moment) {

        var vm = this;

        vm.add = add;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;
        vm.$onInit = onInit;

        /**
         * @ngdoc property
         * @methodOf admin-processing-schedule-edit.controller:ProcessingScheduleEditController
         * @name processingSchedule
         * @type {Object}
         *
         * @description
         * Current Processing Schedule.
         */
        vm.processingSchedule = undefined;

        /**
         * @ngdoc property
         * @methodOf admin-processing-schedule-edit.controller:ProcessingScheduleEditController
         * @name processingPeriods
         * @type {Array}
         *
         * @description
         * Array of Processing Periods for current Processing Schedule.
         */
        vm.processingPeriods = undefined;

        /**
         * @ngdoc property
         * @methodOf admin-processing-schedule-edit.controller:ProcessingScheduleEditController
         * @name newPeriod
         * @type {Object}
         *
         * @description
         * New Processing Period to be saved.
         */
        vm.newPeriod = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-processing-schedule-edit.controller:ProcessingScheduleEditController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating ProcessingScheduleEditController.
         */
        function onInit() {
            vm.processingSchedule = processingSchedule;
            vm.processingPeriods = processingPeriods;
            vm.newPeriod = {
                processingSchedule: processingSchedule
            };
            if (newStartDate) {
                vm.newPeriod.startDate = newStartDate;
            }

            // SIGLUS-REFACTOR: starts here
            vm.theDayAfterLastSubmitEndDate = undefined;
            if (vm.processingPeriods && vm.processingPeriods.length > 0) {
                var lastSubmitEndDate = vm.processingPeriods[vm.processingPeriods.length - 1].submitEndDate;
                vm.theDayAfterLastSubmitEndDate = moment(lastSubmitEndDate).add(1, 'days');
            }
            // SIGLUS-REFACTOR: ends here
        }

        // SIGLUS-REFACTOR: new function getLatterDate
        vm.getLatterDate = function(date1, date2) {
            if (date1 && date2) {
                return moment(date1).isSameOrAfter(date2, 'day') ? date1 : date2;
            }

            if (date1) {
                return date1;
            }

            return date2;
        };
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf admin-processing-schedule-edit.controller:ProcessingScheduleEditController
         * @name add
         *
         * @description
         * Saves the Processing Period with current Processing Schedule.
         */
        function add() {
            var confirmMessage = messageService.get('adminProcessingScheduleEdit.add.question', {
                period: vm.newPeriod.name
            });

            confirmService.confirm(confirmMessage,
                'adminProcessingScheduleEdit.add').then(function() {
                var loadingPromise = loadingModalService.open();
                periodService.create(vm.newPeriod).then(function() {
                    loadingPromise.then(function() {
                        notificationService.success('adminProcessingScheduleEdit.add.success');
                    });
                    $state.reload('openlmis.administration.processingSchedules.edit');
                })
                    .catch(function() {
                        loadingModalService.close();
                        notificationService.error('adminProcessingScheduleEdit.add.fail');
                    });
            });
        }
    }

})();
