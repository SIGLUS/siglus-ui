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
     * @name requisition-constants.SIGLUS_TEMPLATE_COLUMNS_ORDER
     *
     * @description
     * This is constant for siglus requisition columns order.
     */
    angular
        .module('siglus-analytics-report-customize-rapid')
        .constant('SIGLUS_ANALYTICS_REPORT_CUSTOMIZE_RAPID_CONSTANT', getConstant());

    function getConstant() {
        return {
            REPUBLIC_OF_MOZAMBIQUE: 'REPUBLIC OF MOZAMBIQUE',
            MINISTRY_OF_HEALTH: 'MINISTRY OF HEALTH',
            CENTRAL_MEDICINES_AND_MEDICAL_ARTICLES: 'CENTRAL MEDICINES AND MEDICAL ARTICLES',
            RAPID_TEST_TITLE: 'MMIT - MONTHLY INFORMATION MAP OF RAPID TEST',
            MONTH: 'Month',
            HEALTH_FACILITY: 'Health Facility',
            YEAR: 'Year',
            DISTRICT: 'District',
            PROVINCE: 'Province',
            SENCOND_TITLE: 'Rapid Test Balance at the health facility',
            ATTENTIONKITS: '(atention reported in test Kits)',
            CODE_AND_PRODUCT: 'Code & Product',
            INITIAL_STOCK: 'Initial Stock',
            ENTRIES: 'Entries',
            ISSUES: 'Issues',
            LOSS_AND_ADJUSTMENT: 'Loss And Adjustment',
            INVERNTORY: 'Inverntory',
            EXPIRY_DATE: 'Expiry Date',
            
            THIRD_TITLE: 'Test consumption justification',
            THIRD_ATTENTIONTESTS: '(atention reported in test units)',

            SERVICES: 'Services',
            HIV_DETERMINE: 'HIV Determine',
            HIV_UNIGOLD: 'HIV Unigold',
            SYPHILLIS: 'Syphillis',
            MALARIA: 'Malaria'
        };
    }

})();
