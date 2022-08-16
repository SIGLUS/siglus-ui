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
     * @name admin-facility-add.controller:FacilityAddController
     *
     * @description
     * Provides methods for Add Facility modal. Allows returning to previous states and saving
     * facility.
     */
    angular
        .module('admin-facility-add')
        .controller('FacilityAddController', FacilityAddController);

    FacilityAddController.$inject = [
        'facility', 'facilityTypes', 'geographicZones', 'facilityOperators', 'confirmService',
        'FacilityRepository', 'stateTrackerService', '$state', 'loadingModalService',
        'notificationService', 'messageService'
    ];

    function FacilityAddController(facility, facilityTypes, geographicZones, facilityOperators,
                                   confirmService, FacilityRepository, stateTrackerService,
                                   $state, loadingModalService, notificationService,
                                   messageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.save = save;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;

        /**
         * @ngdoc method
         * @methodOf admin-facility-add.controller:FacilityAddController
         * @name $onInit
         *
         * @description
         * Initialization method of the FacilityAddController.
         */
        function onInit() {
            vm.facility = angular.copy(facility);
            vm.facilityTypes = facilityTypes;
            vm.geographicZones = geographicZones;
            vm.facilityOperators = facilityOperators;
            vm.facility.active = facility.active !== false;
            vm.facility.enabled = facility.enabled !== false;
            vm.facility.isAndroidDevice = facility.isAndroidDevice !== false;
            vm.facility.isNewFacility = facility.isNewFacility;
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-add.controller:FacilityAddController
         * @name save
         *
         * @description
         * Saves the facility and takes user back to the previous state.
         */
        function save() {
            return doSave().then(function(response) {
                var confirmMessage = messageService.get('adminFacilityAdd.doYouWantToAddPrograms', {
                    facility: response.name
                });

                confirmService.confirm(confirmMessage,
                    'adminFacilityAdd.addPrograms',
                    'adminFacilityAdd.cancel').then(function() {
                    $state.go('openlmis.administration.facilities.facility.programs', {
                        facility: response
                    });
                });
            });
        }

        function doSave() {
            loadingModalService.open();
            return new FacilityRepository().create(vm.facility)
                .then(function(facility) {
                    notificationService.success('adminFacilityAdd.facilityHasBeenSaved');
                    stateTrackerService.goToPreviousState();
                    return facility;
                })
                .catch(function() {
                    notificationService.error('adminFacilityAdd.failedToSaveFacility');
                    loadingModalService.close();
                });
        }
    }

})();
