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
        .module('stock-issue-creation')
        .controller('SiglusStockIssueCreationController', controller);

    controller.$inject = [
        '$scope', 'draft', 'mergedItems', 'initialDraftInfo', '$state', '$stateParams', '$filter',
        'confirmDiscardService', 'program', 'facility', 'orderableGroups', 'reasons', 'confirmService',
        'messageService', 'isMerge',
        'stockAdjustmentCreationService', 'notificationService', 'orderableGroupService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'loadingModalService', 'alertService', 'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE',
        'siglusSignatureWithDateModalService', 'stockAdjustmentService', 'openlmisDateFilter',
        'siglusRemainingProductsModalService', 'siglusStockIssueService', 'alertConfirmModalService',
        'siglusStockUtilsService', 'localStorageFactory', '$q', 'siglusDownloadLoadingModalService',
        'orderablesPrice', 'moment'
    ];

    function controller($scope, draft, mergedItems, initialDraftInfo, $state, $stateParams, $filter,
                        confirmDiscardService, program, facility, orderableGroups, reasons, confirmService,
                        messageService, isMerge, stockAdjustmentCreationService, notificationService,
                        orderableGroupService, MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService, alertService,
                        dateUtils, displayItems, ADJUSTMENT_TYPE, siglusSignatureWithDateModalService,
                        stockAdjustmentService, openlmisDateFilter, siglusRemainingProductsModalService,
                        siglusStockIssueService, alertConfirmModalService, siglusStockUtilsService,
                        localStorageFactory, $q, siglusDownloadLoadingModalService, orderablesPrice, moment) {
        var vm = this,
            previousAdded = {};
        vm.preparedBy = localStorageFactory('currentUser').getAll('username').username;
        vm.initialDraftInfo = initialDraftInfo;
        var deferred = $q.defer();
        vm.destinationName = '';
        vm.type = 'issue';
        vm.isMerge = isMerge;

        vm.lotNotFirstExpireHint = '';
        vm.key = function(secondaryKey) {
            return 'stockIssueCreation.' + secondaryKey;
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
        vm.search = function(reload) {
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);

            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
            $state.go($state.current.name, $stateParams, {
                reload: reload || $state.current.name,
                notify: false
            });
        };

        vm.returnBack = function() {
            $state.go('openlmis.stockmanagement.issue.draft', $stateParams);
        };

        vm.changeLot = function() {
            validateLotNotFirstExpire();
        };

        function validateLotNotFirstExpire() {
            if (!_.isEmpty(vm.lots) && !_.isEmpty(vm.selectedLot)) {
                var resetLotList = _.filter(vm.lots, function(lot) {
                    return lot.id !== _.get(vm.selectedLot, 'id');
                });
                var isNotFirstToExpire = _.some(resetLotList, function(lot) {
                    return moment(lot.expirationDate).isBefore(moment(vm.selectedLot.expirationDate));
                });
                vm.lotNotFirstExpireHint = isNotFirstToExpire ? 'locationShipmentView.notFirstToExpire' : '';
            } else {
                vm.lotNotFirstExpireHint = '';
            }
        }

        vm.setProductGroups = function() {
            var addedLotIds = _.chain(vm.addedLineItems)
                .map(function(item) {
                    return _.get(item, ['lot', 'id']);
                })
                .compact()
                .value();
            var existingKitProductId = _.chain(vm.addedLineItems)
                .filter(function(item) {
                    return item.orderable.isKit || isEmpty(item.lot);
                })
                .map(function(item) {
                    return item.orderable.id;
                })
                .value();

            vm.orderableGroups = _.chain(orderableGroups)
                .map(function(group) {
                    return _.filter(group, function(item) {
                        return isEmpty(addedLotIds) || !_.include(addedLotIds, _.get(item, ['lot', 'id']));
                    });
                })
                .filter(function(group) {
                    var orderableId = _.get(group, [0, 'orderable', 'id']);
                    return !_.include(existingKitProductId, orderableId);
                })
                .filter(function(item) {
                    return !_.isEmpty(item);
                })
                .value();

            vm.lotNotFirstExpireHint = '';
            $stateParams.orderableGroups = vm.orderableGroups;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name addProduct
     *
     * @description
     * Add a product for stock adjustment.
     */
        vm.addProduct = function() {
            if (vm.selectedLot && isDateBeforeToday(vm.selectedLot.expirationDate)) {
                alertService.error('stockIssueCreation.issueExpiredLot');
                return;
            }
            var selectedItem = orderableGroupService
                .findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);

            var item = _.extend(
                {
                    $errors: {},
                    $previewSOH: selectedItem.stockOnHand
                },
                selectedItem, copyDefaultValue()
            );
            item.productCode = item.orderable.productCode;
            item.productName = item.orderable.fullProductName;
            item.lotCode = item.lot && item.lot.lotCode;
            item.expirationDate = item.lot && openlmisDateFilter(item.lot.expirationDate, 'yyyy-MM-dd');
            item.price = orderablesPrice.data[item.orderable.id] || '';
            vm.addedLineItems.unshift(item);

            if (_.get(vm.selectedLot, 'id')) {
                vm.setProductGroups();
                vm.selectedOrderableGroup = _.filter(vm.selectedOrderableGroup, function(data) {
                    return _.get(data, ['lot', 'id']) !== vm.selectedLot.id;
                });

                vm.setLots();
                vm.setLotSelectionStatus();
            } else {
                vm.setProductGroups();
                vm.selectedOrderableGroup = [];
            }

            previousAdded = vm.addedLineItems[0];
            validateLotNotFirstExpire();

            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
        };

        // if reason Contains correction then show input
        vm.isReasonCorrection = function(lineItem) {
            if (lineItem.reason && lineItem.reason.name) {
                lineItem.reason.isFreeTextAllowed = lineItem.reason.name.toLowerCase().indexOf('correcção') >= 0;
            }
        };

        vm.filterByProgram = function(items, orderable) {
            var programIds = [];
            orderable.programs.forEach(function(program) {
                programIds.push(program.programId);
            });
            var updatedItems = [];
            items.forEach(function(item) {
                if (programIds.indexOf(item.programId) !== -1) {
                    updatedItems.push(item);
                }
            });
            if (orderable.isKit && orderable.children.length === 0) {
                return _.filter(updatedItems, function(item) {
                    return item.name === 'APE';
                });
            }
            return _.filter(updatedItems, function(item) {
                return item.name !== 'APE';
            });
        };

        function copyDefaultValue() {
            var defaultDate;
            if (previousAdded.occurredDate) {
                defaultDate = previousAdded.occurredDate;
            } else {
                defaultDate = dateUtils.toStringDate(new Date());
            }
            return {
                /*assignment: previousAdded.assignment,*/
                srcDstFreeText: previousAdded.srcDstFreeText,
                reason: previousAdded.reason,
                reasonFreeText: previousAdded.reasonFreeText,
                occurredDate: defaultDate
            };
        }

        vm.setSelectedOrderableGroup = function(key, id) {
            vm.selectedOrderableGroup = _.find(vm.orderableGroups, function(group) {
                var lotId = _.map(group, function(item) {
                    return _.get(item, [key, 'id']);
                });
                return _.include(lotId, id);
            });
        };

        vm.setLots = function() {
            var addedLotIds = _.chain(vm.addedLineItems).map(function(item) {
                return _.get(item.lot, 'id');
            })
                .compact()
                .value();
            vm.lots = _.filter(orderableGroupService.lotsOf(vm.selectedOrderableGroup), function(item) {
                return addedLotIds.length === 0 || !_.include(addedLotIds, item.id);
            });
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name remove
     *
     * @description
     * Remove a line item from added products.
     *
     * @param {Object} lineItem line item to be removed.
     */
        vm.remove = function(lineItem) {
            var index = _.indexOf(vm.addedLineItems, lineItem);
            vm.addedLineItems.splice(index, 1);
            vm.setProductGroups();
            var productId = _.get(vm, ['selectedOrderableGroup', 0, 'orderable', 'id']);
            var isRemoveItemInCurrentProduct = lineItem.orderable.id === productId;

            if (isRemoveItemInCurrentProduct) {
                vm.setSelectedOrderableGroup('lot', _.get(lineItem, ['lot', 'id']));
                vm.setLots();
                validateLotNotFirstExpire();
            }

            $stateParams.isAddProduct = true;
            vm.search($state.current.name);
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name removeDisplayItems
     *
     * @description
     * Remove all displayed line items.
     */
        vm.removeDisplayItems = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusStockIssueService.resetDraft($stateParams.draftId).then(function() {
                    $scope.needToConfirm = false;
                    notificationService.success(vm.key('deleted'));
                    $state.go('openlmis.stockmanagement.issue.draft', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name validateQuantity
     *
     * @description
     * Validate line item quantity and returns self.
     *
     * @param {Object} lineItem line item to be validated.
     */
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (lineItem.quantity > lineItem.$previewSOH) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberLargerThanSOH');
            } else if ((!_.isNull(lineItem.quantity)) && lineItem.quantity >= 0) {
                lineItem.$errors.quantityInvalid = false;
            } else {
                lineItem.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
            }
            return lineItem;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name validateReason
     *
     * @description
     * Validate line item reason and returns self.
     *
     * @param {Object} lineItem line item to be validated.
     */
        vm.validateReason = function(lineItem) {
            return lineItem;
        };

        vm.validateLot = function(lineItem) {
            if ((lineItem.lot && lineItem.lot.lotCode) || lineItem.lotId) {
                lineItem.$errors.lotCodeInvalid = false;
            } else {
                lineItem.$errors.lotCodeInvalid = true;
            }
            return lineItem;
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name clearFreeText
     *
     * @description
     * remove free text from given object.
     *
     * @param {Object} obj      given target to be changed.
     * @param {String} property given property to be cleared.
     */
        vm.clearFreeText = function(obj, property) {
            obj[property] = null;
        };

        /**
         * @ngdoc method
         * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
         * @name submit
         *
         * @description
         * Submit all added items.
         */
        function getPdfName(facilityName, nowTime) {
            var result = (
                'Saída_'
                + facilityName
                + '_'
                + nowTime
                + '.pdf'
            );
            if (facilityName.indexOf('Outros') > -1) {
                result = (
                    'Saída_'
                    + facilityName.split(':')[1]
                    + '_'
                    + nowTime
                    + '.pdf'
                );
            }
            return result;
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
                            // 遍历跟随分页部分重复的部分
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
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString() + '-END',
                                585 / 2,
                                A4_HEIGHT
                            );
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
                            vm.destinationName,
                            openlmisDateFilter(new Date(), 'yyyy-MM-dd')
                        )
                    );
                    siglusDownloadLoadingModalService.close();
                    deferred.resolve('success');
                });
            });
        }

        function confirmMergeSubmit(signature, addedLineItems, occurredDate) {
            var subDrafts = _.uniq(_.map(draft.lineItems, function(item) {
                return item.subDraftId;
            }));

            siglusStockIssueService.mergeSubmitDraft($stateParams.programId, addedLineItems,
                signature, vm.initialDraftInfo, facility.id, subDrafts, occurredDate)
                .then(function() {
                    $state.go('openlmis.stockmanagement.stockCardSummaries', {
                        facility: facility.id,
                        program: program
                    });
                })
                .catch(function(error) {
                    loadingModalService.close();
                    if (error.data && error.data.businessErrorExtraData === 'subDrafts quantity not match') {
                        alertService.error('stockIssueCreation.draftHasBeenUpdated');
                    } else if (
                        // eslint-disable-next-line max-len
                        _.get(error, ['data', 'messageKey']) === 'siglusapi.error.stockManagement.movement.date.invalid'
                    ) {
                        alertService.error('openlmisModal.dateConflict');
                    }
                });
        }

        function confirmSubmit(signature, addedLineItems) {
            siglusStockIssueService.submitDraft($stateParams.initialDraftId, $stateParams.draftId, signature,
                addedLineItems, $stateParams.draftType)
                .then(function() {
                    loadingModalService.close();
                    notificationService.success(vm.key('submitted'));
                    $scope.needToConfirm = false;
                    vm.returnBack();
                })
                .catch(function(error) {
                    loadingModalService.close();
                    productDuplicatedHandler(error);
                });
        }

        vm.submit = function() {
            $scope.$broadcast('openlmis-form-submit');
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
            var addedLineItems = angular.copy(vm.addedLineItems);
            addedLineItems.forEach(function(lineItem) {
                lineItem.programId = _.first(lineItem.orderable.programs).programId;
                lineItem.reason = _.find(reasons, {
                    name: capitalize($stateParams.draftType || '')
                });
            });
            if (validateAllAddedItems()) {
                if (vm.isMerge) {
                    siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature')
                        .then(function(data) {
                            vm.issueVoucherDate = openlmisDateFilter(data.occurredDate, 'yyyy-MM-dd');
                            vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
                            vm.signature = data.signature;
                            downloadPdf();
                            deferred.promise.then(function() {
                                loadingModalService.open();
                                confirmMergeSubmit(data.signature, addedLineItems, data.occurredDate);
                            });
                        });
                } else {
                    loadingModalService.open();
                    confirmSubmit('', addedLineItems);
                }

            } else {
                if ($stateParams.keyword) {
                    cancelFilter();
                }
                alertService.error('stockAdjustmentCreation.submitInvalid');
            }
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
        // SIGLUS-REFACTOR: ends here

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name orderableSelectionChanged
     *
     * @description
     * Reset form status and change content inside lots drop down list.
     */
        vm.orderableSelectionChanged = function() {

            //reset selected lot, so that lot field has no default value
            vm.selectedLot = null;

            //same as above
            $scope.productForm.$setUntouched();

            //make form good as new, so errors won't persist
            $scope.productForm.$setPristine();
            vm.setSelectedOrderableGroup('orderable', _.get(vm, ['selectedOrderableGroup', 0, 'orderable', 'id']));
            vm.setLots();
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        };

        vm.setLotSelectionStatus = function() {
            vm.selectedOrderableHasLots = vm.lots.length > 0;
            if (vm.lots.length === 0) {
                vm.selectedOrderableGroup = [];
            }
        };

        /**
     * @ngdoc method
     * @methodOf stock-issue-creation.controller:SiglusStockIssueCreationController
     * @name getStatusDisplay
     *
     * @description
     * Returns VVM status display.
     *
     * @param  {String} status VVM status
     * @return {String}        VVM status display name
     */
        vm.getStatusDisplay = function(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        };

        function productDuplicatedHandler(error) {
            if (_.get(error, ['data', 'isBusinessError'])) {
                var data = _.map(_.get(error, ['data', 'businessErrorExtraData']), function(item) {
                    item.conflictWith = messageService.get('stockIssue.draft') + ' ' + item.conflictWith;
                    return item;
                });
                siglusRemainingProductsModalService.show(data).then(function() {
                    var lineItems = _.clone(vm.addedLineItems);
                    _.forEach(lineItems, function(lineItem) {
                        var hasDuplicated = _.some(data, function(item) {
                            return item.orderableId === lineItem.orderable.id;
                        });
                        if (hasDuplicated) {
                            vm.remove(lineItem);
                        }
                    });
                });
            }
        }

        vm.save = function() {
            var addedLineItems = angular.copy(vm.addedLineItems);

            if ($stateParams.keyword) {
                cancelFilter();
            }

            loadingModalService.open();
            siglusStockIssueService.saveDraft($stateParams.draftId, addedLineItems, $stateParams.draftType)
                .then(function() {
                    notificationService.success(vm.key('saved'));
                    $scope.needToConfirm = false;
                    $stateParams.isAddProduct = false;
                    vm.search(true);
                })
                .catch(function(error) {
                    productDuplicatedHandler(error);
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        vm.selectedLotLabel = function(lot) {
            var expirationDate = lot.expirationDate ? openlmisDateFilter(lot.expirationDate) : '';
            return lot.lotCode + '(' + expirationDate + ')';
        };

        function isDateBeforeToday(date) {
            var currentDate = new Date();
            return date.getFullYear() < currentDate.getUTCFullYear()
        || isMonthInYearBeforeCurrentUTCMonth(date, currentDate)
        || isDayInYearAndMonthBeforeCurrentUTCDay(date, currentDate);
        }

        function isMonthInYearBeforeCurrentUTCMonth(date, currentDate) {
            return date.getFullYear() === currentDate.getUTCFullYear()
        && date.getMonth() < currentDate.getUTCMonth();
        }

        function isDayInYearAndMonthBeforeCurrentUTCDay(date, currentDate) {
            return date.getFullYear() === currentDate.getUTCFullYear()
        && date.getMonth() === currentDate.getUTCMonth()
        && date.getDate() < currentDate.getUTCDate();
        }

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value);
        }

        function validateAllAddedItems() {
            _.each(vm.addedLineItems, function(item) {
                vm.validateQuantity(item);
                vm.validateReason(item);
            });
            return _.chain(vm.addedLineItems)
                .groupBy(function(item) {
                    return item.lot ? item.lot.id : item.orderable.id;
                })
                .values()
                .flatten()
                .all(isItemValid)
                .value();
        }

        function isItemValid(item) {
            return _.chain(item.$errors).keys()
                .all(function(key) {
                    return item.$errors[key] === false;
                })
                .value();
        }

        function reorderItems() {
            var sorted = $filter('orderBy')(vm.addedLineItems, ['orderable.productCode', '-occurredDate']);

            vm.displayItems = _.chain(sorted).groupBy(function(item) {
                return item.lot ? item.lot.id : item.orderable.id;
            })
                .sortBy(function(group) {
                    return _.every(group, function(item) {
                        return !item.$errors.quantityInvalid;
                    });
                })
                .flatten(true)
                .value();
        }

        function onInit() {

            $state.current.label = isMerge
                ? messageService.get('stockIssueCreation.mergedDraft')
                : messageService.get('stockIssue.draft') + ' ' + draft.draftNumber;

            initViewModel();
            initStateParams();

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue, oldValue) {
                $scope.needToConfirm = ($stateParams.isAddProduct || !angular.equals(newValue, oldValue));
                // calc total value
                vm.totalPriceValue = _.reduce(vm.addedLineItems, function(r, c) {
                    var price = c.price * 100;
                    r = r + c.quantity * price;
                    return r;
                }, 0);
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            $scope.$on('$stateChangeStart', function() {
                angular.element('.popover').popover('destroy');
            });
        }

        function initViewModel() {
            //Set the max-date of date picker to the end of the current day.
            vm.maxDate = new Date();
            vm.maxDate.setHours(23, 59, 59, 999);

            vm.destinationName = siglusStockUtilsService
                .getInitialDraftName(vm.initialDraftInfo, $stateParams.draftType);
            vm.facility = facility;
            vm.reasons = reasons;
            vm.addedLineItems = $stateParams.addedLineItems || [];
            _.forEach(vm.addedLineItems, function(item) {
                item.price = orderablesPrice.data[item.orderable.id] || '';
            });
            // calc total value
            vm.totalPriceValue = _.reduce(vm.addedLineItems, function(r, c) {
                var price = c.price ? c.price * 100 : 0;
                r = r + c.quantity * price;
                return r;
            }, 0);
            $stateParams.displayItems = displayItems;
            $stateParams.orderablesPrice = orderablesPrice;
            vm.displayItems = $stateParams.displayItems || [];
            vm.keyword = $stateParams.keyword;
            vm.orderableGroups = _.clone(orderableGroups);
            vm.setProductGroups();
            vm.hasLot = false;
            vm.orderableGroups.forEach(function(group) {
                vm.hasLot = vm.hasLot || orderableGroupService.lotsOf(group).length > 0;
            });
            vm.supplier = vm.facility.name;
            vm.client =
                _.indexOf(vm.destinationName, 'Outros') === 1 ? vm.destinationName.split(':')[1] : vm.destinationName;
        }

        function initStateParams() {
            $stateParams.page = getPageNumber();
            $stateParams.programId = program;
            $stateParams.facility = facility;
            $stateParams.reasons = reasons;
            $stateParams.mergedItems = mergedItems;
            $stateParams.initialDraftInfo = initialDraftInfo;
            $stateParams.draft = draft;
            // SIGLUS-REFACTOR: starts here
            // $stateParams.orderableGroups = orderableGroups;
            $stateParams.hasLoadOrderableGroups = true;
            // SIGLUS-REFACTOR: ends here
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        function cancelFilter() {
            reorderItems();
            vm.keyword = null;
            $stateParams.keyword = null;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.page = 0;
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name,
                notify: false
            });
        }

        onInit();

    }

})();
