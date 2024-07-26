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
     * @name admin-orderable-list.controller:OrderableListController
     *
     * @description
     * Controller for managing orderables list screen.
     */
    angular
        .module('admin-orderable-list')
        .controller('OrderableListController', controller);

    controller.$inject = ['$state', '$stateParams', 'orderables', 'programs', 'canAdd'];

    function controller($state, $stateParams, orderables, programs, canAdd) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.cancelFilter = cancelFilter;

        /**
         * @ngdoc property
         * @propertyOf admin-orderable-list.controller:OrderableListController
         * @name orderables
         * @type {Array}
         *
         * @description
         * Contains filtered orderables.
         */
        vm.orderables = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-orderable-list.controller:OrderableListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Contains list of all programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-orderable-list.controller:OrderableListController
         * @name code
         * @type {String}
         *
         * @description
         * Contains code param for searching orderables.
         */
        vm.code = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-orderable-list.controller:OrderableListController
         * @name name
         * @type {String}
         *
         * @description
         * Contains name param for searching orderables.
         */
        vm.name = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-orderable-list.controller:OrderableListController
         * @name program
         * @type {String}
         *
         * @description
         * Contains program code param for searching orderables.
         */
        vm.program = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-orderable-list.controller:OrderableListController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating OrderableListController.
         */
        function onInit() {
            vm.orderables = orderables;
            vm.programs = programs;
            vm.code = $stateParams.code;
            vm.name = $stateParams.name;
            vm.program = $stateParams.program;
            vm.canAdd = canAdd;
        }

        /**
         * @ngdoc method
         * @methodOf admin-orderable-list.controller:OrderableListController
         * @name search
         *
         * @description
         * Reloads page with new search parameters.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.code = vm.code;
            stateParams.name = vm.name;
            stateParams.program = vm.program;
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.orderables', stateParams, {
                reload: true
            });
        }

        function cancelFilter() {
            var stateParams = angular.copy($stateParams);
            stateParams.code = '';
            stateParams.name = '';
            stateParams.program = '';
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.administration.orderables', stateParams, {
                reload: true
            });
        }
    }

})();
