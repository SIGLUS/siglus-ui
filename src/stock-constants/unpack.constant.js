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
     * @ngdoc object
     * @name stock-constants.UNPACK
     *
     * @description
     * This is constant for UNPACK work flow.
     */
    angular
        .module('stock-constants')
        .constant('UNPACK', status());

    function status() {
        var constants = {
            UNPACK_KIT_DESTINATION_NODE_ID: '13a2acda-0803-11ed-b2ba-acde48001122',
            UNPACK_FROM_KIT_SOURCE_NODE_ID: '13a2b518-0803-11ed-b2ba-acde48001122',
            ISSUE_REASON_NAME: 'Issue',
            ISSUE_REASON_TYPE: 'DEBIT',
            RECEIVE_REASON_NAME: 'Receive',
            RECEIVE_REASON_TYPE: 'CREDIT'
        };
        return constants;
    }
})();