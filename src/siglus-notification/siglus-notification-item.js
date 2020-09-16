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
     * @ngdoc service
     * @name siglus-notification.Notification
     *
     * @description
     * Responsible for adding required methods for line items.
     */
    angular
        .module('siglus-notification')
        .factory('NotificationItem', notificationItem);

    notificationItem.$inject = ['openlmisDateFilter', 'REQUISITION_STATUS', 'ORDER_STATUS', 'NOTIFICATION_TYPE',
        '$state'];

    function notificationItem(openlmisDateFilter, REQUISITION_STATUS, ORDER_STATUS, NOTIFICATION_TYPE, $state) {

        var notificationMsgConfig = {
            UPDATE: {
                APPROVED: {
                    class: 'requisition',
                    label: 'notification.requisition',
                    content: 'notification.update.requisition.approved.message',
                    date: 'notification.update.requisition.approved.date'
                },
                SHIPPED: {
                    class: 'order',
                    label: 'notification.order',
                    content: 'notification.update.order.shipped.message',
                    date: 'notification.update.order.shipped.date'
                },
                RECEIVED: {
                    class: 'pod',
                    label: 'notification.pod',
                    content: 'notification.update.pod.received.message',
                    date: 'notification.update.pod.received.date'
                }
            },
            TODO: {
                REJECTED: {
                    class: 'requisition',
                    label: 'notification.requisition',
                    content: 'notification.todo.requisition.rejected.message',
                    date: 'notification.todo.requisition.rejected.date'
                },
                SUBMITTED: {
                    class: 'requisition',
                    label: 'notification.requisition',
                    content: 'notification.todo.requisition.submitted.message',
                    date: 'notification.todo.requisition.submitted.date'
                },
                AUTHORIZED: {
                    class: 'requisition',
                    label: 'notification.requisition',
                    content: 'notification.todo.requisition.toApprove.message',
                    date: 'notification.todo.requisition.toApprove.date'
                },
                IN_APPROVAL: {
                    class: 'requisition',
                    label: 'notification.requisition',
                    content: 'notification.todo.requisition.toApprove.message',
                    date: 'notification.todo.requisition.toApprove.date'
                },
                APPROVED: {
                    class: 'requisition',
                    label: 'notification.requisition',
                    content: 'notification.todo.requisition.approved.message',
                    date: 'notification.todo.requisition.approved.date'
                },
                ORDERED: {
                    class: 'order',
                    label: 'notification.order',
                    content: 'notification.todo.order.ordered.message',
                    date: 'notification.todo.order.ordered.date'
                },
                SHIPPED: {
                    class: 'pod',
                    label: 'notification.pod',
                    content: 'notification.todo.pod.shipped.message',
                    date: 'notification.todo.pod.shipped.date'
                }
            }
        };

        NotificationItem.prototype.navigate = navigate;

        return NotificationItem;

        function NotificationItem(notificationItem) {
            angular.copy(notificationItem, this);

            this.createdDate = openlmisDateFilter(new Date(notificationItem.createdDate));
            this.requisitionSubmittedDate = notificationItem.requisitionSubmittedDate ?
                openlmisDateFilter(new Date(notificationItem.requisitionSubmittedDate)) : null;
            this.config = notificationMsgConfig[notificationItem.type][notificationItem.status];
        }

        function navigate() {
            if (this.type === NOTIFICATION_TYPE.TODO) {
                todoNavigate(this);
            }
            if (this.type === NOTIFICATION_TYPE.UPDATE) {
                updateNavigate(this);
            }
        }

        function todoNavigate(notificationItem) {
            if (notificationItem.status === REQUISITION_STATUS.APPROVED) {
                goToConvertOrder();
            } else if (notificationItem.status === ORDER_STATUS.ORDERED) {
                goToShipment(notificationItem);
            } else if (notificationItem.status === ORDER_STATUS.SHIPPED) {
                goToPOD(notificationItem);
            } else {
                goToRequisition(notificationItem);
            }
        }

        function updateNavigate(notificationItem) {
            if (notificationItem.status === REQUISITION_STATUS.APPROVED) {
                goToHistory(notificationItem);
            } else {
                goToPOD(notificationItem);
            }
        }

        function goToRequisition(notificationItem) {
            $state.go('openlmis.requisitions.requisition.fullSupply', {
                rnr: notificationItem.referenceId
            });
        }

        function goToHistory(notificationItem) {
            $state.go('openlmis.requisitions.history', {
                rnr: notificationItem.referenceId
            });
        }

        function goToConvertOrder() {
            $state.go('openlmis.requisitions.convertToOrder');
        }

        function goToShipment(notificationItem) {
            $state.go('openlmis.orders.shipmentView', {
                id: notificationItem.referenceId
            });
        }

        function goToPOD(notificationItem) {
            $state.go('openlmis.orders.podManage.podView', {
                podId: notificationItem.referenceId
            });
        }
    }

})();
