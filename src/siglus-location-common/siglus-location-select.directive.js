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
        .module('siglus-location-common')
        .directive('siglusLocationSelect', [function() {
            return {
                templateUrl: 'siglus-location-common/siglus-location-select.html',
                restrict: 'E',
                scope: {
                    lineItem: '=',
                    lineItems: '=',
                    areaLocationInfo: '<',
                    index: '<',
                    errorField: '<'
                },
                controller: ['$scope', 'messageService',
                    function($scope, messageService) {
                        $scope.field = $scope.errorField ? $scope.errorField : '$error';
                        $scope.selectedOption = undefined;
                        var productEmpty = 'product.empty';
                        $scope.$watch('lineItem.moveTo.locationCode', function() {
                            if (!$scope.options) {
                                $scope.options = $scope.lineItem.destLocationOptions.map(function(option) {
                                    var target = _.find($scope.areaLocationInfo, function(areaLocation) {
                                        return areaLocation.locationCode === option;
                                    });
                                    var isEmpty = _.get(target, 'isEmpty');
                                    return isEmpty ? '[' + messageService.get(productEmpty) + '] ' + option : option;
                                });
                            }
                            var initValue = _.get($scope.lineItem, ['moveTo', 'locationCode']);
                            if (initValue) {
                                $scope.selectedOption = _.find($scope.options, function(option) {
                                    return option.replace('[' + messageService.get(productEmpty) + '] ', '')
                                    === initValue.replace('[' + messageService.get(productEmpty) + '] ', '');
                                });
                            } else {
                                $scope.selectedOption = undefined;
                            }
                        }, true);
                        $scope.$watch('lineItem.moveTo.area', function() {
                            $scope.options = $scope.lineItem.destLocationOptions.map(function(option) {
                                var target = _.find($scope.areaLocationInfo, function(areaLocation) {
                                    return areaLocation.locationCode === option;
                                });
                                var isEmpty = _.get(target, 'isEmpty');
                                return isEmpty ? '[' + messageService.get(productEmpty) + '] ' + option : option;
                            });
                        }, true);

                        $scope.changeMoveToLocation = function() {
                            if ($scope.selectedOption) {
                                $scope.lineItem.moveTo = {};
                                $scope.lineItem.moveTo.locationCode =
                                 $scope.selectedOption.replace('[' + messageService.get(productEmpty) + '] ', '');
                            } else {
                                $scope.lineItem.moveTo.locationCode = undefined;
                            }

                            $scope.$emit('locationCodeChange', {
                                lineItem: $scope.lineItem,
                                lineItems: $scope.lineItems,
                                index: $scope.index
                            });
                        };
                    }],
                replace: true
            };
        }]);
})();
