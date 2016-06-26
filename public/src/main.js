define(function (require) {
    var exports = {};
    var layout = require('./layout');
    var render = require('./render');
    var measure = require('./measure');

    exports.init = function (data) {
        measure.init();
        var root = layout.doLayout(data);
        var dom = render.doRender(root);
        document.body.appendChild(dom);
    }

    return exports;
});
