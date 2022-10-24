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
        'isLocalMachine'];

    function controller(homePageSystemNotifications, offlineService, homeImportAndExportService,
                        loadingModalService, notificationService, alertService, messageService,
                        localStorageService, isLocalMachine) {

        var vm = this;

        vm.$onInit = onInit;
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
            if (isLocalMachine) {
                var timer = setInterval(function() {
                    homeImportAndExportService.getLocalMachineBaseInfo()
                        .then(function(res) {
                            console.log('getLocalMachineBaseInfo: ', res);
                        })
                        .catch(function() {
                            clearInterval(timer);
                        });
                }, 5000);
            }
        }

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
                    console.log('getSyncResults: ', res);
                });
        };
    }

})();
