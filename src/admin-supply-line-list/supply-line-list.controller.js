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
     * @name admin-supply-line-list.controller:SupplyLineListController
     *
     * @description
     * Controller for managing supply line list screen.
     */
    angular
        .module('admin-supply-line-list')
        .controller('SupplyLineListController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'supplyLines', 'supplyingFacilities', 'programs'
    ];

    function controller($state, $stateParams, supplyLines, supplyingFacilities, programs) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.showFacilityPopover = showFacilityPopover;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name supplyLines
         * @type {Array}
         *
         * @description
         * Contains filtered supply lines.
         */
        vm.supplyLines = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name supplyingFacilities
         * @type {Array}
         *
         * @description
         * Contains list of all supplying facilities.
         */
        vm.supplyingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Contains list of all programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name supplyingFacilityId
         * @type {string}
         *
         * @description
         * Contains supplying facility id param for searching supply lines.
         */
        vm.supplyingFacilityId = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supply-line-list.controller:SupplyLineListController
         * @name programId
         * @type {string}
         *
         * @description
         * Contains program id param for searching supply lines.
         */
        vm.programId = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating SupplyLineListController.
         */
        function onInit() {
            vm.supplyLines = supplyLines;
            vm.supplyingFacilities = supplyingFacilities;
            vm.programs = programs;
            vm.supplyingFacilityId = $stateParams.supplyingFacilityId;
            vm.programId = $stateParams.programId;
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.supplyingFacilityId = vm.supplyingFacilityId;
            stateParams.programId = vm.programId;
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.supplyLines', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-supply-line-list.controller:SupplyLineListController
         * @name showFacilityPopover
         *
         * @description
         * Checks if member facilities popover should be shown.
         * 
         * @param   {Object}  supplyLine given supply line
         * @returns {boolean}            true if popover should be shown
         */
        function showFacilityPopover(supplyLine) {
            return supplyLine.supervisoryNode.requisitionGroup &&
                supplyLine.supervisoryNode.requisitionGroup.memberFacilities &&
                supplyLine.supervisoryNode.requisitionGroup.memberFacilities.length;
        }
    }
})();
