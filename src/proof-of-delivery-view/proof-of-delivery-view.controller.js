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
     * @name proof-of-delivery-view.controller:ProofOfDeliveryViewController
     *
     * @description
     * Controller that drives the POD view screen.
     */
    angular
        .module('proof-of-delivery-view')
        .controller('ProofOfDeliveryViewController', ProofOfDeliveryViewController);

    ProofOfDeliveryViewController.$inject = [ '$scope',
        'proofOfDelivery', 'order', 'reasons', 'messageService', 'VVM_STATUS', 'orderLineItems', 'canEdit',
        'ProofOfDeliveryPrinter', '$q', 'loadingModalService', 'proofOfDeliveryService', 'notificationService',
        '$stateParams', 'alertConfirmModalService', '$state', 'PROOF_OF_DELIVERY_STATUS', 'confirmService',
        'confirmDiscardService', 'proofOfDeliveryManageService', 'openlmisDateFilter', 'fulfillingLineItemFactory',
        'facilityFactory'];

    function ProofOfDeliveryViewController($scope
        , proofOfDelivery, order, reasons, messageService
        , VVM_STATUS, orderLineItems, canEdit, ProofOfDeliveryPrinter
        , $q, loadingModalService, proofOfDeliveryService, notificationService
        , $stateParams, alertConfirmModalService, $state, PROOF_OF_DELIVERY_STATUS
        , confirmService, confirmDiscardService, proofOfDeliveryManageService
        , openlmisDateFilter, fulfillingLineItemFactory, facilityFactory) {

        var vm = this;

        vm.$onInit = onInit;
        vm.getStatusDisplayName = getStatusDisplayName;
        vm.getReasonName = getReasonName;
        vm.printProofOfDelivery = printProofOfDelivery;
        vm.save = save;
        vm.submit = submit;
        vm.deleteDraft = deleteDraft;
        vm.returnBack = returnBack;
        vm.isMerge = undefined;
        this.ProofOfDeliveryPrinter = ProofOfDeliveryPrinter;
        vm.getReason = function(reasonId) {
            // return 
            var reasonMap = _.reduce(reasons, function(r, c) {
                r[c.id] = c.name;
                return r;
            }, {});
            return reasonMap[reasonId];
        };

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name proofOfDelivery
         * @type {Object}
         *
         * @description
         * Holds Proof of Delivery.
         */
        vm.proofOfDelivery = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name order
         * @type {Object}
         *
         * @description
         * Holds Order from Proof of Delivery.
         */
        vm.order = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name orderLineItems
         * @type {Object}
         *
         * @description
         * Holds a map of Order Line Items with Proof of Delivery Line Items grouped by orderable.
         */
        vm.orderLineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name showVvmColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be shown for current Proof of Delivery.
         */
        vm.showVvmColumn = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name canEdit
         * @type {boolean}
         *
         * @description
         * Indicates if PoD is in initiated status and if user has permission to edit it.
         */
        vm.canEdit = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name reasons
         * @type {Array}
         *
         * @description
         * List of available stock reasons.
         */
        vm.reasons = undefined;

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name $onInit
         *
         * @description
         * Initialization method of the ProofOfDeliveryViewController.
         */
        function onInit() {

            vm.order = order;
            // SIGLUS-REFACTOR: starts here
            // vm.reasons = reasons;
            vm.reasons = _.filter(reasons, function(reason) {
                return _.contains(reason.tags, 'rejection');
            });
            // SIGLUS-REFACTOR: ends here
            vm.proofOfDelivery = proofOfDelivery;
            vm.orderLineItems = orderLineItems;
            vm.vvmStatuses = VVM_STATUS;
            vm.showVvmColumn = proofOfDelivery.hasProductsUseVvmStatus();
            vm.canEdit = canEdit;
            vm.orderCode = order.orderCode;
            facilityFactory.getUserHomeFacility()
                .then(function(res) {
                    vm.facility = res;
                });
            vm.isMerge = $stateParams.actionType === 'MERGE'
            || $stateParams.actionType === 'VIEW';

            if ($stateParams.actionType === 'NOT_YET_STARTED') {
                save(true);
            }

            $scope.$watch(function() {
                return vm.proofOfDelivery;
            }, function(newValue, oldValue) {
                $scope.needToConfirm =  !angular.equals(newValue, oldValue);
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
            updateLabel();
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name getStatusDisplayName
         *
         * @description
         * Returns translated status display name.
         */
        function getStatusDisplayName(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name getReasonName
         *
         * @description
         * Returns a name of the reason with the given ID.
         *
         * @param  {string} id the ID of the reason
         * @return {string}    the name of the reason
         */
        function getReasonName(id) {
            if (!id) {
                return;
            }

            return vm.reasons.filter(function(reason) {
                return reason.id === id;
            })[0].name;
        }

        function save(notReload) {
            $scope.needToConfirm = false;
            loadingModalService.open();
            proofOfDeliveryService.updateSubDraft($stateParams.podId,
                $stateParams.subDraftId, vm.proofOfDelivery, 'SAVE').then(function() {
                if (!notReload) {
                    notificationService.success('proofOfDeliveryView.proofOfDeliveryHasBeenSaved');
                }
                if (notReload) {
                    var stateParams = angular.copy($stateParams);
                    stateParams.actionType = 'DRAFT';
                    $state.go($state.current.name, stateParams, {
                        location: 'replace'
                    });
                }

            })
                .catch(function() {
                    notificationService.error('proofOfDeliveryView.failedToSaveProofOfDelivery');
                })
                .finally(loadingModalService.close);
        }

        function submit() {
            $scope.needToConfirm = false;
            $scope.$broadcast('openlmis-form-submit');
            var copy = angular.copy(vm.proofOfDelivery),
                errors = copy.validate(vm.isMerge);
            if (errors) {
                return $q.reject(errors);
            }
            if (vm.isMerge) {
                submitDraft();
            } else {
                submitSubDraft();
            }
        }

        // submit subDraft
        function submitSubDraft() {
            loadingModalService.open();
            proofOfDeliveryService.updateSubDraft($stateParams.podId,
                $stateParams.subDraftId, vm.proofOfDelivery, 'SUBMIT').then(function() {
                notificationService.success('proofOfDeliveryView.proofOfDeliveryHasBeenSaved');
                $state.go('^', $stateParams, {
                    reload: true
                });
            })
                .catch(function() {
                    notificationService.error('proofOfDeliveryView.failedToSaveProofOfDelivery');
                })
                .finally(loadingModalService.close);
        }

        // final merge and submit
        function submitDraft() {
            confirmService.confirm(
                'proofOfDeliveryView.confirm.message',
                'proofOfDeliveryView.confirm.label'
            )
                .then(function() {
                    loadingModalService.open();
                    var copy = angular.copy(vm.proofOfDelivery);
                    copy.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;
                    proofOfDeliveryService.submitDraft($stateParams.podId,
                        copy).then(function() {
                        notificationService.success(
                            'proofOfDeliveryView.proofOfDeliveryHasBeenConfirmed'
                        );
                        $state.go('openlmis.orders.podManage', {
                            requestingFacilityId: $stateParams.requestingFacilityId,
                            programId: $stateParams.programId
                        }, {
                            reload: true
                        });
                    })
                        .catch(function() {
                            notificationService.error(
                                'proofOfDeliveryView.failedToConfirmProofOfDelivery'
                            );
                        })
                        .finally(loadingModalService.close);
                });

        }

        function deleteDraft() {
            $scope.needToConfirm = false;
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteDraftWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                proofOfDeliveryService.deleteSubDraft($stateParams.podId,
                    $stateParams.subDraftId).then(function() {
                    $state.go('^', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    })
                    .finally(loadingModalService.close);
            });
        }

        function returnBack() {
            $state.go('^', {}, {
                reload: true
            });
        }

        function updateLabel() {
            if ($stateParams.actionType === 'VIEW') {
                $state.current.label = messageService.get('proofOfDeliveryManage.view');
            } else if ($stateParams.actionType === 'MERGE') {
                $state.current.label = messageService.get('stockPhysicalInventoryDraft.mergeDraft');
            } else {
                $state.current.label =
                        messageService.get('stockPhysicalInventoryDraft.draft')
                        + ' '
                        + $stateParams.draftNum;
            }
        }
        function downloadPdf() {
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
                PDF.setFontSize(10);
                PDF.text(
                    pageNumber.toString(),
                    585 / 2,
                    A4_HEIGHT
                );
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
                            // PDF.addImage(
                            //     '',
                            //     'JPEG',
                            //     4,
                            //     (
                            //         offsetHeight
                            //     ) * rate,
                            //     585,
                            //     reback[2].nodeHeight * rate
                            // );
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
                        }
                        offsetHeight = offsetHeight + result[index].nodeHeight;
                    });
                    // 添加分页部分下方的固定部分图片到PDF中
                    // PDF.addImage(
                    //     '',
                    //     'JPEG',
                    //     4,
                    //     (offsetHeight) * rate,
                    //     585,
                    //     reback[2].nodeHeight * rate
                    // );
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
                    // inconsistency report 开始生成，并且下PDF
                    var opt = {
                        rate: rate,
                        PAGE_NUM_HEIGHT: PAGE_NUM_HEIGHT,
                        a4Height2px: a4Height2px,
                        pageNumber: pageNumber,
                        PDF: PDF,
                        A4_HEIGHT: A4_HEIGHT
                    };
                    downloadIncosostenciesPdf(opt);
                });
            });
        }

        function downloadIncosostenciesPdf(opt) {
            var needCalcTrNodesArray = Array.from(document.querySelectorAll('#inconsistencyCalcTr'));
            if (needCalcTrNodesArray.length === 0) {
                opt.PDF.save(
                    // getPdfName(
                    //     vm.facility.name,
                    //     vm.issueVoucherDate
                    // )
                    vm.fileName + '.pdf'
                );
                return;
            }
            opt.PDF.addPage();
            var pageNumber = opt.pageNumber + 1;
            opt.PDF.setFontSize(10);
            opt.PDF.text(
                pageNumber.toString(),
                585 / 2,
                opt.A4_HEIGHT
            );
            var incosostencyHeaderNode = document.getElementById('inconsistencyHeader'),
                incosostencyFooterNode = document.getElementById('inconsistencyFooter'),
                inconsistencyTh = document.getElementById('inconsistencyTh');
            var fixedHeight = incosostencyHeaderNode.offsetHeight
                    + incosostencyFooterNode.offsetHeight
                    + inconsistencyTh.offsetHeight
                    + opt.PAGE_NUM_HEIGHT / opt.rate;
            var canUseHeight = opt.a4Height2px - fixedHeight - opt.PAGE_NUM_HEIGHT;

            var fixedPromiseListIn = [
                // eslint-disable-next-line no-undef
                domtoimage.toPng(incosostencyHeaderNode, {
                    scale: 1,
                    width: 1250,
                    height: incosostencyHeaderNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: incosostencyHeaderNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(inconsistencyTh, {
                    scale: 1,
                    width: 1250,
                    height: inconsistencyTh.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: inconsistencyTh.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(incosostencyFooterNode, {
                    scale: 1,
                    width: 1250,
                    height: incosostencyFooterNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: 1250,
                        nodeHeight: incosostencyFooterNode.offsetHeight
                    };
                })
            ];
            var promiseListIn = [];
            _.forEach(needCalcTrNodesArray, function(item) {
                // eslint-disable-next-line no-undef
                promiseListIn.push(domtoimage.toPng(item, {
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
            $q.all(fixedPromiseListIn).then(function(_reback) {
                // 偏移量
                var offsetHeight = incosostencyHeaderNode.offsetHeight + inconsistencyTh.offsetHeight;
                // 当前分页部分tr的累积高度
                var realHeight = 0;
                // 页码
                $q.all(promiseListIn).then(function(_result) {
                    // 添加分页部分上方的固定部分图片到PDF中
                    opt.PDF.addImage(_reback[0].data, 'JPEG', 4, 0, 585, _reback[0].nodeHeight * opt.rate);
                    opt.PDF.addImage(_reback[1].data, 'JPEG', 4,
                        incosostencyHeaderNode.offsetHeight * opt.rate,
                        585, _reback[1].nodeHeight * opt.rate);
                    _.forEach(_result, function(res, index) {
                        // 计算分页部分实际高度
                        realHeight = realHeight + _result[index].nodeHeight;
                        if (realHeight > canUseHeight) {
                            opt.PDF.setFontSize(10);
                            opt.PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                opt.A4_HEIGHT
                            );
                            // 遍历跟随分页部分重复的部分
                            opt.PDF.addImage(
                                _reback[2].data,
                                'JPEG',
                                4,
                                (
                                    offsetHeight
                                ) * opt.rate,
                                585,
                                _reback[2].nodeHeight * opt.rate + 2
                            );
                            // 新开分页
                            opt.PDF.addPage();
                            pageNumber = pageNumber + 1;
                            opt.PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                opt.A4_HEIGHT
                            );
                            opt.PDF.addImage(_reback[0].data, 'JPEG', 4, 0, 585, _reback[0].nodeHeight * opt.rate);
                            opt.PDF.addImage(_reback[1].data, 'JPEG', 4,
                                incosostencyHeaderNode.offsetHeight * opt.rate, 585, _reback[1].nodeHeight * opt.rate);
                            offsetHeight = incosostencyHeaderNode.offsetHeight + inconsistencyTh.offsetHeight;
                            realHeight = 0;
                        }
                        // 添加当前遍历元素的图片到PDF
                        opt.PDF.addImage(
                            res.data,
                            'JPEG',
                            4,
                            offsetHeight * opt.rate,
                            res.nodeWidth * opt.rate,
                            res.nodeHeight * opt.rate
                        );
                        offsetHeight = offsetHeight + _result[index].nodeHeight;
                    });
                    // 添加分页部分下方的固定部分图片到PDF中
                    opt.PDF.addImage(
                        _reback[2].data,
                        'JPEG',
                        4,
                        (offsetHeight) * opt.rate,
                        585,
                        _reback[2].nodeHeight * opt.rate + 2
                    );
                    // 生成PDF文件，并且命名
                    opt.PDF.save(
                        // getPdfName(
                        //     vm.facility.name,
                        //     vm.issueVoucherDate
                        // )
                        vm.fileName + '.pdf'
                    );
                });
            });
        }

        /**
         *
         * @ngdoc method
         * @methodOf proof-of-delivery-view.controller:ProofOfDeliveryViewController
         * @name printProofOfDelivery
         *
         * @description
         * Prints the proof of delivery.
         */
        function printProofOfDelivery() {
            var orderId = vm.order.id;
            var podId = $stateParams.podId;
            // loadingModalService.open();
            proofOfDeliveryManageService.getPodInfo(podId, orderId).then(function(res) {
                vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
                vm.supplier = res.supplier;
                vm.client = res.client;
                vm.supplierDistrict = res.supplierDistrict;
                vm.supplierProvince = res.supplierProvince;
                vm.requisitionDate = openlmisDateFilter(res.requisitionDate, 'yyyy-MM-dd');
                vm.issueVoucherDate = openlmisDateFilter(res.issueVoucherDate, 'yyyy-MM-dd');
                vm.deliveredBy = res.deliveredBy;
                vm.receivedBy = res.receivedBy;
                vm.receivedDate = res.receivedDate;
                var orderCodeArray = vm.order.orderCode.split('-');
                // if (fileNameArray[fileNameArray.length - 1])
                if (orderCodeArray.length > 2) {
                    var leftString =
                        orderCodeArray[orderCodeArray.length - 1] < 10
                            ? '0' + orderCodeArray[orderCodeArray.length - 1]
                            : orderCodeArray[orderCodeArray.length - 1];
                    vm.fileName = res.fileName + '/' + leftString;
                } else {
                    vm.fileName = res.fileName + '/' + '01';
                }
                // vm.fileName = res.fileName;
                vm.requisitionId = res.requisitionId;
                vm.requisitionNum = res.requisitionNum;
            });
            proofOfDeliveryService.get(podId).then(function(res) {
                fulfillingLineItemFactory
                    .groupByOrderable(res.lineItems, res.shipment.order.orderLineItems).then(function(result) {
                        vm.addedLineItems = _.reduce(result, function(r, c) {
                            r.push(angular.merge({
                                productCode: c.orderable.productCode,
                                productName: c.orderable.fullProductName,
                                lotCode: c.groupedLineItems[0][0].lot.lotCode,
                                expirationDate: c.groupedLineItems[0][0].lot.expirationDate,
                                notes: c.groupedLineItems[0][0].notes,
                                quantityShipped: c.groupedLineItems[0][0].quantityShipped,
                                quantityAccepted: c.groupedLineItems[0][0].quantityAccepted,
                                rejectionReasonId: c.groupedLineItems[0][0].rejectionReasonId
                            }, c));
                            return r;
                        }, []);
                        vm.incosistencies = _.filter(vm.addedLineItems, function(item) {
                            return item.rejectionReasonId;
                        });
                        setTimeout(function() {
                            downloadPdf();
                        }, 1000);
                    });
            });
        }
    }
}());
