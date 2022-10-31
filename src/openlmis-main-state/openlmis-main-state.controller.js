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
     * @name openlmis-main-state:AlertModalController
     *
     * @description
     * Exposes data to the alert modal view.
     */
    angular
        .module('openlmis-main-state')
        .controller('SiglusOpenlmisMainStateController', SiglusOpenlmisMainStateController);

    SiglusOpenlmisMainStateController.$inject = [
        '$scope',
        'localStorageService',
        'homeImportAndExportService',
        '$rootScope'
    ];

    function SiglusOpenlmisMainStateController(
        $scope,
        localStorageService,
        homeImportAndExportService,
        $rootScope
    ) {
        var vm = this;
        $rootScope.$on('localMachine-online', function() {
            $scope.isOffline = false;
        });
        $rootScope.$on('localMachine-offline', function() {
            $scope.isOffline = true;
        });

        vm.isLocalMachine = false;
        vm.$onInit = function() {
            $scope.isOffline = false;
            // console.log(homeImportAndExportService.testString);
            $scope.testString = homeImportAndExportService.testString;
        };
        $scope.$watch(function() {
            return homeImportAndExportService.testString;
        }, function() {
            $scope.testString = homeImportAndExportService.testString;
        });
        $scope.$watch('$rootScope.isLocalMachine', function() {
            vm.isLocalMachine = $rootScope.isLocalMachine;
        });
    }

})();
