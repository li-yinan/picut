define(function (require) {
    var exports = {};
    var ratio = require('./config').ratio;
    var measureEl = null;
    var lastEl = null;

    function setHighLight(el) {
        if (!el) {
            return;
        }
        el.style.outline = 'solid 1px red';
    }

    function setNormal(el) {
        if (!el) {
            return;
        }
        el.style.outline = 'none';
    }

    /**
     * 点击元素的时候显示当前元素的尺寸信息
     *
     */
    function displayMeasureInfo() {
        document.body.addEventListener('click', function (e) {
            var target = e.target;
            setNormal(lastEl);
            // 检测是否是一个图层生成的dom
            if (target.layerInfo) {
                setHighLight(target);
                var info = target.layerInfo;
                var infoStr = `
                    <p>id: ${info.uuid}<\p>
                    <p>名称: ${info.name}<\p>
                    <p>左边距: ${info.relativeLeft / ratio}<\p>
                    <p>上边距: ${info.relativeTop / ratio}</p>
                    <p>宽度 : ${info.width / ratio}</p>
                    <p>高度 : ${info.height / ratio}</p>
                `;
                if (info.parentInfo) {
                    infoStr += `
                        <p>父元素宽度 : ${info.parentInfo.width / ratio}</p>
                        <p>父元素高度 : ${info.parentInfo.height / ratio}</p>
                    `;
                }
                infoStr += `
                    <p>透明度: ${info.opacity}%</p>
                `;
                if (info.type === 'TEXT') {
                    infoStr += `
                        <p>颜色: ${info.color}<\p>
                        <p>字体: ${info.fontFamily}<\p>
                        <p>字号: ${info.fontSize / ratio}<\p>
                    `;
                }
                if (info.hasBackground) {
                    infoStr += `
                        <a target="_blank" href="img/${info.uuid}.png">点击在新窗口打开背景图片</a>
                    `;
                }
                measureEl.innerHTML = infoStr;
                lastEl = target;
            }
        }, false);
    }

    function createMeasureDisplayArea() {
        var el = document.createElement('div');
        var style = el.style;
        style.position = 'fixed';
        style.top = '50px';
        style.right = '50px';
        style.width = '200px';
        style.height = '600px';
        style.zIndex = '999999';
        style.backgroundColor = '#eee';
        measureEl = el;
        document.body.appendChild(el);
    }

    exports.init = function () {
        createMeasureDisplayArea();
        displayMeasureInfo();
    };

    return exports;
});
