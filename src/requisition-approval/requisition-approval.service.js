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
     * @name requisition-approval.requisitionApprovalService
     *
     * @description
     * Responsible for managing programs available to user on the Requisition Approve screen.
     */
    angular
        .module('requisition-approval')
        .service('requisitionApprovalService', requisitionApprovalService);

    requisitionApprovalService.$inject = [
        'programService', 'currentUserService', 'currentUserRolesService', '$q', 'REQUISITION_RIGHTS', 'LocalDatabase',
        '$resource', 'requisitionUrlFactory'
    ];

    function requisitionApprovalService(programService, currentUserService, currentUserRolesService, $q,
                                        REQUISITION_RIGHTS, LocalDatabase, $resource, requisitionUrlFactory) {

        var database = new LocalDatabase('requisitionApprovalPrograms'),
            promise;

        // #368: The approver can filter the requisitions by facility
        var resource = $resource(requisitionUrlFactory('/api/siglusapi/requisitions/facilitiesForApproval'), {}, {
            get: {
                method: 'GET',
                isArray: true
            }
        });

        this.getFacilities = getFacilities;
        // #368: ends here
        this.getPrograms = getPrograms;
        this.clearCache = clearCache;

        /**
         * @ngdoc method
         * @methodOf requisition-approval.requisitionApprovalService
         * @name getPrograms
         *
         * @description
         * Return a list of programs available to the user on the Requisition Approval screen. The result of this method
         * will be cached until clearCache method is called.
         *
         * @return {Promise}  the promise resolving to a list of programs
         */
        function getPrograms() {
            if (promise) {
                return promise;
            }

            promise = database.getAll()
                .then(function(programs) {
                    if (programs.length) {
                        return programs;
                    }
                    return getProgramsOnline();
                });

            return promise;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-approval.requisitionApprovalService
         * @name clearCache
         *
         * @description
         * Clears programs from the cache.
         *
         * @return {Promise}  the promise resolving when cache is cleared
         */
        function clearCache() {
            promise = undefined;
            return database.removeAll();
        }

        function getProgramsOnline() {
            return $q
                .all([
                    getUserRoleIdsWithRequisitionApprovalRight(),
                    currentUserService.getUserInfo(),
                    programService.getAll()
                ])
                .then(getProgramsAccessibleWithRequisitionApprovalRight)
                .then(cachePrograms);
        }

        function getUserRoleIdsWithRequisitionApprovalRight() {
            return currentUserRolesService.getUserRoles()
                .then(function(roles) {
                    return roles
                        .filter(hasRequisitionApprovalRight)
                        .map(mapToId);
                });
        }

        function hasRequisitionApprovalRight(role) {
            return role.rights.filter(isRequisitionApprovalRight).length;
        }

        function isRequisitionApprovalRight(right) {
            return right.name === REQUISITION_RIGHTS.REQUISITION_APPROVE;
        }

        function mapToId(role) {
            return role.id;
        }

        function getProgramsAccessibleWithRequisitionApprovalRight(responses) {
            var roleWithApproveRightIds = responses[0],
                user = responses[1],
                programs = responses[2];

            var programIds = user.roleAssignments
                .filter(isForRoleWithRequisitionApprovalRight(roleWithApproveRightIds))
                .map(mapToProgramId);

            return programs.filter(isIn(programIds));
        }

        function isForRoleWithRequisitionApprovalRight(roleWithApproveRightIds) {
            return function(roleAssignment) {
                return roleWithApproveRightIds.indexOf(roleAssignment.roleId) > -1;
            };
        }

        function isIn(programIds) {
            return function(program) {
                return programIds.indexOf(program.id) > -1;
            };
        }

        function mapToProgramId(roleAssignment) {
            return roleAssignment.programId;
        }

        function cachePrograms(programs) {
            return database.putAll(programs)
                .then(function() {
                    return programs;
                });
        }

        // #368: The approver can filter the requisitions by facility
        /**
         * @ngdoc method
         * @methodOf requisition-approval.requisitionApprovalService
         * @name getFacilities
         *
         * @description
         * Return a list of facilities available to the user on the Requisition Approval screen. The result of this
         * method will be cached until clearCache method is called.
         *
         * @return {Promise}  the promise resolving to a list of facilities
         */
        function getFacilities() {
            return resource.get().$promise;
        }
        // #368: ends here

    }

})();