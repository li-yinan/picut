define(function (require) {
    var exports = {};

    // 计算包含时的容宽，因为好多元素压边或者包围体和字体差一像素导致计算包含失败，不能正确的确定元素间的关系，所以增加容宽，让包含计算更准确
    var tolerance = 3;

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
            a.left - tolerance  < b.left 
            // 检测上边
            && a.top - tolerance < b.top
            // 检测右边
            && a.left + a.width + tolerance > b.left + b.width
            // 检测下边
            && a.top + a.height + tolerance > b.top + b.height
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
     * 抽取最大的一个(其实就是第一个，已经排序了嘛)，遍历后面的所有layer找到所有包含的layer，作为当前元素的子元素（child），然后再从子元素中抽出最大的，在剩余的里面找到所有包含的，以此类推，深度递归
     * 这时以第一个为root的已经成树了，对第二个继续这样做，以此类推，就把所有的树建好了
     *
     * @param {Array.<Object>} layers 图层数据
     *
     * @return {Object}
     */
    function buildTree(layers, index) {
        index = index || 0;
        // 最大的一个为root
        var root = layers[index];
        if (!root) {
            return;
        }
        root.child = root.child || [];
        var layer = null;
        // 因为涉及到从正在循环的数组删除元素，所以从后往前循环
        for (var i = layers.length - 1; i > index; i--) {
            layer = layers[i];
            if (isInside(root, layer)) {
                // 如果当前图层包含在所给图层内，则把当前图层放到所给图层的child的第一个，因为是从后往前循环的，要保证child也是从大到小有序的，所以用unshift
                root.child.unshift(layer);
                // 把当前图层从数组中删除
                layers.splice(i, 1);
            }
        }
        // 先深度遍历所有的child
        buildTree(root.child);
        // 再广度遍历layers里剩下的元素
        buildTree(layers, index + 1);
        return root;
    }

    /**
     * 对已经建树的图层计算相对位置
     *
     * @param {Object} layer 根图层
     */
    function calRelativePosition(layer) {
        var child = layer.child || [];
        layer.relativeLeft = layer.relativeLeft || 0;
        layer.relativeTop = layer.relativeTop || 0;

        // 因为之前按照面积对图层排过序，已经失去了原始图层的排序信息，但dom节点的渲染顺序决定了其所在的位置，需要根据位置信息重新对同一级的图层进行排序
        // 当前不是最优方案，这个排序很复杂，是layout算法的一部分，因为同级的图层也存在上下左右四个方向的排列，不是很好处理，暂时先按照垂直方向排序，以解决最突出的问题
        child.sort(function (a, b) {
            return a.top - b.top;
        });

        child.forEach(function (item) {
            // 子图层保存父图层的信息
            item.parentInfo = layer;
            // 计算相对坐标
            item.relativeLeft = item.left - layer.left; 
            item.relativeTop = item.top - layer.top; 
            calRelativePosition(item);
        });
    }

    /**
     * 对图层数组进行布局，划分包含关系，计算相对位置
     *
     * @param {Array.<Object>} data 图层数组
     *
     * @return {Object} 根图层
     */
    exports.doLayout = function (data) {
        sortLayersByArea(data);
        var root = buildTree(data);
        calRelativePosition(root);
        // console.log(root);
        return root;
    };

    return exports;
});
