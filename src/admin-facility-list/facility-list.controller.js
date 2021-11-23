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
     * @name admin-facility-list.controller:FacilityListController
     *
     * @description
     * Controller for managing facility list screen.
     */
    angular
        .module('admin-facility-list')
        .controller('FacilityListController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'facilities', 'geographicZones'
    ];

    function controller($state, $stateParams, facilities, geographicZones) {

        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.goToAddFacilityPage = goToAddFacilityPage;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-list.controller:FacilityListController
         * @name facilities
         * @type {Array}
         *
         * @description
         * Contains filtered facilities.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-list.controller:FacilityListController
         * @name geographicZones
         * @type {Array}
         *
         * @description
         * Contains all geographic zones.
         */
        vm.geographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-list.controller:FacilityListController
         * @name facilityName
         * @type {String}
         *
         * @description
         * Contains name param for searching facilities.
         */
        vm.facilityName = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-list.controller:FacilityListController
         * @name geographicZone
         * @type {String}
         *
         * @description
         * Contains geographic zone UUID param for searching facilities.
         */
        vm.geographicZone = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-facility-list.controller:FacilityListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating FacilityListController.
         */
        function onInit() {
            vm.facilities = facilities;
            vm.geographicZones = geographicZones;
            vm.facilityName = $stateParams.name;
            vm.geographicZone = $stateParams.zoneId;
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-list.controller:FacilityListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.name = vm.facilityName;
            stateParams.zoneId = vm.geographicZone;
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.facilities', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-list.controller:FacilityListController
         * @name goToAddFacilityPage
         *
         * @description
         * Takes the user to the add facility page.
         */
        function goToAddFacilityPage() {
            $state.go('openlmis.administration.facilities.facility.add');
        }
    }

})();
