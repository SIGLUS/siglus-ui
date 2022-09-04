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

describe('siglusLocationAdjustmentService', function() {

    var $rootScope, $httpBackend, siglusLocationAdjustmentService,
        siglusLocationManagementUrlFactory, baseInfo, lineItems;
    var draft,
        facilityId = 'b889bb10-cfb4-11e9-9398-0242ac130008',
        userId = '00a9f07c-e24a-4fff-8eca-fd504567234f',
        programId = '00000000-0000-0000-0000-000000000000',
        draftType = 'adjustment';
    beforeEach(function() {

        module('siglus-location-adjustment');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            siglusLocationAdjustmentService = $injector.get('siglusLocationAdjustmentService');
            siglusLocationManagementUrlFactory = $injector.get('siglusLocationManagementUrlFactory');
        });
    });

    describe('getDraft', function() {
        beforeEach(function() {
            draft = getDraft();
            $httpBackend
                .when('GET', siglusLocationManagementUrlFactory('/api/siglusapi/draftsWithLocation'
                    + '?draftType=' + draftType
                    + '&facilityId=' + facilityId
                    + '&isDraft=' + true
                    + '&program=' + programId
                    + '&userId=' + userId))
                .respond(200, draft);
        });

        it('should call /api/siglusapi/draftsWithLocation ', function() {
            $httpBackend
                .expectGET(siglusLocationManagementUrlFactory('/api/siglusapi/draftsWithLocation'
                    + '?draftType=' + draftType
                    + '&facilityId=' + facilityId
                    + '&isDraft=' + true
                    + '&program=' + programId
                    + '&userId=' + userId));

            siglusLocationAdjustmentService.getDraft(programId, draftType, facilityId, userId);

            $httpBackend.flush();
        });

        it('should return response', function() {
            var result;
            siglusLocationAdjustmentService.getDraft(programId, draftType, facilityId, userId)
                .then(function(response) {
                    console.log('response');
                    console.log(response);
                    result = response;
                });
            console.log(result);
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).not.toEqual(angular.toJson(draft));
        });

    });

    describe('deleteDraft', function() {
        beforeEach(function() {
            draft = getDraft();
            $httpBackend
                .when('DELETE', siglusLocationManagementUrlFactory('/api/siglusapi/drafts/' + draft.id))
                .respond(204, null);
        });

        it('should call /api/siglusapi/drafts/', function() {
            $httpBackend
                .expectDELETE(siglusLocationManagementUrlFactory('/api/siglusapi/drafts/' + draft.id));
            siglusLocationAdjustmentService
                .deleteDraft(draft.id);

            $httpBackend.flush();
        });
    });

    describe('createDraft', function() {
        beforeEach(function() {
            draft = getDraft();
            $httpBackend
                .whenPOST(siglusLocationManagementUrlFactory('/api/siglusapi/drafts'))
                .respond(200, null);
        });

        it('should call /api/siglusapi/drafts/', function() {
            $httpBackend
                .expectPOST(siglusLocationManagementUrlFactory('/api/siglusapi/drafts'));

            siglusLocationAdjustmentService
                .createDraft(programId, draftType, facilityId, userId);

            $httpBackend.flush();
        });
    });

    describe('saveDraft', function() {
        beforeEach(function() {
            draft = getDraft();
            baseInfo = getBaseInfo();
            lineItems = getLineItems();
            $httpBackend
                .when('PUT', siglusLocationManagementUrlFactory('/api/siglusapi/draftsWithLocation/' + draft.id))
                .respond(200, null);
        });

        it('should call /api/siglusapi/draftsWithLocation/:id', function() {
            $httpBackend
                .expectPUT(siglusLocationManagementUrlFactory('/api/siglusapi/draftsWithLocation/' + draft.id));

            siglusLocationAdjustmentService
                .saveDraft(baseInfo, lineItems);

            $httpBackend.flush();
        });

        it('should response null', function() {
            var result;
            siglusLocationAdjustmentService
                .saveDraft(baseInfo, lineItems).then(function(
                    response
                ) {
                    result = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(result).not.toEqual(null);
        });
    });

    // describe('submitDraft', function() {
    //     beforeEach(function() {
    //         draft = getDraft();
    //         $httpBackend
    //             .whenPOST(siglusLocationManagementUrlFactory('/api/siglusapi/drafts'))
    //             .respond(200, null);
    //     });

    //     it('should call /api/siglusapi/drafts/', function() {
    //         $httpBackend
    //             .expectPOST(siglusLocationManagementUrlFactory('/api/siglusapi/drafts'));

    //         siglusLocationAdjustmentService
    //             .createDraft(programId, draftType, facilityId, userId);

    //         $httpBackend.flush();
    //     });
    // });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function getDraft() {
        return {
            id: 'e34abfbd-969c-4ba7-ac80-fa5300273534',
            facilityId: 'efc83793-a235-4b52-ba77-dfafb5b49906',
            isDraft: true,
            programId: '00000000-0000-0000-0000-000000000000',
            occurredDate: null,
            signature: null,
            userId: '04e28086-6675-48ad-86dc-130fb15de176',
            draftType: 'adjustment',
            initialDraftId: null,
            operator: null,
            status: null,
            draftNumber: null,
            lineItems: [
                {
                    orderableId: '0092034f-8e0d-4fcc-b2fa-08c0b57e9726',
                    lotId: 'bfdf7144-c354-4a90-a6bb-80b9aa4d1d54',
                    lotCode: 'FAKE-LOTE-08H07-062018',
                    occurredDate: '2022-08-05',
                    expirationDate: '2018-06-30',
                    documentNumber: null,
                    quantity: 23,
                    destinationId: null,
                    destinationFreeText: null,
                    sourceId: null,
                    sourceFreeText: null,
                    reasonId: '448152fe-df64-11e9-9e7e-4c32759554d9',
                    reasonFreeText: null,
                    productName: null,
                    productCode: null,
                    stockOnHand: null,
                    extraData: {},
                    locationCode: '22A05',
                    area: 'Armazem Principal'
                }
            ]
        };
    }

    function getBaseInfo() {
        return {
            id: 'e34abfbd-969c-4ba7-ac80-fa5300273534'
        };
    }

    function getLineItems() {
        return [
            [{
                id: 'e34abfbd-969c-4ba7-ac80-fa5300273534'
            }]
        ];
    }
});