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
     * @name admin-supervisory-node-list.controller:SupervisoryNodeListController
     *
     * @description
     * Controller for managing supervisory node list screen.
     */
    angular
        .module('admin-supervisory-node-list')
        .controller('SupervisoryNodeListController', controller);

    controller.$inject = [
        '$state', '$stateParams', 'supervisoryNodes', 'geographicZones', 'facilitiesMap', 'supervisoryNodesMap'
    ];

    function controller($state, $stateParams, supervisoryNodes, geographicZones, facilitiesMap, supervisoryNodesMap) {

        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;

        /**
         * @ngdoc property
         * @propertyOf admin-supervisory-node-list.controller:SupervisoryNodeListController
         * @name supervisoryNodes
         * @type {Array}
         *
         * @description
         * Contains filtered supervisory nodes.
         */
        vm.supervisoryNodes = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supervisory-node-list.controller:SupervisoryNodeListController
         * @name geographicZones
         * @type {Array}
         *
         * @description
         * Contains all geographic zones.
         */
        vm.geographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supervisory-node-list.controller:SupervisoryNodeListController
         * @name supervisoryNodeName
         * @type {String}
         *
         * @description
         * Contains name param for searching supervisory nodes.
         */
        vm.supervisoryNodeName = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supervisory-node-list.controller:SupervisoryNodeListController
         * @name geographicZone
         * @type {String}
         *
         * @description
         * Contains geographic zone UUID param for searching supervisory nodes.
         */
        vm.geographicZone = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-supervisory-node-edit.controller:SupervisoryNodeEditController
         * @type {Object}
         * @name facilitiesMap
         *
         * @description
         * Map where the key is the facility ID and value is the facility object.
         */
        vm.facilitiesMap = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-supervisory-node-list.controller:SupervisoryNodeListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating SupervisoryNodeListController.
         */
        function onInit() {
            vm.supervisoryNodes = supervisoryNodes;
            vm.geographicZones = geographicZones;
            vm.supervisoryNodeName = $stateParams.name;
            vm.geographicZone = $stateParams.zoneId;
            vm.facilitiesMap = facilitiesMap;
            vm.supervisoryNodesMap = supervisoryNodesMap;
        }

        /**
         * @ngdoc method
         * @methodOf admin-supervisory-node-list.controller:SupervisoryNodeListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.name = vm.supervisoryNodeName;
            stateParams.zoneId = vm.geographicZone;
            // SIGLUS-REFACTOR: starts here
            stateParams.nodesPage = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.supervisoryNodes', stateParams, {
                reload: true
            });
        }
    }
})();
