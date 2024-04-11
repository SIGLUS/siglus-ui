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
        'confirmService', 'roleAssignments', 'filteredRoles', 'availableGeographicList', 'ROLE_TYPES', 'geographicList'
    ];

    function controller(
        user, $stateParams, $q, $state, $filter, notificationService,
        confirmService, roleAssignments, filteredRoles, availableGeographicList, ROLE_TYPES, geographicList
    ) {

        var vm = this;
        var ALL_GEOGRAPHIC_UUID = '00000000-0000-0000-0000-000000000000';
        var ALL_GEOGRAPHIC_NAME = 'Todos(ALL)';

        vm.$onInit = onInit;
        vm.removeReportViewRole = removeReportViewRole;
        vm.addRole = addRole;
        vm.onProvinceChange = onProvinceChange;

        vm.filteredRoles = undefined;
        vm.selectedRole = undefined;
        vm.editable = undefined;
        vm.roleAssignments = undefined;

        vm.availableProvince = undefined;
        vm.selectedProvince = undefined;
        vm.availableDistrict = undefined;
        vm.selectedDistrict = undefined;
        vm.isDistrictSelectDisabled = undefined;
        vm.geographicList = undefined;

        function onInit() {
            vm.filteredRoles = filteredRoles;
            vm.editable = true;
            vm.availableProvince = buildProvinceSelectList(availableGeographicList);
            vm.isDistrictSelectDisabled = true;
            vm.roleAssignments = roleAssignments;
            vm.geographicList = geographicList;
        }

        function addRole() {
            try {
                if (_.isEmpty(roleAssignments)) {
                    user.addRoleAssignment(
                        vm.selectedRole.id,
                        vm.selectedRole.name,
                        ROLE_TYPES.REPORTS,
                        // programId
                        undefined,
                        //programName
                        undefined,
                        //supervisoryNodeId
                        undefined,
                        // supervisoryNodeName
                        undefined,
                        //warehouseId
                        undefined,
                        //warehouseName
                        undefined,
                        [{
                            provinceId: vm.selectedProvince.provinceId,
                            provinceName: vm.selectedProvince.provinceName,
                            districtId: vm.selectedDistrict.districtId,
                            districtName: vm.selectedDistrict.districtName
                        }]
                    );
                } else {
                    addReportViewRole(
                        vm.selectedProvince.provinceId,
                        vm.selectedProvince.provinceName,
                        vm.selectedDistrict.districtId,
                        vm.selectedDistrict.districtName
                    );
                }
                reloadState();
                return $q.resolve();
            } catch (error) {
                notificationService.error(error.message);
                return $q.reject();
            }
        }

        function reloadState() {
            $state.go('openlmis.administration.users.roles.' + ROLE_TYPES.REPORTS, $stateParams, {
                reload: 'openlmis.administration.users.roles.' + ROLE_TYPES.REPORTS
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

        function removeReportViewRole(index) {
            confirmService.confirmDestroy('adminUserRoles.removeRole.question', 'adminUserRoles.removeRole.label')
                .then(function() {
                    user.removeGeographicRoleForReportView(index);
                    reloadState();
                });
        }

        function addReportViewRole(provinceId, provinceName, districtId, districtName) {
            var currentRole = {
                provinceId: provinceId,
                provinceName: provinceName,
                districtId: districtId,
                districtName: districtName
            };

            validateRoleGeographicDuplicate(currentRole);
            user.addGeographicRoleForReportView(currentRole);
        }

        function validateRoleGeographicDuplicate(currentRole) {
            if (_.some(geographicList, currentRole)) {
                throw new Error('referencedataRoles.roleAlreadyAssigned');
            }
        }
    }
})();
