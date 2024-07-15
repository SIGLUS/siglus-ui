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
     * @name shipment.Shipment
     *
     * @description
     * Represents a single shipment (or shipment draft).
     */
    angular
        .module('siglus-analytics-report')
        .service('siglusAnalyticsDateService', siglusAnalyticsDateService);

    siglusAnalyticsDateService.$inject = ['moment', 'messageService'];
    function siglusAnalyticsDateService(moment, messageService) {

        this.getCreationDateWithTranslatedMonth = getCreationDateWithTranslatedMonth;
        this.getFullTranslatedMonthFromDateText = getFullTranslatedMonthFromDateText;
        this.getAbbrTranslatedMonthFromDateText = getAbbrTranslatedMonthFromDateText;

        function getCreationDateWithTranslatedMonth(creationDateText) {
            var creationDate = moment(creationDateText).utcOffset(2);
            var fullMonthText = getFullTranslatedMonthFromDateText(creationDateText);
            return creationDate.format('DD') + ' ' + fullMonthText + ' ' + creationDate.format('YYYY');
        }

        function getFullTranslatedMonthFromDateText(dateText) {
            var monthNumber = moment(dateText).month();
            var currentLocale = messageService.getCurrentLocale();
            if (currentLocale === 'en') {
                return englishFullMonths[monthNumber];
            } else if (currentLocale === 'pt') {
                return portugueseFullMonths[monthNumber];
            }
            return '';
        }

        function getAbbrTranslatedMonthFromDateText(dateText) {
            var monthNumber = moment(dateText).month();
            var currentLocale = messageService.getCurrentLocale();
            if (currentLocale === 'en') {
                return englishAbbrMonths[monthNumber];
            } else if (currentLocale === 'pt') {
                return portugueseAbbrMonths[monthNumber];
            }
            return '';
        }

        var englishFullMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        var englishAbbrMonths = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        var portugueseFullMonths = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        var portugueseAbbrMonths = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

    }

})();
