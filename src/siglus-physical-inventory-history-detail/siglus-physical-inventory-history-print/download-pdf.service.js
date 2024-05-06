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
        .module('siglus-physical-inventory-history-detail')
        .service('DownloadPdfService', service);

    service.$inject = ['siglusDownloadLoadingModalService', 'messageService', '$q', 'moment'];

    function service(siglusDownloadLoadingModalService, messageService, $q, moment) {
        // A4: 595.28 x 841.89 (PostScript Point)
        var REAL_A4_HEIGHT = 842;
        var REAL_A4_WIDTH = 595;
        var MARGIN_LEFT = 5;
        var REAL_CONTENT_WIDTH = REAL_A4_WIDTH - MARGIN_LEFT * 2;

        var CONTENT_WIDTH_PIX = 1250;
        var SHRINK_RATIO = REAL_CONTENT_WIDTH / CONTENT_WIDTH_PIX;
        // eslint-disable-next-line no-undef
        var PDF = new jsPDF('', 'pt', 'a4');
        var pageNumber = 1;

        this.downloadPdf = downloadPdf;

        function downloadPdf(
            headerNode, lineItemHeaderNode, lineItemNodeList, footerNode, outerNode
        ) {
            siglusDownloadLoadingModalService.open();
            initPDF();

            var CONTENT_HEIGHT_PIX = REAL_A4_HEIGHT / SHRINK_RATIO;
            var currentPageAvailableHeight = CONTENT_HEIGHT_PIX
                - headerNode.offsetHeight
                - lineItemHeaderNode.offsetHeight;

            var lineItemToImagePromiseList =  _.map(lineItemNodeList, function(lineItemNode) {
                return getElementToImagePromise(lineItemNode, CONTENT_WIDTH_PIX, lineItemNode.offsetHeight + 1);
            });

            var headerFooterPromiseList = [
                getElementToImagePromise(headerNode, CONTENT_WIDTH_PIX),
                getElementToImagePromise(lineItemHeaderNode, CONTENT_WIDTH_PIX),
                getElementToImagePromise(footerNode, CONTENT_WIDTH_PIX),
                getElementToImagePromise(outerNode, CONTENT_WIDTH_PIX)
            ];

            $q.all(headerFooterPromiseList)
                .then(function(result) {
                    var headerNodeResult = result[0];
                    var lineItemHeaderNodeResult = result[1];
                    var footerNodeResult = result[2];
                    var outerNodeResult = result[3];

                    var offsetHeight = headerNode.offsetHeight;
                    var lineItemsUsedHeight = 0;

                    PDF.addImage(
                        headerNodeResult.data, 'JPEG', MARGIN_LEFT, 0,
                        REAL_CONTENT_WIDTH, headerNodeResult.nodeHeight * SHRINK_RATIO
                    );
                    PDF.addImage(
                        lineItemHeaderNodeResult.data, 'JPEG', MARGIN_LEFT, offsetHeight * SHRINK_RATIO,
                        REAL_CONTENT_WIDTH, lineItemHeaderNodeResult.nodeHeight * SHRINK_RATIO
                    );

                    $q.all(lineItemToImagePromiseList)
                        .then(function(lineItemResultList) {
                            _.forEach(lineItemResultList, function(lineItemResult) {
                                lineItemsUsedHeight = lineItemsUsedHeight + lineItemResult.nodeHeight;
                                var needNewPage = lineItemsUsedHeight > currentPageAvailableHeight;
                                if (needNewPage) {
                                    addNewPage();
                                    PDF.addImage(
                                        lineItemHeaderNodeResult.data, 'JPEG', MARGIN_LEFT, 0,
                                        REAL_CONTENT_WIDTH, (lineItemHeaderNodeResult.nodeHeight) * SHRINK_RATIO
                                    );
                                    offsetHeight = lineItemHeaderNodeResult.nodeHeight;
                                    lineItemsUsedHeight = 0;
                                }

                                PDF.addImage(lineItemResult.data, 'JPEG', MARGIN_LEFT,
                                    pageNumber === 1
                                        ? (offsetHeight + lineItemHeaderNodeResult.nodeHeight) * SHRINK_RATIO
                                        : offsetHeight * SHRINK_RATIO,
                                    REAL_CONTENT_WIDTH, lineItemResult.nodeHeight * SHRINK_RATIO);
                                offsetHeight = offsetHeight +  lineItemResult.nodeHeight;
                            });

                            var isCurrentPageAvailable =
                                currentPageAvailableHeight >
                                footerNodeResult.nodeHeight + outerNodeResult.nodeHeight + offsetHeight;
                            // add bottom & outer
                            if (isCurrentPageAvailable) {
                                PDF.addImage(
                                    footerNodeResult.data,
                                    'JPEG',
                                    MARGIN_LEFT,
                                    pageNumber > 1
                                        ? (offsetHeight) * SHRINK_RATIO
                                        : (offsetHeight + lineItemHeaderNodeResult.nodeHeight) * SHRINK_RATIO,
                                    REAL_CONTENT_WIDTH,
                                    footerNodeResult.nodeHeight * SHRINK_RATIO
                                );
                                PDF.addImage(
                                    outerNodeResult.data,
                                    'JPEG',
                                    MARGIN_LEFT,
                                    pageNumber > 1
                                        ? (offsetHeight + footerNodeResult.nodeHeight) * SHRINK_RATIO
                                        : (
                                            offsetHeight +
                                            lineItemHeaderNodeResult.nodeHeight +
                                            footerNodeResult.nodeHeight
                                        ) * SHRINK_RATIO,
                                    REAL_CONTENT_WIDTH,
                                    outerNodeResult.nodeHeight * SHRINK_RATIO
                                );
                            } else {
                                addNewPage();
                                addFooterAndOuterImage(footerNodeResult, outerNodeResult);
                            }

                            addPageBottomText(
                                pageNumber.toString() + '-END',
                                messageService.get('mmia.print_on_computer'),
                                buildCurrentDateTime()
                            );
                            PDF.save('hello.pdf');
                        })
                        .catch(function(error) {
                            throw new Error(error);
                        })
                        .finally(function() {
                            PDF = null;
                        });
                })
                .catch(function(error) {
                    throw new Error(error);
                })
                .finally(function() {
                    siglusDownloadLoadingModalService.close();
                });
        }

        function initPDF() {
            // eslint-disable-next-line no-undef
            PDF = new jsPDF('', 'pt', 'a4');
            pageNumber = 1;
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
                        nodeWidth: element.offsetWidth,
                        nodeHeight: element.offsetHeight
                    };
                })
                .catch(function(error) {
                    throw new Error(error);
                });
        }

        function addPageBottomText(pageNumberText, leftText, rightText) {
            PDF.setFontSize(10);
            PDF.text(
                leftText,
                MARGIN_LEFT,
                REAL_A4_HEIGHT - 10
            );
            PDF.text(
                pageNumberText,
                REAL_CONTENT_WIDTH / 2,
                REAL_A4_HEIGHT - 10
            );
            PDF.text(
                rightText,
                478,
                REAL_A4_HEIGHT - 10
            );
        }

        function addFooterAndOuterImage(footerResult, outerResult) {
            PDF.addImage(
                footerResult.data, 'JPEG',
                MARGIN_LEFT, 0,
                REAL_CONTENT_WIDTH, footerResult.nodeHeight * SHRINK_RATIO
            );
            PDF.addImage(
                outerResult.data, 'JEPG',
                MARGIN_LEFT, footerResult.nodeHeight,
                REAL_CONTENT_WIDTH, outerResult.nodeHeight * SHRINK_RATIO
            );
        }

        function addNewPage() {
            addPageBottomText(
                pageNumber.toString(),
                messageService.get('mmia.print_on_computer'),
                buildCurrentDateTime()
            );
            pageNumber = pageNumber + 1;
            PDF.addPage();
        }

        function buildCurrentDateTime() {
            return moment().format('d MMM y h:mm:ss a');
        }
    }
})();
