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
   * @name stock-issue-creation.service:StockIssueCreationService
   *
   * @description
   * Service for managing stock issue creation.
   */
    angular
        .module('stock-issue-creation')
        .service('stockIssueCreationService', StockIssueCreationService);

    StockIssueCreationService.$inject = [
        'openlmisDateFilter', '$q', 'siglusDownloadLoadingModalService'
    ];

    function StockIssueCreationService(openlmisDateFilter, $q, siglusDownloadLoadingModalService) {

        this.downloadPdf = downloadPdf;
        var deferred = $q.defer();

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

        function downloadPdf(destinationName, callback) {
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
                            destinationName,
                            openlmisDateFilter(new Date(), 'yyyy-MM-dd')
                        )
                    );
                    siglusDownloadLoadingModalService.close();
                    deferred.resolve('success');
                })
                    .then(function() {
                        callback();
                    });
            });
        }
    }
})();
