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
        .module('siglus-stock-input-select')
        .directive('siglusStockInputSelect', [function() {
            return {
                templateUrl: 'siglus-stock-input-select/siglus-stock-input-select.html',
                restrict: 'E',
                scope: {
                    lineItem: '=',
                    lineItems: '=',
                    enableInput: '<'
                },
                controller: ['$scope', 'orderableGroupService', 'siglusAutoGenerateService',
                    'siglusOrderableLotMapping', '$timeout', 'messageService', 'dateUtils',
                    function($scope, orderableGroupService, siglusAutoGenerateService,
                        siglusOrderableLotMapping, $timeout, messageService, dateUtils) {
                        $scope.$watch('lineItem.lot', function(newLot, oldLot) {
                            if ((!_.isEqual(newLot, oldLot))) {
                                $scope.$emit('lotCodeChange', {
                                    lineItem: $scope.lineItem
                                });
                            }
                        }, true);

                        $scope.$watch('lineItem.lot.expirationDate', function(newDate, oldDate) {
                            var lineItem = $scope.lineItem;

                            newDate = angular.isDate(newDate) ? dateUtils.toStringDate(newDate) : newDate;
                            oldDate = angular.isDate(oldDate) ? dateUtils.toStringDate(oldDate) : oldDate;
                            if (newDate && newDate !== oldDate
                                && (lineItem.lot.isAuto || lineItem.isTryAuto)) {
                                // id means from option
                                if (!lineItem.lot.id) {
                                    var lotCode = siglusAutoGenerateService.autoGenerateLotCode(lineItem);
                                    lineItem.lot = {
                                        lotCode: lotCode,
                                        expirationDate: lineItem.lot.expirationDate,
                                        isAuto: true
                                    };
                                    lineItem.isTryAuto = false;
                                }
                            }
                        });

                        $scope.select = function(lotCode) {
                            var lineItem = $scope.lineItem;
                            var option = findLotOptionByCode(lineItem.lotOptions, lotCode);
                            lineItem.lot = angular.copy(option);
                            lineItem.isFromInput = false;
                            lineItem.isFromSelect = true;

                            var selectedOrderableGroup = siglusOrderableLotMapping
                                .findSelectedOrderableGroupsByOrderableId(lineItem.orderable.id);
                            var selectedItem = orderableGroupService
                                .findByLotInOrderableGroup(selectedOrderableGroup, lineItem.lot);

                            // if auto generate, then no selectedItem
                            lineItem.$previewSOH = selectedItem ? selectedItem.stockOnHand : null;
                            $scope.hideAllSelect();
                        };

                        $scope.autoLotCode = function() {
                            var lineItem = $scope.lineItem;
                            //lot.id means option
                            if (lineItem.lot && lineItem.lot.expirationDate && !lineItem.lot.id) {
                                var lotCode = siglusAutoGenerateService.autoGenerateLotCode(lineItem);
                                $scope.lineItem.lot = {
                                    lotCode: lotCode,
                                    expirationDate: lineItem.lot.expirationDate,
                                    isAuto: true
                                };
                                $scope.lineItem.isFromInput = false;
                                $scope.lineItem.isFromSelect = true;

                            } else {
                                lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
                                lineItem.isTryAuto = true;
                                lineItem.lot = null;
                            }
                            $scope.hideAllSelect();
                            lineItem.$previewSOH = null;

                        };

                        $scope.input = function(lineItem) {
                            lineItem.isFromInput = true;
                            lineItem.isFromSelect = false;
                        };

                        function findLotOptionByCode(options, lotCode) {
                            return _.findWhere(options, {
                                lotCode: lotCode
                            });
                        }

                        $scope.finishInput = function(lineItem) {
                            if (lineItem.lot && lineItem.isFromInput) {
                                lineItem.lot.lotCode = lineItem.lot.lotCode.toUpperCase();
                                var option = findLotOptionByCode(lineItem.lotOptions, lineItem.lot.lotCode);
                                if (_.isUndefined(option)) {
                                    // not found then reset, only keep lot code

                                    lineItem.lot = {
                                        lotCode: lineItem.lot.lotCode
                                    };
                                    lineItem.$previewSOH = null;
                                } else {
                                    // if found option
                                    var selectedOrderableGroup = siglusOrderableLotMapping
                                        .findSelectedOrderableGroupsByOrderableId(lineItem.orderable.id);
                                    var selectedItem = orderableGroupService
                                        .findByLotInOrderableGroup(selectedOrderableGroup, option);

                                    lineItem.showSelect = false;
                                    lineItem.isAuto = false;

                                    lineItem.lot = angular.copy(option);

                                    lineItem.isFromInput = true;
                                    $scope.hideAllSelect();
                                    if (selectedItem) {
                                        lineItem = _.extend(lineItem, selectedItem);
                                        lineItem.$previewSOH = selectedItem.stockOnHand;
                                    }
                                }
                            }
                        };

                        $scope.clearLot = function(lineItem) {
                            lineItem.lot = null;
                            lineItem.lotCode = null;
                            lineItem.lotId = null;
                            lineItem.$previewSOH = null;
                            lineItem.showSelect = false;
                            $timeout(function() {
                                validateRequiredLot(lineItem);
                                validateRequiredLotDate(lineItem);
                            }, 100);
                        };

                        function validateRequiredLot(lineItem) {
                            if (!lineItem.isKit) {
                                if ((lineItem.lot && lineItem.lot.lotCode) || lineItem.lotId) {
                                    lineItem.$errors.lotCodeInvalid = false;
                                } else {
                                    lineItem.$errors.lotCodeInvalid = messageService.get('openlmisForm.required');
                                }
                            }
                        }

                        function validateRequiredLotDate(lineItem) {
                            if (!lineItem.isKit) {
                                if (lineItem.lot && lineItem.lot.expirationDate) {
                                    lineItem.$errors.lotDateInvalid = false;
                                } else {
                                    lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
                                }
                            }
                        }
                    }],
                replace: true,
                link: function(scope, element) {
                    $('.adjustment-custom-item').click(function(event) {
                        event.stopPropagation();
                    });

                    $('.stock-select-container').click(function(event) {
                        event.stopPropagation();
                    });

                    $(window).click(function() {
                        scope.hideAllSelect();
                    });

                    var body = angular.element(document).find('body');
                    scope.showSelect = function($event, lineItem) {
                        if (!lineItem.showSelect) {
                            lineItem.showSelect = true;
                            scope.hideAllSelect();
                            var offset = element.offset();
                            var target = element
                                .find('.adjustment-custom-item-wrapper').first()
                                .find('.adjustment-custom-item')
                                .clone();
                            target.css({
                                position: 'absolute',
                                top: (offset.top + 35),
                                left: offset.left
                            });
                            // ng-click will not work after element move;
                            target.find('.auto').first()
                                .on('click', autoLotCode);
                            target.find('.option')
                                .on('click', select);
                            body.append(target);
                        }
                    };

                    scope.hideAllSelect = function() {
                        scope.lineItem.showSelect = false;
                        body.find('> .adjustment-custom-item').remove();
                    };

                    function autoLotCode() {
                        scope.$apply(function() {
                            scope.autoLotCode();
                        });
                    }

                    function select(event) {
                        scope.$apply(function() {
                            scope.select(event.target.innerHTML);
                        });
                    }

                }
            };
        }]);
})();
