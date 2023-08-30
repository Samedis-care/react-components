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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
import React, { useCallback, useMemo, useState } from "react";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
var enhanceData = function (data, loading, parentHasNext, index, depth) {
    return data
        .map(function (entry, idx) {
        var hasNext = idx < data.length - 1;
        return __spreadArray([
            __assign(__assign({}, entry), { index: index++, depth: depth, hasPrev: idx !== 0, hasNext: hasNext, childrenLoading: loading.includes(entry.id), childrenLoaded: entry.children != null && entry.children.length > 0, parentHasNext: parentHasNext })
        ], (entry.children && entry.expanded
            ? (function () {
                var data = enhanceData(entry.children, loading, __spreadArray(__spreadArray([], parentHasNext, true), [hasNext], false), index, depth + 1);
                index += data.length;
                return data;
            })()
            : []), true);
    })
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
    var data = props.data, renderer = props.renderer, rendererItemHeight = props.rendererItemHeight, onLoadChildren = props.onLoadChildren, onToggleExpanded = props.onToggleExpanded, rendererProps = __rest(props, ["data", "renderer", "rendererItemHeight", "onLoadChildren", "onToggleExpanded"]);
    var itemHeight = rendererItemHeight !== null && rendererItemHeight !== void 0 ? rendererItemHeight : 24;
    var _a = useState([]), loading = _a[0], setLoading = _a[1];
    var enhancedData = useMemo(function () {
        var processingTarget;
        if (Array.isArray(data)) {
            processingTarget = buildTreeFromFlat(data);
        }
        else {
            processingTarget = data;
        }
        return enhanceData([processingTarget], loading, [], 0, 0);
    }, [data, loading]);
    var hookOnToggleExpanded = useCallback(function (id) {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var toggleRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toggleRecord = enhancedData.find(function (record) { return record.id === id; });
                        if (!(toggleRecord &&
                            toggleRecord.hasChildren &&
                            !toggleRecord.childrenLoaded)) return [3 /*break*/, 2];
                        if (toggleRecord.childrenLoading)
                            return [2 /*return*/];
                        setLoading(function (prev) { return __spreadArray(__spreadArray([], prev, true), [id], false); });
                        return [4 /*yield*/, onLoadChildren(id)];
                    case 1:
                        _a.sent();
                        setLoading(function (prev) { return prev.filter(function (entry) { return entry !== id; }); });
                        _a.label = 2;
                    case 2:
                        onToggleExpanded(id);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [enhancedData, onLoadChildren, onToggleExpanded]);
    var itemData = useMemo(function () { return ({
        renderer: renderer !== null && renderer !== void 0 ? renderer : TreeViewDefaultRenderer,
        data: enhancedData,
        rendererProps: __assign(__assign({}, rendererProps), { onToggleExpanded: hookOnToggleExpanded }),
    }); }, [renderer, enhancedData, rendererProps, hookOnToggleExpanded]);
    return (React.createElement(AutoSizer, null, function (_a) {
        var width = _a.width, height = _a.height;
        return (React.createElement(FixedSizeList, { itemSize: itemHeight, height: height, width: width, itemCount: enhancedData.length, itemData: itemData }, RendererWrapper));
    }));
};
export default React.memo(TreeView);
