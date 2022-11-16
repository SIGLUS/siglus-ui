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
        .module('siglus-location-receive-creation')
        .controller('siglusLocationReceiveCreationController', siglusLocationReceiveCreationController);

    siglusLocationReceiveCreationController.$inject = [
        '$stateParams', '$q', '$scope', '$state', 'DRAFT_TYPE',
        'draftInfo', 'facility', 'reasons',
        'initialDraftInfo', 'locations', 'addedLineItems', 'productList', 'siglusStockUtilsService', 'displayItems',
        'siglusLocationCommonApiService', 'SiglusLocationCommonUtilsService',
        'siglusStockDispatchService', 'addAndRemoveReceiveLineItemIssueService', 'alertConfirmModalService',
        'loadingModalService', 'notificationService', 'paginationService', 'messageService', 'isMerge', 'moment',
        'siglusStockIssueLocationService', 'siglusRemainingProductsModalService', 'alertService',
        'siglusSignatureWithDateModalService', 'program', 'confirmDiscardService', 'siglusDownloadLoadingModalService',
        'openlmisDateFilter', 'areaLocationInfo', 'siglusPrintPalletLabelComfirmModalService', 'orderablesPrice'
    ];

    function siglusLocationReceiveCreationController(
        $stateParams, $q, $scope, $state, DRAFT_TYPE, draftInfo, facility,
        reasons, initialDraftInfo, locations, addedLineItems, productList,
        siglusStockUtilsService, displayItems,
        siglusLocationCommonApiService, SiglusLocationCommonUtilsService,
        siglusStockDispatchService,
        addAndRemoveReceiveLineItemIssueService, alertConfirmModalService,
        loadingModalService, notificationService, paginationService,
        messageService, isMerge,
        moment, siglusStockIssueLocationService,
        siglusRemainingProductsModalService, alertService,
        siglusSignatureWithDateModalService, program,
        confirmDiscardService,
        siglusDownloadLoadingModalService, openlmisDateFilter,
        areaLocationInfo, siglusPrintPalletLabelComfirmModalService,
        orderablesPrice
    ) {
        var orderablesPriceMap = orderablesPrice.data;
        addedLineItems.forEach(function(lineItem) {
            var orderableId = _.get(lineItem, ['orderable', 'id']);
            lineItem.price = orderablesPriceMap[orderableId];
        });
        var vm = this;

        vm.areaLocationInfo = areaLocationInfo;

        vm.keyword = $stateParams.keyword;

        vm.productList = null;

        vm.facility = facility;

        vm.initialDraftInfo = initialDraftInfo;

        vm.addedLineItems = [];

        vm.displayItems = displayItems;

        vm.selectedProduct = null;

        vm.sourceName = '';

        vm.isMerge = isMerge;

        var deferred = $q.defer();

        vm.$onInit = function() {
            $state.current.label = isMerge
                ? messageService.get('stockIssueCreation.mergedDraft')
                : messageService.get('stockIssue.draft') + ' ' + draftInfo.draftNumber;
            vm.addedLineItems = addedLineItems || [];
            vm.sourceName = siglusStockUtilsService
                .getInitialDraftName(vm.initialDraftInfo, $stateParams.draftType);
            filterProductList();

            var validator = function(lineItems) {
                return _.every(lineItems, function(lineItem, index) {
                    if (lineItems.length > 1 && index === 0) {
                        return true;
                    }
                    return _.chain(lineItem.$errors)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$errors[key]);
                        })
                        .value();
                });
            };

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue, oldValue) {
                $scope.needToConfirm =  !angular.equals(newValue, oldValue);
            }, true);
            confirmDiscardService.register($scope, 'openlmis.locationManagement.issue.draft.creation');
            paginationService.registerList(validator, $stateParams, function() {
                return vm.displayItems;
            });
            cacheParams();

            addedLineItems.forEach(function(groupedItems) {
                groupedItems.forEach(function(lineItem) {
                    lineItem.destAreaOptions = vm.getDesAreaList(lineItem);
                    lineItem.destLocationOptions = vm.getDesLocationList(lineItem);
                });
            });
            loadingModalService.close();
        };

        vm.getDesAreaList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getDesAreaList(lineItem, areaLocationInfo);
        };

        vm.getDesLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getDesLocationList(lineItem, areaLocationInfo);
        };

        vm.addProduct = function() {
            loadingModalService.open();
            siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                isAdjustment: false,
                extraData: true,
                returnNoMovementLots: true
            }, [vm.selectedProduct.orderableId]).then(function(locationsInfo) {
                locations = locations.concat(locationsInfo);
                var lineItem = addAndRemoveReceiveLineItemIssueService.getAddProductRow(vm.selectedProduct, locations);
                // TODO hanlde area change & location change callback
                lineItem.destAreaOptions = vm.getDesAreaList(lineItem);
                lineItem.destLocationOptions = vm.getDesLocationList(lineItem);
                vm.addedLineItems.unshift([lineItem]);
                if (vm.selectedProduct.archived) {
                    alertService.info({
                        title: 'archivedProduct.title',
                        message: 'archivedProduct.message',
                        buttonLabel: 'archivedProduct.close'
                    });
                }
                reloadPage();
            });
        };

        function validateLocationDuplicatedForRemove(lineItems) {
            _.forEach(lineItems, function(item, index) {
                item.$errors.moveToLocationError = '';
                if (lineItems.length > 1 && index === 0) {
                    return;
                }
                if (_.isEmpty(item.moveTo)) {
                    item.$errors.moveToLocationError = 'openlmisForm.required';
                    return;
                }
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.moveTo
                      && _.get(item, ['location', 'locationCode']) === data.moveTo.locationCode;
                })) > 1;
                if (hasDuplicated) {
                    item.$errors.moveToLocationError = 'receiveLocationCreation.locationDuplicated';
                }
            });
        }

        vm.removeItem = function(lineItems, index) {
            var isKit = lineItems[index].isKit;
            addAndRemoveReceiveLineItemIssueService.removeItem(lineItems, index);
            if (lineItems.length === 0) {
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
                $stateParams.addedLineItems = vm.addedLineItems;
                vm.displayItems = _.filter(vm.displayItems, function(item) {
                    return !_.isEmpty(item);
                });
                filterProductList();
            }
            if (isKit) {
                validateLocationDuplicatedForRemove(lineItems);
            } else {
                validateBase(lineItems, function(item) {
                    item.$errors.lotCodeInvalid = '';
                });
            }
        };

        vm.addItem = function(lineItem, lineItems) {
            addAndRemoveReceiveLineItemIssueService.addLineItem(lineItem, lineItems);
            lineItems.forEach(function(line) {
                if (!line.destAreaOptions) {
                    line.destAreaOptions = vm.getDesAreaList(lineItem);
                }
                if (!line.destLocationOptions) {
                    line.destLocationOptions = vm.getDesLocationList(lineItem);
                }
            });
        };

        function validateLotExpired(item) {
            if (!item.$errors.lotCodeInvalid && item.lot) {
                var lotExpiredDate = moment(item.lot.expirationDate);
                if (moment().isAfter(lotExpiredDate)) {
                    item.$errors.lotCodeInvalid = 'receiveLocationCreation.lotExpired';
                }
            }
        }

        function validateBase(lineItems, callback) {
            _.forEach(lineItems, function(item, $index) {
                if (lineItems.length > 1 && $index === 0) {
                    return;
                }
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    var baseLotCode = _.get(item.lot, 'lotCode');
                    var compareLotCode = _.get(data.lot, 'lotCode');
                    var baseLocationCode = _.get(item.moveTo, 'locationCode');
                    var compareLocationCode = _.get(data.moveTo, 'locationCode');

                    var isLotTheSame = baseLotCode && compareLotCode && baseLotCode === compareLotCode;
                    var isLocationTheSame = baseLocationCode && compareLocationCode
                      && baseLocationCode === compareLocationCode;
                    return isLotTheSame && isLocationTheSame;
                })) > 1;

                if (hasDuplicated) {
                    item.$errors.lotCodeInvalid = 'receiveLocationCreation.lotDuplicated';
                } else {
                    callback(item, $index);

                    validateLotExpired(item);
                }
            });
        }

        function lotOrLocationChangeEmitValidation(lineItem) {
            var hasKitLocation = lineItem.isKit && !_.isEmpty(lineItem.moveTo);
            var hasBothLocationAndLot = !lineItem.isKit && !_.isEmpty(lineItem.moveTo)
              && !_.isEmpty(lineItem.lot);
            var hasQuantityShippedFilled = !_.isNull(_.get(lineItem, 'quantityShipped'));
            if ((hasKitLocation || hasBothLocationAndLot) && hasQuantityShippedFilled) {
                validateQuantity(lineItem);
            }
        }

        function validateQuantity(currentItem) {
            currentItem.$errors.quantityError = '';
            if (!_.isNumber(currentItem.quantity) || currentItem.quantity === 0) {
                currentItem.$errors.quantityError = 'issueLocationCreation.inputPositiveNumber';
                return;
            }
        }

        vm.changeQuantity = function(currentItem) {
            validateQuantity(currentItem);
        };

        function validateLot(lineItem, lineItems, index) {
            lineItem.$errors.lotCodeInvalid = '';
            lineItem.$errors.lotDateInvalid = '';
            validateBase(lineItems, function(item, $index) {
                if (index === $index && _.isEmpty(_.get(item.lot, 'lotCode'))) {
                    item.$errors.lotCodeInvalid = 'openlmisForm.required';
                    item.$errors.lotDateInvalid = 'openlmisForm.required';
                    return ;
                }

                item.$errors.lotCodeInvalid = '';
                lineItem.$errors.lotDateInvalid = '';
            });
            lotOrLocationChangeEmitValidation(lineItem);
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            var lineItems = data.lineItems;
            var index = data.index;
            validateLot(lineItem, lineItems, index);
            setStockOnHand(lineItem);
        });

        vm.changeLot = function(lineItem, lineItems, index) {
            validateLot(lineItem, lineItems, index);
            setStockOnHand(lineItem);
        };

        vm.changeExpirationDate = function(lineItem, lineItems, index) {
            if (_.isEmpty(_.get(lineItem.lot, 'expirationDate'))) {
                lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
            } else {
                lineItem.$errors.lotDateInvalid = '';
            }
            validateBase(lineItems, function(item, $index) {
                if (index === $index && _.isEmpty(_.get(item.lot, 'lotCode'))) {
                    item.$errors.lotCodeInvalid = 'openlmisForm.required';
                    return ;
                }
                item.$errors.lotCodeInvalid = '';
            });
        };

        vm.changeLocation = function(lineItem, lineItems, index) {
            var areaList = SiglusLocationCommonUtilsService.getDesAreaList(lineItem, areaLocationInfo);
            if (_.get(lineItem.moveTo, 'locationCode')) {
                lineItem.moveTo.area = _.first(areaList);
                vm.changeArea(lineItem);
            }
            lineItem.destAreaOptions = areaList;

            lineItem.$errors.moveToLocationError = '';
            if (lineItem.isKit) {
                if (_.isEmpty(_.get(lineItem.moveTo, 'locationCode'))) {
                    lineItem.$errors.moveToLocationError = 'openlmisForm.required';
                }
                validateLocationDuplicated(lineItems);
            } else {
                validateBase(lineItems, function(item, $index) {
                    if (_.isEmpty(lineItem.moveTo.locationCode) && $index === index) {
                        lineItem.$errors.moveToLocationError = 'openlmisForm.required';
                        item.$errors.lotCodeInvalid = '';
                        return;
                    }
                    item.$errors.lotCodeInvalid = '';

                    if (_.isEmpty(item.lot) && $index === index) {
                        item.$errors.lotCodeInvalid = 'openlmisForm.required';
                    }
                });
            }
            validateQuantity(lineItem);
            setStockOnHand(lineItem);
        };

        vm.changeArea = function(lineItem) {
            lineItem.destLocationOptions = vm.getDesLocationList(lineItem);
            if (_.isEmpty(_.get(lineItem.moveTo, 'area'))) {
                lineItem.$errors.areaError = 'openlmisForm.required';
                return;
            }
            lineItem.$errors.areaError = '';
        };

        $scope.$on('locationCodeChange', function(event, data) {
            var lineItem = data.lineItem;
            var lineItems = data.lineItems;
            var index = data.index;
            vm.changeLocation(lineItem, lineItems, index);
        });

        function setStockOnHand(lineItem) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            lineItem.stockOnHand = getSoh(lineItem, orderableLocationLotsMap);
        }

        function validateLocationDuplicated(lineItems) {
            _.forEach(lineItems, function(item) {
                if (item.$errors.moveToLocationError === 'openlmisForm.required') {
                    return;
                }
                item.$errors.moveToLocationError = '';
                var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                    return data.moveTo
                      && _.get(item, ['moveTo', 'locationCode']) === data.moveTo.locationCode;
                })) > 1;
                if (hasDuplicated) {
                    item.$errors.moveToLocationError = 'receiveLocationCreation.locationDuplicated';
                }
            });
        }

        function getSoh(lineItem, orderableLocationLotsMap) {
            var lot = _.chain(orderableLocationLotsMap[lineItem.orderableId])
                .get(_.get(lineItem.moveTo, 'locationCode'))
                .find(function(item) {
                    return lineItem.isKit ? _.isEmpty(item.lotCode)
                        : item.lotCode === _.get(lineItem.lot, 'lotCode');
                })
                .value();
            return _.get(lot, 'stockOnHand', 0);
        }

        vm.getStockOnHand = function(lineItems, index) {
            var orderableLocationLotsMap = SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            if (index === 0) {
                return _.reduce(lineItems, function(availableSoh, lineItem) {
                    return availableSoh + getSoh(lineItem, orderableLocationLotsMap);
                }, 0);
            }
            return getSoh(lineItems[index], orderableLocationLotsMap);
        };

        vm.getQuantity = function(lineItems) {
            return _.reduce(lineItems, function(quantity, item) {
                return quantity + _.get(item, 'quantity') || 0;
            }, 0);

        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return lineItem.isKit || (lineItems.length > 1 && index === 0);
        };

        vm.showEmptyBlock = function(lineItems, index) {
            return (lineItems.length > 1 && index === 0);
        };

        vm.removeDisplayItems = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusStockDispatchService.resetDraft($stateParams.initialDraftId, $stateParams.draftId,
                    $stateParams.moduleType).then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success('stockIssueCreation.deleted');
                    $state.go('^', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        function searchList() {
            reloadPage();
        }

        vm.search = function() {
            searchList();
        };

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        vm.cancelFilter = function() {
            vm.keyword = '';
            searchList();
        };

        $scope.$watch(function() {
            return vm.keyword;
        }, function(newValue, oldValue) {
            if (oldValue && !newValue && $stateParams.keyword) {
                searchList();
            }
        });

        function getLineItems() {
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            var reason = _.find(reasons, {
                name: capitalize($stateParams.draftType || '')
            });
            return _.chain(vm.addedLineItems)
                .map(function(group) {
                    return _.filter(group, function(lineItem) {
                        return !lineItem.isMainGroup || (lineItem.isMainGroup && group.length === 1);
                    });
                })
                .flatten()
                .each(function(item) {
                    item.reason = reason;
                    item.locationCode = _.get(item, ['moveTo', 'locationCode']);
                    item.area = _.get(item, ['moveTo', 'area']);
                })
                .value();
        }

        vm.save = function() {

            loadingModalService.open();
            siglusStockDispatchService.saveDraft($stateParams.initialDraftId,
                $stateParams.draftId, getLineItems(),
                DRAFT_TYPE[$stateParams.moduleType][$stateParams.draftType], $stateParams.moduleType)
                .then(function() {
                    notificationService.success('stockIssueCreation.saved');
                    $scope.needToConfirm = false;
                    reloadPage();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    productDuplicatedHandler(error);
                });
        };

        function validateRequired(lineItem) {
            if (_.isEmpty(_.get(lineItem.lot, 'lotCode')) && !lineItem.isKit) {
                lineItem.$errors.lotCodeInvalid = messageService.get('openlmisForm.required');
            }

            if (_.isEmpty(_.get(lineItem.lot, 'expirationDate')) && !lineItem.isKit) {
                lineItem.$errors.lotDateInvalid = messageService.get('openlmisForm.required');
            }

            if (_.isEmpty(_.get(lineItem.moveTo, 'locationCode'))) {
                lineItem.$errors.moveToLocationError = 'openlmisForm.required';
            }

            if (_.isEmpty(_.get(lineItem.moveTo, 'area'))) {
                lineItem.$errors.areaError = 'openlmisForm.required';
            }

        }

        function validateDuplicated(lineItems, item) {
            var hasDuplicated = _.size(_.filter(lineItems, function(data) {
                return data.lot && data.moveTo && _.get(item, ['lot', 'lotCode']) === data.lot.lotCode
                  && _.get(item, ['moveTo', 'locationCode']) === data.moveTo.locationCode;
            })) > 1;

            if (hasDuplicated) {
                item.$errors.lotCodeInvalid = 'receiveLocationCreation.lotDuplicated';
            }
        }

        function validateKitLocationDuplicated(lineItems, item) {
            var hasKitLocationDuplicated = _.size(_.filter(lineItems, function(data) {
                return data.moveTo
                  && _.get(item, ['moveTo', 'locationCode']) === data.moveTo.locationCode;
            })) > 1;

            if (hasKitLocationDuplicated) {
                item.$errors.moveToLocationError = 'receiveLocationCreation.locationDuplicated';
            }
        }

        function isTableFormValid() {
            _.forEach(vm.addedLineItems, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    if (index === 0 && lineItems.length !== 1) {
                        lineItem.$errors = {};
                    } else {
                        validateRequired(lineItem);
                        validateLotExpired(lineItem);
                        if (lineItem.isKit) {
                            validateKitLocationDuplicated(lineItems, lineItem);
                        } else {
                            validateDuplicated(lineItems, lineItem);
                        }
                        validateQuantity(lineItem);
                    }
                });
            });

            return _.every(vm.addedLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$errors)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$errors[key]);
                        })
                        .value();
                });
            });
        }

        function productDuplicatedHandler(error) {
            if (_.get(error, ['data', 'isBusinessError'])) {
                var data = _.map(_.get(error, ['data', 'businessErrorExtraData']), function(item) {
                    item.conflictWith = messageService.get('stockIssue.draft') + ' ' + item.conflictWith;
                    return item;
                });
                siglusRemainingProductsModalService.show(data).then(function() {
                    var addedLineItemsClone = angular.copy(vm.addedLineItems);
                    _.forEach(addedLineItemsClone, function(group, index) {
                        var orderableId = _.get(group, [0, 'orderableId']);

                        var orderableIds = _.map(data, function(data) {
                            return data.orderableId;
                        });
                        if (_.includes(orderableIds, orderableId)) {
                            vm.addedLineItems[index] = [];
                        }
                    });
                    vm.addedLineItems = _.filter(vm.addedLineItems, function(group) {
                        return !_.isEmpty(group);
                    });
                    productList = null;
                    reloadPage();
                });
            }
        }

        vm.cancelMerge = function() {
            $state.go('^', $stateParams);
        };

        function getPdfName(facilityName, nowTime) {
            return (
                'Entrada_'
              + facilityName
              + '_'
              + nowTime
              + '.pdf'
            );
        }
        function downloadPdf() {
            siglusDownloadLoadingModalService.open();
            // 获取固定高度的dom节点
            var sectionFirst = document.getElementById('sectionFirst');
            var sectionSecond = document.getElementById('sectionSecond');
            var sectionThird = document.getElementById('sectionThird');
            var sectionFouth = document.getElementById('sectionFouth');
            var subInformation = document.getElementById('subInformation');
            // 定义常量
            var A4_WIDTH = 585, A4_HEIGHT = 781.89, CONTAINER_WIDTH = 1250, PAGE_NUM_HEIGHT = 10;
            // 计算px to a4实际单位换算比例
            var rate = A4_WIDTH / CONTAINER_WIDTH;
            // a4实际高度换算px
            var a4Height2px = A4_HEIGHT / rate;
            // 计算固定部分的高度总和
            var fixedHeight = sectionFirst.offsetHeight
              + sectionSecond.offsetHeight
              + sectionThird.offsetHeight
              + sectionFouth.offsetHeight
              + subInformation.offsetHeight
              + PAGE_NUM_HEIGHT / rate;
            // 分页部分的高度计算
            var canUseHeight = a4Height2px - fixedHeight - PAGE_NUM_HEIGHT;
            // 获取分页部分每行节点
            var needCalcTrNodes = document.querySelectorAll('#calcTr');
            // NodeList -> 数组
            var needCalcTrNodesArray = Array.from(needCalcTrNodes);
            // 定义固定部分的promiseList
            var fixedPromiseList = [
                // eslint-disable-next-line no-undef
                domtoimage.toPng(sectionFirst, {
                    scale: 1,
                    width: 1250,
                    height: sectionFirst.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: sectionFirst.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(sectionSecond, {
                    scale: 1,
                    width: 1250,
                    height: sectionSecond.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: sectionSecond.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(sectionThird, {
                    scale: 1,
                    width: 1250,
                    height: sectionThird.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: sectionThird.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(sectionFouth, {
                    scale: 1,
                    width: 1250,
                    height: sectionFouth.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: sectionFouth.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(subInformation, {
                    scale: 1,
                    width: 1250,
                    height: subInformation.offsetHeight + 30
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: subInformation.offsetHeight + 30
                    };
                })
            ];
            // 定义分页部分的promiseList
            var promiseList = [];
            // eslint-disable-next-line no-undef
            var PDF = new jsPDF('', 'pt', 'a4');
            _.forEach(needCalcTrNodesArray, function(item) {
                // eslint-disable-next-line no-undef
                promiseList.push(domtoimage.toPng(item, {
                    scale: 1,
                    width: 1250,
                    height: item.offsetHeight + 1
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: item.offsetHeight + 1
                    };
                }));
            });
            // 固定部分的图片转换完成后再去做分页部分的图片转换
            $q.all(fixedPromiseList).then(function(reback) {
                // 偏移量
                var offsetHeight = sectionFirst.offsetHeight + sectionSecond.offsetHeight;
                // 当前分页部分tr的累积高度
                var realHeight = 0;
                // 页码
                var pageNumber = 1;
                var promiseListLen = promiseList.length;
                $q.all(promiseList).then(function(result) {
                    // 添加分页部分上方的固定部分图片到PDF中
                    PDF.addImage(reback[0].data, 'JPEG', 4, 0, 585, reback[0].nodeHeight * rate);
                    PDF.addImage(
                        reback[1].data,
                        'JPEG',
                        4,
                        reback[0].nodeHeight * rate,
                        585,
                        reback[1].nodeHeight * rate
                    );
                    _.forEach(result, function(res, index) {
                        // 计算分页部分实际高度
                        realHeight = realHeight + result[index].nodeHeight;
                        if (realHeight > canUseHeight) {
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                A4_HEIGHT
                            );
                            PDF.addImage(
                                reback[3].data,
                                'JPEG',
                                4,
                                (
                                    offsetHeight
                                + reback[2].nodeHeight
                                ) * rate,
                                585,
                                reback[3].nodeHeight * rate
                            );
                            PDF.addImage(
                                reback[4].data,
                                'JPEG',
                                4,
                                (
                                    offsetHeight
                                + reback[2].nodeHeight
                                + reback[3].nodeHeight
                                ) * rate,
                                585,
                                reback[4].nodeHeight * rate
                            );
                            // 新开分页
                            PDF.addPage();
                            pageNumber = pageNumber + 1;
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                A4_HEIGHT
                            );
                            PDF.addImage(reback[0].data, 'JPEG', 4, 0, 585, reback[0].nodeHeight * rate);
                            PDF.addImage(
                                reback[1].data,
                                'JPEG',
                                4,
                                reback[0].nodeHeight * rate, 585,
                                reback[1].nodeHeight * rate
                            );
                            offsetHeight = sectionFirst.offsetHeight + sectionSecond.offsetHeight;
                            realHeight = 0;
                        }
                        // 添加当前遍历元素的图片到PDF
                        PDF.addImage(
                            res.data,
                            'JPEG',
                            4,
                            offsetHeight * rate,
                            res.nodeWidth * rate,
                            res.nodeHeight * rate
                        );
                        if (promiseListLen - 1 === index) {
                            PDF.addImage(
                                reback[2].data,
                                'JPEG',
                                4,
                                (
                                    offsetHeight + result[index].nodeHeight
                                ) * rate,
                                585,
                                reback[2].nodeHeight * rate
                            );
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString() + '-END',
                                585 / 2,
                                A4_HEIGHT
                            );
                        }
                        offsetHeight = offsetHeight + result[index].nodeHeight;
                    });
                    PDF.addImage(
                        reback[3].data,
                        'JPEG',
                        4,
                        (offsetHeight + reback[2].nodeHeight) * rate,
                        585,
                        reback[3].nodeHeight * rate
                    );
                    PDF.addImage(
                        reback[4].data,
                        'JPEG',
                        4,
                        (offsetHeight + reback[2].nodeHeight + reback[3].nodeHeight) * rate,
                        585,
                        reback[4].nodeHeight * rate
                    );
                    PDF.save(
                        getPdfName(
                            vm.sourceName,
                            openlmisDateFilter(new Date(), 'yyyy-MM-dd')
                        )
                    );
                    siglusDownloadLoadingModalService.close();
                    deferred.resolve('success');
                });
            });
        }

        function getSumQuantity(items) {
            var total = 0;
            _.each(items, function(item) {
                total = total + item.quantity;
            });
            return total;
        }
        function getDownloadLineItems() {
            var downloadLineItems = [];
            _.each(vm.displayItems, function(orderableItems) {
                var validItems;
                if (orderableItems.length > 1) {
                    validItems = orderableItems.filter(function(item) {
                        return !item.isMainGroup;
                    });
                } else {
                    validItems = orderableItems;
                }
                var groupByLot = _.chain(validItems)
                    .groupBy(function(item) {
                        return _.get(item, ['lot', 'lotCode'], '');
                    })
                    .values()
                    .value();
                _.each(groupByLot, function(lotItems) {
                    var downloadLineItem = angular.copy(lotItems[0]);
                    downloadLineItem.lotCode = _.get(downloadLineItem, ['lot', 'lotCode'], '');
                    downloadLineItem.expirationDate = _.get(downloadLineItem, ['lot', 'expirationDate'], '');
                    downloadLineItem.quantity = getSumQuantity(lotItems);
                    var orderableId = _.get(downloadLineItem, ['orderableId']);
                    downloadLineItem.price = orderablesPriceMap[orderableId];
                    downloadLineItems.push(downloadLineItem);
                });
            });
            return downloadLineItems;
        }

        vm.submit = function() {
            if (isTableFormValid()) {
                if (isMerge) {
                    siglusPrintPalletLabelComfirmModalService.show()
                        .then(function(result) {
                            if (result) {
                                vm.downloadPrint();
                            }

                            vm.type = 'receive';
                            vm.downloadLineItems = getDownloadLineItems();
                            vm.totalPriceValue = _.reduce(vm.downloadLineItems, function(r, c) {
                                var price = c.price * 100;
                                r = r + c.quantity * price;
                                return r;
                            }, 0);
                            vm.totalPriceValue = _.isNaN(vm.totalPriceValue) ? 0 : vm.totalPriceValue;
                            vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
                            vm.client = vm.facility.name;
                            vm.supplier = vm.initialDraftInfo.sourceName === 'Outros'
                                ? vm.initialDraftInfo.locationFreeText : vm.sourceName;

                            siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature')
                                .then(function(data) {
                                    loadingModalService.open();
                                    var signature = data.signature;
                                    var occurredDate = data.occurredDate;
                                    var subDrafts = _.uniq(_.map(draftInfo.lineItems, function(item) {
                                        return item.subDraftId;
                                    }));

                                    vm.issueVoucherDate = openlmisDateFilter(data.occurredDate, 'yyyy-MM-dd');
                                    vm.signature = data.signature;
                                    setTimeout(function() {
                                        downloadPdf();
                                    }, 200);

                                    deferred.promise.then(function() {
                                        siglusStockIssueLocationService
                                            .mergeSubmitDraft($stateParams.programId, getLineItems(),
                                                signature, vm.initialDraftInfo, facility.id, subDrafts, occurredDate)
                                            .then(function() {
                                                $scope.needToConfirm = false;
                                                $state.go('openlmis.locationManagement.stockOnHand', {
                                                    facility: facility.id,
                                                    program: program
                                                });
                                            })
                                            .catch(function(error) {
                                                loadingModalService.close();
                                                if (error.data &&
                                        error.data.businessErrorExtraData === 'subDrafts quantity not match') {
                                                    alertService.error('stockIssueCreation.draftHasBeenUpdated');
                                                } else if (
                                                    // eslint-disable-next-line max-len
                                                    _.get(error, ['data', 'messageKey']) === 'siglusapi.error.stockManagement.movement.date.invalid'
                                                ) {
                                                    alertService.error('openlmisModal.dateConflict');
                                                }
                                            });
                                    });

                                });
                        });

                } else {
                    loadingModalService.open();
                    siglusStockIssueLocationService.submitDraft($stateParams.initialDraftId, $stateParams.draftId,
                        getLineItems(), DRAFT_TYPE[$stateParams.moduleType][$stateParams.draftType])
                        .then(function() {

                            loadingModalService.close();
                            notificationService.success('issueLocationCreation.submitSuccessfully');
                            $scope.needToConfirm = false;
                            $state.go('^', $stateParams);
                        })
                        .catch(function(error) {
                            loadingModalService.close();
                            productDuplicatedHandler(error);
                        });
                }

            } else {
                alertService.error(messageService.get('openlmisForm.formInvalid'));
            }
        };

        vm.downloadPrint = function() {
            var printLineItems = getLineItems();

            var newPrintLineItems = _.chain(printLineItems)
                .map(function(item) {
                    var result = {};
                    result.productName = _.get(item, ['productName']);
                    result.productCode = _.get(item, ['productCode']);
                    result.lotCode = _.get(item, ['lot', 'lotCode'], null);
                    result.expirationDate = _.get(item, ['lot', 'expirationDate'], null);
                    result.location = _.get(item, ['locationCode']);
                    var orderableLocationLotsMap = SiglusLocationCommonUtilsService
                        .getOrderableLocationLotsMap(locations);
                    var totalQuantity = getSoh(item, orderableLocationLotsMap);
                    result.pallet = Number(totalQuantity) +  _.get(item, ['quantity']);
                    result.pack = null;
                    return result;
                })
                .filter(function(item) {
                    return item.pallet > 0;
                })
                .value();
            vm.printLineItems = newPrintLineItems;
        };

        function filterProductList() {
            var addedOrderableIds = _.map(vm.addedLineItems, function(group) {
                return _.first(group).orderableId;
            });
            vm.productList = _.filter(productList, function(item) {
                return !_.includes(addedOrderableIds, item.orderableId);
            });
        }

        function cacheParams() {
            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.locations = locations;
            $stateParams.draftInfo = draftInfo;
            $stateParams.reasons = reasons;
            $stateParams.productList = productList;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.facility = facility;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
        }

        function reloadPage() {
            cacheParams();
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        }

    }

})();
