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
                        var programNeedSortByProductCode = ['VC', 'MMC', 'TR', 'TB', 'T'];
                        var sortOrder = programNeedSortByProductCode.includes(program.code) ?  [
                            '$program.orderableCategoryDisplayOrder',
                            '$program.orderableCategoryDisplayName',
                            '$program.displayOrder',
                            'orderable.productCode',
                            'orderable.fullProductName'
                        ] : [
                            '$program.orderableCategoryDisplayOrder',
                            '$program.orderableCategoryDisplayName',
                            '$program.displayOrder',
                            'orderable.fullProductName'
                        ];
                        // TODO community table component will merge the lines with same category in one page
                        // even sort is correct
                        var productOrder = ['08L08', '08L07', '08L06Z', '08L0XX', '08L09', '08M01', '08M02',
                            '08L10Z', '08L10', '08L06YZ', '08L06Y', '08L02Z', '08L02', '08L11X', '08L11Y', '08H07XZ',
                            '08H07X', '08L10X', '08L11Z', '08L12X', '08L05Y', '08L05', '08D01I', '08C01', '08L11I',
                            '08L11W', '08L04', '08L03', '08H07Y', '08H07', '08L06X', '08L06XZ', '12D14', '12D14Z'];
                        function sortProductLineItems(productLineItems) {
                            var sort = [];
                            productOrder.forEach(function(c) {
                                var found = _.find(productLineItems, function(p) {
                                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                                });
                                if (found) {
                                    sort.push(found);
                                }
                            });

                            var allDefined = {};
                            productOrder.forEach(function(code) {
                                allDefined[code] = true;
                            });

                            var otherLineItems = productLineItems.filter(function(p) {
                                var code = _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                                return code && !allDefined[code];
                            });

                            otherLineItems.sort(function(a, b) {
                                return _.get(a, ['orderable', 'productCode'])
                                    .localeCompare(_.get(b, ['orderable', 'productCode']));
                            });

                            return [].concat(
                                sort,
                                otherLineItems
                            );
                        }

                        var productOrder1 = ['08S18WI', '08S18W', '08S40', '08S18Z', '08S01ZY', '08S30WZ',
                            '08S30ZY', '08S38Z', '08S30Y', '08S29'];
                        var productOrder2 = ['08S01ZV', '08S01ZVI', '08S30ZW', '08S39B', '08S01Zw', '08S40Z'];
                        var productOrder3 = ['08S23', '08S17'];

                        function sortMMIAProductLineItems(productLineItems) {
                            var sort1 = [];
                            productOrder1.forEach(function(c) {
                                var found = _.find(productLineItems, function(p) {
                                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                                });
                                if (found) {
                                    sort1.push(found);
                                }
                            });

                            var sort2 = [];
                            productOrder2.forEach(function(c) {
                                var found = _.find(productLineItems, function(p) {
                                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                                });
                                if (found) {
                                    sort2.push(found);
                                }
                            });

                            var sort3 = [];
                            productOrder3.forEach(function(c) {
                                var found = _.find(productLineItems, function(p) {
                                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                                });
                                if (found) {
                                    sort3.push(found);
                                }
                            });

                            var allDefined = {};
                            productOrder1.concat(productOrder2, productOrder3).forEach(function(code) {
                                allDefined[code] = true;
                            });

                            var otherLineItems = productLineItems.filter(function(p) {
                                var code = _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                                return code && !allDefined[code];
                            });

                            otherLineItems.sort(function(a, b) {
                                return _.get(a, ['orderable', 'productCode'])
                                    .localeCompare(_.get(b, ['orderable', 'productCode']));
                            });

                            return [].concat(
                                sort1,
                                sort2,
                                sort3,
                                otherLineItems
                            );
                        }

                        if ('TB' === program.code) {
                            var sortedMMTBLineItems = sortProductLineItems(fullSupplyLineItems);
                            console.log('sortedLineItems', sortedMMTBLineItems);
                            return sortedMMTBLineItems;
                        }
                        if ('T' === program.code) {
                            var sortedMMIALineItems = sortMMIAProductLineItems(fullSupplyLineItems);
                            console.log('sortedMMIALineItems', sortedMMIALineItems);
                            return sortedMMIALineItems;
                        }
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
