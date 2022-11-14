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
        '$rootScope',
        'offlineService',
        'isLocalMachine'
    ];

    function SiglusOpenlmisMainStateController(
        $scope,
        localStorageService,
        homeImportAndExportService,
        $rootScope,
        offlineService,
        isLocalMachine
    ) {
        var vm = this;
        $rootScope.$on('localMachine-online', function() {
            $scope.isOffline = false;
        });
        $rootScope.$on('localMachine-offline', function() {
            $scope.isOffline = true;
        });

        $rootScope.isLocalMachine = undefined;
        vm.$onInit = function() {
            $scope.isOffline = false;
            $scope.testString = homeImportAndExportService.testString;
            $rootScope.isLocalMachine = isLocalMachine;
            var isOffline = offlineService.isOffline();
            if ($rootScope.isLocalMachine) {
                var timer = setInterval(function() {
                    if (!isOffline) {
                        homeImportAndExportService.getLocalMachineBaseInfo()
                            .then(function(res) {
                                var data = res.data;
                                var localMachineVersion = _.get(data, 'localMachineVersion');
                                var connectedOnlineWeb = _.get(data, 'connectedOnlineWeb');
                                if (connectedOnlineWeb) {
                                    $rootScope.$emit('localMachine-online', {
                                        localMachineVersion: localMachineVersion
                                    });
                                } else {
                                    $rootScope.$emit('localMachine-offline');
                                }
                            })
                            .catch(function(error) {
                                console.log(error);

                                $rootScope.$emit('localMachine-offline');
                            });
                    }
                }, 5000);

                $rootScope.$on('$stateChangeStart', function(_e, _toState) {
                    if (_.contains(_toState.name, 'auth')) {
                        clearInterval(timer);
                    }
                });
            }
        };
        $scope.$watch(function() {
            return homeImportAndExportService.testString;
        }, function() {
            $scope.testString = homeImportAndExportService.testString;
        });
    }

})();
