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

describe('NotificationItem', function() {

    beforeEach(function() {
        module('siglus-notification');

        inject(function($injector) {
            this.openlmisDateFilter = $injector.get('openlmisDateFilter');
            this.REQUISITION_STATUS = $injector.get('REQUISITION_STATUS');
            this.ORDER_STATUS = $injector.get('ORDER_STATUS');
            this.NOTIFICATION_TYPE = $injector.get('NOTIFICATION_TYPE');
            this.$state = $injector.get('$state');
            this.NotificationItem = $injector.get('NotificationItem');
        });

        this.notification = new this.NotificationItem({
            createdDate: '2020-09-11T07:40:52.753Z',
            emergency: false,
            id: 'fa907bec-65d3-4892-9f31-06708118e5c4',
            processingPeriod: {
                endDate: '2020-03-31',
                id: 'a2d7768e-4218-4c7e-8afa-7e3844f5300b',
                name: '202003-multi',
                startDate: '2020-03-01'
            },
            referenceId: 'f433700a-1182-41a9-8dda-30cb1c1681c2',
            requestingFacility: null,
            requisitionSubmittedDate: null,
            status: 'SHIPPED',
            type: 'TODO'
        });
    });

    it('Should format createdDate', function() {
        expect(this.notification.createdDate).toBe('11/09/2020');
    });

    it('Should add notification config', function() {
        expect(this.notification.config).toEqual({
            class: 'pod',
            label: 'notification.pod',
            content: 'notification.todo.order.shipped.message',
            date: 'notification.todo.order.shipped.date'
        });
    });

    describe('navigate', function() {
        beforeEach(function() {
            spyOn(this.$state, 'go').andReturn();
        });

        it('Should route to convert to order when notification type is todo and status is approved', function() {
            this.notification.status = 'APPROVED';
            this.notification.navigate();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.convertToOrder');
        });

        it('Should route to shipment when notification type is todo and status is ORDERED', function() {
            this.notification.status = 'ORDERED';
            this.notification.navigate();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.orders.shipmentView', {
                id: 'f433700a-1182-41a9-8dda-30cb1c1681c2'
            });
        });

        it('Should route to POD when notification type is todo and status is SHIPPED', function() {
            this.notification.navigate();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.orders.podManage.podView', {
                podId: 'f433700a-1182-41a9-8dda-30cb1c1681c2'
            });
        });

        it('Should route to requisition when notification type is todo and status is SUBMITTED', function() {
            this.notification.status = 'SUBMITTED';
            this.notification.navigate();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
                rnr: 'f433700a-1182-41a9-8dda-30cb1c1681c2'
            });
        });

        it('Should route to POD when notification type is update and status is SHIPPED', function() {
            this.notification.navigate();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.orders.podManage.podView', {
                podId: 'f433700a-1182-41a9-8dda-30cb1c1681c2'
            });
        });

        it('Should route to requisition when notification type is update and status is APPROVED', function() {
            this.notification.status = 'APPROVED';
            this.notification.type = 'UPDATE';
            this.notification.navigate();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.history', {
                rnr: 'f433700a-1182-41a9-8dda-30cb1c1681c2'
            });
        });

    });
});
