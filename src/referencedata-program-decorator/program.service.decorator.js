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
     * @name referencedata-program-decorator.programService
     *
     * @description
     * Decorates programService with additional method.
     */
    angular.module('referencedata-program-decorator')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('programService', decorator);
    }

    decorator.$inject = ['$delegate', 'openlmisUrlFactory', '$resource', 'PROGRAM_CODE'];
    function decorator($delegate, openlmisUrlFactory, $resource, PROGRAM_CODE) {
        var resource = $resource(openlmisUrlFactory('/api/requisitionTemplates/programs'), {}, {
            getReportPrograms: {
                method: 'GET',
                isArray: true
            }
        });

        $delegate.getReportPrograms = getReportPrograms;
        $delegate.getTruePrograms = getTruePrograms;
        $delegate.getVirtualPrograms = getVirtualPrograms;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf referencedata-program-decorator.programService
         * @name getReportPrograms
         *
         * @description
         * Get report programs.
         */
        function getReportPrograms() {
            return resource.getReportPrograms({
                isReport: true
            })
                .$promise;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-program-decorator.programService
         * @name getTruePrograms
         *
         * @description
         * Get true programs.
         */
        function getTruePrograms() {
            return $delegate.getAll()
                .then(function(programs) {
                    return _.filter(programs, function(p) {
                        return !p.isVirtual;
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-program-decorator.programService
         * @name getVirtualPrograms
         *
         * @description
         * Get virtual programs.
         */
        function getVirtualPrograms() {
            return $delegate.getAll()
                .then(function(programs) {
                    return _.filter(programs, function(p) {
                        return p.code !== PROGRAM_CODE.ALL && p.isVirtual;
                    });
                });
        }
    }
})();
