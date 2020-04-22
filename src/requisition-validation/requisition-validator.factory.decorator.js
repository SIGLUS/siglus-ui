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
     * @name requisition-validation.requisitionValidator
     *
     * @description
     * Decorates requisitionValidator with new validateRequisition method.
     */
    angular.module('requisition-validation')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('requisitionValidator', decorator);
    }

    decorator.$inject = ['$delegate', '$filter'];

    function decorator($delegate, $filter) {
        $delegate.validateRequisition = validateRequisition;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf requisition-validation.requisitionValidator
         * @name validateRequisition
         *
         * @description
         * Validates the given requisitions.
         *
         * @param  {Object}  requisition the requisition to be validated
         * @return {Boolean}             true if the requisition is valid, false otherwise
         */
        function validateRequisition(requisition) {
            var valid = true,
                validator = this,
                fullSupplyColumns = requisition.template.getColumns(),
                nonFullSupplyColumns = requisition.template.getColumns(true);

            angular.forEach($filter('filter')(requisition.requisitionLineItems, {
                $program: {
                    fullSupply: true
                }
            }), function(lineItem) {
                valid = validator.validateLineItem(lineItem, fullSupplyColumns, requisition) && valid;
            });

            angular.forEach($filter('filter')(requisition.requisitionLineItems, {
                $program: {
                    fullSupply: false
                }
            }), function(lineItem) {
                valid = validator.validateLineItem(lineItem, nonFullSupplyColumns, requisition) && valid;
            });

            valid = validateExtraData(requisition) && valid;

            return valid;
        }

        function validateExtraData(requisition) {
            var flag = true;

            if (requisition.template.enableKitUsage) {
                flag = isNotEmpty(requisition.extraData.openedKitByCHW)
                    && isNotEmpty(requisition.extraData.openedKitByHF)
                    && isNotEmpty(requisition.extraData.receivedKitByCHW)
                    && isNotEmpty(requisition.extraData.receivedKitByHF);
            }
            if (requisition.template.enableConsultationNumber) {
                flag = flag && isNotEmpty(requisition.extraData.consultationNumber);
            }
            return flag;
        }

        function isNotEmpty(value) {
            return _.isNumber(value) && !_.isNaN(value);
        }
    }
})();
