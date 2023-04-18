var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useMemo } from "react";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
var enhanceData = function (data, index, depth) {
    return data
        .map(function (entry, idx) { return __spreadArray([
        __assign(__assign({}, entry), { index: index++, depth: depth, hasPrev: idx !== 0, hasNext: idx < data.length - 1 })
    ], (entry.children && entry.expanded
        ? (function () {
            var data = enhanceData(entry.children, index, depth + 1);
            index += data.length;
            return data;
        })()
        : []), true); })
        .flat();
};
var buildTreeFromFlat = function (data) {
    var rootNode = data.find(function (record) { return record.parentId === null; });
    if (!rootNode) {
        throw new Error("No root node found (set parentId to null for root node)");
    }
    var buildNode = function (node) {
        return __assign(__assign({}, node), { children: data
                .filter(function (record) { return record.parentId === node.id; })
                .map(buildNode) });
    };
    return buildNode(rootNode);
};
var RendererWrapper = function (props) {
    var index = props.index, data = props.data, style = props.style;
    var Renderer = data.renderer, rendererProps = data.rendererProps, itemData = data.data;
    return (React.createElement("div", { style: style },
        React.createElement(Renderer, __assign({}, rendererProps, itemData[index]))));
};
var TreeView = function (props) {
    var data = props.data, renderer = props.renderer, rendererItemHeight = props.rendererItemHeight, rendererProps = __rest(props, ["data", "renderer", "rendererItemHeight"]);
    var itemHeight = rendererItemHeight !== null && rendererItemHeight !== void 0 ? rendererItemHeight : 24;
    var enhancedData = useMemo(function () {
        var processingTarget;
        if (Array.isArray(data)) {
            processingTarget = buildTreeFromFlat(data);
        }
        else {
            processingTarget = data;
        }
        return enhanceData([processingTarget], 0, 0);
    }, [data]);
    var itemData = useMemo(function () { return ({
        renderer: renderer !== null && renderer !== void 0 ? renderer : TreeViewDefaultRenderer,
        data: enhancedData,
        rendererProps: rendererProps,
    }); }, [renderer, enhancedData, rendererProps]);
    return (React.createElement(AutoSizer, null, function (_a) {
        var width = _a.width, height = _a.height;
        return (React.createElement(FixedSizeList, { itemSize: itemHeight, height: height, width: width, itemCount: enhancedData.length, itemData: itemData }, RendererWrapper));
    }));
};
export default React.memo(TreeView);
