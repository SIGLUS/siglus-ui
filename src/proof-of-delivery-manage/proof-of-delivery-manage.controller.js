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
        'messageService', 'SIGLUS_TIME', 'siglusDownloadLoadingModalService', 'facility',
        'orderablesPrice', 'moment', 'SiglusIssueOrReceiveReportService'
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
        siglusDownloadLoadingModalService,
        facility,
        orderablesPrice,
        moment,
        SiglusIssueOrReceiveReportService
    ) {

        var vm = this;
        var ReportService = new SiglusIssueOrReceiveReportService();
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
            vm.programs = _.filter(programs, function(program) {
                return program.code !== 'ML';
            });
            vm.requestingFacilities = requestingFacilities;
            vm.supplyingFacilities = supplyingFacilities;
            vm.program = getSelectedObjectById(programs, $stateParams.programId);
            vm.requestingFacility = getSelectedObjectById(requestingFacilities, $stateParams.requestingFacilityId);
            vm.supplyingFacility = getSelectedObjectById(supplyingFacilities, $stateParams.supplyingFacilityId);
            vm.facilityName = getName(vm.requestingFacility);
            vm.programName = getName(vm.program);
            vm.facility = facility;
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
            stateParams.page = 0;

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

        vm.getErrorMsg = function() {
            return 'proofOfDeliveryManage.invalidForm';
        };

        vm.getReason = function(reasonId) {
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
            if (_.get(order, ['facility', 'id']) !== _.get(facility, 'id')) {
                return proofOfDeliveryManageService.getByOrderId(order.id).then(function(pod) {
                    $state.go('openlmis.orders.podManage.view', {
                        orderId: order.id,
                        podId: pod.id,
                        actionType: 'VIEW'
                    });
                });
            }
            if (order.status  === 'RECEIVED') {
                proofOfDeliveryManageService.getByOrderId(order.id).then(function(pod) {
                    if (facility.enableLocationManagement) {
                        $state.go('openlmis.orders.podManage.viewWithLocation', {
                            orderId: order.id,
                            podId: pod.id,
                            actionType: 'VIEW'
                        });
                    } else {
                        $state.go('openlmis.orders.podManage.view', {
                            orderId: order.id,
                            podId: pod.id,
                            actionType: 'VIEW'
                        });
                    }
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
         * @param  {Object} order the UUID of order to find it's POD
         * @return {String}         the prepared URL
         */
        function printProofOfDelivery(order) {
            var orderId = order.id;
            vm.orderCode = order.orderCode;
            siglusDownloadLoadingModalService.open();
            stockReasonsFactory.getReasons(order.program.id, order.facility.type.id)
                .then(function(reasons) {
                    vm.reasons = reasons;
                    proofOfDeliveryManageService.getByOrderId(orderId)
                        .then(function(pod) {
                            proofOfDeliveryManageService.getPodInfo(pod.id, orderId).then(function(podInfo) {
                                proofOfDeliveryService.get(pod.id).then(function(result) {
                                    fulfillingLineItemFactory.groupByOrderableForPod(
                                        result.lineItems, result.shipment.order.orderLineItems
                                    )
                                        .then(function(orderLineItems) {
                                            var momentNow = moment();
                                            var numberAndFileName = generateNumberAndFileName(order, podInfo);
                                            var lineItemsInPDF = buildLineItemsForPDF(orderLineItems);

                                            setPDFInfo(
                                                numberAndFileName,
                                                lineItemsInPDF,
                                                podInfo,
                                                order,
                                                momentNow
                                            );

                                            ReportService.downloadPdf(numberAndFileName.fileName, undefined, true);
                                            siglusDownloadLoadingModalService.close();
                                        });
                                });
                            });
                        })
                        .catch(function() {
                            notificationService.error('proofOfDeliveryManage.noOrderFound');
                            siglusDownloadLoadingModalService.close();
                        });
                });
        }

        function setPDFInfo(numberAndFileName, lineItemsInPDF, podInfo, order, momentNow) {
            // for receive PDF
            vm.reportPDFInfo = {
                type: ReportService.REPORT_TYPE.POD,
                addedLineItems: lineItemsInPDF,
                documentNumber: numberAndFileName.documentNumber,
                issueVoucherNumber: numberAndFileName.issueVoucherNumber,
                supplier: podInfo.supplier,
                supplierDistrict: podInfo.supplierDistrict,
                supplierProvince: podInfo.supplierProvince,
                client: podInfo.client,
                requisitionNumber: podInfo.requisitionNum,
                requisitionDate: moment(podInfo.requisitionDate, 'YYYY-MM-dd'),
                issueVoucherDate: moment(order.occurredDate).format('YYYY-MM-DD'),
                numberN: numberAndFileName.podNumber,
                receptionDate: podInfo.receivedDate,
                totalPriceValue: _.reduce(lineItemsInPDF, function(acc, lineItem) {
                    var price = lineItem.price ? lineItem.price : 0;
                    return acc + lineItem.quantityShipped * price;
                }, 0),
                preparedBy: podInfo.preparedBy,
                conferredBy: podInfo.conferredBy,
                receivedBy: podInfo.receivedBy,
                nowTime: momentNow.format('D MMM YYYY h:mm:ss A'),
                isSupply: true
            };

            // for pod Inconsistency PDF
            vm.podInconsistencyInfo = {
                province: vm.facility.geographicZone.parent.name,
                district: vm.facility.geographicZone.name,
                client: podInfo.client,
                inconsistentItems: _.filter(lineItemsInPDF, function(item) {
                    return item.rejectionReasonId;
                }),
                deliveredBy: podInfo.deliveredBy,
                receivedDate: podInfo.receivedDate,
                nowTime: momentNow.format('D MMM YYYY h:mm:ss A')
            };
        }

        function buildLineItemsForPDF(orderLineItems) {
            var addedLineItems = [];
            _.each(orderLineItems, function(orderLineItem) {
                _.each(orderLineItem.groupedLineItems, function(groupedLineItem) {
                    _.each(groupedLineItem, function(fulfillingLineItem) {
                        addedLineItems.push(angular.merge({
                            orderedQuantity: orderLineItem.orderedQuantity,
                            partialFulfilledQuantity: orderLineItem.partialFulfilledQuantity
                        }, fulfillingLineItem));
                    });
                });
            });
            return _.reduce(addedLineItems, function(finalLineItemList, lineItem) {
                finalLineItemList.push(
                    _.assign({}, lineItem, {
                        productCode: lineItem.orderable.productCode,
                        productName: lineItem.orderable.fullProductName,
                        price: orderablesPrice.data[lineItem.orderable.id] || '',
                        lotCode: lineItem.lot ? lineItem.lot.lotCode : '',
                        expirationDate: lineItem.lot ? lineItem.lot.expirationDate : ''
                    })
                );
                return finalLineItemList;
            }, []);
        }

        function generateNumberAndFileName(order, podInfo) {
            var fileName = '';
            var documentNumber = '';
            var podNumber = '';

            if (order.orderCode.indexOf('ORDEM') > -1) {
                if (order.status === 'SHIPPED') {
                    fileName = podInfo.fileName.replace(/^OF/, 'GR');
                    documentNumber = order.orderCode;
                } else if (order.status === 'RECEIVED') {
                    fileName = podInfo.fileName.replace(/^OF/, 'RR');
                    documentNumber = order.orderCode;
                    podNumber = order.orderCode;
                }
            } else {
                if (order.status === 'SHIPPED') {
                    fileName =  order.orderCode.replace(/^OF/, 'GR').replaceAll('/', '_');
                    documentNumber = order.orderCode.replace(/^OF/, 'GR');
                }

                if (order.status === 'RECEIVED') {
                    fileName =  order.orderCode.replace(/^OF/, 'RR').replaceAll('/', '_');
                    documentNumber = order.orderCode.replace(/^OF/, 'GR');
                    podNumber = order.orderCode.replace(/^OF/, 'RR');
                }
            }
            return {
                fileName: fileName,
                documentNumber: documentNumber,
                podNumber: podNumber,
                issueVoucherNumber: order.issueVoucherNumber ? order.issueVoucherNumber : undefined
            };
        }

        function getStatusText(order) {
            if (_.get(order, ['facility', 'id']) !== facility.id) {
                return messageService.get('proofOfDeliveryManage.view');
            }
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
