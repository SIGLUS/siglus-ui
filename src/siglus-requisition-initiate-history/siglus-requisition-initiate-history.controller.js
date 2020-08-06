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
     * @name requisition-search.controller:RequisitionViewController
     *
     * @description
     * Controller for requisition view page.
     */
    angular
        .module('siglus-requisition-initiate-history')
        .controller('SiglusRequisitionInitiateHistoryController', SiglusRequisitionInitiateHistoryController);

    SiglusRequisitionInitiateHistoryController.$inject = [
        '$state', '$filter', '$stateParams', 'facilities', 'offlineService', 'localStorageFactory', 'confirmService',
        'requisitions'
    ];

    function SiglusRequisitionInitiateHistoryController($state, $filter, $stateParams,
                                                      facilities, offlineService,
                                                      localStorageFactory, confirmService,
                                                      requisitions) {
        var vm = this;
        vm.$onInit = onInit;
        vm.openRnr = openRnr;

        /**
         * @ngdoc property
         * @propertyOf requisition-search.controller:RequisitionViewController
         * @name facilities
         * @type {Array}
         *
         * @description
         * The list of all facilities available to the user.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-search.controller:RequisitionViewController
         * @name selectedFacility
         * @type {Object}
         *
         * @description
         * The facility selected by the user.
         */
        vm.selectedFacility = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-search.controller:RequisitionViewController
         * @name selectedProgram
         * @type {Object}
         *
         * @description
         * The program selected by the user.
         */
        vm.selectedProgram = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-search.controller:RequisitionViewController
         * @name requisitions
         * @type {Array}
         *
         * @description
         * Holds all requisitions that will be displayed on screen.
         */
        vm.requisitions = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-search.controller:RequisitionViewController
         * @name offline
         * @type {Boolean}
         *
         * @description
         * Indicates if requisitions will be searched offline or online.
         */
        vm.offline = undefined;

        vm.options = {
            'requisitionSearch.dateInitiated': ['createdDate,desc']
        };

        /**
         * @ngdoc method
         * @methodOf requisition-search.controller:RequisitionViewController
         * @name $onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            vm.requisitions = requisitions;
            vm.facilities = facilities;
            vm.offline = $stateParams.offline === 'true' || offlineService.isOffline();

            if ($stateParams.facility) {
                vm.selectedFacility = $filter('filter')(vm.facilities, {
                    id: $stateParams.facility
                })[0];
            }

            if (vm.selectedFacility && $stateParams.program) {
                vm.selectedProgram = $filter('filter')(vm.selectedFacility.supportedPrograms, {
                    id: $stateParams.program
                })[0];
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition-search.controller:RequisitionViewController
         * @name openRnr
         *
         * @description
         * Redirect to requisition page after clicking on grid row.
         *
         * @param {String} requisitionId Requisition UUID
         */
        function openRnr(requisitionId) {
            $state.go('openlmis.requisitions.history', {
                rnr: requisitionId
            });
        }
    }
})();

