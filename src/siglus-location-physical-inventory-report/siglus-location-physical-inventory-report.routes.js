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
        .module('siglus-location-physical-inventory-report')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider) {
        // console.log(document.body.);
        $stateProvider.state('openlmis.locationManagement.physicalInventory.report', {
            url: '/report',
            showInNavigation: false,
            label: 'printTemplate.title',
            priority: 1,
            views: {
                '@openlmis': {
                    controller: 'siglusLocationPhysicalInventoryReport',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-location-physical-inventory-report/siglus-location-physical-inventory-report.html'
                }
            },
            resolve: {
                hideBreadcrumb: function() {
                    console.log(document.getElementsByClassName('breadcrumb')[0]);
                }
            }
        });
    }

})();
