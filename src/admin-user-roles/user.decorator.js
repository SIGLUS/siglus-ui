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
     * @name admin-user-roles.User
     *
     * @description
     * Decorates User class with helper methods for role assignments.
     */
    angular
        .module('admin-user-roles')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('User', decorator);
    }

    var reportViewerRoleId = 'a598b9b4-1dd8-11ed-84e1-acde48001122';

    decorator.$inject = ['$delegate', 'RoleAssignment', 'ROLE_TYPES'];
    function decorator($delegate, RoleAssignment, ROLE_TYPES) {

        $delegate.prototype.addRoleAssignment = addRoleAssignment;
        $delegate.prototype.removeRoleAssignment = removeRoleAssignment;
        $delegate.prototype.addRoleAssignments = addRoleAssignments;
        $delegate.prototype.addGeographicListToRoleAssignments = addGeographicListToRoleAssignments;
        $delegate.prototype.addGeographicRoleForReportView = addGeographicRoleForReportView;
        $delegate.prototype.removeGeographicRoleForReportView = removeGeographicRoleForReportView;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.User
         * @name addRoleAssignment
         *
         * @description
         * Adds new role assignment to the User.
         *
         * @param {String} roleId              the UUID of the role that will be assigned
         * @param {String} roleName            the name of the role that will be assigned
         * @param {String} roleType            the type of the role that will be assigned
         * @param {String} programId           the UUID of the program that will be assigned with role
         * @param {String} programName         the name of the program that will be assigned with role
         * @param {String} supervisoryNodeId   the UUID of the supervisory node that will be assigned with role
         * @param {String} supervisoryNodeName the name of the supervisory node that will be assigned with role
         * @param {String} warehouseId         the UUID of the warehouse that will be assigned with role
         * @param {String} warehouseName       the name of the warehouse that will be assigned with role
         * @param {Array}  reportViewGeographicList      the list of the province and district for report view role
         */
        function addRoleAssignment(
            roleId, roleName, roleType, programId, programName,
            supervisoryNodeId, supervisoryNodeName, warehouseId, warehouseName,
            reportViewGeographicList
        ) {
            validateRoleAssignment(
                this, roleId, roleName, roleType, programId, programName,
                supervisoryNodeId, supervisoryNodeName, warehouseId
            );
            this.roleAssignments.push(new RoleAssignment(this,
                roleId,
                warehouseId,
                supervisoryNodeId,
                programId,
                roleName,
                roleType,
                programName,
                supervisoryNodeName,
                warehouseName,
                reportViewGeographicList));
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.User
         * @name addRoleAssignments
         *
         * @description
         * Adds selected User's Role Assignments to the current User.
         *
         * @param {Array} originalUserRoleAssignments  the current User's Role AssignmentsF
         * @param {Array} roleAssignments              the Role Assignments which are to be imported
         * @param {Array} geographicList               the geographic list of report view which are to be imported
         */
        function addRoleAssignments(originalUserRoleAssignments, roleAssignments, geographicList) {
            roleAssignments.forEach(function(roleAssignment) {
                if (isRoleAlreadyAssigned(originalUserRoleAssignments, roleAssignment.roleId,
                    roleAssignment.programId, roleAssignment.supervisoryNodeId, roleAssignment.warehouseId)) {

                    if (roleAssignment.type === ROLE_TYPES.REPORTS) {
                        var originalReportViewRoleAssignment =
                            originalUserRoleAssignments.find(function(roleAssignment) {
                                return roleAssignment.type === ROLE_TYPES.REPORTS;
                            });

                        originalReportViewRoleAssignment.reportViewGeographicList =
                            _.uniq(
                                originalReportViewRoleAssignment.reportViewGeographicList.concat(geographicList),
                                'districtId'
                            );
                    }
                    return;
                }

                if (roleAssignment.type === ROLE_TYPES.REPORTS) {
                    roleAssignment.reportViewGeographicList = geographicList;
                }

                originalUserRoleAssignments.push(roleAssignment);
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.User
         * @name removeRoleAssignment
         *
         * @description
         * Deletes user role assignment.
         *
         * @param {String} roleAssignment the role that will be removed
         */
        function removeRoleAssignment(roleAssignment) {
            var index = this.roleAssignments.indexOf(roleAssignment);
            if (index < 0) {
                return;
            }
            this.roleAssignments.splice(index, 1);
        }

        function validateRoleAssignment(user, roleId, roleName, roleType, programId, programName,
                                        supervisoryNodeId, supervisoryNodeName, warehouseId) {
            if (isCurrentUserHasBeenAssociatedToFacility(user, roleId)) {
                throw new Error('adminUserRoles.roleReportViewerInvalid');
            } else if (isRoleAssignmentInvalid(programId, supervisoryNodeId, warehouseId)) {
                throw new Error('referencedataRoles.roleAssignmentInvalid');
            } else if (isRoleAlreadyAssigned(user.roleAssignments, roleId, programId, supervisoryNodeId, warehouseId)) {
                throw new Error('referencedataRoles.roleAlreadyAssigned');
            }
        }

        function addGeographicListToRoleAssignments(geographicList) {
            var reportViewRoleAssignments = this.getRoleAssignments(ROLE_TYPES.REPORTS);
            if (!_.isEmpty(reportViewRoleAssignments)) {
                var reportViewRoleAssignment = reportViewRoleAssignments[0];
                reportViewRoleAssignment.reportViewGeographicList = _.isEmpty(geographicList) ? [] : geographicList;
            }
        }

        function addGeographicRoleForReportView(geographicRole) {
            var reportViewRoleAssignments = this.getRoleAssignments(ROLE_TYPES.REPORTS);
            if (!_.isEmpty(reportViewRoleAssignments)) {
                var reportViewRoleAssignment = reportViewRoleAssignments[0];
                reportViewRoleAssignment.reportViewGeographicList.push(geographicRole);
            }
        }

        function removeGeographicRoleForReportView(index) {
            var reportViewRoleAssignments = this.getRoleAssignments(ROLE_TYPES.REPORTS);
            if (!_.isEmpty(reportViewRoleAssignments)) {
                var reportViewRoleAssignment = reportViewRoleAssignments[0];
                reportViewRoleAssignment.reportViewGeographicList.splice(index, 1);
                if (_.isEmpty(reportViewRoleAssignment.reportViewGeographicList)) {
                    this.removeRoleAssignment(reportViewRoleAssignment);
                }
            }
        }
    }

    function isRoleAlreadyAssigned(roleAssignments, roleId, programId, supervisoryNodeId, warehouseId) {
        return _.some(roleAssignments, function(roleAssignment) {
            return roleAssignment.roleId === roleId &&
                isRoleAssignmentDuplicated(programId, supervisoryNodeId, warehouseId, roleAssignment);
        });
    }

    function isRoleAssignmentInvalid(programId, supervisoryNodeId, warehouseId) {
        return hasRoleSupervisoryNodeOrProgramAndWarehouse(programId, supervisoryNodeId, warehouseId) ||
            hasRoleSupervisoryNodeWithoutProgram(programId, supervisoryNodeId);
    }

    function hasRoleSupervisoryNodeWithoutProgram(programId, supervisoryNodeId) {
        return !programId && supervisoryNodeId;
    }

    function hasRoleSupervisoryNodeOrProgramAndWarehouse(programId, supervisoryNodeId, warehouseId) {
        return (programId || supervisoryNodeId) && warehouseId;
    }

    // SIGLUS-REFACTOR: starts here
    function isCurrentUserHasBeenAssociatedToFacility(user, roleId) {
        return roleId === reportViewerRoleId && user.homeFacilityId !== undefined;
    }
    // SIGLUS-REFACTOR: ends here

    function isRoleAssignmentDuplicated(programId, supervisoryNodeId, warehouseId, existingRoleAssignment) {
        return hasFieldValue(existingRoleAssignment.programId, programId) &&
            hasFieldValue(existingRoleAssignment.supervisoryNodeId, supervisoryNodeId) &&
            hasFieldValue(existingRoleAssignment.warehouseId, warehouseId);
    }

    function hasFieldValue(existingValue, newValue) {
        return (_.isEmpty(newValue) && _.isEmpty(existingValue)) || existingValue === newValue;
    }
})();
