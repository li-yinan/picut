var ps = require('photoshop');
var fs = require('fs');

function process(){

    var uuid = (function () {
        var cnt = 0;
        return function () {
            return 'uuid' + cnt++;
        }
    })();

    function walk(layers, callback) {
        layers = layers || [];
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            callback(layer);
            if (layer.visible) {
                walk(layers[i].layers, callback);
            }
        }
    }

    function saveFileToPng(layer, path) {
        // 使用原始psd的大小新建画布
        // 为什么不按照当前layer大小建立画布？
        // 因为复制出来的图层坐标对应不上，可见区域没法和复制的图层重叠，切不出来
        var width = layer.bounds[2]-layer.bounds[0];
        var height = layer.bounds[3]-layer.bounds[1];
        // 记录当前的psd，duplicate操作只能在active的psd上进行
        var activeDoc = app.activeDocument;
        // 生成一个新的文件
        // 这时active的psd是这个新建的psd
        var newDoc = documents.add(activeDoc.width, activeDoc.height, 72, 'newDoc',
            NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);

        // 设置原始psd为active状态
        app.activeDocument = activeDoc;

        // 复制图层到新创建的psd
        layer.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);
        // 把新建的图层设置为active状态
        app.activeDocument = newDoc;
        // 去掉所有透明的部分
        newDoc.trim(TrimType.TRANSPARENT);
        // 把剩余的部分保存成文件
        newDoc.saveAs(
            new File(path),
            new PNGSaveOptions(),
            true,
            Extension.LOWERCASE
        );
        // 把新建的psd关掉，不保存
        newDoc.close(SaveOptions.DONOTSAVECHANGES);
    }

    // 第一层的group&layer
    var layers = app.activeDocument.layers;
    // 这个数组用于保存所有layer的信息，并且从ps内把数据输出到node
    var layerArr = [];
    // 递归处理每一个layer
    walk(layers, function (layer) {
        // 当layer不可见或者不是一个图层的时候不处理
        if (!layer.visible || layer.typename !== 'ArtLayer') {
            return;
        }
        // 为当前layer生成一个uuid
        var uid = uuid();
        var layerObj = {
            uuid: uid,
            left: layer.bounds[0],
            top: layer.bounds[1],
            width: (layer.bounds[2]-layer.bounds[0]),
            height: (layer.bounds[3]-layer.bounds[1]),
            name: layer.name,
            type: layer.typename
        };
        // 当前图层如果是文字的话需要特殊处理
        if (layer.kind === LayerKind.TEXT) {
            var textItem = layer.textItem;
            // 保存文本内容、颜色、字体、字号等
            layerObj.text = textItem.contents;
            layerObj.color = '#' + textItem.color.rgb.hexValue;
            layerObj.fontFamily = app.fonts.getByName(textItem.font).family;
            layerObj.fontSize = textItem.size;
            layerObj.type = 'TEXT';
        }
        else {
            saveFileToPng(layer, '/Users/liyinan/code/li-yinan/test/img/' + uid);
        }
        // 把当前层切成图片
        console.log(layerObj);
        // 保存当前图层信息
        layerArr.push(layerObj);
    });

    return layerArr;
}

var startTime = +new Date();
console.log(`start time: ${startTime}`);

// 把js放到ps里处理
ps.invoke(process, function(error, result){
    var endTime = +new Date();
    console.log(`end time: ${endTime}`);
    console.log(`cost: ${endTime - startTime}`);
    var wrapAMD = `
        define(function (require) {
            return ${JSON.stringify(result, null, 4)};
        });
    `;
    // 生成的数据导出成amd模块给页面使用
    fs.writeFile('/Users/liyinan/code/li-yinan/test/src/data.js', wrapAMD, function () {
        console.log('ok');
    });
})
