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
        .module('shipment-view')
        .config(config);

    config.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS', 'selectProductsModalStateProvider'];

    // #264: warehouse clerk can add product to orders
    function config($stateProvider, FULFILLMENT_RIGHTS, selectProductsModalStateProvider) {
        selectProductsModalStateProvider.stateWithAddOrderablesChildState('openlmis.orders.shipmentView', {
            // #264: ends here
            controller: 'ShipmentViewController',
            controllerAs: 'vm',
            label: 'shipmentView.viewShipment',
            showInNavigation: false,
            templateUrl: 'shipment-view/shipment-view.html',
            url: '/:id/shipment',
            accessRights: [
                FULFILLMENT_RIGHTS.SHIPMENTS_VIEW,
                FULFILLMENT_RIGHTS.ORDERS_VIEW
            ],
            areAllRightsRequired: false,
            resolve: {
                order: function(orderRepository, $stateParams) {
                    return orderRepository.get($stateParams.id);
                },
                stockCardSummaries: function(StockCardSummaryRepositoryImpl, order) {
                    var orderableIds = order.orderLineItems.map(function(lineItem) {
                        return lineItem.orderable.id;
                    });

                    return new StockCardSummaryRepositoryImpl().queryWithStockCards({
                        programId: order.program.id,
                        facilityId: order.supplyingFacility.id,
                        orderableId: orderableIds
                    })
                        .then(function(page) {
                            return page.content;
                        });
                },
                shipment: function(shipmentViewService, order) {
                    return shipmentViewService.getShipmentForOrder(order);
                },
                tableLineItems: function(ShipmentViewLineItemFactory, shipment, stockCardSummaries) {
                    return new ShipmentViewLineItemFactory().createFrom(shipment, stockCardSummaries);
                },
                updatedOrder: function(shipment) {
                    return shipment.order;
                }
            }
        });
    }
})();
