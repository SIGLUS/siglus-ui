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
        .module('siglus-location-status-view')
        .config(config);

    config.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function config($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.locationManagement.locationStatus', {
            url: '/location-status?pageNumber&pageSize&keyword',
            label: 'locationManagement.locationStatus',
            priority: 1,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationStatusController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-status-view/siglus-location-status-view.html'
                }
            },
            params: {
                pageNumber: '0',
                pageSize: '20',
                keyword: undefined
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW],
            resolve: {
                user: function(authorizationService, $stateParams) {
                    if ($stateParams.user) {
                        return $stateParams.user;
                    }
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                locationStatus: function(SiglusLocationStatusService, paginationService, $stateParams, facility) {
                    return SiglusLocationStatusService.getAllLocationInfo(facility.id);
                },
                displayLocationStatus: function(locationStatus) {
                    return locationStatus;
                    //  paginationFactory, paginationService
                    // return paginationService.registerList(null, $stateParams, function() {
                    //     return locationInfos;
                    // }, {
                    //     customPageParamName: 'pageNumber',
                    //     customSizeParamName: 'pageSize'
                    // });
                }
            }
        });
    }
})();
