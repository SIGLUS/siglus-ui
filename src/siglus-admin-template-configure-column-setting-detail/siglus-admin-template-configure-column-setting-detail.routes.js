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
        .module('siglus-admin-template-configure-column-setting-detail')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS'];

    function routes($stateProvider, REQUISITION_RIGHTS) {
        addStateForDetail('consultationNumber', 'siglus-admin-template-configure-column-setting-detail.html');
        addStateForDetail('patient', 'siglus-admin-template-configure-patient.html');
        addStateForDetail('regimen', 'siglus-admin-template-configure-column-setting-detail.html');
        addStateForDetail('testConsumption', 'siglus-admin-template-configure-column-setting-detail.html');
        addStateForDetail('usageInformation', 'siglus-admin-template-configure-column-setting-detail.html');

        function addStateForDetail(section, templateFile) {
            $stateProvider
                .state('openlmis.administration.requisitionTemplates.configure.columnSetting.' + section, {
                    label: 'adminProgramTemplate.' + section,
                    url: '/' + section,
                    params: {
                        section: section
                    },
                    templateUrl: 'siglus-admin-template-configure-column-setting-detail/' + templateFile,
                    controller: 'SiglusColumnSettingDetailController',
                    controllerAs: 'vm',
                    accessRights: [REQUISITION_RIGHTS.REQUISITION_TEMPLATES_MANAGE]
                });
        }
    }
})();
