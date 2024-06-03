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

        var deferred = $q.defer();
        var PDF, pageNumber;
        var IMAGE_WIDTH_PX = 1250;
        var PDF_IMAGE_WIDTH = 585;
        // 定义常量
        var A4_WIDTH = 585, A4_HEIGHT = 781.89, CONTAINER_WIDTH = 1250, PAGE_NUM_HEIGHT = 10;
        // 计算px to a4实际单位换算比例
        var RATE = A4_WIDTH / CONTAINER_WIDTH;
        // a4实际高度换算px
        var a4Height2px = A4_HEIGHT / RATE;
        var CONTENT_MARGIN_LEFT_PX = 4;

        this.downloadPdf = downloadPdf;

        function init() {
            // eslint-disable-next-line no-undef
            PDF = new jsPDF('', 'pt', 'a4');
            pageNumber = 1;
        }

        function downloadPdf(destinationName, callback) {
            siglusDownloadLoadingModalService.open();
            init();

            // 获取固定高度的dom节点
            var sectionFirst = document.getElementById('sectionFirst');
            var sectionSecond = document.getElementById('sectionSecond');
            var sectionThird = document.getElementById('sectionThird');
            var sectionFouth = document.getElementById('sectionFouth');
            var subInformation = document.getElementById('subInformation');
            // 计算固定部分的高度总和
            var fixedHeight = sectionFirst.offsetHeight
                + sectionSecond.offsetHeight
                + sectionThird.offsetHeight
                + sectionFouth.offsetHeight
                + subInformation.offsetHeight
                + PAGE_NUM_HEIGHT / RATE;
            // 分页部分的高度计算
            var canUseHeight = a4Height2px - fixedHeight - PAGE_NUM_HEIGHT;
            // 定义固定部分的promiseList
            var fixedPromiseList = [
                getElementToImagePromise(sectionFirst, IMAGE_WIDTH_PX),
                getElementToImagePromise(sectionSecond, IMAGE_WIDTH_PX),
                getElementToImagePromise(sectionThird, IMAGE_WIDTH_PX),
                getElementToImagePromise(sectionFouth, IMAGE_WIDTH_PX),
                getElementToImagePromise(subInformation, IMAGE_WIDTH_PX)
            ];

            // 获取分页部分每行节点
            var needCalcTrNodes = document.querySelectorAll('#calcTr');
            // NodeList -> 数组
            var needCalcTrNodesArray = Array.from(needCalcTrNodes);
            // 定义分页部分的promiseList
            var lineItemsPromiseList = _.map(needCalcTrNodesArray, function(element) {
                return getElementToImagePromise(element, IMAGE_WIDTH_PX, element.offsetHeight + 1);
            });

            // 固定部分的图片转换完成后再去做分页部分的图片转换
            $q.all(fixedPromiseList).then(function(fixedPromiseResult) {
                var sectionFirstResult = fixedPromiseResult[0];
                var sectionSecondResult = fixedPromiseResult[1];
                var sectionThirdResult = fixedPromiseResult[2];
                var sectionFouthResult = fixedPromiseResult[3];
                var subInformationResult = fixedPromiseResult[4];
                // sectionFirst && sectionSecond are needed in every page top
                var topComponents = [sectionFirstResult, sectionSecondResult];
                // sectionFouthResult && subInformationResult are needed in every page bottom
                var bottomComponents = [sectionFouthResult, subInformationResult];
                // 起始偏移量
                var offsetHeight = topComponents.reduce(function(acc, componentResult) {
                    return acc + componentResult.nodeHeight;
                });
                // 当前分页部分tr的累积高度
                var realHeight = 0;

                $q.all(lineItemsPromiseList).then(function(result) {
                    // 添加分页部分上方的固定部分图片到PDF中
                    addPageTopComponents(topComponents);

                    _.forEach(result, function(lineItemPromiseResult, index) {
                        // 计算分页部分实际高度
                        realHeight = realHeight + lineItemPromiseResult.nodeHeight;
                        // need new page
                        if (realHeight > canUseHeight) {
                            addPageNumberAtFooter(false);
                            // add page bottom components
                            addPageBottomComponents(bottomComponents, (offsetHeight + sectionThirdResult.nodeHeight));
                            // new page
                            addNewPage();
                            addPageNumberAtFooter(false);

                            offsetHeight = sectionFirst.offsetHeight + sectionSecond.offsetHeight;
                            realHeight = 0;
                        }

                        // 添加当前遍历元素的图片到PDF
                        PDF.addImage(
                            lineItemPromiseResult.data, 'JPEG',
                            CONTENT_MARGIN_LEFT_PX, offsetHeight * RATE,
                            lineItemPromiseResult.nodeWidth * RATE, lineItemPromiseResult.nodeHeight * RATE
                        );

                        var isLastLineItem = index === lineItemsPromiseList.length - 1;
                        if (isLastLineItem) {
                            addPageNumberAtFooter(true);
                            // TODO: what if sectionThirdResult need new page?
                            PDF.addImage(
                                sectionThirdResult.data, 'JPEG',
                                CONTENT_MARGIN_LEFT_PX, (offsetHeight + lineItemPromiseResult.nodeHeight) * RATE,
                                PDF_IMAGE_WIDTH, sectionThirdResult.nodeHeight * RATE
                            );
                        }
                        offsetHeight = offsetHeight + lineItemPromiseResult.nodeHeight;
                    });

                    // add page bottom components
                    addPageBottomComponents(bottomComponents, (offsetHeight + sectionThirdResult.nodeHeight));

                    var fileName = getPdfName(
                        destinationName,
                        openlmisDateFilter(new Date(), 'yyyy-MM-dd')
                    );
                    PDF.save(fileName);
                    siglusDownloadLoadingModalService.close();
                    deferred.resolve('success');
                })
                    .then(function() {
                        callback();
                    });
            });
        }

        function getElementToImagePromise(element, width, height) {
            var imageHeight = height ? height : element.offsetHeight;
            // eslint-disable-next-line no-undef
            return domtoimage.toPng(element, {
                scale: 1,
                width: width,
                height: imageHeight
            })
                .then(function(data) {
                    return {
                        data: data,
                        nodeWidth: width,
                        nodeHeight: imageHeight
                    };
                });
        }

        function addPageTopComponents(componentResultList) {
            var startYOffset = 0;
            componentResultList.forEach(function(componentResult) {
                PDF.addImage(
                    componentResult.data, 'JPEG',
                    CONTENT_MARGIN_LEFT_PX, startYOffset  * RATE,
                    PDF_IMAGE_WIDTH, componentResult.nodeHeight * RATE
                );
                startYOffset = startYOffset + componentResult.nodeHeight;
            });
        }

        function addPageBottomComponents(componentResultList, offsetY) {
            var startYOffset = offsetY;
            componentResultList.forEach(function(componentResult) {
                PDF.addImage(
                    componentResult.data, 'JPEG',
                    CONTENT_MARGIN_LEFT_PX, startYOffset * RATE,
                    PDF_IMAGE_WIDTH, componentResult.nodeHeight * RATE
                );
                startYOffset = startYOffset + componentResult.nodeHeight;
            });
        }

        function addPageNumberAtFooter(isLastPage) {
            var numberText = isLastPage ? pageNumber.toString() + '-END' : pageNumber.toString();
            PDF.setFontSize(10);
            PDF.text(numberText, PDF_IMAGE_WIDTH / 2, A4_HEIGHT);
        }

        function addNewPage() {
            PDF.addPage();
            pageNumber = pageNumber + 1;
            addPageNumberAtFooter(false);
        }

        function getPdfName(facilityName, nowTime) {
            var facility = facilityName.indexOf('Outros') > -1 ?
                facilityName.split(':')[1] : facilityName;
            return ('Saída_' + facility + '_' + nowTime + '.pdf');
        }

    }
})();
