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
        .module('admin-user-roles')
        .controller('UserRolesReportController', controller);

    controller.$inject = [
        'user', '$stateParams', '$q', '$state', '$filter', 'notificationService',
        'confirmService', 'roleAssignments', 'filteredRoles', 'availableGeographicList'
    ];

    function controller(
        user, $stateParams, $q, $state, $filter, notificationService,
        confirmService, roleAssignments, filteredRoles, availableGeographicList
    ) {

        var vm = this;
        var ALL_GEOGRAPHIC_UUID = '00000000-0000-0000-0000-000000000000';
        var ALL_GEOGRAPHIC_NAME = 'Todos(ALL)';

        vm.$onInit = onInit;
        vm.removeRole = removeRole;
        vm.addRole = addRole;
        vm.onProvinceChange = onProvinceChange;

        vm.filteredRoles = undefined;
        vm.selectedRole = undefined;
        vm.editable = undefined;

        vm.availableProvince = undefined;
        vm.selectedProvince = undefined;
        vm.availableDistrict = undefined;
        vm.selectedDistrict = undefined;
        vm.isDistrictSelectDisabled = undefined;

        function onInit() {
            vm.roleAssignments = roleAssignments;
            vm.filteredRoles = filteredRoles;
            vm.editable = true;
            vm.showErrorColumn = roleAssignments.filter(function(role) {
                return role.errors && role.errors.length;
            }).length > 0;
            vm.availableProvince = buildProvinceSelectList(availableGeographicList);
            vm.isDistrictSelectDisabled = true;
        }

        function addRole() {
            try {
                // TODO: add role with Geographic
                // user.addRoleAssignment(
                //     vm.selectedRole.id,
                //     vm.selectedRole.name, roleType, programId, programName,
                //     supervisoryNodeId, supervisoryNodeName, warehouseId, warehouseName,
                //     reportViewProvinceId, reportViewDistrictId
                // );
                // user.addRoleAssignment(
                //     vm.selectedProgram ? vm.selectedProgram.id : undefined,
                //     vm.selectedProgram ? vm.selectedProgram.name : undefined
                // );
                reloadState();
                return $q.resolve();
            } catch (error) {
                notificationService.error(error.message);
                return $q.reject();
            }
        }

        function removeRole(roleAssignment) {
            confirmService.confirmDestroy('adminUserRoles.removeRole.question', 'adminUserRoles.removeRole.label')
                .then(function() {
                    user.removeRoleAssignment(roleAssignment);
                    reloadState();
                });
        }

        function reloadState() {
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        function onProvinceChange() {
            vm.selectedDistrict = undefined;
            vm.availableDistrict = buildDistrictSelectList(availableGeographicList, vm.selectedProvince);
            vm.isDistrictSelectDisabled = !vm.selectedProvince
                || vm.selectedProvince.provinceId === ALL_GEOGRAPHIC_UUID ;
        }

        function buildProvinceSelectList(availableGeographicList) {
            var uniqueProvinceList = _.unique(availableGeographicList, 'provinceId').map(function(item) {
                return {
                    provinceId: item.provinceId,
                    provinceName: item.provinceName
                };
            });
            uniqueProvinceList.unshift({
                provinceId: ALL_GEOGRAPHIC_UUID,
                provinceName: ALL_GEOGRAPHIC_NAME
            });
            return uniqueProvinceList;
        }

        function buildDistrictSelectList(availableGeographicList, selectedProvince) {
            if (!selectedProvince) {
                return undefined;
            }
            var districtList = _.groupBy(availableGeographicList, 'provinceId')[selectedProvince.provinceId];
            districtList.unshift({
                districtId: ALL_GEOGRAPHIC_UUID,
                districtName: ALL_GEOGRAPHIC_NAME
            });
            return districtList;
        }
    }
})();
