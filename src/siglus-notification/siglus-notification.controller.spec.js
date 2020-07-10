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

describe('SiglusNotificationController', function() {

    var vm, $q, $controller, $rootScope, $state, loadingModalService, siglusNotificationService,
        alertService, messageService;

    beforeEach(function() {
        module('siglus-notification');

        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            loadingModalService = $injector.get('loadingModalService');
            siglusNotificationService = $injector.get('siglusNotificationService');
            alertService = $injector.get('alertService');
            messageService = $injector.get('messageService');
        });

        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(messageService, 'get');
        spyOn(siglusNotificationService, 'getNotifications').andReturn($q.resolve([{
            id: 'b0b08344-01a2-469c-9fc0-bdbca6b6dc52',
            emergency: true,
            sourceFacilityName: 'CS Molumbo',
            referenceId: 'b8218a82-e419-480f-b610-aa662db6e010',
            status: 'SHIPPED'
        }]));
        spyOn(siglusNotificationService, 'viewNotification').andReturn($q.resolve());
        spyOn($state, 'go').andReturn($q.resolve());
        spyOn(alertService, 'error');

        vm = $controller('SiglusNotificationController');
    });

    describe('getNotifications', function() {

        it('should get notifications if API return notification list', function() {
            vm.getNotifications();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(vm.notifications).toEqual([{
                id: 'b0b08344-01a2-469c-9fc0-bdbca6b6dc52',
                emergency: true,
                sourceFacilityName: 'CS Molumbo',
                referenceId: 'b8218a82-e419-480f-b610-aa662db6e010',
                status: 'SHIPPED'
            }]);
        });

        it('should set showDropdown to true when get resolve response', function() {
            vm.getNotifications();
            $rootScope.$apply();

            expect(vm.showDropdown).toBe(true);
        });

        it('should close loading modal if API reject error', function() {
            siglusNotificationService.getNotifications.andReturn($q.reject());
            vm.getNotifications();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(vm.notifications).toEqual([]);
        });
    });

    describe('hideDropdown', function() {

        it('should set showDropdown to false', function() {
            vm.showDropdown = true;
            vm.hideDropdown();

            expect(vm.showDropdown).toBe(false);
        });
    });

    describe('getNotificationMsg', function() {

        it('should return requisition message', function() {
            vm.getNotificationMsg({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'AUTHORIZED'
            });

            expect(messageService.get.calls[0].args[0]).toBe('notification.emergency');
            expect(messageService.get.calls[1].args[0]).toBe('notification.message.requisition');
            expect(messageService.get.calls[1].args[1]).toEqual({
                facility: 'DPM NAMPULA'
            });
        });

        it('should return order message', function() {
            vm.getNotificationMsg({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'ORDERED'
            });

            expect(messageService.get.calls[0].args[0]).toBe('notification.emergency');
            expect(messageService.get.calls[1].args[0]).toBe('notification.message.order');
            expect(messageService.get.calls[1].args[1]).toEqual({
                facility: 'DPM NAMPULA'
            });
        });

        it('should return POD message', function() {
            vm.getNotificationMsg({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: false,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'SHIPPED'
            });

            expect(messageService.get).toHaveBeenCalledWith('notification.message.POD', {
                facility: 'DPM NAMPULA'
            });
        });
    });

    describe('viewNotification', function() {

        it('should navigate to requisition if status is AUTHORIZED', function() {
            vm.viewNotification({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'AUTHORIZED'
            });
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
                rnr: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575'
            });
        });

        it('should navigate to view shipment if status is ORDERED', function() {
            vm.viewNotification({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'ORDERED'
            });
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.orders.shipmentView', {
                id: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575'
            });
        });

        it('should navigate to view pod if status is SHIPPED', function() {
            vm.viewNotification({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'SHIPPED'
            });
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.orders.podManage.podView', {
                podId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575'
            });
        });

        it('should alert viewed message if API reject 409', function() {
            siglusNotificationService.viewNotification.andReturn($q.reject({
                status: 409
            }));
            vm.viewNotification({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'SHIPPED'
            });
            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith('notification.processed');
        });

        it('should alert processed message if API reject 410', function() {
            siglusNotificationService.viewNotification.andReturn($q.reject({
                status: 410
            }));
            vm.viewNotification({
                id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
                emergency: true,
                sourceFacilityName: 'DPM NAMPULA',
                referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
                status: 'SHIPPED'
            });
            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith('notification.viewed');
        });
    });
});
