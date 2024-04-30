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
        .controller('PhysicalInventoryHistoryPrintController', controller);

    controller.$inject = [
        'historyData', 'moment', 'SiglusPhysicalInventoryHistoryDetailService', 'siglusDownloadLoadingModalService',
        'messageService', '$q'
    ];

    function controller(
        historyData, moment, SiglusPhysicalInventoryHistoryDetailService, siglusDownloadLoadingModalService,
        messageService, $q
    ) {
        var vm = this;

        vm.historyData = historyData;
        vm.service = SiglusPhysicalInventoryHistoryDetailService;
        vm.creationDate = buildDetailDate();

        vm.$onInit = onInit;
        vm.downloadPdf = downloadPdf;

        function onInit() {
            hideBreadcrumb();
        }

        function hideBreadcrumb() {
            document.querySelector('openlmis-breadcrumbs').style.display = 'none';
        }

        function buildDetailDate() {
            var creationDate = moment(historyData.creationDate);
            return {
                year: creationDate.year(),
                monthFullName: creationDate.format('MMMM'),
                dateInShort: creationDate.format('DD MMM YYYY')
            };
        }

        function downloadPdf() {
            siglusDownloadLoadingModalService.open();
            var node = document.getElementById('print-form');
            var headerNode = document.getElementById('header-section');
            var lineItemHeaderNode = document.getElementById('lineItem-header');
            var footerNode = document.getElementById('footer');
            var outerNode = document.getElementById('outer');

            var contentWidth = node.offsetWidth;
            // A4: 595.28 x 841.89 (PostScript Point)
            var A4_HEIGHT = 841.89;
            // 585 = image width in pdf (pix) = pdf content width
            // 1250 = image width (pix)
            var a4Height = 1250 / 585 * A4_HEIGHT;
            var rate = 585 / 1250;
            var canUseHeight = a4Height
                - headerNode.offsetHeight
                - lineItemHeaderNode.offsetHeight;
            var needCalcNodes = document.querySelectorAll('#calcTr');
            var needCalcNodesArray = Array.from(needCalcNodes);

            var lineItemToImagePromiseList =  [];

            _.forEach(needCalcNodesArray, function(lineItemNode) {
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
                    PDF.addImage(result[0].data, 'JPEG', 5, 0, 585, result[0].nodeHeight * rate);
                    PDF.addImage(result[1].data, 'JPEG', 5, offsetHeight * rate, 585, result[1].nodeHeight * rate);
                    $q.all(lineItemToImagePromiseList)
                        .then(function(lineItemResultList) {
                            _.forEach(lineItemResultList, function(lineItemResult) {
                                realHeight = realHeight + lineItemResult.nodeHeight;
                                if (realHeight <= canUseHeight) {
                                    PDF.addImage(lineItemResult.data, 'JPEG', 5,
                                        pageNumber > 1
                                            ? offsetHeight * rate
                                            : (offsetHeight + result[1].nodeHeight) * rate,
                                        585, lineItemResult.nodeHeight * rate);
                                    offsetHeight = offsetHeight + lineItemResult.nodeHeight;
                                } else {
                                    PDF.setFontSize(10);
                                    PDF.text(
                                        messageService.get('mmia.print_on_computer'),
                                        5,
                                        A4_HEIGHT - 10
                                    );
                                    PDF.text(
                                        pageNumber.toString(),
                                        585 / 2,
                                        A4_HEIGHT - 10
                                    );
                                    PDF.text(
                                        moment().format('d MMM y h:mm:ss a'),
                                        478,
                                        A4_HEIGHT - 10
                                    );

                                    pageNumber = pageNumber + 1;
                                    PDF.addPage();
                                    PDF.addImage(
                                        result[1].data,
                                        'JPEG',
                                        5,
                                        0,
                                        585,
                                        (result[1].nodeHeight) * rate
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
                                    A4_HEIGHT - 10
                                );
                                PDF.text(
                                    pageNumber.toString() + '-END',
                                    585 / 2 - 10,
                                    A4_HEIGHT - 10
                                );

                                PDF.text(
                                    moment().format('d MMM y h:mm:ss a'),
                                    478,
                                    A4_HEIGHT - 10
                                );
                                PDF.addImage(
                                    result[2].data,
                                    'JPEG',
                                    5,
                                    pageNumber > 1
                                        ? (offsetHeight) * rate
                                        : (offsetHeight + result[1].nodeHeight) * rate,
                                    585,
                                    result[2].nodeHeight * rate
                                );
                                PDF.addImage(
                                    result[3].data,
                                    'JPEG',
                                    5,
                                    pageNumber > 1
                                        ? (offsetHeight + result[2].nodeHeight) * rate
                                        : (offsetHeight + result[1].nodeHeight + result[2].nodeHeight) * rate,
                                    585,
                                    result[3].nodeHeight * rate
                                );
                            } else {
                                PDF.setFontSize(10);
                                PDF.text(
                                    pageNumber.toString(),
                                    585 / 2,
                                    A4_HEIGHT - 10
                                );
                                PDF.text(
                                    messageService.get('mmia.print_on_computer'),
                                    5,
                                    A4_HEIGHT - 10
                                );
                                PDF.text(
                                    vm.nowTime,
                                    478,
                                    A4_HEIGHT - 10
                                );
                                pageNumber = pageNumber + 1;
                                PDF.addPage();
                                PDF.setFontSize(10);
                                PDF.text(
                                    pageNumber.toString() + '-END',
                                    585 / 2 - 10,
                                    A4_HEIGHT - 10
                                );
                                PDF.text(
                                    messageService.get('mmia.print_on_computer'),
                                    5,
                                    A4_HEIGHT - 10
                                );
                                PDF.text(
                                    vm.nowTime,
                                    478,
                                    A4_HEIGHT - 10
                                );
                                PDF.addImage(
                                    result[2].data,
                                    'JPEG',
                                    5,
                                    0,
                                    585,
                                    result[2].nodeHeight * rate
                                );
                                PDF.addImage(
                                    result[3].data,
                                    'JPEG',
                                    5,
                                    result[2].nodeHeight * rate,
                                    585,
                                    result[3].nodeHeight * rate
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
    }
})();
