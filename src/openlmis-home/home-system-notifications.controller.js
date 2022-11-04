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
     * @name home-system-notifications.controller:HomeSystemNotificationsController
     *
     * @description
     * Exposes data to the system notifications view on Home Page.
     */
    angular
        .module('openlmis-home')
        .controller('HomeSystemNotificationsController', controller);

    controller.$inject = ['homePageSystemNotifications', 'offlineService', 'homeImportAndExportService',
        'loadingModalService', 'notificationService', 'alertService', 'messageService', 'localStorageService',
        'isLocalMachine', 'moment', '$rootScope'];

    function controller(homePageSystemNotifications, offlineService, homeImportAndExportService,
                        loadingModalService, notificationService, alertService, messageService,
                        localStorageService, isLocalMachine, moment, $rootScope) {

        var vm = this;

        var LAST_SYNC_TIME = 'LAST_SYNC_TIME';
        vm.$onInit = onInit;
        vm.localMachineVersion = undefined;
        vm.connectedOnlineWeb = true;
        vm.lastSyncTime = localStorageService.get(LAST_SYNC_TIME);
        vm.syncMessage = '';
        vm.errors = [];
        /**
         * @ngdoc property
         * @propertyOf home-system-notifications.controller:HomeSystemNotificationsController
         * @type {Object}
         * @name homePageSystemNotifications
         *
         * @description
         * System notifications which will be displayed to users.
         */
        vm.homePageSystemNotifications = undefined;
        /**
         * @ngdoc property
         * @propertyOf home-system-notifications.controller:HomeSystemNotificationsController
         * @type {boolean}
         * @name isOffline
         *
         * @description
         * Indicates offline connection.
         */
        vm.isOffline = undefined;
        vm.isLocalMachine = isLocalMachine;
        /**
         * @ngdoc method
         * @methodOf home-system-notifications.controller:HomeSystemNotificationsController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating HomeSystemNotificationsController.
         */
        function onInit() {
            vm.isOffline = offlineService.isOffline();
            vm.homePageSystemNotifications = homePageSystemNotifications;
            $rootScope.isLocalMachine = isLocalMachine;
            if (isLocalMachine) {
                var timer = setInterval(function() {
                    if (!vm.isOffline) {
                        homeImportAndExportService.getLocalMachineBaseInfo()
                            .then(function(res) {
                                var data = res.data;
                                vm.localMachineVersion = _.get(data, 'localMachineVersion');
                                vm.connectedOnlineWeb = _.get(data, 'connectedOnlineWeb');
                                if (vm.connectedOnlineWeb) {
                                    $rootScope.$emit('localMachine-online');
                                } else {
                                    $rootScope.$emit('localMachine-offline');
                                }
                            })
                            .catch(function(error) {
                                console.log(error);
                                vm.connectedOnlineWeb = false;
                                $rootScope.$emit('localMachine-offline');
                            });
                    }
                }, 5000);

                $rootScope.$on('$stateChangeStart', function() {
                    clearInterval(timer);
                });
            }
        }
        $rootScope.$on('openlmis.offline', function() {
            vm.connectedOnlineWeb = false;
            vm.isOffline = true;
            $rootScope.$emit('localMachine-offline');
        });
        $rootScope.$on('openlmis.online', function() {
            vm.connectedOnlineWeb = true;
            vm.isOffline = false;
            $rootScope.$emit('localMachine-online');
        });

        vm.file = undefined;

        vm.import = function() {
            if (vm.file) {
                console.log(vm.file);
                loadingModalService.open();
                return homeImportAndExportService.importData(vm.file).then(function() {
                    notificationService.success('openlmisHome.importSuccess');
                })
                    .catch(function(error) {
                        alertService.error(messageService.get(error.data.messageKey));
                    })
                    .finally(loadingModalService.close);
            }
        };

        vm.export = function() {
            loadingModalService.open();
            return homeImportAndExportService.exportData().then(function(response) {
                var fileName = response.headers('content-disposition').split('filename=')[1].split(';')[0];
                var contentType = response.headers('content-type');

                var linkElement = document.createElement('a');
                try {
                    var blob = new Blob([response.data], {
                        type: contentType
                    });
                    var url = window.URL.createObjectURL(blob);

                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute('download', fileName);

                    var clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: false
                    });
                    linkElement.dispatchEvent(clickEvent);
                    notificationService.success('openlmisHome.exportSuccess');
                } catch (ex) {
                    console.log('export link exception: ', ex);
                }
            })
                .catch(function(error) {
                    var decoder = new TextDecoder('utf-8');
                    var unit8 = new window.Uint8Array(error.data);
                    var decoded = JSON.parse(decoder.decode(unit8));
                    console.log('decoded error', decoded);
                    alertService.error(messageService.get(decoded.messageKey));
                })
                .finally(loadingModalService.close);
        };

        vm.sync = function() {
            homeImportAndExportService.getSyncResults()
                .then(function(res) {
                    var errors = _.get(res, ['data', 'errors']);
                    if (errors && errors.length > 0) {
                        vm.syncMessage = 'openlmisHome.syncedFailed';
                        vm.errors = errors;
                    } else {
                        vm.syncMessage = 'openlmisHome.syncedSuccessfully';
                        vm.lastSyncTime = moment(_.get(res, ['data', 'latestSyncedTime']))
                            .format('YYYY-MM-DD HH:mm:ss');
                        localStorageService.add(LAST_SYNC_TIME, vm.lastSyncTime);
                    }
                });
        };

        vm.getCurrentTime = function() {
            return moment().format('YYYY-MM-DD HH:mm:ss');
        };
    }

})();
