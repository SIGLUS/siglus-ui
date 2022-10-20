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
       * @name openlmis-modal.controller:SiglusSignatureModalController
       *
       * @description
       * Exposes data to the confirmation modal view.
       */
    angular
        .module('openlmis-modal')
        .controller('SiglusSignatureWithDateModalController', controller);

    controller.$inject = [
        'message', 'confirmMessage', 'cancelMessage',
        'confirmDeferred', 'modalDeferred',
        'siglusSignatureWithLimitDateModalService', 'facility',
        'messageService', 'alertService'
    ];

    function controller(message, confirmMessage, cancelMessage,
                        confirmDeferred, modalDeferred,
                        siglusSignatureWithLimitDateModalService, facility, messageService,
                        alertService) {
        var vm = this;
        vm.$onInit = onInit;
        vm.facilityId = facility.id;
        vm.confirm = confirm;
        vm.cancel = cancel;
        vm.signatureIsRequired = false;
        vm.occurredDate = new Date();
        vm.currentDate = getCurrentDate();
        vm.movementDate = undefined;
        vm.firstDayOfPeroid = firstDayOfPeriod();
        vm.maxDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        vm.minDate = undefined;
        vm.isToday = true;
        vm.maxDate.setHours(0, 0, 0, 0);
        vm.onlyShowToday = onlyShowToday();
        console.log('ost', vm.onlyShowToday);

        /**
         * @ngdoc property
         * @propertyOf openlmis-modal.controller:SiglusSignatureModalController
         * @type {String}
         * @name message
         *
         * @description
         * The message to be displayed on the header.
         */
        vm.message = undefined;

        /**
         * @ngdoc property
         * @propertyOf openlmis-modal.controller:SiglusSignatureModalController
         * @type {String}
         * @name confirmMessage
         *
         * @description
         * The message to be displayed on the confirmation button.
         */
        vm.confirmMessage = undefined;

        /**
         * @ngdoc property
         * @propertyOf openlmis-modal.controller:SiglusSignatureModalController
         * @type {String}
         * @name cancelMessage
         *
         * @description
         * The message to be displayed on the cancel button.
         */
        vm.cancelMessage = undefined;

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SiglusSignatureModalController.
         */
        function onInit() {

            vm.message = message;
            vm.confirmMessage = confirmMessage;
            vm.cancelMessage = cancelMessage;
            vm.facilityId = facility.id;
            siglusSignatureWithLimitDateModalService.getMovementDate(
                vm.currentDate, facility.id
            ).then(
                function(result) {
                    vm.movementDate = result;
                    vm.minDate = minDate();
                }
            )
                .catch(handleError);
        }

        function handleError(error) {
            if (error.data.messageKey
              === 'siglusapi.error.stockManagement.movement.date.invalid') {
                vm.invalidMessage = messageService.get(
                    'openlmisModal.dateConflict'
                );
            }
            if (error.data.messageKey
              === 'siglusapi.error.stockManagement.draft.notFound') {
                alertService.error('openlmisModal.dateConflict');
            }
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name confirm
         *
         * @description
         * Resolves the confirmation promise and closes the modal.
         */
        function confirm() {
            if (_.isEmpty(vm.signature)) {
                vm.signatureIsRequired = true;
                return;
            }
            confirmDeferred.resolve({
                signature: vm.signature,
                occurredDate: vm.occurredDate

            });
            modalDeferred.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name cancel
         *
         * @description
         * Rejects the confirmation promise and closes the modal.
         */
        function cancel() {
            confirmDeferred.reject();
            modalDeferred.resolve();
        }

        vm.changeDateType = function(isToday) {
            vm.occurredDate = isToday ? new Date() : null;
        };

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name getCurrentDate
         *
         * @description
         * to get current date
         */
        function getCurrentDate() {
            var nowDate = new Date();
            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            var day = nowDate.getDate();
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            return year + '-' + month + '-' + day;
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name onlyShowToday
         *
         * @description
         * to get the value of only show today
         */
        function onlyShowToday() {
            if (vm.currentDate === vm.minDate) {
                return vm.onlyShowToday = true;
            }
            return vm.onlyShowToday = false;
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name firstDayOfPeriod
         *
         * @description
         * to get first day of every period
         */
        function firstDayOfPeriod() {
            var nowDate = new Date();
            var year = nowDate.getFullYear();
            var month = nowDate.getMonth();
            var day = 21;
            return year + '-' + month + '-' + day;
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-modal.controller:SiglusSignatureModalController
         * @name minDate
         *
         * @description
         * to get mindate
         */

        function minDate() {
            if (vm.movementDate && vm.firstDayOfPeroid) {
                var lastMovementDate = vm.movementDate;
                var firstDayOfPeriod = vm.firstDayOfPeroid;
                var lastMovementDateDT = new Date(
                    lastMovementDate.replace('-', '/')
                );
                var firstDayOfPeriodDT = new Date(
                    firstDayOfPeriod.replace('-', '/')
                );
                if (lastMovementDateDT > firstDayOfPeriodDT) {
                    return lastMovementDateDT;
                }

                if (firstDayOfPeriodDT > lastMovementDateDT) {
                    return firstDayOfPeriodDT;
                }
            } else if (vm.movementDate && !firstDayOfPeriod) {
                return vm.movementDate;
            } else if (!vm.movementDate && firstDayOfPeriod) {
                return vm.firstDayOfPeroid;
            }
        }

        // function getMovementDate() {
        //     var currentDate = vm.currentDate;
        //     var facilityId = vm.facilityId;
        //     return new siglusSignatureWithLimitDateModalService.getMovementDate(
        //         currentDate, facilityId
        //     )
        //         .then(function(lastMovementDate) {
        //             vm.lastMovementDate = lastMovementDate;
        //             console.log('vm.lastMovementDate', lastMovementDate);
        //             return vm.lastMovementDate;
        //         })
        //         .catch(handleError);
        // }
        //
        // function handleError(error) {
        //     if (error.data.messageKey
        //       === 'siglusapi.error.stockManagement.movement.date.invalid') {
        //         vm.invalidMessage = messageService.get(
        //             'openlmisModal.dateConflict'
        //         );
        //     }
        //     if (error.data.messageKey
        //       === 'siglusapi.error.stockManagement.draft.notFound') {
        //         alertService.error('openlmisModal.dateConflict');
        //     }
        // }

    }
}

)();