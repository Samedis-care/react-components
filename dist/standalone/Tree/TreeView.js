import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, } from "react";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import { List } from "react-window";
const enhanceData = (data, loading, ancestorLanes, index, depth, forest) => {
    // the root level of a single root tree has no spine: the lone root has no sibling
    // to connect to, so descending past it must not open a lane. Every other level
    // does, and so does the root level of a forest, whose roots are siblings.
    const levelHasSpine = forest || depth !== 0;
    return data
        .map((entry, idx) => {
        const hasNext = idx < data.length - 1;
        return [
            {
                ...entry,
                index: index++,
                depth: depth,
                hasPrev: idx !== 0,
                hasNext,
                childrenLoading: loading.includes(entry.id),
                childrenLoaded: entry.children != null && entry.children.length > 0,
                ancestorLanes,
                hasConnector: levelHasSpine,
            },
            ...(entry.children && entry.expanded
                ? (() => {
                    const data = enhanceData(entry.children, loading, levelHasSpine ? [...ancestorLanes, hasNext] : ancestorLanes, index, depth + 1, forest);
                    index += data.length;
                    return data;
                })()
                : []),
        ];
    })
        .flat();
};
const buildTreeFromFlat = (data) => {
    const roots = data.filter((record) => record.parentId === null);
    if (roots.length === 0) {
        throw new Error("No root node found (set parentId to null for root node)");
    }
    const childrenByParent = new Map();
    data.forEach((record) => {
        const parentId = record.parentId;
        if (parentId === null)
            return;
        const siblings = childrenByParent.get(parentId);
        if (siblings)
            siblings.push(record);
        else
            childrenByParent.set(parentId, [record]);
    });
    if (process.env.NODE_ENV === "development") {
        const ids = new Set(data.map((record) => record.id));
        const unknownParents = Array.from(childrenByParent.keys()).filter((parentId) => !ids.has(parentId));
        if (unknownParents.length > 0) {
            // orphans are unreachable from any root, so they simply never render
            // eslint-disable-next-line no-console
            console.warn("[Components-Care] [TreeView] Dropping entries whose parentId is not present in data. Unknown parent IDs:", unknownParents);
        }
    }
    const buildNode = (node, ancestors) => {
        const withSelf = new Set(ancestors).add(node.id);
        return {
            ...node,
            children: (childrenByParent.get(node.id) ?? [])
                .filter((child) => {
                // a node that is its own (grand)parent would recurse forever
                if (!withSelf.has(child.id))
                    return true;
                if (process.env.NODE_ENV === "development") {
                    // eslint-disable-next-line no-console
                    console.warn(`[Components-Care] [TreeView] Dropping cyclic parent-child relation ${node.id} -> ${child.id}`);
                }
                return false;
            })
                .map((child) => buildNode(child, withSelf)),
        };
    };
    return roots.map((root) => buildNode(root, new Set()));
};
const isFlatEntry = (entry) => "parentId" in entry;
/**
 * Normalizes the data prop into the list of root nodes
 * @param data The data prop
 * @returns The root nodes, in the order they were passed in
 */
const getRoots = (data) => {
    if (!Array.isArray(data))
        return [data];
    const entries = data;
    if (entries.length === 0)
        return [];
    const flat = entries.filter(isFlatEntry);
    if (flat.length === entries.length)
        return buildTreeFromFlat(flat);
    if (flat.length !== 0) {
        throw new Error("Mixed tree data: pass either nested (TreeData) or flat (TreeDataFlat, with parentId) entries, not both");
    }
    return entries;
};
const RendererWrapper = (props) => {
    const { index, style, ariaAttributes, renderer: Renderer, rendererProps, data: itemData, } = props;
    return (_jsx("div", { style: style, ...ariaAttributes, children: _jsx(Renderer, { ...rendererProps, ...itemData[index] }) }));
};
const TreeView = React.forwardRef(function TreeView(props, ref) {
    const { data, renderer, rendererItemHeight, onLoadChildren, onToggleExpanded, ...rendererProps } = props;
    const listRef = useRef(null);
    const itemHeight = rendererItemHeight ?? 24;
    const [loading, setLoading] = useState([]);
    const enhancedData = useMemo(() => {
        const roots = getRoots(data);
        return enhanceData(roots, loading, [], 0, 0, roots.length > 1);
    }, [data, loading]);
    const hookOnToggleExpanded = useCallback((id) => {
        void (async () => {
            const toggleRecord = enhancedData.find((record) => record.id === id);
            if (toggleRecord &&
                toggleRecord.hasChildren &&
                !toggleRecord.childrenLoaded) {
                if (toggleRecord.childrenLoading)
                    return;
                setLoading((prev) => [...prev, id]);
                await onLoadChildren(id);
                setLoading((prev) => prev.filter((entry) => entry !== id));
            }
            onToggleExpanded(id);
        })();
    }, [enhancedData, onLoadChildren, onToggleExpanded]);
    const itemData = useMemo(() => ({
        renderer: renderer ?? TreeViewDefaultRenderer,
        data: enhancedData,
        rendererProps: {
            ...rendererProps,
            onToggleExpanded: hookOnToggleExpanded,
        },
    }), [renderer, enhancedData, rendererProps, hookOnToggleExpanded]);
    // controlled scrolling
    const [scrollToId, setScrollToId] = useState(null);
    useEffect(() => {
        if (!scrollToId)
            return;
        const list = listRef.current;
        if (!list)
            return;
        setScrollToId(null);
        const entry = enhancedData.find((entry) => entry.id === scrollToId);
        if (!entry)
            return;
        list.scrollToRow({ index: entry.index });
    }, [scrollToId, enhancedData]);
    // ref
    useImperativeHandle(ref, () => ({
        scrollTo: (id) => {
            setScrollToId(id);
        },
    }), []);
    return (_jsx(List, { listRef: listRef, rowComponent: RendererWrapper, rowHeight: itemHeight, rowCount: enhancedData.length, rowProps: itemData }));
});
export default React.memo(TreeView);
