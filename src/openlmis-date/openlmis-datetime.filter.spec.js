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

describe('openlmisDatetimeFilter', function() {

    beforeEach(function() {
        module('openlmis-date');

        inject(function($injector) {
            this.$filter = $injector.get('$filter');
            this.localeService = $injector.get('localeService');
            this.moment = $injector.get('moment');
        });

        this.localeSettings = {
            timeZoneId: 'America/Los_Angeles',
            dateTimeFormat: 'dd/MM/yyyy HH:mm:ssZ'
        };

        this.openlmisDateTimeFilter = this.$filter('openlmisDatetime');

        spyOn(this.localeService, 'getFromStorage').andReturn(this.localeSettings);
        spyOn(this.moment, 'tz').andCallThrough();
    });

    it('should return date with default datetimeFormat and timezone', function() {
        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z')).toEqual('01/10/2017 04:55:12-0800');
    });

    it('should return date with given datetimeFormat and default timezone', function() {
        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', 'medium')).toEqual('Oct 1, 2017 4:55:12 AM');

        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', 'short')).toEqual('10/1/17 4:55 AM');
    });

    it('should return date with default datetimeFormat and given timezone', function() {
        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', undefined)).toEqual('01/10/2017 04:55:12-0800');

        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', undefined, 'UTC'))
            .toEqual('01/10/2017 12:55:12+0000');

        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', undefined, 'UTC+8'))
            .toEqual('01/10/2017 20:55:12+0800');
    });

    it('should return date with given datetimeFormat and timezone', function() {
        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', 'short', 'UTC+8'))
            .toEqual('10/1/17 8:55 PM');

        expect(this.openlmisDateTimeFilter('2017-10-01T12:55:12Z', 'medium', 'UTC')).toEqual('Oct 1, 2017 12:55:12 PM');
    });
});
