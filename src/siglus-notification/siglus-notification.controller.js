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

    controller.$inject = ['$state', 'loadingModalService', 'alertService', 'REQUISITION_STATUS', 'ORDER_STATUS',
        'messageService', 'siglusNotificationService'];

    function controller($state, loadingModalService, alertService, REQUISITION_STATUS, ORDER_STATUS,
                        messageService, siglusNotificationService) {
        var vm = this;

        vm.showDropdown = false;
        vm.notifications = [];

        vm.getNotifications = getNotifications;
        vm.hideDropdown = hideDropdown;
        vm.getNotificationMsg = getNotificationMsg;
        vm.viewNotification = viewNotification;
        vm.hideDropdown = hideDropdown;

        function getNotifications() {
            loadingModalService.open();
            siglusNotificationService.getNotifications()
                .then(function(notifications) {
                    vm.notifications = notifications;
                    vm.showDropdown = true;
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }

        function hideDropdown() {
            vm.showDropdown = false;
        }

        function getNotificationMsg(notification) {
            var result = '';
            var msg = 'notification.message.requisition';
            if (isOrder(notification)) {
                msg = 'notification.message.order';
            } else if (isPOD(notification)) {
                msg = 'notification.message.POD';
            }
            if (notification.emergency) {
                result = messageService.get('notification.emergency');
            }
            result += messageService.get(msg, {
                facility: notification.sourceFacilityName
            });
            return result;
        }

        function isOrder(notification) {
            return notification.status === ORDER_STATUS.ORDERED || notification.status === ORDER_STATUS.FULFILLING;
        }

        function isPOD(notification) {
            return notification.status === ORDER_STATUS.SHIPPED;
        }

        function navigate(notification) {
            if (notification.status === REQUISITION_STATUS.APPROVED) {
                $state.go('openlmis.requisitions.convertToOrder');
            } else if (isOrder(notification)) {
                $state.go('openlmis.orders.shipmentView', {
                    id: notification.referenceId
                });
            } else if (isPOD(notification)) {
                $state.go('openlmis.orders.podManage.podView', {
                    podId: notification.referenceId
                });
            } else {
                $state.go('openlmis.requisitions.requisition.fullSupply', {
                    rnr: notification.referenceId
                });
            }
        }

        function viewNotification(notification) {
            siglusNotificationService.viewNotification(notification.id)
                .then(function() {
                    navigate(notification);
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
