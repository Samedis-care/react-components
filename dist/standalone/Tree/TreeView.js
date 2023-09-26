import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, } from "react";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
const enhanceData = (data, loading, parentHasNext, index, depth) => {
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
                parentHasNext,
            },
            ...(entry.children && entry.expanded
                ? (() => {
                    const data = enhanceData(entry.children, loading, [...parentHasNext, hasNext], index, depth + 1);
                    index += data.length;
                    return data;
                })()
                : []),
        ];
    })
        .flat();
};
const buildTreeFromFlat = (data) => {
    const rootNode = data.find((record) => record.parentId === null);
    if (!rootNode) {
        throw new Error("No root node found (set parentId to null for root node)");
    }
    const buildNode = (node) => {
        return {
            ...node,
            children: data
                .filter((record) => record.parentId === node.id)
                .map(buildNode),
        };
    };
    return buildNode(rootNode);
};
const RendererWrapper = (props) => {
    const { index, data, style } = props;
    const { renderer: Renderer, rendererProps, data: itemData } = data;
    return (React.createElement("div", { style: style },
        React.createElement(Renderer, { ...rendererProps, ...itemData[index] })));
};
const TreeView = React.forwardRef(function TreeView(props, ref) {
    const { data, renderer, rendererItemHeight, onLoadChildren, onToggleExpanded, ...rendererProps } = props;
    const listRef = useRef(null);
    const itemHeight = rendererItemHeight ?? 24;
    const [loading, setLoading] = useState([]);
    const enhancedData = useMemo(() => {
        let processingTarget;
        if (Array.isArray(data)) {
            processingTarget = buildTreeFromFlat(data);
        }
        else {
            processingTarget = data;
        }
        return enhanceData([processingTarget], loading, [], 0, 0);
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
        list.scrollToItem(entry.index);
    }, [scrollToId, enhancedData]);
    // ref
    useImperativeHandle(ref, () => ({
        scrollTo: (id) => {
            setScrollToId(id);
        },
    }), []);
    return (React.createElement(AutoSizer, null, ({ width, height }) => (React.createElement(FixedSizeList, { ref: listRef, itemSize: itemHeight, height: height, width: width, itemCount: enhancedData.length, itemData: itemData }, RendererWrapper))));
});
export default React.memo(TreeView);
