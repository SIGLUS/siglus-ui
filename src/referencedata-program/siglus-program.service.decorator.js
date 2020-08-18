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

    decorator.$inject = ['$delegate', 'openlmisUrlFactory', '$resource', '$q', 'localStorageFactory'];
    function decorator($delegate, openlmisUrlFactory, $resource, $q, localStorageFactory) {
        var resource = $resource(openlmisUrlFactory('/api/siglusapi/programs'), {}, {
                getAllProductsProgram: {
                    method: 'GET',
                    params: {
                        code: 'ALL'
                    },
                    isArray: true
                },
                getById: {
                    url: openlmisUrlFactory('/api/siglusapi/programs/:id'),
                    method: 'GET'
                }
            }),
            programsCache = localStorageFactory('programs');

        $delegate.getAllProductsProgram = getAllProductsProgram;
        $delegate.get = get;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf referencedata-program.programService
         * @name getAllProductsProgram
         *
         * @description
         * Get all products program.
         */
        function getAllProductsProgram() {
            return resource.getAllProductsProgram()
                .$promise;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-program.programService
         * @name get
         *
         * @description
         * Gets program by id.
         *
         * @param  {String}  id Program UUID
         * @return {Promise}    Program info
         */
        function get(id) {
            if (!id) {
                return $q.resolve(undefined);
            }
            var cachedProgram = programsCache.getBy('id', id);

            if (cachedProgram) {
                return $q.resolve(cachedProgram);
            }

            return resource.getById({
                id: id
            })
                .$promise
                .then(function(program) {
                    programsCache.put(program);
                    return program;
                });
        }
    }
})();
