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
        this.downloadPdf = downloadPdf;

        function downloadPdf(
            rootNode, headerNode, lineItemHeaderNode, lineItemNodeList, footerNode, outerNode
        ) {
            siglusDownloadLoadingModalService.open();

            var contentWidth = rootNode.offsetWidth;
            // A4: 595.28 x 841.89 (PostScript Point)
            var REAL_A4_HEIGHT = 841.89;
            var IMAGE_WIDTH_PIX = 1250;
            var PDF_CONTENT_WIDTH_PIX = 585;
            var SHRINK_RATIO = PDF_CONTENT_WIDTH_PIX / IMAGE_WIDTH_PIX;

            var a4Height = 1250 / 585 * REAL_A4_HEIGHT;
            var canUseHeight = a4Height
                - headerNode.offsetHeight
                - lineItemHeaderNode.offsetHeight;

            var lineItemToImagePromiseList =  [];

            _.forEach(lineItemNodeList, function(lineItemNode) {
                // eslint-disable-next-line no-undef
                lineItemToImagePromiseList.push(domtoimage.toPng(lineItemNode, {
                    scale: 1,
                    width: contentWidth,
                    height: lineItemNode.offsetHeight + 1
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: lineItemNode.offsetWidth,
                        nodeHeight: lineItemNode.offsetHeight
                    };
                }));
            });

            // eslint-disable-next-line no-undef
            var PDF = new jsPDF('', 'pt', 'a4');

            var headerFooterPromiseList = [
                // eslint-disable-next-line no-undef
                domtoimage.toPng(headerNode, {
                    scale: 1,
                    width: 1250,
                    height: headerNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: headerNode.offsetWidth,
                        nodeHeight: headerNode.offsetHeight
                    };
                })
                    .catch((function(error) {
                        throw new Error(error);
                    })),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(lineItemHeaderNode, {
                    scale: 1,
                    width: 1250,
                    height: lineItemHeaderNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: lineItemHeaderNode.offsetWidth,
                        nodeHeight: lineItemHeaderNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(footerNode, {
                    scale: 1,
                    width: 1250,
                    height: footerNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: footerNode.offsetWidth,
                        nodeHeight: footerNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(outerNode, {
                    scale: 1,
                    width: 1250,
                    height: outerNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: outerNode.offsetWidth,
                        nodeHeight: outerNode.offsetHeight
                    };
                })
            ];

            $q.all(headerFooterPromiseList)
                .then(function(result) {
                    var offsetHeight = headerNode.offsetHeight;
                    var realHeight = 0;
                    var pageNumber = 1;
                    PDF.addImage(result[0].data, 'JPEG', 5, 0, 585, result[0].nodeHeight * SHRINK_RATIO);
                    PDF.addImage(
                        result[1].data, 'JPEG', 5, offsetHeight * SHRINK_RATIO, 585, result[1].nodeHeight * SHRINK_RATIO
                    );
                    $q.all(lineItemToImagePromiseList)
                        .then(function(lineItemResultList) {
                            _.forEach(lineItemResultList, function(lineItemResult) {
                                realHeight = realHeight + lineItemResult.nodeHeight;
                                if (realHeight <= canUseHeight) {
                                    PDF.addImage(lineItemResult.data, 'JPEG', 5,
                                        pageNumber > 1
                                            ? offsetHeight * SHRINK_RATIO
                                            : (offsetHeight + result[1].nodeHeight) * SHRINK_RATIO,
                                        585, lineItemResult.nodeHeight * SHRINK_RATIO);
                                    offsetHeight = offsetHeight + lineItemResult.nodeHeight;
                                } else {
                                    PDF.setFontSize(10);
                                    PDF.text(
                                        messageService.get('mmia.print_on_computer'),
                                        5,
                                        REAL_A4_HEIGHT - 10
                                    );
                                    PDF.text(
                                        pageNumber.toString(),
                                        585 / 2,
                                        REAL_A4_HEIGHT - 10
                                    );
                                    PDF.text(
                                        buildCurrentDateTime(),
                                        478,
                                        REAL_A4_HEIGHT - 10
                                    );

                                    pageNumber = pageNumber + 1;
                                    PDF.addPage();
                                    PDF.addImage(
                                        result[1].data,
                                        'JPEG',
                                        5,
                                        0,
                                        585,
                                        (result[1].nodeHeight) * SHRINK_RATIO
                                    );
                                    offsetHeight = result[1].nodeHeight;
                                    realHeight = 0;
                                }
                            });
                            if (canUseHeight - offsetHeight > result[2].nodeHeight + result[3].nodeHeight) {
                                PDF.setFontSize(10);
                                PDF.text(
                                    messageService.get('mmia.print_on_computer'),
                                    5,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.text(
                                    pageNumber.toString() + '-END',
                                    585 / 2 - 10,
                                    REAL_A4_HEIGHT - 10
                                );

                                PDF.text(
                                    buildCurrentDateTime(),
                                    478,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.addImage(
                                    result[2].data,
                                    'JPEG',
                                    5,
                                    pageNumber > 1
                                        ? (offsetHeight) * SHRINK_RATIO
                                        : (offsetHeight + result[1].nodeHeight) * SHRINK_RATIO,
                                    585,
                                    result[2].nodeHeight * SHRINK_RATIO
                                );
                                PDF.addImage(
                                    result[3].data,
                                    'JPEG',
                                    5,
                                    pageNumber > 1
                                        ? (offsetHeight + result[2].nodeHeight) * SHRINK_RATIO
                                        : (offsetHeight + result[1].nodeHeight + result[2].nodeHeight) * SHRINK_RATIO,
                                    585,
                                    result[3].nodeHeight * SHRINK_RATIO
                                );
                            } else {
                                PDF.setFontSize(10);
                                PDF.text(
                                    pageNumber.toString(),
                                    585 / 2,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.text(
                                    messageService.get('mmia.print_on_computer'),
                                    5,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.text(
                                    buildCurrentDateTime(),
                                    478,
                                    REAL_A4_HEIGHT - 10
                                );
                                pageNumber = pageNumber + 1;
                                PDF.addPage();
                                PDF.setFontSize(10);
                                PDF.text(
                                    pageNumber.toString() + '-END',
                                    585 / 2 - 10,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.text(
                                    messageService.get('mmia.print_on_computer'),
                                    5,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.text(
                                    buildCurrentDateTime(),
                                    478,
                                    REAL_A4_HEIGHT - 10
                                );
                                PDF.addImage(
                                    result[2].data,
                                    'JPEG',
                                    5,
                                    0,
                                    585,
                                    result[2].nodeHeight * SHRINK_RATIO
                                );
                                PDF.addImage(
                                    result[3].data,
                                    'JPEG',
                                    5,
                                    result[2].nodeHeight * SHRINK_RATIO,
                                    585,
                                    result[3].nodeHeight * SHRINK_RATIO
                                );
                            }
                            PDF.save('hello.pdf');
                        })
                        .catch(function(error) {
                            throw new Error(error);
                        });
                })
                .catch(function(error) {
                    throw new Error(error);
                })
                .finally(function() {
                    siglusDownloadLoadingModalService.close();
                });
        }

        function buildCurrentDateTime() {
            return moment().format('d MMM y h:mm:ss a');
        }
    }
})();
