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
     * @name stock-reason.stockReasonsFactory
     *
     * @description
     * Decorator stockReasonsFactory .
     */
    angular.module('stock-reason')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('stockReasonsFactory', decorator);
    }

    decorator.$inject = ['$delegate', '$filter', 'ValidReasonResource'];
    function decorator($delegate, $filter, ValidReasonResource) {
        var stockReasonsFactory = $delegate;

        stockReasonsFactory.getReasons = getReasons;

        return stockReasonsFactory;

        /**
         * @ngdoc method
         * @methodOf stock-reason.stockReasonsFactory
         * @name getReasons
         *
         * @description
         * Retrieves a list of reason assignments and extract the list of reason from it.
         *
         * @param  {String}  program      the UUID of the program
         * @param  {String}  facilityType the UUID of the facility type
         * @param  {Object}  reasonType   the reason type, can be an array
         * @return {Promise}              the promise resolving to the list of reasons
         */
        function getReasons(program, facilityType, reasonType) {
            return new ValidReasonResource().query({
                program: program,
                facilityType: facilityType,
                reasonType: reasonType
            })
                .then(function(reasonAssignments) {
                    return reasonAssignments
                        .filter(function(reasonAssignment) {
                            return !reasonAssignment.hidden;
                        })
                        .reduce(function(result, reasonAssignemnt) {
                            if (result.indexOf(reasonAssignemnt.reason) < 0) {
                                // SIGLUS-REFACTOR: filter reason by program
                                reasonAssignemnt.reason.programId = reasonAssignemnt.program.id;
                                // SIGLUS-REFACTOR: ends here
                                result.push(reasonAssignemnt.reason);
                            }
                            return result;
                        }, []);
                });
        }
    }
})();
