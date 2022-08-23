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
     * @name stock-adjustment.controller:StockAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('siglus-location-movement-creation')
        .controller('SiglusLocationMovementCreationController', controller);

    controller.$inject = ['draftInfo', 'areaLocationInfo', 'addedLineItems', '$state', 'orderableGroups', '$filter',
        'paginationService', '$stateParams',
        'addAndRemoveLineItemService', 'displayItems', 'locations', 'siglusMovementFilterService',
        'SiglusLocationCommonUtilsService', 'siglusLocationMovementService', 'alertConfirmModalService',
        'loadingModalService', 'notificationService', 'siglusLocationCommonApiService', 'facility', 'user',
        'siglusSignatureWithDateModalService'];

    function controller(draftInfo, areaLocationInfo, addedLineItems, $state, orderableGroups,
                        $filter, paginationService, $stateParams,
                        addAndRemoveLineItemService, displayItems, locations, siglusMovementFilterService,
                        SiglusLocationCommonUtilsService,
                        siglusLocationMovementService, alertConfirmModalService, loadingModalService,
                        notificationService, siglusLocationCommonApiService, facility, user,
                        siglusSignatureWithDateModalService) {
        var vm = this;

        vm.orderableGroups = null;

        vm.selectedOrderableGroup = null;

        vm.addedLineItems = [];

        vm.facility = facility;

        vm.displayItems = displayItems || [];

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations)
            );
        };

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)
            );
        };

        vm.getAreaList = function(lineItem) {
            return _.chain(areaLocationInfo)
                .filter(function(locationInfo) {
                    var currentMoveToLocationCode = _.get(lineItem.moveTo, 'locationCode', '');
                    return currentMoveToLocationCode
                        ? currentMoveToLocationCode === locationInfo.locationCode
                        : true;
                })
                .uniq('area')
                .map(function(item) {
                    return item.area;
                })
                .value();
        };

        vm.getLocationAreaList = function(lineItem) {
            return  _.chain(areaLocationInfo)
                .filter(function(locationInfo) {
                    var currentMoveToArea = _.get(lineItem.moveTo, 'area', '');
                    return currentMoveToArea
                        ? currentMoveToArea === locationInfo.area
                        : true;
                })
                .uniq('locationCode')
                .map(function(item) {
                    return item.locationCode;
                })
                .value();
        };

        vm.$onInit = function() {
            vm.addedLineItems = addedLineItems;
            vm.displayItems = displayItems;
            filterOrderableGroups();

            return paginationService.registerList(isValid, angular.copy($stateParams), function() {
                return vm.addedLineItems;
            });
        };

        function filterOrderableGroups() {

            var addedOrderableIds = _.map(vm.addedLineItems, function(group) {
                return _.first(group).orderableId;
            });
            vm.orderableGroups = _.chain(orderableGroups)
                .map(function(group) {
                    return _.first(group);
                })
                .filter(function(item) {
                    return !_.isEmpty(item) && !_.includes(addedOrderableIds, item.orderable.id);
                })
                .value();
        }

        vm.orderableSelectionChanged = function() {

        };

        vm.addProduct = function() {
            var orderable = vm.selectedOrderableGroup.orderable;
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                orderableIds: [orderable.id],
                extraData: true
            })
                .then(function(locationsInfo) {
                    locations = locations.concat(locationsInfo);
                    var firstRow = addAndRemoveLineItemService.getAddProductRow(orderable);
                    vm.addedLineItems.unshift([firstRow]);
                    searchList();
                })
                .finally(function() {
                    loadingModalService.close();
                });

        };

        function searchList() {
            // vm.displayItems = siglusMovementFilterService.filterMovementList(vm.keyword, vm.addedLineItems);
            $stateParams.locations = locations;
            $stateParams.areaLocationInfo = areaLocationInfo;
            $stateParams.keyword = vm.keyword;
            $stateParams.addedLineItems = vm.addedLineItems;
            console.log(vm.addedLineItems);
            $stateParams.orderableGroups = orderableGroups;
            $stateParams.draftInfo = draftInfo;
            $stateParams.user = user;
            $stateParams.facility = facility;
            // $stateParams.displayItems = vm.displayItems;
            reloadPage();
        }

        function emitQuantityChange(lineItem, lineItems) {
            if (lineItem.lot && lineItem.location) {
                lineItem.stockOnHand = _.get(lineItem.lot, 'stockOnHand', 0);
                vm.changeQuantity(lineItem, lineItems);
            } else {
                lineItem.stockOnHand = 0;
            }
        }

        vm.changeLot = function(lineItem, lineItems) {
            lineItem.$error.lotCodeError = _.isEmpty(lineItem.lot) ? 'openlmisForm.required' : '';
            emitQuantityChange(lineItem, lineItems);

        };

        vm.changeLocation = function(lineItem, lineItems) {
            lineItem.$error.locationError = _.isEmpty(lineItem.location) ? 'openlmisForm.required' : '';
            emitQuantityChange(lineItem, lineItems);
        };

        vm.changeArea = function(lineItem) {
            lineItem.$error.areaError = _.isEmpty(_.get(lineItem.moveTo, 'area')) ? 'openlmisForm.required' : '';
        };

        vm.changeMoveToLocation = function(lineItem) {
            lineItem.$error.moveToLocationArea = _.isEmpty(_.get(lineItem.moveTo, 'locationCode'))
                ? 'openlmisForm.required' : '';
        };

        vm.getStockOnHand = function(lineItem, lineItems, index) {
            if (index === 0) {
                var mappedData = _.map(lineItems, function(item) {
                    return {
                        lotCode: _.get(item.lot, 'lotCode', ''),
                        locationCode: _.get(item.location, 'locationCode', ''),
                        lotLocationCode: _.get(item.lot, 'lotCode') + _.get(item.location, 'locationCode'),
                        stockOnHand: item.stockOnHand
                    };
                });
                var filerLineItems = _.uniq(mappedData, false, function(item) {
                    return item.lotLocationCode;
                });
                return _.reduce(filerLineItems, function(sum, item) {
                    return sum + item.stockOnHand;
                }, 0);
            }
            return lineItem.stockOnHand;
        };

        vm.changeQuantity = function(lineItem, lineItems) {
            var isNumberEmpty =  _.isNumber(lineItem.quantity) ? lineItem.quantity < 0 : true;
            lineItem.$error.quantityError = isNumberEmpty ? 'openlmisForm.required' : '';

            if (!lineItem.$error.quantityError) {
                validateQuantityMtSoh(lineItem, lineItems);
            }

        };

        vm.addItem = function(lineItem, lineItems) {
            addAndRemoveLineItemService.addLineItem(lineItem, lineItems);
        };

        vm.removeItem = function(lineItems, index) {
            addAndRemoveLineItemService.removeItem(lineItems, index);
            if (lineItems.length === 0) {
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
                filterOrderableGroups();
            }
            searchList();
        };

        function validateQuantityMtSoh(lineItem, lineItems) {
            _.forEach(lineItems, function(item) {
                var filterLineItems = _.filter(lineItems, function(data) {
                    return _.get(item, ['lot', 'lotCode']) === _.get(data.lot, 'lotCode')
                      && _.get(item, ['location', 'locationCode']) === _.get(data.location, 'locationCode');
                });
                var totalQuantity = _.reduce(filterLineItems, function(result, row) {
                    return result + _.get(row, 'quantity', 0);
                }, 0);
                if (totalQuantity > item.stockOnHand) {
                    item.$error.quantityError = 'locationMovement.mtSoh';
                } else {
                    item.$error.quantityError = '';
                }

            });
        }

        function reloadPage() {
            $state.go($state.current.name, $stateParams, {
                reload: false
            });
        }

        vm.getTotalQuantity = function(lineItems) {
            return _.reduce(lineItems, function(sum, item) {
                return sum + (item.quantity || 0);
            }, 0);
        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return lineItem.isKit || (lineItems.length > 1 && index === 0);
        };

        vm.showEmptyBlock = function(lineItem, lineItems, index) {
            return (lineItems.length > 1 && index === 0);
        };

        vm.search = function() {
            searchList();
        };

        vm.cancelFilter = function() {
            vm.keyword = '';
            searchList();
            $stateParams.keyword = '';
            $stateParams.addedLineItems = vm.addedLineItems;
            reloadPage();
        };

        function validateLotCodeRequired(lineItem) {
            if (_.isEmpty(lineItem.lot)) {
                lineItem.$error.lotCodeError = 'openlmisForm.required';
            }
        }

        function validateLocationRequired(lineItem) {
            if (_.isEmpty(lineItem.location)) {
                lineItem.$error.locationError = 'openlmisForm.required';
            }
        }

        function validateQuantity(lineItem) {
            if (_.isEmpty(lineItem.quantity)) {
                lineItem.$error.quantityError = 'openlmisForm.required';
            }
        }

        function validateMoveToLocationRequired(lineItem) {
            if (_.isEmpty(_.get(lineItem.moveTo, 'locationCode'))) {
                lineItem.$error.moveToLocationError = 'openlmisForm.required';
            }
        }

        function validateMoveToAreaRequired(lineItem) {
            if (_.isEmpty(_.get(lineItem.moveTo, 'area'))) {
                lineItem.$error.moveToAreaError = 'openlmisForm.required';
            }
        }

        function validateForm() {
            _.forEach(vm.addedLineItems, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    lineItem.$error = {};
                    if (lineItems.length > 1 && index === 0) {
                        return;
                    }
                    validateLotCodeRequired(lineItem);
                    validateLocationRequired(lineItem);
                    validateQuantity(lineItem);
                    validateMoveToAreaRequired(lineItem);
                    validateMoveToLocationRequired(lineItem);
                    validateQuantityMtSoh(lineItem, lineItems);
                });
            });
            return _.every(vm.addedLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            });
        }

        function isValid() {
            return _.every(vm.addedLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            });
        }

        function getLineItems() {
            return _.chain(vm.addedLineItems)
                .map(function(group) {
                    if (group.length === 1) {
                        return group;
                    }
                    if (group.length > 1) {
                        var cloneGroup = _.clone(group);
                        cloneGroup.splice(0, 1);
                        return cloneGroup;
                    }
                })
                .flatten()
                .value();
        }

        vm.save = function() {
            var baseInfo = {
                id: draftInfo.id,
                programId: $stateParams.programId,
                facilityId: facility.id,
                userId: user.user_id
            };

            siglusLocationMovementService.saveMovementDraft(baseInfo, getLineItems(), locations).then(function() {
                notificationService.success('stockIssueCreation.saved');
                // draftInfo = null;
                // searchList();
            });
        };

        vm.submit = function() {
            validateForm();
            if (isValid()) {
                siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature').
                    then(function(data) {
                        console.log(data);
                    });
            }
        };

        vm.deleteDraft = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusLocationMovementService.deleteMovementDraft($stateParams.draftId)
                    .then(function() {
                        notificationService.success('stockIssueCreation.deleted');
                        $state.go('^', $stateParams, {
                            reload: true
                        });
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });

            });
        };
    }

})();
