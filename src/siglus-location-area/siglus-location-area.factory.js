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
     * @name stock-physical-inventory.physicalInventoryFactory
     *
     * @description
     * Allows the user to retrieve physical inventory enhanced informations.
     */
    angular
        .module('siglus-location-area')
        .factory('siglusLocationAreaFactory', factory);

    factory.$inject = [
        '$q', 'siglusLocationAreaService'
    ];

    function factory($q, siglusLocationAreaService) {

        return {
            getAllLocationAreaInfoMap: getAllLocationAreaInfoMap
        };

        function getAllLocationAreaInfoMap() {
            return siglusLocationAreaService.getAllLocationInfo()
                .then(function(res) {
                    return _.reduce(res, function(r, c) {
                        if (r[c.area]) {
                            r[c.area].push(c);
                        } else {
                            r[c.area] = [c];
                        }
                        return r;
                    }, {});
                });
        }
    }
})();
