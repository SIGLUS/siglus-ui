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
   * @name stock-issue-creation.controller:SiglusStockIssueCreationController
   *
   * @description
   * Controller for managing stock issue creation.
   */
    angular
        .module('siglus-stock-issue-view')
        .controller('SiglusStockIssueViewController', controller);

    controller.$inject = [
        '$scope', 'draft', 'initialDraftInfo', '$state', '$stateParams', '$filter', 'confirmDiscardService',
        'confirmService', 'messageService',
        'adjustmentType', 'paginationService', 'addedLineItems', 'siglusStockUtilsService'
    ];

    function controller($scope, draft, initialDraftInfo, $state, $stateParams, $filter, confirmDiscardService,
                        confirmService, messageService, adjustmentType, paginationService, addedLineItems,
                        siglusStockUtilsService) {
        var vm = this;

        vm.initialDraftInfo = initialDraftInfo;

        vm.displayName = '';

        vm.isLocation = false;

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + 'Creation.' + secondaryKey;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name search
     *
     * @description
     * It searches from the total line items with given keyword. If keyword is empty then all line
     * items will be shown.
     */
        vm.search = function() {
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.draft = draft;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = 0;
            $state.go($state.current.name, $stateParams, {
                location: 'replace',
                reload: true
            });
        };

        function search(keyword, items) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = items;
            } else {
                keyword = keyword.trim();
                result = _.filter(items, function(item) {
                    var hasStockOnHand = !(_.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand));
                    var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
                    var searchableFields = [
                        item.productCode,
                        item.productName,
                        hasStockOnHand ? item.stockOnHand.toString() : '',
                        item.reason && item.reason.name ? item.reason.name : '',
                        _.get(item, 'reasonFreeText', ''),
                        hasQuantity ? item.quantity.toString() : '',
                        _.get(item, 'lotCode', ''),
                        item.expirationDate,
                        item.assignment ? item.assignment.name : '',
                        _.get(item, 'srcDstFreeText', ''),
                        item.occurredDate
                    ];
                    return _.any(searchableFields, function(field) {
                        // SIGLUS-REFACTOR: starts here
                        if (!field) {
                            return false;
                        }
                        // SIGLUS-REFACTOR: ends here
                        return field.toLowerCase().contains(keyword.toLowerCase());
                    });
                });
            }

            return result;
        }

        vm.returnBack = function() {
            $state.go('^', $stateParams);
        };

        // SIGLUS-REFACTOR: starts here
        vm.doCancelFilter = function() {
            if ($stateParams.keyword) {
                cancelFilter();
            }
        };

        $scope.$watch(function() {
            return vm.keyword;
        }, function(newValue, oldValue) {
            if (oldValue && !newValue && $stateParams.keyword) {
                cancelFilter();
            }
        });

        function onInit() {
            $state.current.label = messageService.get('stockIssue.draft') + ' ' + draft.draftNumber;
            initViewModel();
            initStateParams();
            vm.isLocation = $stateParams.moduleType === 'locationManagement';
        }

        function initViewModel() {

            vm.displayName = siglusStockUtilsService
                .getInitialDraftName(vm.initialDraftInfo, $stateParams.draftType);

            vm.keyword = $stateParams.keyword;
            vm.filterLineItems = search($stateParams.keyword, addedLineItems);

            paginationService.registerList(null, $stateParams, function() {
                return vm.filterLineItems;
            });
        }

        function initStateParams() {
            $stateParams.page = getPageNumber();
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.filterLineItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        function cancelFilter() {
            vm.keyword = null;
            $stateParams.keyword = null;
            $stateParams.page = 0;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.draft = draft;
            $state.go($state.current.name, $stateParams, {
                location: 'replace',
                reload: true
            });
        }
        onInit();

    }

})();
