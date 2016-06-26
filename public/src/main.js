define(function (require) {
    var exports = {};
    var layout = require('./layout');
    var render = require('./render');

    exports.init = function (data) {
        var root = layout.doLayout(data);
        var dom = render.doRender(root);
        document.body.appendChild(dom);
    }

    return exports;
});
