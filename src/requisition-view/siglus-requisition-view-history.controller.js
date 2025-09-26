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
     * @name requisition-view-tab.controller:SiglusHistoryViewTabController
     *
     * @description
     * Responsible for managing product grid for non full supply products.
     */
    angular
        .module('requisition-view-tab')
        .controller('SiglusHistoryViewTabController', Controller);

    Controller.$inject = ['requisition', 'columns', 'lineItems', 'program', 'processingPeriod', 'facility',
        'requisitionUrlFactory', '$window', 'accessTokenFactory', 'TEMPLATE_COLUMNS', 'messageService', '$q',
        'loadingModalService', 'requisitionViewService'];

    function Controller(requisition, columns, lineItems, program, processingPeriod, facility, requisitionUrlFactory,
                        $window, accessTokenFactory, TEMPLATE_COLUMNS, messageService, $q,
                        loadingModalService, requisitionViewService) {
        var vm = this;
        vm.program = undefined;
        vm.processingPeriod = undefined;
        vm.facility = undefined;
        vm.$onInit = onInit;
        vm.print = print;
        vm.replaceLocation = function() {
            return $q.resolve({
                location: 'replace'
            });
        };

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:SiglusHistoryViewTabController
         * @name lineItems
         * @type {Array}
         *
         * @description
         * Holds all requisition line items.
         */
        vm.lineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:SiglusHistoryViewTabController
         * @name items
         * @type {Array}
         *
         * @description
         * Holds all items that will be displayed.
         */
        vm.items = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:SiglusHistoryViewTabController
         * @name requisition
         * @type {Object}
         *
         * @description
         * Holds requisition. This object is shared with the parent and fullSupply states.
         */
        vm.requisition = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:SiglusHistoryViewTabController
         * @name columns
         * @type {Array}
         *
         * @description
         * Holds the list of columns visible on this screen.
         */
        vm.columns = undefined;

        vm.getDescriptionForColumn = getDescriptionForColumn;

        vm.displayExportButton = undefined;
        vm.exportExcel = exportExcel;
        vm.isPrintAsReport = false;

        function onInit() {
            vm.program = program;
            vm.processingPeriod = processingPeriod;
            vm.facility = facility;
            vm.lineItems = lineItems;
            vm.requisition = requisition;
            vm.columns = columns;
            vm.displayExportButton = requisitionViewService.canExportExcel(requisition.status, program.code);
            hideApprovedQuantity(vm.requisition);
            hidePacksToShip(vm.requisition);
            setTypeAndClass();
            setIsPrintAsReport();
        }

        function hideApprovedQuantity(requisition) {
            if (vm.requisition.$isAuthorized() &&
                requisition.template.columnsMap[TEMPLATE_COLUMNS.APPROVED_QUANTITY].isDisplayed) {
                angular.forEach(requisition.requisitionLineItems, function(lineItem) {
                    lineItem.approvedQuantity = undefined;
                });
            }
        }

        function hidePacksToShip(requisition) {
            if (!shouldDispalyPacksToship(requisition)) {
                angular.forEach(requisition.requisitionLineItems, function(lineItem) {
                    lineItem.packsToShip = undefined;
                });
            }
        }

        function shouldDispalyPacksToship(requisition) {
            var packsToship = requisition.template.columnsMap[TEMPLATE_COLUMNS.PACKS_TO_SHIP];
            if (packsToship.isDisplayed && typeof packsToship.option !== 'undefined') {
                return (packsToship.option.optionName === 'showPackToShipInApprovalPage' &&
                    requisition.$isAfterApprove() && !requisition.isApprovedByInternal) ||
                    packsToship.option.optionName === 'showPackToShipInAllPages';
            }
        }

        function setTypeAndClass() {
            if (vm.requisition.emergency) {
                vm.requisitionType = 'requisitionView.emergency';
                vm.requisitionTypeClass = 'emergency';
            } else if (vm.requisition.reportOnly) {
                vm.requisitionType = 'requisitionView.reportOnly';
                vm.requisitionTypeClass = 'report-only';
            } else {
                vm.requisitionType = 'requisitionView.regular';
                vm.requisitionTypeClass = 'regular';
            }
        }

        function exportExcel() {
            loadingModalService.open();
            requisitionViewService.exportExcel(vm.requisition.id).$promise.finally(
                loadingModalService.close
            );
        }

        function setIsPrintAsReport() {
            var status = vm.requisition.status;
            if (
                status === 'APPROVED' ||
                status === 'IN_APPROVAL' ||
                status === 'RELEASED' ||
                status === 'RELEASED_WITHOUT_ORDER'
            ) {
                vm.isPrintAsReport = true;
            }
        }

        function print() {
            if (vm.isPrintAsReport) {
                var printUrl = '#!/requisitions/'
                    + 'Balance%20Requisition'
                    + '/'
                    + vm.requisition.id
                    + '?showBreadCrumb=false';
                $window.open(accessTokenFactory.addAccessToken(printUrl), '_blank');
            } else {
                var url = requisitionUrlFactory('/api/siglusapi/requisitions/' + vm.requisition.id + '/print');
                $window.open(accessTokenFactory.addAccessToken(url), '_blank');
            }
        }

        function getDescriptionForColumn(column) {
            if (requisition.template.populateStockOnHandFromStockCards &&
                column.name === TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS) {
                return column.definition + ' ' +
                    messageService.get('requisitionViewTab.totalLossesAndAdjustment.disabled');
            }
            return column.definition;
        }

    }

})();
