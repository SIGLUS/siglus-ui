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
     * @name referencedata-role.RoleAssignment
     *
     * @description
     * Represents a single user role assignment.
     */
    angular
        .module('referencedata-role')
        .factory('RoleAssignment', RoleAssignment);

    RoleAssignment.$inject = ['ROLE_TYPES'];

    function RoleAssignment(ROLE_TYPES) {

        return RoleAssignment;

        /**
         * @ngdoc method
         * @methodOf referencedata-role.RoleAssignment
         * @name RoleAssignment
         *
         * @description
         * Creates a new instance of the RoleAssignment class.
         *
         * @param  {Object}  user                the user object.
         * @param  {String}  roleId              the UUID of the role
         * @param  {String}  warehouseId         the UUID of the warehouse for fulfillment role
         * @param  {String}  supervisoryNodeId   the UUID of the supervisory node for supervision role
         * @param  {String}  programId           the UUID of the program for supervision role
         * @param  {String}  roleName            the name of the supervision role
         * @param  {String}  roleType            the type of the supervision role
         * @param  {String}  programName         the name of the program for supervision role
         * @param  {String}  supervisoryNodeName the UUID of the program for supervision role
         * @param  {String}  warehouseName       the UUID of the program for supervision role
         * @return {Object}                      the user role assignment object
         */
        function RoleAssignment(user, roleId, warehouseId, supervisoryNodeId, programId, roleName,
                                roleType, programName, supervisoryNodeName, warehouseName) {
            this.roleId = roleId;
            this.warehouseId = warehouseId;
            this.supervisoryNodeId = supervisoryNodeId;
            this.programId = programId;
            this.roleName = roleName;
            this.type = roleType;
            this.programName = programName;
            this.supervisoryNodeName = supervisoryNodeName;
            this.warehouseName = warehouseName;
            this.errors = [];

            validateRoleAssignment(this, user);
        }

        function validateRoleAssignment(assignment, user) {
            if (assignment.type === ROLE_TYPES.SUPERVISION
                && !assignment.supervisoryNodeId
                && !user.homeFacilityId) {
                assignment.errors.push('referencedataRoles.homeFacilityRoleInvalid');
            }
        }
    }
})();
