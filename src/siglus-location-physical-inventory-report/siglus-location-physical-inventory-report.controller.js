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
        'draft',
        'facility',
        'program',
        '$stateParams',
        'localStorageService',
        'messageService'
    ];

    function controller(
        $scope,
        $window,
        draft,
        facility,
        program,
        $stateParams,
        localStorageService,
        messageService
    ) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            hideLayoutAndBreadcrumb();
            $window.onunload = function() {
                localStorageService.remove('physicalInventoryCategories');
            };
            vm.draft = vm.getTbDataSource(JSON.parse(draft));
            vm.facility = facility;
            vm.program = program;
            vm.breadcrumb = vm.getBreadcrumbName($stateParams);
        }

        var hideLayoutAndBreadcrumb = function() {
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        };

        vm.getBreadcrumbName = function(stateParams) {
            var result = messageService.get('printTemplate.breadcrumbName.subDraft', {
                number: stateParams.draftNum
            });
            if (stateParams.isMerged === 'true') {
                result =  messageService.get('printTemplate.breadcrumbName.mergedDraft');
            }
            return result;
        };

        vm.getTbDataSource = function(data) {
            var tempArray = [];
            _.forEach(Object.keys(data), function(key) {
                _.forEach(data[key], function(item) {
                    tempArray.push(item);
                });
            });

            return _.reduce(tempArray, function(r, c) {
                if (c.length > 1) {
                    var temp = _.map(c, function(item, i) {
                        var result = {
                            productCode: '',
                            product: ''
                        };
                        if (i === 0) {
                            result = {
                                productCode: c[0].orderable.productCode,
                                product: c[0].orderable.fullProductName
                            };
                        }
                        return result;
                    });
                    r = r.concat(temp);
                } else {
                    r.push({
                        productCode: c[0].orderable.productCode,
                        product: c[0].orderable.fullProductName
                    });
                }
                return r;
            }, []);
        };

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
