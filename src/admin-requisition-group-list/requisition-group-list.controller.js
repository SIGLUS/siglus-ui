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
     * @name admin-requisition-group-list.controller:RequisitionGroupListController
     *
     * @description
     * Controller for managing requisition group list screen.
     */
    angular
        .module('admin-requisition-group-list')
        .controller('RequisitionGroupListController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'requisitionGroups', 'programs', 'geographicZones', 'facilitiesMap'
    ];

    function controller($state, $stateParams, requisitionGroups, programs, geographicZones, facilitiesMap) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name requisitionGroups
         * @type {Array}
         *
         * @description
         * Contains filtered requisition groups.
         */
        vm.requisitionGroups = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Contains list of all programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name geographicZones
         * @type {Array}
         *
         * @description
         * Contains list of all geographic zones.
         */
        vm.geographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name facilitiesMap
         * @type {Object}
         *
         * @description
         * Contains facilities related to requisition groups. The key value is equal to a facility ID value.
         */
        vm.facilitiesMap = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name name
         * @type {String}
         *
         * @description
         * Contains name param for searching requisition groups.
         */
        vm.name = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name program
         * @type {String}
         *
         * @description
         * Contains program code param for searching requisition groups.
         */
        vm.program = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name geographicZone
         * @type {String}
         *
         * @description
         * Contains geographic zone code param for searching requisition groups.
         */
        vm.geographicZone = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating ProductListController.
         */
        function onInit() {
            vm.requisitionGroups = requisitionGroups;
            vm.programs = programs;
            vm.geographicZones = geographicZones;
            vm.program = $stateParams.program;
            vm.geographicZone = $stateParams.zone;
            vm.name = $stateParams.name;
            vm.facilitiesMap = facilitiesMap;
        }

        /**
         * @ngdoc method
         * @methodOf admin-requisition-group-list.controller:RequisitionGroupListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.zone = vm.geographicZone;
            stateParams.name = vm.name;
            stateParams.program = vm.program;
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.requisitionGroupList', stateParams, {
                reload: true
            });
        }
    }
})();
