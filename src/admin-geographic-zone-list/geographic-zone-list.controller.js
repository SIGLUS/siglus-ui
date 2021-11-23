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
     * @name admin-geographic-zone-list.controller:GeographicZoneListController
     *
     * @description
     * Controller for managing geographic zone list screen.
     */
    angular
        .module('admin-geographic-zone-list')
        .controller('GeographicZoneListController', controller);

    controller.$inject = ['$state', '$stateParams', 'filteredGeographicZones', 'geographicZones'];

    function controller($state, $stateParams, filteredGeographicZones, geographicZones) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;

        /**
         * @ngdoc property
         * @propertyOf admin-geographic-zone-list.controller:GeographicZoneListController
         * @name filteredGeographicZones
         * @type {Array}
         *
         * @description
         * Contains filtered geographic zones.
         */
        vm.filteredGeographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-geographic-zone-list.controller:GeographicZoneListController
         * @name geographicZones
         * @type {Array}
         *
         * @description
         * Contains list of all geographic zones.
         */
        vm.geographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-geographic-zone-list.controller:GeographicZoneListController
         * @name name
         * @type {String}
         *
         * @description
         * Contains name param for searching geographic zones.
         */
        vm.name = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-geographic-zone-list.controller:GeographicZoneListController
         * @name parent
         * @type {String}
         *
         * @description
         * Contains geographic zone id param for searching geographic zones by parent.
         */
        vm.parent = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-geographic-zone-list.controller:GeographicZoneListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating GeographicZoneListController.
         */
        function onInit() {
            vm.filteredGeographicZones = filteredGeographicZones;
            vm.geographicZones = geographicZones;
            vm.parent = $stateParams.parent;
            vm.name = $stateParams.name;
        }

        /**
         * @ngdoc method
         * @methodOf admin-geographic-zone-list.controller:GeographicZoneListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.name = vm.name;
            stateParams.parent = vm.parent;
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.geographicZones', stateParams, {
                reload: true
            });
        }
    }

})();
