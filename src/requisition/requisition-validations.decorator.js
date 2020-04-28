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
     * @name requisition.Requisition
     *
     * @description
     * Decorates requisition class with the validations.
     */
    angular.module('requisition')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('Requisition', decorate);
    }

    decorate.$inject = ['$delegate', 'REQUISITION_STATUS'];

    function decorate($delegate, REQUISITION_STATUS) {
        var originalAddLineItem = $delegate.prototype.addLineItem,
            originalDeleteLineItem = $delegate.prototype.deleteLineItem;

        $delegate.prototype.addLineItem = addLineItem;
        $delegate.prototype.deleteLineItem = deleteLineItem;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name addLineItem
         *
         * @description
         * Creates a new line item based on the given orderable, requested quantity and explanation.
         * If requisition status does not allow for adding line items an exception will be thrown.
         * If a line item for the given orderable exists an exception will be thrown.
         * If the given orderable is not on the list of available non full supply products an
         * exception will be thrown.
         *
         * @param   {Object}    orderable                       the orderable
         * @param   {integer}   requestedQuantity               the requested quantity
         * @param   {string}    requestedQuantityExplanation    the explanation
         */
        function addLineItem(orderable) {

            validateStatusForManipulatingLineItems(this.status);
            validateOrderableDoesNotHaveLineItem(this.requisitionLineItems, orderable);
            validateOrderableIsAvailable(this, orderable);
            // SIGLUS-REFACTOR: starts here
            // validateNotAddingFullSupplyLineItemToRegularRequisition(this, orderable);
            // SIGLUS-REFACTOR: ends here
            return originalAddLineItem.apply(this, arguments);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name deleteLineItem
         *
         * @description
         * Removes the given line item from the requisition.
         * If requisition status does not allow for removing line items an exception will be thrown.
         * If line item is not part of the requisition an exception will be thrown.
         * If line item is full supply an exception will be thrown.
         *
         * @param   {LineItem}  lineItem    the line item to be deleted
         */
        function deleteLineItem(lineItem) {

            validateStatusForManipulatingLineItems(this.status);
            validateLineItemIsPartOfRequisition(this, lineItem);
            validateLineItemIsNotFullSupply(lineItem);

            return originalDeleteLineItem.apply(this, arguments);
        }

        function validateStatusForManipulatingLineItems(status) {
            if (REQUISITION_STATUS.INITIATED !== status &&
                REQUISITION_STATUS.SUBMITTED !== status &&
                REQUISITION_STATUS.REJECTED !== status
            ) {
                throw 'Can not add or remove line items past SUBMITTED status';
            }
        }

        function validateOrderableDoesNotHaveLineItem(lineItems, orderable) {
            var orderableLineItems = lineItems.filter(function(lineItem) {
                return lineItem.orderable.id === orderable.id;
            });

            if (orderableLineItems.length > 0) {
                throw 'Line item for the given orderable already exist';
            }
        }

        function validateOrderableIsAvailable(requisition, orderable) {
            var program = getOrderableProgramById(orderable.programs, requisition.program.id);

            if (!program) {
                throw 'The given product is not available for this requisition';
            }

            var availableProducts;
            if (program.fullSupply) {
                availableProducts = requisition.availableFullSupplyProducts;
            } else {
                availableProducts = requisition.availableNonFullSupplyProducts;
            }

            var matchingAvailableOrderables = availableProducts.filter(function(product) {
                return product.id === orderable.id;
            });

            if (!matchingAvailableOrderables.length) {
                throw 'The given product is not available for this requisition';
            }
        }

        // SIGLUS-REFACTOR: starts here
        // function validateNotAddingFullSupplyLineItemToRegularRequisition(requisition, orderable) {
        //     var program = getOrderableProgramById(orderable.programs, requisition.program.id);
        //
        //     if (program.fullSupply && !requisition.emergency) {
        //         throw 'Can not add full supply line items to regular requisition';
        //     }
        // }
        // SIGLUS-REFACTOR: ends here

        function validateLineItemIsPartOfRequisition(requisition, lineItem) {
            var lineItemIndex = requisition.requisitionLineItems.indexOf(lineItem);
            if (lineItemIndex === -1) {
                throw 'The given line item is not part of this requisition';
            }
        }

        function validateLineItemIsNotFullSupply(lineItem) {
            if (lineItem.$program.fullSupply) {
                throw 'Can not delete full supply line items';
            }
        }

        function getOrderableProgramById(programs, programId) {
            return programs.filter(function(program) {
                // SIGLUS-REFACTOR: get program by parent id
                return program.parentId === programId;
                // SIGLUS-REFACTOR: ends here
            })[0];
        }
    }
})();
