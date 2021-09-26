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
        .module('referencedata-role')
        .factory('RoleDataBuilder', RoleDataBuilder);

    RoleDataBuilder.$inject = ['Role', 'ROLE_TYPES'];

    function RoleDataBuilder(Role, ROLE_TYPES) {

        RoleDataBuilder.prototype.build = build;
        RoleDataBuilder.prototype.withSupervisionType = withSupervisionType;
        RoleDataBuilder.prototype.withOrderFulfillmentType = withOrderFulfillmentType;
        RoleDataBuilder.prototype.withReportsType = withReportsType;
        RoleDataBuilder.prototype.withGeneralAdminType = withGeneralAdminType;
        RoleDataBuilder.prototype.withRight = withRight;
        // SIGLUS-REFACTOR: starts here
        RoleDataBuilder.prototype.withId = withId;
        // SIGLUS-REFACTOR: ends here

        return RoleDataBuilder;

        function RoleDataBuilder() {
            RoleDataBuilder.instanceNumber = (RoleDataBuilder.instanceNumber || 0) + 1;

            this.id = 'role-id-' + RoleDataBuilder.instanceNumber;
            this.name = 'role-' + RoleDataBuilder.instanceNumber;
            this.description = 'description for role ' + RoleDataBuilder.instanceNumber;
            this.type = ROLE_TYPES.SUPERVISION;
            this.rights = [];
        }

        function build() {
            return new Role(
                this.id,
                this.name,
                this.description,
                this.rights,
                this.type
            );
        }

        function withSupervisionType() {
            this.type = ROLE_TYPES.SUPERVISION;
            return this;
        }

        function withOrderFulfillmentType() {
            this.type = ROLE_TYPES.ORDER_FULFILLMENT;
            return this;
        }

        function withReportsType() {
            this.type = ROLE_TYPES.REPORTS;
            return this;
        }

        function withGeneralAdminType() {
            this.type = ROLE_TYPES.GENERAL_ADMIN;
            return this;
        }

        function withRight(right) {
            this.rights.push(right);
            return this;
        }

        // SIGLUS-REFACTOR: starts here
        function withId(id) {
            this.id = id;
            return this;
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
