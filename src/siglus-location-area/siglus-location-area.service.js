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
     * @name siglus-location-area.service
     *
     * @description
     * Responsible for retrieving physical inventory information from server.
     */
    angular
        .module('siglus-location-area')
        .service('siglusLocationAreaService', service);

    service.$inject = [
        '$resource', 'stockmanagementUrlFactory'
    ];

    function service($resource, stockmanagementUrlFactory) {
        // SIGLUS-REFACTOR: starts here
        var resource = $resource(stockmanagementUrlFactory('api/siglusapi/locations'), {
            extraData: false
        }, {
            get: {
                method: 'POST',
                url: stockmanagementUrlFactory('api/siglusapi/locations'),
                isArray: true
            }
        });
        // SIGLUS-REFACTOR: ends here
        this.getAllLocationInfo = getAllLocationInfo;
        function getAllLocationInfo() {
            return resource.get().$promise;
        }
    }
})();
