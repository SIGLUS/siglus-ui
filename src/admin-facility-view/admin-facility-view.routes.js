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

    angular.module('admin-facility-view').config(routes);

    routes.$inject = ['$stateProvider', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, ADMINISTRATION_RIGHTS) {

        $stateProvider.state('openlmis.administration.facilities.edit', {
            label: 'adminFacilityView.editFacility',
            url: '/:id',
            accessRights: [ADMINISTRATION_RIGHTS.FACILITIES_MANAGE],
            views: {
                '@openlmis': {
                    controller: 'FacilityViewController',
                    templateUrl: 'admin-facility-view/facility-view.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                facility: function(FacilityRepository, $stateParams) {
                    return new FacilityRepository().get($stateParams.id);
                },
                facilityTypes: function(facilityTypeService) {
                    return facilityTypeService.query({
                        active: true
                    })
                        .then(function(response) {
                            return response.content;
                        });
                },
                geographicZones: function($q, geographicZoneService) {
                    var deferred = $q.defer();

                    geographicZoneService.getAll().then(function(response) {
                        deferred.resolve(response.content);
                    }, deferred.reject);

                    return deferred.promise;
                },
                facilityOperators: function(facilityOperatorService) {
                    return facilityOperatorService.getAll();
                },
                programs: function(programService) {
                    // SIGLUS-REFACTOR: get true program
                    return programService.getTruePrograms();
                    //SIGLUS-REFACTOR: ends here
                }
            }
        });
    }
})();
