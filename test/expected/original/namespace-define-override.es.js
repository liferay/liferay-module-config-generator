define("modal@2.0.0/js/namespace-define-override.es", ["exports"], function(exports) {
    var thing = {
        doStuff: function () {
            return 'doing stuff';
        }
    };
    exports.default = thing;
});