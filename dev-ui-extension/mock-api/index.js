const pathToRegexp = require('path-to-regexp');
const usedMockAPIs = require('./used-mock-api');

const isMatch = (routePattern) => (routePath) => {
    const regexp = pathToRegexp(routePattern);
    return !!regexp.exec(routePath);
};

const useMockAPI = function(req, res, next) {
    for (let pattern in usedMockAPIs) {
        let apiResponseOrRequestHandler = usedMockAPIs[pattern];
        if (!isMatch(pattern)(req.url)) {
            continue
        }
        console.log(`[mock=${pattern}]`, req.method, req.url);
        const typeOfResponseOrRequestHandler = typeof apiResponseOrRequestHandler;
        const isRequestHandler = typeOfResponseOrRequestHandler === 'function';
        if (isRequestHandler) {
            return apiResponseOrRequestHandler(req, res, next);
        }
        if (typeOfResponseOrRequestHandler !== 'string') {
            apiResponseOrRequestHandler = JSON.stringify(apiResponseOrRequestHandler);
        }
        return res.end(apiResponseOrRequestHandler);
    }
    next();
};

module.exports = useMockAPI;