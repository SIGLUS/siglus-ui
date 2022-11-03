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
        .module('shipment-view-report')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.orders.fulfillment.report', {
            url: '/report?id',
            showInNavigation: false,
            label: 'shipmentViewReport.title',
            priority: 1,
            views: {
                '@openlmis': {
                    controller: 'ShipmentViewReport',
                    controllerAs: 'vm',
                    templateUrl: 'shipment-view-report/shipment-view-report.html'
                }
            },
            params: {
                id: undefined
            },
            resolve: {
                displayTableLineItems: function(localStorageService) {
                    return localStorageService.get('shipmentViewData');
                },
                locations: function(localStorageService) {
                    return JSON.parse(localStorageService.get('locations'));
                },
                pickPackInfo: function(shipmentViewService, $stateParams) {
                    return shipmentViewService.getPickPackInfo($stateParams.id);
                }
            }
        });
    }

})();
