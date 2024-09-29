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
     * @name requisition-view-tab.controller:ViewTabController
     *
     * @description
     * Responsible for managing product grid for non full supply products.
     */
    angular
        .module('requisition-view-tab')
        .controller('ViewTabController', ViewTabController);

    ViewTabController.$inject = [
        '$filter', 'selectProductsModalService', 'requisitionValidator', 'requisition', 'columns',
        'messageService', 'lineItems', 'alertService', 'canSubmit', 'canAuthorize', 'fullSupply',
        'TEMPLATE_COLUMNS', '$q', 'OpenlmisArrayDecorator', 'canApproveAndReject', 'items',
        '$stateParams', 'requisitionCacheService', 'canSubmitAndAuthorize', 'requisitionService',
        'loadingModalService', 'siglusArchivedProductService', 'program', '$scope',
        'notificationService', 'offlineService', 'canSync', '$state', 'alertConfirmModalService',
        '$window', 'hasAuthorizeRight'
    ];

    function ViewTabController(
        $filter, selectProductsModalService, requisitionValidator, requisition, columns,
        messageService, lineItems, alertService, canSubmit, canAuthorize, fullSupply,
        TEMPLATE_COLUMNS, $q, OpenlmisArrayDecorator, canApproveAndReject, items,
        $stateParams, requisitionCacheService, canSubmitAndAuthorize, requisitionService,
        loadingModalService, siglusArchivedProductService, program, $scope,
        notificationService, offlineService, canSync, $state, alertConfirmModalService,
        $window, hasAuthorizeRight
    ) {

        var vm = this;
        vm.$onInit = onInit;
        vm.deleteLineItem = deleteLineItem;
        vm.addFullSupplyProducts = addFullSupplyProducts;
        vm.addNonFullSupplyProducts = addNonFullSupplyProducts;
        vm.unskipFullSupplyProducts = unskipFullSupplyProducts;
        vm.showDeleteColumn = showDeleteColumn;
        vm.isLineItemValid = requisitionValidator.isLineItemValid;
        vm.getDescriptionForColumn = getDescriptionForColumn;
        vm.skippedFullSupplyProductCountMessage = skippedFullSupplyProductCountMessage;
        vm.cacheRequisition = cacheRequisition;
        // SIGLUS-REFACTOR: starts here
        vm.siglusAddProducts = siglusAddProducts;
        vm.showAddProducts = canSync;
        vm.showQuicklyFill = showQuicklyFill;
        vm.quicklyFillHandler = quicklyFillHandler;
        vm.isOffline = offlineService.isOffline;
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name lineItems
         * @type {Array}
         *
         * @description
         * Holds all requisition line items.
         */
        vm.lineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name items
         * @type {Array}
         *
         * @description
         * Holds all items that will be displayed.
         */
        vm.items = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name requisition
         * @type {Object}
         *
         * @description
         * Holds requisition. This object is shared with the parent and fullSupply states.
         */
        vm.requisition = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showAddFullSupplyProductsButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button for the full supply products for emergency
         * requisition.
         */
        vm.showAddFullSupplyProductsButton = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showAddNonFullSupplyProductsButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button for non-full supply products.
         */
        vm.showAddNonFullSupplyProductsButton = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showUnskipFullSupplyProductsButton
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button for un-skipping full supply products.
         */
        vm.showUnskipFullSupplyProductsButton = undefined;

        /**
         * @ngdoc property
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showAddFullSupplyProductControls
         * @type {Boolean}
         *
         * @description
         * Flag defining whether to show or hide the Add Product button based on the requisition
         * status and user rights and requisition template configuration.
         */
        vm.showAddFullSupplyProductControls = undefined;

        /**
         * @ngdoc property
         * @propertyOf requisition-view-tab.controller:ViewTabController
         * @name columns
         * @type {Array}
         *
         * @description
         * Holds the list of columns visible on this screen.
         */
        vm.columns = undefined;

        vm.keyword = $stateParams.keyword;
        vm.isExpiredEmergency = $stateParams.isExpiredEmergency || false;
        vm.search = function() {
            $stateParams.keyword = vm.keyword;
            if (vm.requisition.isInitForClient || vm.requisition.isCreateForClient) {
                refreshLineItems();
                return;
            }
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        };
        vm.cancelFilter = function() {
            if (vm.keyword) {
                vm.keyword = null;
                vm.search();
            }
        };

        function onInit() {
            vm.lineItems = lineItems;
            vm.items = items;
            vm.requisition = requisition;
            vm.columns = columns;
            vm.userCanEdit = vm.requisition.isInitForClient ||
                canAuthorize || canSubmit || (canApproveAndReject && !requisition.isExternalApproval);
            vm.showAddProducts = vm.requisition.isInitForClient || vm.requisition.isCreateForClient || canSync;
            vm.showAddFullSupplyProductsButton = showAddFullSupplyProductsButton();
            vm.showAddNonFullSupplyProductsButton = showAddNonFullSupplyProductsButton();
            vm.showUnskipFullSupplyProductsButton = showUnskipFullSupplyProductsButton();
            vm.showSkipControls = showSkipControls();
            vm.noProductsMessage = getNoProductsMessage();
            vm.canApproveAndReject = canApproveAndReject;
            vm.paginationId = fullSupply ? 'fullSupplyList' : 'nonFullSupplyList';
            // #375: create requisition with test consumption section
            vm.program = program;
            // #375: ends here
            // SIGLUS-REFACTOR: starts here
            populateDefaultValue();
            // SIGLUS-REFACTOR: ends here
            showDeleteModalForExpiredEmergency();
        }

        // SIGLUS-REFACTOR: starts here
        function populateDefaultValue() {
            if (vm.requisition.extraData.isSaved || vm.requisition.$modified) {
                return;
            }
            var programCode = _.get(vm.program, 'code');
            if (programCode !== 'VC' && programCode !== 'MMC') {
                return;
            }
            if (canSubmit && !vm.requisition.$isRejected()) {
                angular.forEach(vm.requisition.requisitionLineItems, function(lineItem) {
                    lineItem.requestedQuantity = lineItem.theoreticalQuantityToRequest;
                });
            }
            if (canAuthorize || canSubmitAndAuthorize) {
                angular.forEach(vm.requisition.requisitionLineItems, function(lineItem) {
                    lineItem.authorizedQuantity = lineItem.requestedQuantity;
                });
            }
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name deleteLineItem
         *
         * @description
         * Deletes the given line item, removing it from the grid and returning the product to the
         * list of approved products.
         *
         * @param {Object} lineItem the line item to be deleted
         */
        function deleteLineItem(lineItem) {
            try {
                if (_.get(lineItem, ['$program', 'fullSupply'])) {
                    lineItem.$program.fullSupply = false;
                }
                vm.requisition.deleteLineItem(lineItem);
                if (lineItem.id) {
                    requisitionService.deleteRequisitionLineItem(lineItem.id);
                }
                refreshLineItems();
            } catch (e) {
                notificationService.error(e || 'requisitionViewTab.removeProductFailed');
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name showDeleteColumn
         *
         * @description
         * Checks whether the delete column should be displayed. The column is visible only if any
         * of the line items is deletable.
         *
         * @return {Boolean} true if the delete column should be displayed, false otherwise
         */
        function showDeleteColumn() {
            if (vm.requisition.isInitForClient) {
                return true;
            }
            return vm.userCanEdit;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name cacheRequisition
         *
         * @description
         * Caches given requisition in the local storage.
         *
         * @return {Promise} the promise resolved after adding requisition to the local storage
         */
        function cacheRequisition() {
            requisitionCacheService.cacheRequisition(vm.requisition);
            // #546: "Back to preview" are affected by the pagination of requisition
            return $q.resolve({
                location: 'replace'
            });
            // #546: ends here
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name getDescriptionForColumn
         *
         * @description
         * Returns a translated description for the given column.
         *
         * @param  {RequisitionColumn} column  the column of the requisition template
         * @return {string}                    the translated description of the column
         */
        function getDescriptionForColumn(column) {
            return column.definition;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name addFullSupplyProducts
         *
         * @description
         * Opens modal that lets the user add new full supply products to the grid. If there are no products to be added
         * an alert will be shown.
         */
        function addFullSupplyProducts() {
            addProducts(vm.requisition.getAvailableFullSupplyProducts());
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name addNonFullSupplyProducts
         *
         * @description
         * Opens modal that lets the user add new non-full supply products to the grid. If there are no products to be
         * added an alert will be shown.
         */
        function addNonFullSupplyProducts() {
            addProducts(vm.requisition.getAvailableNonFullSupplyProducts());
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name unskipFullSupplyProducts
         *
         * @description
         * Opens modal that lets the user unskip full supply products and add them back to the grid.. If there are no
         * products to be added an alert will be shown.
         */
        function unskipFullSupplyProducts() {
            selectProducts({
                products: vm.requisition.getSkippedFullSupplyProducts()
            })
                .then(function(selectedProducts) {
                    vm.requisition.unskipFullSupplyProducts(selectedProducts);
                    refreshLineItems();
                });
        }

        // #352: can add skipped products
        function siglusAddProducts() {
            var products = vm.requisition.getAvailableFullSupplyProducts();

            if (vm.showSkipControls && vm.requisition.template.hideSkippedLineItems()) {
                products = products.concat(vm.requisition.getSkippedProducts());
            }
            addProducts(products);
        }
        // #352: ends here

        /**
         * @ngdoc method
         * @methodOf requisition-view-tab.controller:ViewTabController
         * @name skippedFullSupplyProductCountMessage
         *
         * @description
         * Returns a translated message that contains the number of line items that were skipped
         * from full supply requisition.
         */
        function skippedFullSupplyProductCountMessage() {
            return  messageService.get('requisitionViewTab.fullSupplyProductsSkipped', {
                skippedProductCount: getCountOfSkippedFullSupplyProducts()
            });
        }

        function addProducts(availableProducts) {
            var addedOrderableIds;

            selectProducts({
                products: availableProducts
            })
            // SIGLUS-REFACTOR: starts here
                .then(function(selectedProducts) {
                    addedOrderableIds = selectedProducts.map(function(orderable) {
                        return orderable.id;
                    });
                    var skippedProducts = selectedProducts.filter(function(orderable) {
                        return orderable.skipped;
                    });
                    var availableProducts = selectedProducts.filter(function(orderable) {
                        return !orderable.skipped;
                    });
                    return $q.all([
                        vm.requisition.unskipFullSupplyProducts(skippedProducts),
                        prepareLineItems(availableProducts)
                    ]);
                })
                .then(function() {
                    return refreshLineItems();
                })
                .then(function() {
                    var addedLineItems = vm.lineItems.filter(function(lineItem) {
                        return addedOrderableIds.includes(lineItem.orderable.id);
                    });
                    siglusArchivedProductService.alterInfo(addedLineItems);
                });
            // SIGLUS-REFACTOR: ends here
        }

        // SIGLUS-REFACTOR: starts here
        function prepareLineItems(selectedProducts) {
            if (vm.requisition.isInitForClient) {
                var columns = vm.columns.filter(function(column) {
                    return !column.name.includes('orderable');
                });
                selectedProducts.forEach(function(product) {
                    var approvedProduct = requisition.availableFullSupplyProducts.find(function(item) {
                        return item.id === product.id;
                    });
                    product.versionNumber = _.get(product, ['meta', 'versionNumber']);
                    var addedProduct = {
                        orderable: product,
                        approvedProduct: approvedProduct
                    };
                    var lineItem = vm.requisition.addProductLineItem(addedProduct);
                    lineItem.$program.fullSupply = false;
                    columns.forEach(function(column) {
                        lineItem[column.name] = undefined;
                    });
                });
                return;
            }
            var ids = selectedProducts.map(function(product) {
                return product.id;
            });
            loadingModalService.open();
            return requisitionService.getOrderableLineItem(vm.requisition.id, ids)
                .then(function(results) {
                    results.forEach(function(result) {
                        var lineItem = result.lineItem;
                        lineItem.orderable = _.find(selectedProducts, function(product) {
                            return lineItem.orderable.id === product.id;
                        });
                        lineItem.approvedProduct = result.approvedProduct;
                        lineItem.$deletable = true;
                        vm.requisition.addProductLineItem(lineItem);
                    });
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }
        // SIGLUS-REFACTOR: ends here

        function selectProducts(availableProducts) {
            refreshLineItems();

            var decoratedAvailableProducts = new OpenlmisArrayDecorator(availableProducts.products);
            decoratedAvailableProducts.sortBy('fullProductName');

            if (!availableProducts.products.length) {
                alertService.error(
                    'requisitionViewTab.noProductsToAdd.label',
                    'requisitionViewTab.noProductsToAdd.message'
                );
                return $q.reject();
            }
            // #352: can add skipped products
            if (vm.requisition.emergency) {
                var displayLineItemCount = vm.requisition.requisitionLineItems.filter(function(lineItem) {
                    return !lineItem.skipped;
                }).length;
            }
            // #352: ends here

            // SIGLUS-REFACTOR: starts here
            return selectProductsModalService.show({
                products: decoratedAvailableProducts,
                limit: vm.requisition.emergency ? {
                    max: 10 - displayLineItemCount,
                    errorMsg: 'requisitionViewTab.selectTooMany'
                } : undefined
            });
            // SIGLUS-REFACTOR: ends here
        }

        function refreshLineItems() {
            if (vm.requisition.isInitForClient || vm.requisition.isCreateForClient) {
                vm.lineItems = filterAddedProducts();
                return;
            }
            var filterObject = (fullSupply &&
                vm.requisition.template.hasSkipColumn() &&
                vm.requisition.template.hideSkippedLineItems()) ?
                {
                    skipped: '!true',
                    $program: {
                        fullSupply: fullSupply
                    }
                } : {
                    $program: {
                        fullSupply: fullSupply
                    }
                };

            var lineItems = $filter('filter')(vm.requisition.requisitionLineItems, filterObject);

            vm.lineItems = $filter('orderBy')(lineItems, [
                // eslint-disable-next-line max-len
                // SIGLUS-REFACTOR: starts here :after add product or change page number, the product order will restore by this filter
                //, just order by the display the order will not change when page number change
                '$program.orderableCategoryDisplayOrder',
                '$program.orderableCategoryDisplayName',
                '$program.displayOrder',
                'orderable.fullProductName'
                // SIGLUS-REFACTOR: ends here
            ]);
        }

        // #286 high level approver can skip some products in requisition
        function showSkipControls() {
            return requisition.template.hasSkipColumn()
                && requisition.template.getColumn(TEMPLATE_COLUMNS.SKIPPED).$display
                && canApproveAndReject && requisition.isExternalApproval;
        }
        // #286 ends here

        // #340: quickly fill the tables in R&R during creating an R&R
        function showQuicklyFill() {
            return vm.requisition.template.extension.enableQuicklyFill
                && (canSubmit || canAuthorize);
        }

        function quicklyFillHandler() {
            $scope.$broadcast('siglus-quickly-fill');
            notificationService.success('requisitionViewTab.quicklyFill.success');
        }
        // #340: ends here

        function showAddFullSupplyProductsButton() {
            return vm.userCanEdit && fullSupply && requisition.emergency;
        }

        function showAddNonFullSupplyProductsButton() {
            return vm.userCanEdit && !fullSupply;
        }

        function showUnskipFullSupplyProductsButton() {
            return vm.userCanEdit &&
                fullSupply &&
                !requisition.emergency &&
                requisition.template.hideSkippedLineItems();
        }

        function hasDeletableLineItems() {
            var hasDeletableLineItems = false;

            vm.requisition.requisitionLineItems.forEach(function(lineItem) {
                hasDeletableLineItems = hasDeletableLineItems || lineItem.$deletable;
            });

            return hasDeletableLineItems;
        }

        function isSkippedFullSupply(item) {
            return (item.skipped === true && item.$program.fullSupply === true);
        }

        function getCountOfSkippedFullSupplyProducts() {
            return vm.requisition.requisitionLineItems.filter(isSkippedFullSupply).length;
        }

        function getNoProductsMessage() {
            return fullSupply ?
                'requisitionViewTab.noFullSupplyProducts' :
                'requisitionViewTab.noNonFullSupplyProducts';
        }

        function filterAddedProducts() {
            if (vm.keyword) {
                var searchText = vm.keyword.toLowerCase();
                return vm.requisition.requisitionLineItems.filter(function(product) {
                    return String(product.orderable.productCode.toLowerCase()).includes(searchText)
                        || String(product.orderable.fullProductName.toLowerCase()).includes(searchText);
                });
            }
            return vm.requisition.requisitionLineItems;
        }

        function showDeleteModalForExpiredEmergency() {
            // only P1 shows the delete modal
            if (vm.isExpiredEmergency && !hasAuthorizeRight) {
                alertConfirmModalService.error(
                    'requisitionViewTab.expiredEmergency.title',
                    'requisitionViewTab.expiredEmergency.message',
                    ['', 'requisitionView.delete.label']
                )
                    .then(function() {
                        loadingModalService.open();
                        vm.requisition.$remove().then(function() {
                            goBack();
                            notificationService.success('requisitionView.delete.success');
                        }, loadingModalService.close);
                    });
            }
        }

        function goBack() {
            var prevPage = $window.location.href;
            $window.history.back();
            $window.onpopstate = function() {
                if ($window.location.href === prevPage) {
                    $state.go('openlmis.home');
                }
                $window.onpopstate = null;
            };
        }
    }

})();
