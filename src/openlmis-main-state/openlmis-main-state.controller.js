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
        'OpenlmisMainStateService',
        '$rootScope',
        'offlineService'

    ];

    function SiglusOpenlmisMainStateController(
        $scope,
        localStorageService,
        OpenlmisMainStateService,
        $rootScope,
        offlineService
    ) {
        var vm = this;
        var IS_OFFLINE = 'IS_OFFLINE';
        $rootScope.$on('localMachine-online', function() {
            $scope.isOffline = false;
            localStorageService.add(IS_OFFLINE, 'false');
        });
        $rootScope.$on('localMachine-offline', function() {
            $scope.isOffline = true;
            localStorageService.add(IS_OFFLINE, 'true');
        });

        $rootScope.isLocalMachine = undefined;
        vm.$onInit = function() {
            $scope.isOffline = localStorageService.get(IS_OFFLINE)
                ? localStorageService.get(IS_OFFLINE) === 'true' : false;
            $scope.testString = OpenlmisMainStateService.testString;
            if (vm.isLocalMachine === undefined) {
                OpenlmisMainStateService.getMachineType().then(function(res) {
                    var isLocalMachine = Boolean(!_.get(res, ['data', 'onlineWeb']));
                    vm.isLocalMachine = isLocalMachine;
                    $rootScope.isLocalMachine = isLocalMachine;
                    if (vm.isLocalMachine) {
                        $rootScope.$emit('isLocationMachine');
                        localStorageService.add('isLocalMachine', true);
                        vm.handleIfLocalMachine();
                    } else {
                        localStorageService.add('isLocalMachine', false);
                    }
                });
            } else if (vm.isLocalMachine) {
                vm.handleIfLocalMachine();
            }

        };

        vm.handleIfLocalMachine = function() {
            var isOffline = offlineService.isOffline();
            if ($rootScope.isLocalMachine) {
                if ($rootScope.timer === undefined) {
                    $rootScope.timer = setInterval(function() {
                        if (!isOffline) {
                            OpenlmisMainStateService.getLocalMachineBaseInfo()
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
                }

                $rootScope.$on('$stateChangeStart', function(_e, _toState) {
                    if (_toState.name.contains('auth')) {
                        clearInterval($rootScope.timer);
                        $rootScope.timer = undefined;
                    }
                });
            }
        };

        $scope.$watch(function() {
            return OpenlmisMainStateService.testString;
        }, function() {
            $scope.testString = OpenlmisMainStateService.testString;
        });
    }

})();
