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

describe('shipmentViewService', function() {

    // #287: add alertService
    var shipmentRepositoryMock, shipmentFactoryMock, loadingModalService, $state,
        notificationService, stateTrackerService, confirmService, alertService,
        orderService, siglusShipmentConfirmModalService;
    // #287: ends here

    beforeEach(function() {
        module('order');
        module('siglus-alert-confirm-modal');
        module('shipment-view', function($provide) {
            shipmentRepositoryMock = jasmine.createSpyObj('shipmentRepository', [
                'getByOrderId', 'getDraftByOrderId', 'createDraft'
            ]);
            $provide.factory('ShipmentRepository', function() {
                return function() {
                    return shipmentRepositoryMock;
                };
            });

            shipmentFactoryMock = jasmine.createSpyObj('shipmentFactory', [
                'buildFromOrder'
            ]);
            $provide.factory('ShipmentFactory', function() {
                return function() {
                    return shipmentFactoryMock;
                };
            });
        });

        inject(function($injector) {
            siglusShipmentConfirmModalService = $injector.get('siglusShipmentConfirmModalService');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            stateTrackerService = $injector.get('stateTrackerService');
            $state = $injector.get('$state');
            confirmService = $injector.get('confirmService');
            alertService = $injector.get('alertService');
            orderService = $injector.get('orderService');
        });

        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(notificationService, 'success');
        spyOn(notificationService, 'error');
        spyOn(siglusShipmentConfirmModalService, 'confirm');
        spyOn(stateTrackerService, 'goToPreviousState');
        spyOn($state, 'reload');
        spyOn(confirmService, 'confirm');
        spyOn(confirmService, 'confirmDestroy');
        // #287: Warehouse clerk can skip some products in order
        spyOn(alertService, 'error');
        spyOn(orderService, 'getStatus');
        // #287: ends here
    });

});
