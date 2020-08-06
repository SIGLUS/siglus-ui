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
     * @name siglus-add-regimen-model.addRegimensModalState
     *
     * @description
     * Provider for defining states which should be displayed as modals.
     */
    angular
        .module('siglus-add-regimen-model')
        .provider('siglusAddRegimensModalState', siglusAddRegimensModalStateProvider);

    siglusAddRegimensModalStateProvider.$inject = ['modalStateProvider'];

    function siglusAddRegimensModalStateProvider(modalStateProvider) {
        this.stateWithAddRegimensChildState = stateWithAddRegimensChildState;
        this.$get = [function() {}];

        /**
         * @ngdoc method
         * @methodOf siglus-add-regimen-model.addRegimensModalState
         * @name state
         *
         * @description
         * Defines a state which should be displayed as modal. Currently the resolves from parent
         * states are not available in the controller by default. To make them available please
         * include them in the parentResolves parameter line this
         *
         * ```
         * addRegimensModalStateProvider.state('some.state', {
         *     parentResolves: ['someParentResolve']
         * });
         * ```
         *
         * @param   {String}    stateName   the name of the state
         * @param   {Object}    state       the state definition
         */
        function stateWithAddRegimensChildState(stateName) {
            modalStateProvider
                .state(stateName + '.addRegimens', {
                    controller: 'SelectProductsModalController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-add-regimen-model/siglus-add-regimen-model.html',
                    nonTrackable: true,
                    params: {
                        addRegimensPage: undefined,
                        addRegimensSize: undefined,
                        search: undefined
                    },
                    resolve: {
                        external: function() {
                            return false;
                        },
                        isUnpackKitState: function() {
                            return false;
                        },
                        orderables: function(paginationService, $stateParams,
                            selectProductsModalService) {
                            var orderables = selectProductsModalService.getOrderables();

                            return paginationService.registerList(undefined, $stateParams, function() {
                                return orderables;
                            }, {
                                paginationId: 'addRegimens'
                            });
                        }
                    }
                });
        }
    }

})();
