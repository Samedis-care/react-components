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
import React, { useCallback, useState } from "react";
import TreeView from "../../../standalone/Tree/TreeView";
import { action } from "@storybook/addon-actions";
export var initialTreeData = [
    {
        parentId: null,
        id: "root",
        expanded: true,
        hasChildren: true,
        icon: null,
        label: "Root",
    },
    {
        parentId: "root",
        id: "child-1",
        expanded: false,
        hasChildren: false,
        icon: null,
        label: "Child 1",
    },
    {
        parentId: "root",
        id: "child-2",
        expanded: false,
        hasChildren: false,
        icon: null,
        label: "Child 2 has some extremely ".concat(new Array(250)
            .fill("long")
            .join(" "), " label"),
    },
];
export var TreeViewStory = function () {
    var _a = useState(initialTreeData), data = _a[0], setData = _a[1];
    var loadChildren = useCallback(function (id) {
        action("loadChildren")(id);
    }, []);
    var toggleExpanded = useCallback(function (id) {
        setData(function (prev) {
            return prev.map(function (entry) {
                return entry.id === id ? __assign(__assign({}, entry), { expanded: !entry.expanded }) : entry;
            });
        });
    }, []);
    return (React.createElement("div", { style: { width: "calc(100vw - 32px)", height: "calc(100vh - 32px)" } },
        React.createElement(TreeView, { data: data, onLoadChildren: loadChildren, onToggleExpanded: toggleExpanded })));
};
TreeViewStory.storyName = "TreeView";
