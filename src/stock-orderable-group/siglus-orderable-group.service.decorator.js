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
     * @name stock-orderable-group.orderableGroupService
     *
     * @description
     * Decorator orderableGroupService .
     */
    angular.module('stock-orderable-group')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('orderableGroupService', decorator);
    }

    decorator.$inject = ['$delegate', 'messageService', 'StockCardSummaryRepositoryImpl',
        'FullStockCardSummaryRepositoryImpl', 'StockCardSummaryRepository'];
    function decorator($delegate, messageService, StockCardSummaryRepositoryImpl, FullStockCardSummaryRepositoryImpl,
                       StockCardSummaryRepository) {
        var orderableGroupService = $delegate;
        var noLotDefined = {
            lotCode: messageService.get('orderableGroupService.noLotDefined')
        };

        orderableGroupService.determineLotMessage = determineLotMessage;
        orderableGroupService.findByLotInOrderableGroup = findByLotInOrderableGroup;
        orderableGroupService.lotsOf = lotsOf;
        orderableGroupService.lotsOfWithNull = lotsOfWithNull;
        orderableGroupService.findOneInOrderableGroupWithoutLot = findOneInOrderableGroupWithoutLot;
        orderableGroupService.getOrderableLots = getOrderableLots;
        orderableGroupService.uniqLots = uniqLots;
        orderableGroupService.findAvailableProductsAndCreateOrderableGroups =
            findAvailableProductsAndCreateOrderableGroups;

        return orderableGroupService;

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name lotsOf
         *
         * @description
         * Extract lots from orderable group. Adds no lot defined as an option when some group
         * has no lot
         *
         * @param {Object} orderableGroup   orderable group
         * @return {Array}                  array with lots
         */
        function lotsOf(orderableGroup) {
            var lots = _.chain(orderableGroup).pluck('lot')
                .compact()
                .value();

            var someHasLot = lots.length > 0;
            var someHasNoLot = _.any(orderableGroup, function(item) {
                return !item.lot;
            });

            if (someHasLot && someHasNoLot) {
                //add no lot defined as an option
                lots.unshift(noLotDefined);
            }
            return lots;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name determineLotMessage
         *
         * @description
         * Determines lot message based on a lot and an orderable group.
         *
         * @param {Object} orderableGroup   orderable group
         * @param {Object} selectedItem     product with lot property. Property displayLotMessage
         *                                  will be assigned to id.
         */
        function determineLotMessage(selectedItem, orderableGroup) {
            // SIGLUS-REFACTOR: starts here
            if (selectedItem.lot && selectedItem.lot.id) {
            // SIGLUS-REFACTOR: ends here
                selectedItem.displayLotMessage = selectedItem.lot.lotCode;
            } else {
                var messageKey = $delegate.lotsOf(orderableGroup).length > 0 ? 'noLotDefined' : 'productHasNoLots';
                selectedItem.displayLotMessage = messageService.get('orderableGroupService.' + messageKey);
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name areOrderablesUseVvm
         *
         * @description
         * Find product in orderable group based on lot.
         *
         * @param {Object} orderableGroup   orderable group
         * @param {Object} selectedLot      selected lot
         * @return {Object}                 found product
         */
        function findByLotInOrderableGroup(orderableGroup, selectedLot) {
            var selectedItem = _.chain(orderableGroup)
                .find(function(groupItem) {
                    // SIGLUS-REFACTOR: strats here
                    var selectedNoLot = !groupItem.lot && (!selectedLot || angular.equals(selectedLot, noLotDefined));
                    var lotMatch = groupItem.lot && angular.equals(groupItem.lot, selectedLot);
                    // SIGLUS-REFACTOR: ends here
                    return selectedNoLot || lotMatch;
                })
                .value();

            if (selectedItem) {
                determineLotMessage(selectedItem, orderableGroup);
            }
            return selectedItem;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name lotsOfWithNull
         *
         * @description
         * get lots without null
         */
        function lotsOfWithNull(orderableGroup) {
            var lots = _.chain(orderableGroup).pluck('lot')
                .value();
            return lots;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name findOneInOrderableGroupWithoutLot
         *
         * @description
         * find without lot and SOH
         */
        function findOneInOrderableGroupWithoutLot(orderableGroup) {
            var selectedItem = angular.copy(orderableGroup[0]);
            selectedItem.lot = undefined;
            return selectedItem;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name getOrderableLots
         *
         * @description
         * get orderable lots
         */
        function getOrderableLots(items) {
            return _.chain(items)
                .filter(function(item) {
                    return item.lot && item.lot.id;
                })
                .map(function(item) {
                    return _.extend(item.lot, {
                        orderableId: item.orderable.id
                    });
                })
                .groupBy('orderableId')
                .value();
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name uniqLots
         *
         * @description
         * uniq lots
         */
        function uniqLots(lots) {
            var uniq = {};
            _.forEach(lots, function(lot) {
                uniq[lot.id] = lot;
            });
            return _.values(uniq);
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name findAvailableProductsAndCreateOrderableGroups
         *
         * @description
         * Finds available Stock Products by facility and program, then groups product items
         * by orderable id.
         */
        function findAvailableProductsAndCreateOrderableGroups(programId, facilityId, includeApprovedProducts,
                                                               rightName) {
            var repository;
            if (includeApprovedProducts) {
                repository = new StockCardSummaryRepository(new FullStockCardSummaryRepositoryImpl());
            } else {
                repository = new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl());
            }

            return repository.query({
                programId: programId,
                facilityId: facilityId,
                rightName: rightName
            }).then(function(summaries) {
                return $delegate.groupByOrderableId(summaries.content.reduce(function(items, summary) {
                    summary.canFulfillForMe.forEach(function(fulfill) {
                        items.push(fulfill);
                    });
                    return items;
                }, []));
            });
        }
    }
})();
