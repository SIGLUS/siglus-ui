const usedMockAPIs = {
    '*/api/fake-systemNotifications*': {
        'content': [],
        'last': true,
        'totalElements': 0,
        'totalPages': 0,
        'first': true,
        'sort': null,
        'numberOfElements': 0,
        'size': 2147483647,
        'number': 0
    },
    '*/api/demo-request-handler*': function(req, res, next) {
        res.end(JSON.stringify({'data': []}));
    },
    '*/api/get-conflict-draft*': function(req, res, next) {
        const { facilityId, programId } = req
        let result;
        if (facilityId == 100 && programId == 110) {
            result = [];
        } else {
            result = [
                {
                    orderable: {
                        productCode: '001',
                        fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                    },
                    currentStock: 0,
                    conflictWith: 'draft1'
                },
                {
                    orderable: {
                        productCode: '002',
                        fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                    },
                    currentStock: 0,
                    conflictWith: 'draft2'
                },
                {
                    orderable: {
                        productCode: '003',
                        fullProductName: 'Imunoglobulina humana anti-rabica inj; 1000UI/5mL; Inj',
                    },
                    currentStock: 0,
                    conflictWith: 'draft3'
                }
            ]
        }
        res.end(JSON.stringify({'data': result}));
    }
};

module.exports = usedMockAPIs;