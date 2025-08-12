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
        .module('siglus-issue-or-receive-report')
        .factory('SiglusIssueOrReceiveReportService', SiglusIssueOrReceiveReportService);

    SiglusIssueOrReceiveReportService.$inject = [
        'moment', '$q', 'siglusDownloadLoadingModalService', '$timeout'
    ];

    function SiglusIssueOrReceiveReportService(
        moment, $q, siglusDownloadLoadingModalService, $timeout
    ) {
        var PDF, pageNumber;
        var deferred = $q.defer();
        var IMAGE_WIDTH_PX = 1250;
        var PDF_IMAGE_WIDTH = 585;
        // 定义常量
        var A4_WIDTH = 585, A4_HEIGHT = 781.89, CONTAINER_WIDTH = 1250, PAGE_NUM_HEIGHT = 10;
        // 计算px to a4实际单位换算比例
        var RATE = A4_WIDTH / CONTAINER_WIDTH;
        // a4实际高度换算px
        var a4Height2px = A4_HEIGHT / RATE;
        var CONTENT_MARGIN_LEFT_PX = 4;
        var REPORT_TYPE = {
            ISSUE: 'issue',
            RECEIVE: 'receive',
            POD: 'pod'
        };
        var RECEIVE_PDF_REASON_NAME_LIST = [
            // eslint-disable-next-line max-len
            '[Ajustes Positivos] Correcção de inventário, no caso do stock Superior (stock é Superior ao existente na ficha de stock)',
            '[Ajustes Positivos] Da quarentena para Depósito, no caso de se confirmar a qualidade do produto',
            '[Ajustes Positivos] Devolução Dentro do prazo de validade dos clientes (US e Depósitos Beneficiários)',
            '[Ajustes Positivos] Devolução de expirados (US e Depósitos Beneficiários)',
            '[Ajustes Positivos] Doações ao Depósito',
            '[Ajustes Positivos] Empréstimos (de todos os níveis) que dão entrada no depósito'
        ];
        var ISSUE_PDF_REASON_NAME_LIST = [
            // eslint-disable-next-line max-len
            '[Ajustes Negativos] Correcção de inventário, no caso do stock inferior (stock é inferior ao existente na ficha de stock)',
            '[Ajustes Negativos] Danificado no depósito',
            '[Ajustes Negativos] Devolução Dentro do prazo de validade ao Depósito fornecedor',
            '[Ajustes Negativos] Devolução de expirados para Depósito fornecedor',
            '[Ajustes Negativos] Empréstimos (para todos níveis) que dão saída do depósito',
            '[Ajustes Negativos] Saída para quarentena, no caso de problemas relativos a qualidade',
            '[Ajustes Negativos] Transferência de produtos expirados'
        ];

        SiglusIssueOrReceiveReportService.prototype.downloadPdf = downloadPdf;
        SiglusIssueOrReceiveReportService.prototype.REPORT_TYPE = REPORT_TYPE;
        SiglusIssueOrReceiveReportService.prototype.RECEIVE_PDF_REASON_NAME_LIST = RECEIVE_PDF_REASON_NAME_LIST;
        SiglusIssueOrReceiveReportService.prototype.ISSUE_PDF_REASON_NAME_LIST = ISSUE_PDF_REASON_NAME_LIST;

        function SiglusIssueOrReceiveReportService() {}
        return SiglusIssueOrReceiveReportService;

        function init() {
            // eslint-disable-next-line no-undef
            PDF = new jsPDF('', 'pt', 'a4');
            pageNumber = 1;
        }

        function downloadPdf(fileName, callback, needPodInconsistentPdf) {
            waitForAddedLineItemsRender().then(function() {
                downloadReceiveOrIssuePdf(fileName, callback, needPodInconsistentPdf);
            });
        }

        function downloadReceiveOrIssuePdf(fileName, callback, needPodInconsistentPdf) {
            siglusDownloadLoadingModalService.open();
            init();
            var pdfFileName = fileName + '.pdf';

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
                getElementToImagePromise(subInformation, IMAGE_WIDTH_PX, subInformation.offsetHeight + 30)
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
                var  bottomComponents = [sectionFouthResult, subInformationResult];
                // 起始偏移量
                var offsetHeight = topComponents.reduce(function(acc, componentResult) {
                    return acc + componentResult.nodeHeight;
                }, 0);
                // 当前分页部分tr的累积高度
                var realHeight = 0;

                // add line items
                $q.all(lineItemsPromiseList).then(function(result) {
                    // 添加分页部分上方的固定部分图片到PDF中
                    addComponentsImage(topComponents);

                    _.forEach(result, function(lineItemPromiseResult, index) {
                        // 计算分页部分实际高度
                        realHeight = realHeight + lineItemPromiseResult.nodeHeight;
                        // need new page
                        if (realHeight > canUseHeight) {
                            addPageNumberAtFooter(false);
                            // add page bottom components
                            addComponentsImage(bottomComponents, (offsetHeight + sectionThirdResult.nodeHeight));
                            // new page
                            addNewPage();

                            addComponentsImage(topComponents);

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
                    // add line items end

                    // TODO: need new page?
                    // add page bottom components
                    addComponentsImage(bottomComponents, (offsetHeight + sectionThirdResult.nodeHeight));

                    if (needPodInconsistentPdf) {
                        downloadPodInconsistencyPdf(pdfFileName);
                    } else {
                        PDF.save(pdfFileName);
                        siglusDownloadLoadingModalService.close();
                    }
                    deferred.resolve('success');
                })
                    .then(function() {
                        if (callback) {
                            callback();
                        }
                    });
            });
        }

        function downloadPodInconsistencyPdf(fileName) {
            var needCalcTrNodesArray = Array.from(document.querySelectorAll('#inconsistencyCalcTr'));
            if (needCalcTrNodesArray.length === 0) {
                PDF.save(fileName);
                return;
            }
            // download Inconsistent pod in new page
            PDF.addPage();
            pageNumber = pageNumber + 1;

            var inconsistencyHeaderNode = document.getElementById('inconsistencyHeader');
            var inconsistencyFooterNode = document.getElementById('inconsistencyFooter');
            var inconsistencyTh = document.getElementById('inconsistencyTh');
            var fixedHeight = inconsistencyHeaderNode.offsetHeight
                + inconsistencyFooterNode.offsetHeight
                + inconsistencyTh.offsetHeight
                + PAGE_NUM_HEIGHT / RATE;
            var canUseHeight = a4Height2px - fixedHeight - PAGE_NUM_HEIGHT;
            var fixedPromiseList = [
                getElementToImagePromise(inconsistencyHeaderNode, IMAGE_WIDTH_PX),
                getElementToImagePromise(inconsistencyTh, IMAGE_WIDTH_PX),
                getElementToImagePromise(inconsistencyFooterNode, IMAGE_WIDTH_PX)
            ];
            var lineItemsPromiseList = _.map(needCalcTrNodesArray, function(lineItemElement) {
                return getElementToImagePromise(lineItemElement, IMAGE_WIDTH_PX, lineItemElement.offsetHeight + 1);
            });

            // add line items
            $q.all(fixedPromiseList).then(function(fixedPromiseResult) {
                var headerNodeResult = fixedPromiseResult[0];
                var thNodeResult = fixedPromiseResult[1];
                var footerNodeResult = fixedPromiseResult[2];

                var topComponents = [headerNodeResult, thNodeResult];
                var bottomComponents = [footerNodeResult];

                var offsetHeight = topComponents.reduce(function(acc, componentResult) {
                    return acc + componentResult.nodeHeight;
                }, 0);
                var realHeight = 0;

                $q.all(lineItemsPromiseList).then(function(itemsPromiseResult) {
                    addComponentsImage(topComponents);
                    // add lineItems
                    _.forEach(itemsPromiseResult, function(itemResult, index) {
                        realHeight = realHeight + itemResult.nodeHeight;
                        // need to add new page
                        if (realHeight > canUseHeight) {
                            // add footer
                            addPageNumberAtFooter(false);
                            // add bottom components
                            addComponentsImage(bottomComponents, offsetHeight);
                            // add new page
                            addNewPage();
                            // add top components
                            addComponentsImage(topComponents);
                            // reset offset
                            offsetHeight = topComponents.reduce(function(acc, componentResult) {
                                return acc + componentResult.nodeHeight;
                            }, 0);
                            realHeight = 0;
                        }

                        // add line item
                        PDF.addImage(
                            itemResult.data, 'JPEG',
                            CONTENT_MARGIN_LEFT_PX, offsetHeight * RATE,
                            itemResult.nodeWidth * RATE, itemResult.nodeHeight * RATE
                        );
                        offsetHeight = offsetHeight + itemResult.nodeHeight;

                        var isLastLineItem = index === lineItemsPromiseList.length - 1;
                        if (isLastLineItem) {
                            addPageNumberAtFooter(true);
                        }
                    });
                    // add line items end

                    // add bottom components
                    addComponentsImage(bottomComponents, offsetHeight);
                    PDF.save(fileName);
                    siglusDownloadLoadingModalService.close();
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

        function addComponentsImage(componentResultList, offsetY) {
            var startYOffset = offsetY ? offsetY : 0;
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

        function waitForAddedLineItemsRender() {
            var TIME_WAITING_FOR_REPORT_RENDER = 500;
            var deferred = $q.defer();
            $timeout(deferred.resolve, TIME_WAITING_FOR_REPORT_RENDER);
            return deferred.promise;
        }

    }
})();
