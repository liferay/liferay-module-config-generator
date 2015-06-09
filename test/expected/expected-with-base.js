var __CONFIG__ = {
    url: 'http://localhost:3000/combo?',
    basePath: '/modules',
    combine: true,
    map: {
        'jquery': 'http://code.jquery.com/jquery-2.1.3.min.js',
        'aui': 'html/js'
    }
};
__CONFIG__.modules = {
    "/js/address_1.es.js": {
        "dependencies": ["exports", "modal@1.0.0/js/eduardo-1.es"],
        "path": "/js/address_1.es.js"
    },
    "/js/eduardo_1.es.js": {
        "dependencies": ["exports"],
        "path": "/js/eduardo_1.es.js"
    }
};