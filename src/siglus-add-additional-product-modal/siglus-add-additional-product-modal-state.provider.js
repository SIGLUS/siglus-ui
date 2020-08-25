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
     * @name siglus-add-additional-product-modal.siglusAddAdditionalProductModalState
     *
     * @description
     * Provider for defining states which should be displayed as modals.
     */
    angular
        .module('siglus-add-additional-product-modal')
        .provider('siglusAddAdditionalProductModalState', siglusAddAdditionalProductModalStateProvider);

    siglusAddAdditionalProductModalStateProvider.$inject = ['modalStateProvider', '$stateProvider'];

    function siglusAddAdditionalProductModalStateProvider(modalStateProvider, $stateProvider) {
        this.stateWithAddAdditionalProductChildState = stateWithAddAdditionalProductChildState;
        this.$get = [function() {}];

        /**
         * @ngdoc method
         * @methodOf siglus-add-additional-product-modal.siglusAddAdditionalProductModalState
         * @name state
         *
         * @description
         * Defines a state which should be displayed as modal. Currently the resolves from parent
         * states are not available in the controller by default. To make them available please
         * include them in the parentResolves parameter line this
         *
         * ```
         * siglusAddAdditionalProductModalStateProvider.state('some.state', {
         *     parentResolves: ['someParentResolve']
         * });
         * ```
         *
         * @param   {String}    stateName   the name of the state
         * @param   {Object}    state       the state definition
         */
        function stateWithAddAdditionalProductChildState(stateName, state) {

            $stateProvider.state(stateName, state);

            modalStateProvider
                .state(stateName + '.addAdditionalProduct', {
                    controller: 'SiglusAddAdditionalProductModalController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-add-additional-product-modal/siglus-add-additional-product-modal.html',
                    nonTrackable: true,
                    params: {
                        addAdditionalProductPage: undefined,
                        addAdditionalProductSize: undefined,
                        productName: undefined,
                        productCode: undefined
                    },
                    resolve: {
                        orderables: function(paginationService, $stateParams, SiglusAdditionalOrderableResource,
                            programList) {
                            return paginationService.registerUrl($stateParams, function(stateParams) {
                                var params = {
                                    sort: 'fullProductName',
                                    page: stateParams.page,
                                    size: stateParams.size,
                                    code: stateParams.productCode,
                                    name: stateParams.productName,
                                    programId: stateParams.programId
                                };
                                return new SiglusAdditionalOrderableResource().query(params)
                                    .then(function(result) {
                                        var orderables = result.content;
                                        result.content = _.map(orderables, function(orderable) {
                                            orderable.program = _.find(programList, function(program) {
                                                return program.id === _.first(orderable.programs).programId;
                                            });
                                            return orderable;
                                        });
                                        return result;
                                    });
                            }, {
                                paginationId: 'addAdditionalProduct'
                            });
                        }
                    }
                });
        }
    }

})();
