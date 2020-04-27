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
     * @name referencedata-program.programService
     *
     * @description
     * Decorates programService with additional method.
     */
    angular.module('referencedata-program')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('programService', decorator);
    }

    decorator.$inject = ['$delegate', 'openlmisUrlFactory', '$resource'];
    function decorator($delegate, openlmisUrlFactory, $resource) {
        var resource = $resource(openlmisUrlFactory('/api/siglusintegration/programs'), {}, {
            getAll: {
                method: 'GET',
                isArray: true
            }
        });

        $delegate.getRealPrograms = getRealPrograms;
        $delegate.getVirtualPrograms = getVirtualPrograms;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf referencedata-program.programService
         * @name getRealPrograms
         *
         * @description
         * Get real programs.
         */
        function getRealPrograms() {
            return resource.getAll()
                .$promise
                .then(function(programs) {
                    return _.filter(programs, function(p) {
                        return !p.isVirtual;
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-program.programService
         * @name getVirtualPrograms
         *
         * @description
         * Get virtual programs.
         */
        function getVirtualPrograms() {
            return resource.getAll()
                .$promise
                .then(function(programs) {
                    return _.filter(programs, function(p) {
                        return p.isVirtual;
                    });
                });
        }
    }
})();
