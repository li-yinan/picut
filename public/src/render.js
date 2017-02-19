define(function (require) {
    var exports = {};
    var util = require('util');
    var scale = util.scale;

    /**
     * 通过图层数据生成dom
     *
     * @param {Object} data 图层数据
     *
     * @return {HTMLElement}
     */
    function createDom (data) {
        var el = document.createElement('div');
        el.layerInfo = data;
        var style = el.style;
        style.position = 'absolute';
        style.top = scale(data.relativeTop) + 'px';
        style.left = scale(data.relativeLeft) + 'px';
        style.opacity = data.opacity / 100;
        el.id = data.uuid;
        el.setAttribute('title', data.name);
        el.className = 'ps-layer';
        if (data.type === 'TEXT') {
            // 文字就不设置宽度和高度了
            el.innerHTML = data.text;
            style.fontSize = scale(data.fontSize) + 'px';
            style.color = data.color;
            // style.lineHeight = scale(data.leading) + 'px';
            style.lineHeight = scale(data.fontSize) + 'px';
        }
        else {
            if (data.text) {
                el.innerHTML = data.text;
                style.fontSize = scale(data.fontSize) + 'px';
                style.color = data.color;
                style.lineHeight = scale(data.leading) + 'px';
                // style.lineHeight = scale(data.fontSize) + 'px';
            }
            style.width = scale(data.width) + 'px';
            style.height = scale(data.height) + 'px';
            style.background = `url(img/${data.uuid}.png) no-repeat`;
            style.backgroundSize = '100%';
        }
        // style.overflow = 'hidden';
        // style.border = 'solid 1px #888';
        return el;
    }

    /**
     * 通过图层数据建立dom树
     *
     * @param {Object} rootLayer 根图层
     *
     * @return {HTMLElement} 根dom节点
     */
    function createDomTree(rootLayer, parentNode) {
        var rootDom = createDom(rootLayer);
        if (parentNode) {
            parentNode.appendChild(rootDom);
        }
        var child = rootLayer.child || [];

        child.forEach(function (item) {
            createDomTree(item, rootDom);
        });

        return rootDom;
    }

    exports.doRender = function (rootLayer) {
        return createDomTree(rootLayer);
    }

    return exports;
});
