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
     * @ngdoc controller
     * @name siglus-location-physical-inventory-draft.controller:LocationPhysicalInventoryDraftController
     *
     * @description
     * Controller for managing physical inventory draft.
     */
    angular
        .module('siglus-location-physical-inventory-print')
        .controller('LocationPhysicalInventoryPrintController', controller);

    controller.$inject = ['draft', '$scope', '$window', '$stateParams',
        'facility', 'program', 'messageService'];

    function controller(
        draft, $scope, $window, $stateParams,
        facility, program, messageService
    ) {

        var vm = this;
        vm.$onInit = onInit;
        vm.groupedCategories = [];
        vm.isMerged = undefined;
        vm.isInitialInventory = undefined;
        vm.inInitialList = new Array(80);
        vm.locationList = [];
        vm.draftNumber = undefined;
        function onInit() {
            hideLayoutAndBreadcrumb();
            vm.groupedCategories = draft;
            vm.facility = facility;
            vm.program = program;
            vm.isMerged = $stateParams.isMerged === 'true';
            vm.isInitialInventory = $stateParams.isInitialInventory === 'true';
            vm.breadcrumb = vm.getBreadcrumbName($stateParams);
            var newLocationList = _.chain(draft)
                .keys()
                .chunk(10)
                .map(function(item) {
                    if (item.length < 10) {
                        var fixedLengthArr = new Array(10);
                        return _.map(fixedLengthArr, function(i, j) {
                            return i = item[j] ? item[j] : '';
                        });
                    }
                    return item;
                })
                .value();
            vm.locationList = newLocationList;
            vm.draftNumber = $stateParams.draftNum ? $stateParams.draftNum : null;
        }

        vm.getBreadcrumbName = function(stateParams) {
            var result = messageService.get('printTemplate.breadcrumbName.subDraft', {
                number: stateParams.draftNum
            });
            if (stateParams.isMerged === 'true') {
                result =  messageService.get('printTemplate.breadcrumbName.mergedDraft');
            }
            return result;
        };

        var hideLayoutAndBreadcrumb = function() {
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
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