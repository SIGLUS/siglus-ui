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

describe('siglusNotificationService', function() {

    var siglusNotificationService, $rootScope, $httpBackend, openlmisUrlFactory;

    beforeEach(function() {
        module('siglus-notification');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            siglusNotificationService = $injector.get('siglusNotificationService');
            openlmisUrlFactory = $injector.get('openlmisUrlFactory');
        });
    });

    describe('getNotifications', function() {

        var notifications = [{
            id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
            emergency: false,
            sourceFacilityName: 'DPM NAMPULA',
            referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
            status: 'AUTHORIZED'
        }];

        beforeEach(function() {

            $httpBackend.whenGET(openlmisUrlFactory('/api/siglusapi/notifications'))
                .respond(200, notifications);
        });

        it('should call /api/siglusapi/notifications endpoint', function() {
            $httpBackend.expectGET(openlmisUrlFactory('/api/siglusapi/notifications'));

            siglusNotificationService.getNotifications();

            $httpBackend.flush();
        });

        it('should return response', function() {
            var result;
            siglusNotificationService.getNotifications()
                .then(function(notifications) {
                    result = notifications;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(notifications));
        });
    });

    describe('viewNotification', function() {

        var notification = {
            id: '24bb436d-e917-41e6-83c2-29410bcc1a63',
            emergency: false,
            sourceFacilityName: 'DPM NAMPULA',
            referenceId: 'dea5e3b9-6ad0-4d82-8266-e1f7bb2fa575',
            status: 'AUTHORIZED'
        };

        beforeEach(function() {
            $httpBackend.whenPATCH(openlmisUrlFactory('/api/siglusapi/notifications/' + notification.id))
                .respond(200, {});
        });

        it('should call /api/siglusapi/notifications/{id} endpoint', function() {
            $httpBackend.expectPATCH(openlmisUrlFactory('/api/siglusapi/notifications/' + notification.id));

            var result;
            siglusNotificationService.viewNotification(notification.id).then(function(response) {
                result = response;
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson({}));
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
