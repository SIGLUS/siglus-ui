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
     * @ngdoc service
     * @name siglus-stock-archived-product.siglusArchivedProductService
     *
     * @description
     * Some method of archived product.
     */
    angular
        .module('siglus-stock-archived-product')
        .service('siglusArchivedProductService', service);

    service.$inject = ['alertService', '$resource', 'openlmisUrlFactory'];

    function service(alertService, $resource, openlmisUrlFactory) {
        var resource = $resource(
            openlmisUrlFactory('/api/siglusapi/archivedproducts'), {}, {
                get: {
                    method: 'GET',
                    isArray: true
                }
            }
        );

        return {
            alterInfo: alterInfo,
            getArchivedOrderables: getArchivedOrderables
        };

        function alterInfo(lineItems) {
            var isArchived = lineItems.find(function(lineItem) {
                return lineItem.orderable.archived;
            });

            if (isArchived) {
                alertService.info({
                    title: 'archivedProduct.title',
                    message: 'archivedProduct.message',
                    buttonLabel: 'archivedProduct.close'
                });
            }
        }

        function getArchivedOrderables(facilityId) {
            return resource.get({
                facilityId: facilityId
            }).$promise;
        }
    }
})();
