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
    }
};

module.exports = usedMockAPIs;