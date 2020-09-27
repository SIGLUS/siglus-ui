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
        alertService, messageService, mockNotification, NotificationItem, currentUserService,
        authorizationService, confirmService;

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
            NotificationItem = $injector.get('NotificationItem');
            currentUserService = $injector.get('currentUserService');
            authorizationService = $injector.get('authorizationService');
            confirmService = $injector.get('confirmService');
        });

        mockNotification = {
            type: 'TODO',
            id: 'b0b08344-01a2-469c-9fc0-bdbca6b6dc52',
            emergency: true,
            sourceFacilityName: 'CS Molumbo',
            referenceId: 'b8218a82-e419-480f-b610-aa662db6e010',
            status: 'SHIPPED',
            createdDate: new Date()
        };

        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(messageService, 'get');
        spyOn(siglusNotificationService, 'getNotifications').andReturn($q.resolve([mockNotification]));
        spyOn(siglusNotificationService, 'viewNotification').andReturn($q.resolve());
        spyOn($state, 'go').andReturn($q.resolve());
        spyOn($state, 'get').andReturn({
            accessRights: []
        });
        spyOn(NotificationItem.prototype, 'navigate');
        spyOn(alertService, 'error');
        spyOn(currentUserService, 'getUserInfo').andReturn($q.resolve({}));
        spyOn(authorizationService, 'hasRights').andReturn(false);
        spyOn(confirmService, 'confirm').andReturn($q.resolve());

        vm = $controller('SiglusNotificationController');
    });

    describe('getNotifications', function() {

        it('should get notifications if API return notification list', function() {
            vm.getNotifications({});
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(vm.notificationItems).toEqual([new NotificationItem(mockNotification)]);
        });

        it('should set showDropdown to true when get resolve response', function() {
            vm.getNotifications({});
            $rootScope.$apply();

            expect(vm.notification.showDropdown).toBe(true);
        });

        it('should close loading modal if API reject error', function() {
            siglusNotificationService.getNotifications.andReturn($q.reject());
            vm.getNotifications({});
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(vm.notificationItems).toEqual([]);
        });
    });

    describe('hideDropdown', function() {

        it('should set showDropdown to false', function() {
            vm.notification = {
                showDropdown: true
            };
            vm.hideDropdown();

            expect(vm.notification.showDropdown).toBe(false);
        });
    });

    describe('viewNotification', function() {

        it('should call navigate when success view notification', function() {
            var notification = new NotificationItem(mockNotification);
            vm.viewNotification(notification);
            $rootScope.$apply();

            expect(notification.navigate).toHaveBeenCalled();
        });

        it('should alert viewed message if API reject 409', function() {
            siglusNotificationService.viewNotification.andReturn($q.reject({
                status: 409
            }));
            vm.viewNotification({});
            $rootScope.$apply();

            expect(alertService.error).toHaveBeenCalledWith('notification.processed');
        });

        it('should popup confirm when canInitialInventory is true and do not have right', function() {
            currentUserService.getUserInfo.andReturn($q.resolve({
                canInitialInventory: true
            }));
            vm.viewNotification({});
            $rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith('stockInitialDiscard.initialInventory',
                'stockInitialInventory.initialInventory');

            expect(alertService.error).toHaveBeenCalledWith('openlmisAuth.authorization.error',
                'stockInitialInventory.authorization.message');
        });

        it('should route to initial inventory when canInitialInventory is true and has right', function() {
            currentUserService.getUserInfo.andReturn($q.resolve({
                canInitialInventory: true
            }));
            authorizationService.hasRights.andReturn(true);
            vm.viewNotification({});
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.initialInventory');
        });
    });
});
