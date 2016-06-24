define(function (require) {
    var exports = {};
    var ratio = 2;

    exports.init = function (data) {
        data.reverse();
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var el = document.createElement('div');
            var style = el.style;
            style.position = 'absolute';
            style.top = d.top / ratio + 'px';
            style.left = d.left / ratio + 'px';
            el.setAttribute('title', d.name);
            if (d.type === 'TEXT') {
                // 文字就不设置宽度和高度了
                el.innerHTML = d.text;
                style.fontSize = d.fontSize / ratio + 'px';
                style.color = d.color;
                style.lineHeight = d.fontSize / ratio + 'px';
            }
            else {
                style.width = d.width / ratio + 'px';
                style.height = d.height / ratio + 'px';
                style.background = `url(img/${d.uuid}.png) no-repeat`;
                style.backgroundSize = '100%';
            }
            style.overflow = 'hidden';
            // style.border = 'solid 1px #888';
            document.body.appendChild(el);
        }
    }

    return exports;
});
