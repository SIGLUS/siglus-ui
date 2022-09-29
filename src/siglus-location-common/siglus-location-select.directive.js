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
                    areaLocationInfo: '<'
                },
                controller: ['$scope',
                    function($scope) {
                        $scope.optionToIsEmptyFlag = {};

                        $scope.selectedOption = undefined;

                        $scope.$watch('lineItem.moveTo.locationCode', function() {
                            var initValue = _.get($scope.lineItem, ['moveTo', 'locationCode']);
                            if (initValue) {
                                $scope.selectedOption = _.find($scope.options, function(option) {
                                    return option.replace('[empty]', '') === initValue.replace('[empty]', '');
                                });
                            } else {
                                $scope.selectedOption = '';
                            }
                        }, true);
                        $scope.$watch('lineItem.moveTo.area', function() {
                            $scope.options = $scope.lineItem.destLocationOptions.map(function(option) {
                                var target = _.find($scope.areaLocationInfo, function(areaLocation) {
                                    return areaLocation.locationCode === option;
                                });
                                var isEmpty = _.get(target, 'isEmpty');
                                $scope.optionToIsEmptyFlag[option] = isEmpty;
                                return isEmpty ? '[empty]' + option : option;
                            });
                        }, true);

                        $scope.changeMoveToLocation = function() {
                            if ($scope.selectedOption) {
                                $scope.lineItem.moveTo.locationCode = $scope.selectedOption.replace('[empty]', '');
                            } else {
                                $scope.lineItem.moveTo.locationCode = undefined;
                            }

                            $scope.$emit('locationCodeChange', {
                                lineItem: $scope.lineItem,
                                lineItems: $scope.lineItems
                            });
                        };
                    }],
                replace: true
            };
        }]);
})();