define(function (require) {
    var exports = {};

    /**
     * b 是否在a 内部
     *
     * @param {Object} a
     * @param {number} a.width
     * @param {number} a.height
     * @param {number} a.left
     * @param {number} a.top
     * @param {Object} b
     * @param {number} b.width
     * @param {number} b.height
     * @param {number} b.left
     * @param {number} b.top
     *
     * @return {boolean}
     */
    function isInside(a, b) {
        if (
            // 检测左边
            a.left < b.left 
            // 检测上边
            && a.top < b.top
            // 检测右边
            && a.left + a.width > b.left + b.width
            // 检测下边
            && a.top + a.height > b.top + b.height
            ) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * 计算面积
     * @param {Array.<Object>} layers 图层数据
     */
    function calArea(layers) {
        layers = layers || [];
        layers.map(function (layer) {
            layer.area = layer.width * layer.height;
        });
    }

    /**
     * 按照面积排序
     * @param {Array.<Object>} layers 图层数据
     */
    function sortLayersByArea(layers) {
        layers = layers || [];
        calArea(layers);
        layers.sort(function (a, b) {
            return b.area - a.area;
        });
    }

    /**
     * 复制数组
     *
     * @param {Array.<Object>} layers 图层数据
     *
     * @return {Array.<Object>}
     */
    function duplicateArray(layers) {
        var res = [];
        layers.map(function (layer) {
            res.push(layer);
        })
        return res;
    }

    /**
     * 建立树形结构
     * 这个算法有点复杂，待我慢慢道来
     * 首先按照面积对所有图层进行排序，因为图层大的才可能包含图层小的，这个是先决条件，遇到两个图形交叉就不好使了
     * 排序后可保证整体有序，接下来做局部有序
     * 抽取最大的一个(其实就是第一个，已经排序了嘛)，遍历后面的所有layer找到所有包含的layer，记做集合A，然后再集合A中抽出最大的，在剩余的里面找到所有包含的，以此类推，深度递归
     * 这时以第一个为root的已经成树了，对第二个继续这样做，以此类推，就把所有的树建好了
     *
     * @param {Array.<Object>} layers 图层数据
     *
     * @return {Object}
     */
    function buildTree(layers, index) {
        // 最大的一个为root
        var root = layers[index];
        if (!root) {
            return;
        }
        root.child = root.child || [];
        var layer = null;
        for (var i = layers.length - 1; i > index; i--) {
            layer = layers[i];
            if (isInside(root, layer)) {
                root.child.unshift(layer);
                layers.splice(i, 1);
            }
        }
        // 先深度遍历所有的child
        buildTree(root.child, 0);
        // 再广度遍历layers里剩下的元素
        buildTree(layers, index + 1);
        return root;
    }

    exports.init = function (data) {
        sortLayersByArea(data);
        buildTree(data, 0);
        console.log(data);
    };

    return exports;
});
