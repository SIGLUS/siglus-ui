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
        .module('siglus-location-physical-inventory-report')
        .controller('SiglusLocationPhysicalInventoryReport', controller);

    controller.$inject = [
        '$scope',
        '$window',
        'lineItemsGroup',
        'facility',
        'program',
        'isMerged'
    ];

    function controller(
        $scope,
        $window,
        lineItemsGroup,
        facility,
        program,
        isMerged
    ) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            hideLayoutAndBreadcrumb();
            vm.lineItemsGroup = lineItemsGroup;
            vm.notMergedLineItems = buildDataForNotMergedLineItems(lineItemsGroup);
            vm.facility = facility;
            vm.program = program;
            vm.isMerged = isMerged;
        }

        function hideLayoutAndBreadcrumb() {
            var breadcrumbComponent =  document.querySelector('openlmis-breadcrumbs');
            if (breadcrumbComponent) {
                breadcrumbComponent.style.display = 'none';
            }

            var headerComponent = document.querySelector('header');
            if (headerComponent) {
                headerComponent.style.display = 'none';
            }
        }

        function isEmpty(value) {
            return value === '' || value === undefined || value === null;
        }

        vm.calculate = function(lineItems, field) {
            var allEmpty = _.every(lineItems, function(lineItem) {
                return isEmpty(lineItem[field]);
            });
            if (allEmpty) {
                return undefined;
            }

            return _.chain(lineItems).map(function(lineItem) {
                return lineItem[field];
            })
                .compact()
                .reduce(function(memo, num) {
                    return parseInt(num) + memo;
                }, 0)
                .value();
        };

        function buildDataForNotMergedLineItems(lineItemsGroup) {
            return _.reduce(lineItemsGroup, function(flattenedLineItems, lineItems) {
                var lineItemInfoToDisplay = {
                    productCode: _.get(lineItems[0], ['orderable', 'productCode']),
                    product: _.get(lineItems[0], ['orderable', 'fullProductName'])
                };
                flattenedLineItems.push(lineItemInfoToDisplay);

                if (lineItems.length > 1) {
                    var lotList = lineItems.map(function() {
                        return {
                            productCode: '',
                            product: ''
                        };
                    });
                    flattenedLineItems = flattenedLineItems.concat(lotList);
                }

                return flattenedLineItems;
            }, []);
        }

        $scope.$on('$destroy', function() {
            $window.onunload = null;
        });
        $scope.$on('$stateChangeStart', function(event, toState) {
            if (toState) {
                document.getElementsByClassName('header')[0].style.display = 'block';
                document.getElementsByClassName('page')[0].childNodes[1].style.display = 'block';
            }
        });
    }

})();
