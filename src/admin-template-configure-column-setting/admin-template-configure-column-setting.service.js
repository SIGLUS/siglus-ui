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

    angular.module('admin-template-configure-column-setting')
        .service('templateConfigureService', service);

    service.$inject = [
        '$rootScope', 'loadingModalService', 'notificationService'
    ];

    function service() {
        this.getDefaultColumn = getDefaultColumn;
        function getDefaultColumn() {
            return {
                id: null,
                name: null,
                label: null,
                indicator: null,
                displayOrder: 0,
                isDisplayed: true,
                source: null,
                option: null,
                definition: null,
                tag: null,
                columnDefinition: {
                    canChangeOrder: true,
                    columnType: 'NUMERIC',
                    name: null,
                    sources: [],
                    options: [],
                    label: null,
                    indicator: null,
                    mandatory: false,
                    isDisplayRequired: false,
                    canBeChangedByUser: false,
                    supportsTag: true,
                    definition: null
                }
            };
        }
    }

})();
