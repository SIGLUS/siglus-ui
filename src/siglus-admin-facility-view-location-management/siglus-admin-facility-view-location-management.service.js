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
   * @name siglus-admin-facility-view-location-management.locationManagementService
   *
   * @description
   * Responsible for retrieving Ideal Stock Amounts from the server.
   */
    angular
        .module('siglus-admin-facility-view-location-management')
        .factory('locationManagementService', service);

    service.$inject = ['$resource', 'referencedataUrlFactory'];

    function service($resource, referencedataUrlFactory) {

        var resource = $resource(
            referencedataUrlFactory('/api/siglusapi/facilities/:id/locations'),
            {},
            {
                upload: {
                    url: referencedataUrlFactory(
                        '/api/siglusapi/facilities/:id/locations?format=csv'
                    ),
                    method: 'POST',
                    headers:
                {
                    'Content-Type': undefined
                }
                },

                update: {
                    url: referencedataUrlFactory(
                        '/api/siglusapi/facilities/:id'
                    ),
                    method: 'PUT'
                }
            }
        );

        return {
            getDownloadUrl: getDownloadUrl,
            upload: upload,
            update: update
        };

        /**
     * @ngdoc method
     * @methodOf siglus-admin-facility-view-location-management.locationManagementService
     * @name getDownloadUrl
     *
     * @description
     * Returns URL for downloading Ideal Stock Amounts in csv format file.
     * @param  {id}  UUID of facility
     * @return {String} the URL for downloading Ideal Stock Amounts
     */

        function getDownloadUrl(id) {
            return referencedataUrlFactory(
                '/api/siglusapi/facilities/' + id + '/locations?format=csv'
            );
        }

        /**
     * @ngdoc method
     * @methodOf siglus-admin-facility-view-location-management.locationManagementService
     * @name upload
     *
     * @description
     * Uploads ISA records in csv file.
     *
     * @param  {Object}  file the csv file that will be uploaded
     * @return {Promise}      the number of uploaded items
     */
        function upload(file, id) {
            var formData = new FormData();
            formData.append('file', file);

            return resource
                .upload({
                    id: id
                }, formData)
                .$promise;
        }

        /**
     * @ngdoc method
     * @methodOf siglus-admin-facility-view-location-management.locationManagementService
     * @name update
     *
     * @description
     * Uploads ISA records in csv file.
     *
     * @param  {Object}  file the csv file that will be uploaded
     * @return {Promise}      the number of uploaded items
     */
        function update(id, facility, tb) {
            return resource.update({
                id: id
            },
            angular.merge(facility, {
                tb: tb
            }))
                .$promise;
        }
    }
})();
