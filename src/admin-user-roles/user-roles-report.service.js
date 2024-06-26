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
     * @name UserRolesReportService
     *
     * @description
     * Responsible for fetching user roles report data from server.
     */
    angular
        .module('admin-user-roles')
        .service('UserRolesReportService', service);

    service.$inject = ['$resource', '$http', 'openlmisUrlFactory', 'ROLE_TYPES'];

    function service($resource, $http, openlmisUrlFactory, ROLE_TYPES) {
        var resource = $resource(
            openlmisUrlFactory('/api/siglusapi/users/:id/reportView'), {}, {
                getUserReportViewRoles: {
                    method: 'GET',
                    isArray: true
                },
                saveUserReportViewRoles: {
                    method: 'POST'
                },
                getAvailableGeographicList: {
                    method: 'GET',
                    url: openlmisUrlFactory('/api/siglusapi/geographicInfo'),
                    isArray: true
                }
            }
        );

        this.getAvailableGeographicList = getAvailableGeographicList;
        this.getUserGeographicList = getUserGeographicList;
        this.saveUserReportViewRoles = saveUserReportViewRoles;

        function getAvailableGeographicList() {
            return resource.getAvailableGeographicList().$promise;
        }

        function getUserGeographicList(userId) {
            return resource.getUserReportViewRoles({
                id: userId
            }).$promise;
        }

        function saveUserReportViewRoles(user) {
            var geographicList = [];
            var reportViewRoleAssignments = user.getRoleAssignments(ROLE_TYPES.REPORTS);
            if (!_.isEmpty(reportViewRoleAssignments)) {
                var reportViewRoleAssignment = reportViewRoleAssignments[0];
                geographicList = reportViewRoleAssignment.reportViewGeographicList;
            }

            return resource.saveUserReportViewRoles({
                id: user.id
            }, geographicList).$promise;
        }
    }
})();
