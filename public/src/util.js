define(function (require) {
    var exports = {};
    var ratio = 2;

    exports.scale = function (value) {
        return Math.round(value / ratio);
    };

    return exports;
});
