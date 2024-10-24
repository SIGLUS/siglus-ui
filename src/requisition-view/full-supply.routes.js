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

    routes.$inject = [
        'selectProductsModalStateProvider',
        // #441: Facility user can create requisition with regimen section
        'siglusAddRegimensModalStateProvider', 'REQUISITION_RIGHTS'
        // #441: ends here
    ];

    function routes(selectProductsModalStateProvider, siglusAddRegimensModalStateProvider, REQUISITION_RIGHTS) {
        selectProductsModalStateProvider
            .stateWithAddOrderablesChildState('openlmis.requisitions.requisition.fullSupply', {
                url: '/fullSupply?fullSupplyListPage&fullSupplyListSize&keyword',
                templateUrl: 'requisition-view-tab/requisition-view-tab.html',
                controller: 'ViewTabController',
                controllerAs: 'vm',
                isOffline: true,
                nonTrackable: true,
                accessRights: [
                    REQUISITION_RIGHTS.REQUISITION_VIEW
                ],
                params: {
                    rnr: undefined,
                    isExpiredEmergency: false
                },
                resolve: {
                    program: function(programService, requisitionService, requisition) {
                        return programService.get(requisition.program.id);
                    },
                    lineItems: function($filter, requisition, $stateParams, program) {
                        var filterObject = requisition.template.hideSkippedLineItems() ?
                            {
                                skipped: '!true',
                                $program: {
                                    fullSupply: true
                                }
                            } : {
                                $program: {
                                    fullSupply: true
                                }
                            };
                        var fullSupplyLineItems = $filter('filter')(requisition.requisitionLineItems, filterObject);

                        if ($stateParams.keyword) {
                            var keyword = $stateParams.keyword.toLowerCase();
                            fullSupplyLineItems = fullSupplyLineItems.filter(function(lineItem) {
                                var productName = _.get(lineItem, ['orderable', 'fullProductName'], '').toLowerCase();
                                var productCode = _.get(lineItem, ['orderable', 'productCode'], '').toLowerCase();
                                return productName.includes(keyword) || productCode.includes(keyword);
                            });
                        }
                        var programNeedSortByProductCode = ['VC', 'MMC'];
                        var sortOrder = programNeedSortByProductCode.includes(program.code) ?  [
                            '$program.orderableCategoryDisplayOrder',
                            '$program.orderableCategoryDisplayName',
                            '$program.displayOrder',
                            'orderable.productCode',
                            'orderable.fullProductName'
                        ] : [
                            '$program.orderableCategoryDisplayOrd er',
                            '$program.orderableCategoryDisplayName',
                            '$program.displayOrder',
                            'orderable.fullProductName'
                        ];
                        return $filter('orderBy')(fullSupplyLineItems, sortOrder);
                    },
                    items: function(paginationService, lineItems, $stateParams, requisitionValidator,
                        paginationFactory, requisition) {
                        var paginationParams = {
                            fullSupplyListPage: $stateParams.fullSupplyListPage,
                            fullSupplyListSize: requisition.isInitForClient
                                ? Number.MAX_SAFE_INTEGER : $stateParams.fullSupplyListSize
                        };
                        return paginationService.registerList(
                            requisitionValidator.isLineItemValid, paginationParams, function(params) {
                                return paginationFactory.getPage(lineItems, parseInt(params.page),
                                    parseInt(params.size));
                            }, {
                                paginationId: 'fullSupplyList'
                            }
                        );
                    },
                    columns: function(requisition) {
                        return requisition.getColumns(requisition.isInitForClient);
                    },
                    fullSupply: function() {
                        return true;
                    },
                    hasAuthorizeRight: function(authorizationService, requisition) {
                        return authorizationService.hasRight(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, {
                            programId: requisition.program.id,
                            facilityId: requisition.facility.id
                        });
                    }
                }
            });
        // #441: Facility user can create requisition with regimen section
        siglusAddRegimensModalStateProvider
            .stateWithAddRegimensChildState('openlmis.requisitions.requisition.fullSupply');
        // #441: ends here
    }

})();
