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

    angular
        .module('siglus-notification')
        .controller('SiglusNotificationController', controller);

    controller.$inject = ['$state', 'loadingModalService', 'alertService', 'siglusNotificationService',
        'NotificationItem', 'NOTIFICATION_TYPE'];

    function controller($state, loadingModalService, alertService, siglusNotificationService, NotificationItem,
                        NOTIFICATION_TYPE) {
        var vm = this;

        vm.showDropdown = false;
        vm.notificationItems = [];
        vm.notifications = [{
            type: NOTIFICATION_TYPE.TODO,
            icon: 'fa-check-square',
            msg: 'notification.type.todo',
            title: 'notification.todo.title',
            showDropdown: false
        }, {
            type: NOTIFICATION_TYPE.UPDATE,
            icon: 'fa-bell',
            msg: 'notification.type.update',
            title: 'notification.update.title',
            showDropdown: false
        }];
        vm.notification = undefined;

        vm.getNotifications = getNotifications;
        vm.hideDropdown = hideDropdown;
        vm.viewNotification = viewNotification;

        function getNotifications(notification) {
            vm.notification = notification;
            loadingModalService.open();
            siglusNotificationService.getNotifications(notification.type)
                .then(function(notifications) {
                    vm.notificationItems = _.map(notifications, function(notification) {
                        return new NotificationItem(notification);
                    });
                    vm.notification.showDropdown = true;
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }

        function hideDropdown() {
            vm.notification.showDropdown = false;
        }

        function viewNotification(notificationItem) {
            siglusNotificationService.viewNotification(notificationItem.id)
                .then(function() {
                    notificationItem.navigate();
                })
                .catch(function(error) {
                    if (error.status === 409) {
                        alertService.error('notification.processed');
                    }
                    if (error.status === 410) {
                        alertService.error('notification.viewed');
                    }
                });
        }
    }

})();
