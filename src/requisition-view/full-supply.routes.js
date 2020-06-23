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
        .module('requisition-view')
        .config(routes);

    routes.$inject = ['selectProductsModalStateProvider'];

    function routes(selectProductsModalStateProvider) {
        selectProductsModalStateProvider
            .stateWithAddOrderablesChildState('openlmis.requisitions.requisition.fullSupply', {
                url: '/fullSupply?fullSupplyListPage&fullSupplyListSize',
                templateUrl: 'requisition-view-tab/requisition-view-tab.html',
                controller: 'ViewTabController',
                controllerAs: 'vm',
                isOffline: true,
                nonTrackable: true,
                resolve: {
                    lineItems: function($filter, requisition) {
                        // #227: user can add both full supply & non-fully supply product
                        var fullSupplyLineItems = requisition.template.hideSkippedLineItems()
                            ? $filter('filter')(requisition.requisitionLineItems, {
                                skipped: '!true'
                            }) : requisition.requisitionLineItems;
                        // #227: ends here

                        return $filter('orderBy')(fullSupplyLineItems, [
                            '$program.orderableCategoryDisplayOrder',
                            '$program.orderableCategoryDisplayName',
                            '$program.displayOrder',
                            'orderable.fullProductName'
                        ]);
                    },
                    items: function(paginationService, lineItems, $stateParams, requisitionValidator,
                        paginationFactory) {
                        return paginationService.registerList(
                            requisitionValidator.isLineItemValid, $stateParams, function(params) {
                                return paginationFactory.getPage(lineItems, parseInt(params.page),
                                    parseInt(params.size));
                            }, {
                                paginationId: 'fullSupplyList'
                            }
                        );
                    },
                    columns: function(requisition) {
                        // SIGLUS-REFACTOR: starts here
                        return requisition.template.getDisplayedColumns(requisition);
                        // SIGLUS-REFACTOR: ends here
                    },
                    fullSupply: function() {
                        return true;
                    },
                    homeFacility: function(facilityFactory) {
                        return facilityFactory.getUserHomeFacility();
                    }
                }
            });
    }

})();
