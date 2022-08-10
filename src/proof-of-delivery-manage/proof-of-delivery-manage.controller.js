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
     * @name proof-of-delivery-manage.controller:ProofOfDeliveryManageController
     *
     * @description
     * Controller for proof of delivery manage page
     */
    angular
        .module('proof-of-delivery-manage')
        .controller('ProofOfDeliveryManageController', controller);

    controller.$inject = [
        'proofOfDeliveryManageService', '$state', 'loadingModalService', 'notificationService', 'pods',
        '$stateParams', 'programs', 'requestingFacilities', 'supplyingFacilities', 'ProofOfDeliveryPrinter',
        'proofOfDeliveryService', 'fulfillingLineItemFactory', '$q', 'openlmisDateFilter',
        'stockReasonsFactory', 'facilityFactory', 'siglusInitialProofOfDeliveryService',
        'messageService', 'SIGLUS_TIME', 'siglusDownloadLoadingModalService'
    ];

    function controller(
        proofOfDeliveryManageService,
        $state,
        loadingModalService,
        notificationService,
        pods,
        $stateParams,
        programs,
        requestingFacilities,
        supplyingFacilities,
        ProofOfDeliveryPrinter,
        proofOfDeliveryService,
        fulfillingLineItemFactory,
        $q,
        openlmisDateFilter,
        stockReasonsFactory,
        facilityFactory,
        siglusInitialProofOfDeliveryService,
        messageService,
        SIGLUS_TIME,
        siglusDownloadLoadingModalService
    ) {

        var vm = this;
        vm.$onInit = onInit;
        vm.openPod = openPod;
        vm.loadOrders = loadOrders;
        vm.printProofOfDelivery = printProofOfDelivery;
        vm.getStatusText = getStatusText;
        vm.validatePODStatus = _.throttle(validatePODStatus, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });
        vm.ProofOfDeliveryPrinter = ProofOfDeliveryPrinter;
        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name pods
         * @type {Array}
         *
         * @description
         * Holds pods that will be displayed.
         */
        vm.pods = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds list of supervised programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name requestingFacilities
         * @type {Array}
         *
         * @description
         * Holds list of supervised requesting facilities.
         */
        vm.requestingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name supplyingFacilities
         * @type {Array}
         *
         * @description
         * Holds list of supervised supplying facilities.
         */
        vm.supplyingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds selected program.
         */
        vm.program = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name requestingFacility
         * @type {Object}
         *
         * @description
         * Holds selected requesting facility.
         */
        vm.requestingFacility = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name supplyingFacility
         * @type {Object}
         *
         * @description
         * Holds selected supplying facility.
         */
        vm.supplyingFacility = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name facilityName
         * @type {string}
         * 
         * @description
         * The name of the requesting facility for which the Proofs of Delivery are shown.
         */
        vm.facilityName = undefined;

        /**
         * @ngdoc property
         * @propertyOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name programName
         * @type {string}
         * 
         * @description
         * The name of the program for which the Proofs of Delivery are shown.
         */
        vm.programName = undefined;
        vm.incosistencies = [
            {
                productCode: 'aaaa',
                productName: 'bbbb',
                quantityShipped: 99,
                quantityAccepted: 50,
                rejectionReasonId: 'abcdefg',
                notes: 'hello'
            },
            {
                productCode: 'aaaa',
                productName: 'bbbb',
                quantityShipped: 99,
                quantityAccepted: 50,
                rejectionReasonId: 'abcdefg',
                notes: 'hello'
            },
            {
                productCode: 'aaaa',
                productName: 'bbbb',
                quantityShipped: 99,
                quantityAccepted: 50,
                rejectionReasonId: 'abcdefg',
                notes: 'hello'
            }
        ];
        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name $onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            vm.pods = pods;
            vm.programs = programs;
            vm.requestingFacilities = requestingFacilities;
            vm.supplyingFacilities = supplyingFacilities;
            vm.program = getSelectedObjectById(programs, $stateParams.programId);
            vm.requestingFacility = getSelectedObjectById(requestingFacilities, $stateParams.requestingFacilityId);
            vm.supplyingFacility = getSelectedObjectById(supplyingFacilities, $stateParams.supplyingFacilityId);
            vm.facilityName = getName(vm.requestingFacility);
            vm.programName = getName(vm.program);
            facilityFactory.getUserHomeFacility()
                .then(function(res) {
                    vm.facility = res;
                });
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name loadOrders
         *
         * @description
         * Retrieves the list of orders matching the selected requesting facility and program.
         *
         * @return {Array} the list of matching orders
         */
        function loadOrders() {
            var stateParams = angular.copy($stateParams);

            stateParams.programId = vm.program.id;
            stateParams.requestingFacilityId = vm.requestingFacility ? vm.requestingFacility.id : null;
            stateParams.supplyingFacilityId = vm.supplyingFacility ? vm.supplyingFacility.id : null;

            $state.go('openlmis.orders.podManage', stateParams, {
                reload: true
            });
        }

        /**
         *
         * @ngdoc method
         * @methodOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name openPod
         *
         * @description
         * Redirect to POD page.
         *
         * @param {String} orderId id of order to find it's POD
         */
        function openPod(orderId) {
            loadingModalService.open();
            proofOfDeliveryManageService.getByOrderId(orderId)
                .then(function(pod) {
                    $state.go('openlmis.orders.podManage.podView', {
                        podId: pod.id
                    });
                })
                .catch(function() {
                    notificationService.error('proofOfDeliveryManage.noOrderFound');
                    loadingModalService.close();
                });
        }
        // function getPdfName(facilityName, nowTime) {
        //     return (
        //         'Issue_'
        //         + facilityName
        //         + '_'
        //         + nowTime
        //         + '.pdf'
        //     );
        // }
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
            var canUseHeight = a4Height2px - fixedHeight - PAGE_NUM_HEIGHT - 50;
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
                            if (vm.incosistencies.length === 0) {
                                PDF.text(
                                    pageNumber.toString() + '-END',
                                    585 / 2,
                                    A4_HEIGHT
                                );
                            }
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
                siglusDownloadLoadingModalService.close();
                return;
            }
            opt.PDF.addPage();
            var pageNumber = opt.pageNumber + 1;
            // opt.PDF.setFontSize(10);
            // opt.PDF.text(
            //     pageNumber.toString(),
            //     585 / 2,
            //     opt.A4_HEIGHT
            // );
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
            var promiseListInLen = promiseListIn.length;
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
                    _.forEach(_result, function(res, _index) {
                        // 计算分页部分实际高度
                        realHeight = realHeight + _result[_index].nodeHeight;
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
                            opt.PDF.setFontSize(10);
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
                        // console.log('promiseListInLen', promiseListInLen);
                        // console.log('_index', _index);
                        if (promiseListInLen - 1 === _index) {
                            opt.PDF.text(
                                pageNumber.toString() + '-END',
                                585 / 2,
                                opt.A4_HEIGHT
                            );
                        }
                        offsetHeight = offsetHeight + _result[_index].nodeHeight;
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
                    siglusDownloadLoadingModalService.close();
                });
            });
        }

        vm.getReason = function(reasonId) {
            // return 
            // TODO  vm
            var reasonMap = _.reduce(vm.reasons, function(r, c) {
                r[c.id] = c.name;
                return r;
            }, {});
            return reasonMap[reasonId];
        };

        /**
         *
         * @ngdoc method
         * @methodOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name validatePoDDraftList
         *
         * @description
         * judge POD has started multi-users issue voucher
         *
         * @param {String} isStarter status of POD
         */
        function validatePODStatus(order) {

            if (order.status  === 'RECEIVED') {
                proofOfDeliveryManageService.getByOrderId(order.id).then(function(pod) {
                    $state.go('openlmis.orders.podManage.view', {
                        orderId: order.id,
                        podId: pod.id,
                        actionType: 'VIEW'
                    });
                });
            } else if (order.hasSubDraft) {
                proofOfDeliveryManageService.getByOrderId(order.id).then(function(pod) {
                    $state.go('openlmis.orders.podManage.draftList', {
                        orderId: order.id,
                        podId: pod.id,
                        orderCode: order.orderCode
                    });
                });
            } else {
                proofOfDeliveryManageService.getByOrderId(order.id).then(function(pod) {
                    siglusInitialProofOfDeliveryService.show(order.id, pod.id, order.orderCode);
                });
            }
        }

        /**
         *
         * @ngdoc method
         * @methodOf proof-of-delivery-manage.controller:ProofOfDeliveryManageController
         * @name printProofOfDelivery
         *
         * @description
         * Prints the given proof of delivery.
         *
         * @param  {Object} orderId the UUID of order to find it's POD
         * @return {String}         the prepared URL
         */
        function printProofOfDelivery(order) {
            var orderId = order.id;
            vm.orderCode = order.orderCode;
            siglusDownloadLoadingModalService.open();
            stockReasonsFactory.getReasons(order.program.id, order.facility.type.id, 'DEBIT')
                .then(function(reasons) {
                    vm.reasons = reasons;
                    proofOfDeliveryManageService.getByOrderId(orderId)
                        .then(function(pod) {
                            proofOfDeliveryManageService.getPodInfo(pod.id, orderId).then(function(res) {
                                vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
                                vm.supplier = res.supplier;
                                vm.preparedBy = res.preparedBy;
                                vm.conferredBy = res.conferredBy;
                                vm.client = res.client;
                                vm.supplierDistrict = res.supplierDistrict;
                                vm.supplierProvince = res.supplierProvince;
                                vm.requisitionDate = openlmisDateFilter(res.requisitionDate, 'yyyy-MM-dd');
                                vm.issueVoucherDate = openlmisDateFilter(res.issueVoucherDate, 'yyyy-MM-dd');
                                vm.deliveredBy = res.deliveredBy;
                                vm.receivedBy = res.receivedBy;
                                vm.receivedDate = res.receivedDate;
                                var orderCodeArray = vm.orderCode.split('-');
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
                                vm.requisitionId = res.requisitionId;
                                vm.requisitionNum = res.requisitionNum;
                            });
                            proofOfDeliveryService.get(pod.id).then(function(res) {
                                fulfillingLineItemFactory
                                    .groupByOrderable(res.lineItems, res.shipment.order.orderLineItems)
                                    .then(function(result) {
                                        vm.addedLineItems = _.reduce(result, function(r, c) {
                                            r.push(angular.merge({
                                                productCode: c.orderable.productCode,
                                                productName: c.orderable.fullProductName,
                                                lotCode:
                                                    c.groupedLineItems[0][0].lot
                                                        ? c.groupedLineItems[0][0].lot.lotCode
                                                        : '',
                                                expirationDate:
                                                    c.groupedLineItems[0][0].lot
                                                        ? c.groupedLineItems[0][0].lot.expirationDate
                                                        : '',
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
                                        }, 500);
                                    });
                            });
                        })
                        .catch(function() {
                            // printer.closeTab();
                            notificationService.error('proofOfDeliveryManage.noOrderFound');
                        });
                });
        }

        function getStatusText(order) {
            if (order.status  === 'RECEIVED') {
                return messageService.get('proofOfDeliveryManage.view');
            }
            if (order.hasSubDraft) {
                return messageService.get('proofOfDeliveryManage.continue');
            }
            return messageService.get('proofOfDeliveryManage.start');

        }
    }
    function getName(object) {
        return object ? object.name : undefined;
    }

    function getSelectedObjectById(list, id) {
        if (!list || !id) {
            return null;
        }
        var filteredList = list.filter(function(object) {
            return object.id === id;
        });
        return filteredList.length > 0 ? filteredList[0] : null;
    }
})();
