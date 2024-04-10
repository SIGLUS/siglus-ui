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
     * @name admin-user-roles.userRoleAssignmentFactory
     *
     * @description
     * Allows the user to retrieve roles with additional info.
     */
    angular
        .module('admin-user-roles')
        .factory('userRoleAssignmentFactory', factory);

    factory.$inject = ['$filter', 'UserRepository'];

    function factory($filter, UserRepository) {

        return {
            getUser: getUser
        };

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.userRoleAssignmentFactory
         * @name getUser
         *
         * @description
         * Returns user with role assignments that have added names to all properties
         * based on given roles, programs, supervisory nodes and warehouses.
         *
         * @param  {String} userId           the UUID of the user that will be retrieved from server
         * @param  {Array}  roles            the array of roles
         * @param  {Array}  programs         the array of programs
         * @param  {Array}  supervisoryNodes the array of supervisory nodes
         * @param  {Array}  warehouses       the array of warehouses
         * @return {User}                    the User object with role assignments with additional info
         */
        function getUser(userId, roles, programs, supervisoryNodes, warehouses) {

            return new UserRepository().get(userId)
                .then(function(user) {
                    addInfoToRoleAssignments(user, user.roleAssignments, roles, programs, supervisoryNodes,
                        warehouses);

                    return user;
                });
        }

        function addInfoToRoleAssignments(user, roleAssignments, roles, programs, supervisoryNodes, warehouses) {
            user.roleAssignments = [];

            roleAssignments.forEach(function(roleAssignment) {
                var filteredRoles = roles.filter(function(role) {
                        return role.id === roleAssignment.roleId;
                    }),
                    filteredPrograms,
                    filteredSupervisoryNodes,
                    filteredWarehouses;

                if (roleAssignment.programId) {
                    filteredPrograms = programs.filter(function(program) {
                        return program.id === roleAssignment.programId;
                    });
                }

                if (roleAssignment.supervisoryNodeId) {
                    filteredSupervisoryNodes = supervisoryNodes.filter(function(node) {
                        return node.id === roleAssignment.supervisoryNodeId;
                    });
                }

                if (roleAssignment.warehouseId) {
                    filteredWarehouses = warehouses.filter(function(warehouse) {
                        return warehouse.id === roleAssignment.warehouseId;
                    });
                }

                user.addRoleAssignment(roleAssignment.roleId,
                    filteredRoles[0].name,
                    filteredRoles[0].rights[0].type,
                    roleAssignment.programId,
                    filteredPrograms ? filteredPrograms[0].name : undefined,
                    roleAssignment.supervisoryNodeId,
                    filteredSupervisoryNodes ? $filter('supervisoryNode')(filteredSupervisoryNodes[0]) : undefined,
                    roleAssignment.warehouseId,
                    filteredWarehouses ? filteredWarehouses[0].name : undefined);
            });

            return user;
        }
    }
})();
