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

    angular
        .module('add-regimen-model')
        .service('addRegimenModalService', service);

    service.$inject = ['openlmisModalService', 'paginationService', '$stateParams'];

    function service(openlmisModalService, paginationService, $stateParams) {
        var dialog;

        this.show = show;

        function show(Regimes) {
            if (dialog) {
                return dialog.promise;
            }

            dialog = openlmisModalService.createDialog({
                controller: 'AddRegimenModelController',
                controllerAs: 'vm',
                templateUrl: 'add-regimen-model/add-regimen-model.html',
                show: true,
                resolve: {
                    Regimes: function() {
                        return paginationService.registerList(null, $stateParams,
                            function() {
                                return Regimes;
                            }, {
                                customPageParamName: 'pPage',
                                customSizeParamName: 'pSize'
                            });
                    }
                }
            });

            dialog.promise.finally(function() {
                dialog = undefined;
            });

            return dialog.promise;
        }
    }

})();
