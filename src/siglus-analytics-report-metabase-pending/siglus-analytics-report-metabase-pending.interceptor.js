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
     * @name siglus-analytics-report-metabase-pending.interceptor
     *
     * @description
     * Stops state transitions when loadingService is started.
     */
    angular.module('siglus-analytics-report-metabase-pending')
        .run(pendingInterceptor);

    pendingInterceptor.$inject = ['$rootScope', '$state'];

    function pendingInterceptor($rootScope, $state) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
            if (toState.name === 'openlmis.pending') {
                if (toParams.summittedStatus !== 'Não Submetido') {
                    var routerParam = {
                        Malaria: 'openlmis.analyticsReport.requisitionAndMonthly.malaria',
                        MMIT: 'openlmis.analyticsReport.requisitionAndMonthly.rapid',
                        'Requisição Balancete': 'openlmis.analyticsReport.requisitionAndMonthly.ViaClassica'
                    };

                    event.preventDefault();
                    $state.go(routerParam[toParams.reportName], {
                        rnr: toParams.rnr
                    }, {
                        location: 'replace'
                    });
                }
            }
        });
    }
})();
