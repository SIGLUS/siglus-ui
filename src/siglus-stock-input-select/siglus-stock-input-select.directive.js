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
                    enableInput: '<',
                    compId: '=',
                    disabled: '=',
                    index: '=',
                    hideExpiredPopover: '='
                },
                controller: ['$scope', 'orderableGroupService', 'siglusAutoGenerateService',
                    'siglusOrderableLotMapping', '$timeout', 'messageService', 'dateUtils',
                    'SIGLUS_LOT_CODE_REGEXP', 'moment', 'SIGLUS_LOT_CODE_DATE_FORMATE',
                    'SIGLUS_LOT_CODE_REGEXP_REPLACE', 'SIGLUS_LOT_CODE_DATE_ISVALID',
                    function($scope, orderableGroupService, siglusAutoGenerateService,
                        siglusOrderableLotMapping, $timeout, messageService, dateUtils,
                        SIGLUS_LOT_CODE_REGEXP, moment, SIGLUS_LOT_CODE_DATE_FORMATE,
                        SIGLUS_LOT_CODE_REGEXP_REPLACE, SIGLUS_LOT_CODE_DATE_ISVALID) {
                        $scope.$watch('lineItem.lot', function(newLot, oldLot) {
                            if ((!_.isEqual(newLot, oldLot))) {
                                $scope.$emit('lotCodeChange', {
                                    lineItem: $scope.lineItem,
                                    lineItems: $scope.lineItems,
                                    index: $scope.index
                                });
                            }
                        }, true);

                        $scope.$watch('lineItem.lot.expirationDate', function(newDate, oldDate) {
                            var lineItem = $scope.lineItem;

                            newDate = angular.isDate(newDate) ? dateUtils.toStringDate(newDate) : newDate;
                            oldDate = angular.isDate(oldDate) ? dateUtils.toStringDate(oldDate) : oldDate;
                            if (newDate && newDate !== oldDate) {
                                if (!lineItem.lot.id) {
                                    if (SIGLUS_LOT_CODE_REGEXP.test(lineItem.lot.lotCode)
                                    && moment(lineItem.lot.lotCode.slice(-10), SIGLUS_LOT_CODE_DATE_ISVALID).isValid()
                                    ) {
                                        lineItem.lot.lotCode = lineItem.lot.lotCode
                                            .replace(SIGLUS_LOT_CODE_REGEXP_REPLACE,
                                                moment(lineItem.lot.expirationDate)
                                                    .format(SIGLUS_LOT_CODE_DATE_FORMATE));
                                    } else if (_.get(lineItem, ['lot', 'lotCode'])) {
                                        lineItem.lot.lotCode = lineItem.lot.lotCode +
                                        moment(lineItem.lot.expirationDate).format(SIGLUS_LOT_CODE_DATE_FORMATE);
                                    }
                                }
                            }
                        });

                        $scope.select = function(lotCode) {
                            lotCode = lotCode.replace(/^\[Expired\]\s|\[Expirado\]\s/, '');
                            var lineItem = $scope.lineItem;
                            var option = findLotOptionByCode(lineItem.lotOptions, lotCode);
                            lineItem.lot = angular.copy(option);
                            lineItem.isFromInput = false;
                            lineItem.isFromSelect = true;

                            var selectedOrderableGroup = siglusOrderableLotMapping
                                .findSelectedOrderableGroupsByOrderableId(lineItem.orderable.id);
                            var selectedItem = orderableGroupService
                                .findByLotInOrderableGroup(selectedOrderableGroup, lineItem.lot);

                            lineItem.$previewSOH = selectedItem ? selectedItem.stockOnHand : null;
                            // if auto generate, then no selectedItem、
                            setTimeout(function() {
                                $scope.hideAllSelect();
                            }, 100);
                        };

                        $scope.autoLotCode = function() {
                            var lineItem = $scope.lineItem;
                            //lot.id means option
                            if (lineItem.lot && lineItem.lot.expirationDate && !lineItem.lot.id) {
                                var lotCode = siglusAutoGenerateService.autoGenerateLotCode(lineItem);
                                $scope.lineItem.lot = {
                                    lotCode: lotCode,
                                    expirationDate: lineItem.lot.expirationDate
                                };
                                $scope.lineItem.isFromInput = false;
                                $scope.lineItem.isFromSelect = true;

                            } else {
                                lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
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
                                var validInputLotCode = validateInputLotCode(lineItem.lot.lotCode);
                                lineItem.lot.lotCode = validInputLotCode.toUpperCase();
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

                                    lineItem.lot = angular.copy(option);

                                    lineItem.isFromInput = true;
                                    $scope.hideAllSelect();
                                    if (selectedItem) {
                                        lineItem = _.assign(lineItem, selectedItem, {
                                            occurredDate: lineItem.occurredDate
                                        });
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

                        $scope.testLotCode = function() {
                            var lineItem = $scope.lineItem;
                            if (_.get(lineItem, ['lot', 'lotCode'])) {
                                if (SIGLUS_LOT_CODE_REGEXP.test(lineItem.lot.lotCode)
                                && moment(lineItem.lot.lotCode.slice(-10), SIGLUS_LOT_CODE_DATE_ISVALID).isValid()) {
                                    lineItem.lot.lotCode = lineItem.lot.lotCode.slice(0, -11);
                                }
                            }
                        };

                        // eslint-disable-next-line complexity
                        $scope.fillLotCode = function() {
                            var lineItem = $scope.lineItem;
                            var hasLotCode = _.get(lineItem, ['lot', 'lotCode']);
                            var hasExpirationDate = _.get(lineItem, ['lot', 'expirationDate']);
                            var hasLotId = _.get(lineItem, ['lot', 'id']);
                            lineItem.lot.lotCode = removeHyphensAtEnd(lineItem.lot.lotCode);

                            if (hasLotCode && hasExpirationDate && !hasLotId) {
                                if (!SIGLUS_LOT_CODE_REGEXP.test(lineItem.lot.lotCode)) {
                                    lineItem.lot.lotCode = lineItem.lot.lotCode +
                                    moment(lineItem.lot.expirationDate).format(SIGLUS_LOT_CODE_DATE_FORMATE);
                                }
                            } else if (hasLotCode && !hasExpirationDate && !hasLotId) {
                                if (SIGLUS_LOT_CODE_REGEXP.test(lineItem.lot.lotCode) &&
                                    moment(lineItem.lot.lotCode.slice(-10), SIGLUS_LOT_CODE_DATE_ISVALID).isValid()) {
                                    lineItem.lot.expirationDate =
                                        moment(
                                            lineItem.lot.lotCode.slice(-10), SIGLUS_LOT_CODE_DATE_ISVALID
                                        ).format('YYYY-MM-DD');
                                }
                            } else if (hasLotCode && hasExpirationDate && hasLotId) {
                                lineItem.lot.lotCode = lineItem.lot.lotCode +
                                    moment(lineItem.lot.expirationDate).format(SIGLUS_LOT_CODE_DATE_FORMATE);
                            }
                        };

                        $scope.showExpired = function() {
                            var lineItem = $scope.lineItem;
                            var hideExpiredPopover = $scope.hideExpiredPopover;
                            if (!hideExpiredPopover) {
                                if (moment().isAfter(moment(_.get(lineItem, ['lot', 'expirationDate'])).add(1, 'd'))) {
                                    return  messageService.get('siglusStockInputSelect.lotExpired');
                                }
                            }
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

                        function validateInputLotCode(inputContent) {
                            inputContent = inputContent.trim();
                            inputContent = validateInputCharacters(inputContent);
                            inputContent = removeConsecutiveHyphens(inputContent);
                            return inputContent;
                        }
                        function validateInputCharacters(inputContent) {
                            var VALID_CHARS = /^[a-zA-Z0-9-]*$/;
                            if (!VALID_CHARS.test(inputContent)) {
                                return inputContent.replace(/[^a-zA-Z0-9-]/g, '');
                            }
                            return inputContent;
                        }
                        function removeConsecutiveHyphens(inputContent) {
                            return inputContent.replace(/-+/g, '-');
                        }
                        function removeHyphensAtEnd(inputContent) {
                            if (inputContent.endsWith('-')) {
                                inputContent = inputContent.slice(0, -1);
                            }
                            return inputContent;
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
                        scope.testLotCode();
                        setTimeout(function() {
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
                        }, 200);
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
