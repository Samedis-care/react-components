import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { styled } from "@mui/material";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import { List } from "react-window";
import { captureError } from "../../framework/ErrorReporting";
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
                siblingIndex: idx,
                siblingCount: data.length,
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
/**
 * The React key of each row: its entry's id, preceded by the number of rows
 * above with the same id, so that duplicate ids still get keys of their own
 * @param rows The rows, in display order
 * @returns The keys, by row index
 */
const getRowKeys = (rows) => {
    const seen = new Map();
    return rows.map(({ id }) => {
        const count = seen.get(id) ?? 0;
        seen.set(id, count + 1);
        return `${count}:${id}`;
    });
};
// the list element, for the caller's sx
const TreeList = styled((List))({});
const TreeItem = styled("div")(({ theme }) => ({
    // inside the row: the rows touch each other, and the list clips the first
    // and the last one
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
const RendererWrapper = (props) => {
    const { index, style, renderer: Renderer, rendererProps, data: itemData, activeIndex, registerRow, } = props;
    const entry = itemData[index];
    const { onToggleExpanded } = rendererProps;
    const checkable = !!Renderer.checkableLeaves && !entry.hasChildren;
    const ref = useCallback((element) => registerRow(index, element), [registerRow, index]);
    // Enter (TreeView dispatches a click on the row element) and assistive
    // technology activate the entry. A click on what the renderer draws is the
    // renderer's, and so is a click a pointer made (detail >= 1).
    const handleClick = useCallback((event) => {
        if (event.target !== event.currentTarget || event.detail !== 0)
            return;
        if (entry.onClick) {
            entry.onClick(event);
            return;
        }
        if (entry.expandLocked || !(entry.hasChildren || checkable))
            return;
        onToggleExpanded(entry.id);
    }, [entry, checkable, onToggleExpanded]);
    // a treeitem instead of react-window's listitem (its `ariaAttributes`), whose
    // position and set size count all visible rows instead of the siblings
    return (_jsx(TreeItem, { ref: ref, style: style, role: "treeitem", "data-id": entry.id, 
        // a roving tabindex: the tree is one tab stop
        tabIndex: index === activeIndex ? 0 : -1, onClick: handleClick, "aria-level": entry.depth + 1, "aria-posinset": entry.siblingIndex + 1, "aria-setsize": entry.siblingCount, "aria-expanded": entry.hasChildren ? entry.expanded : undefined, "aria-checked": checkable ? entry.expanded : undefined, children: _jsx(Renderer, { ...rendererProps, ...entry }) }));
};
/**
 * Whether the element uses keys TreeView would otherwise handle: a text field,
 * a select, a slider and the like. The tree's keys leave such a control in a
 * row alone.
 */
const usesOwnKeys = (element) => {
    if (element instanceof HTMLInputElement)
        return !["button", "checkbox", "image", "reset", "submit"].includes(element.type);
    return (element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement ||
        (element instanceof HTMLElement && element.isContentEditable) ||
        ["slider", "spinbutton", "radio", "combobox", "listbox"].includes(element.getAttribute("role") ?? ""));
};
/**
 * Whether the element shows a keyboard focus ring, that is it got focus from
 * the keyboard rather than from a click
 */
const isFocusVisible = (element) => {
    try {
        return element.matches(":focus-visible");
    }
    catch {
        // a browser without :focus-visible
        return true;
    }
};
const TreeView = React.forwardRef(function TreeView(props, ref) {
    const { data, renderer, rendererItemHeight, onLoadChildren, onToggleExpanded, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, id, className, sx, } = props;
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
                try {
                    await onLoadChildren(id);
                }
                catch (e) {
                    // nothing was loaded: leave the entry as it is, so that the next
                    // toggle loads again
                    captureError(e, {
                        source: "TreeView.onLoadChildren",
                        extra: { id },
                    });
                    return;
                }
                finally {
                    setLoading((prev) => prev.filter((entry) => entry !== id));
                }
            }
            onToggleExpanded(id);
        })();
    }, [enhancedData, onLoadChildren, onToggleExpanded]);
    const Renderer = renderer ?? TreeViewDefaultRenderer;
    // keyboard focus: the row of the active entry is the tree's one tab stop (a
    // roving tabindex). It is the row focused last, at first the first row.
    const [active, setActive] = useState(null);
    const activeIndex = useMemo(() => {
        if (enhancedData.length === 0)
            return -1;
        if (active === null)
            return 0;
        if (enhancedData[active.index]?.id === active.id)
            return active.index;
        const index = enhancedData.findIndex((entry) => entry.id === active.id);
        // gone (removed, or under a collapsed parent): the row in its place
        return index >= 0 ? index : Math.min(active.index, enhancedData.length - 1);
    }, [active, enhancedData]);
    // the rendered rows' elements by index, and the row that is to get focus
    // once it is rendered
    const rowElements = useRef(new Map());
    const wantedRow = useRef(null);
    // set while a commit takes a row that holds focus away from its index: it
    // unmounts, or it moves to another index
    const focusedRowDetached = useRef(false);
    const focusRow = useCallback((element) => {
        wantedRow.current = null;
        const doc = element.ownerDocument;
        const focused = doc.activeElement;
        // focus moved on meanwhile, out of the tree
        const list = listRef.current?.element;
        if (focused && focused !== doc.body && !list?.contains(focused))
            return;
        element.focus({ preventScroll: true });
    }, []);
    const registerRow = useCallback((index, element) => {
        if (!element) {
            const row = rowElements.current.get(index);
            if (row?.contains(row.ownerDocument.activeElement))
                focusedRowDetached.current = true;
            rowElements.current.delete(index);
            return;
        }
        rowElements.current.set(index, element);
        if (wantedRow.current === index)
            focusRow(element);
    }, [focusRow]);
    const rowIndexOf = useCallback((target) => {
        if (!(target instanceof Node))
            return -1;
        for (const [index, element] of rowElements.current)
            if (element.contains(target))
                return index;
        return -1;
    }, []);
    // the rows react-window renders (with the overscan), and the ones in view
    const [renderedRows, setRenderedRows] = useState(null);
    const visibleRows = useRef({ startIndex: 0, stopIndex: 0 });
    const handleRowsRendered = useCallback((visible, all) => {
        visibleRows.current = visible;
        setRenderedRows((prev) => prev?.startIndex === all.startIndex && prev.stopIndex === all.stopIndex
            ? prev
            : all);
    }, []);
    // while the active row is scrolled out of the rendered range, the list is
    // the tab stop and passes focus on to the row
    const activeRendered = renderedRows !== null &&
        activeIndex >= renderedRows.startIndex &&
        activeIndex <= renderedRows.stopIndex;
    /**
     * Makes the row the active one, scrolls it into view and focuses it, at once
     * or once it is rendered. Until then, the list holds focus.
     */
    const moveTo = useCallback((index) => {
        const entry = enhancedData[index];
        const list = listRef.current;
        if (!entry || !list)
            return;
        setActive({ id: entry.id, index });
        list.scrollToRow({ index, align: "auto" });
        const element = rowElements.current.get(index);
        if (element) {
            focusRow(element);
            return;
        }
        wantedRow.current = index;
        list.element?.focus({ preventScroll: true });
    }, [enhancedData, focusRow]);
    // The rows are keyed by entry, so a row that holds focus stays mounted when
    // rows are inserted or removed above it. It unmounts when an update hides or
    // removes its entry, or moves it past the last row react-window rendered
    // before: react-window renders the rows of a longer list one commit later.
    // Focus then goes to the active row, the same entry at its new index or the
    // row in its place, rather than to the page. A row the user scrolls away
    // unmounts without a change of the rows, and is left alone here.
    useLayoutEffect(() => {
        if (!focusedRowDetached.current)
            return;
        const doc = listRef.current?.element?.ownerDocument;
        if (!doc || (doc.activeElement && doc.activeElement !== doc.body))
            return;
        moveTo(activeIndex);
    }, [enhancedData, activeIndex, moveTo]);
    useLayoutEffect(() => {
        focusedRowDetached.current = false;
    });
    const handleListFocus = useCallback((event) => {
        const index = rowIndexOf(event.target);
        if (index >= 0) {
            // a row or a control in it got focus (the keys, a click): it is the
            // active one
            wantedRow.current = null;
            const id = enhancedData[index]?.id;
            if (id === undefined)
                return;
            setActive((prev) => prev?.id === id && prev.index === index ? prev : { id, index });
            return;
        }
        if (event.target !== event.currentTarget)
            return;
        // the list itself, the tab stop while the active row is scrolled away,
        // was reached with Tab or Shift+Tab: the active row takes focus. Not
        // when TreeView focused it (from a row) or a window got focus back
        // (from nothing), nor for a click on its empty part or its scrollbar
        const from = event.relatedTarget;
        if (!(from instanceof Node) || event.currentTarget.contains(from))
            return;
        if (!isFocusVisible(event.currentTarget))
            return;
        moveTo(activeIndex);
    }, [rowIndexOf, enhancedData, moveTo, activeIndex]);
    // focus left the tree: no row waits for it anymore
    const handleListBlur = useCallback((event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && !event.currentTarget.contains(next))
            wantedRow.current = null;
    }, []);
    // the keys of the WAI-ARIA tree pattern, see TreeViewProps
    const handleListKeyDown = useCallback((event) => {
        if (event.defaultPrevented || event.altKey)
            return;
        const target = event.target;
        if (!(target instanceof Element))
            return;
        // the list itself has focus while a row is waited for, and after a click
        // on its empty part: the keys act on the active row
        const onList = target === event.currentTarget;
        const index = onList ? activeIndex : rowIndexOf(target);
        const entry = enhancedData[index];
        if (!entry)
            return;
        const row = onList ? null : rowElements.current.get(index);
        const onRow = row != null && target === row;
        if (!onList && !onRow && usesOwnKeys(target))
            return;
        const checkable = !!Renderer.checkableLeaves && !entry.hasChildren;
        // Enter and Space on a control in the row are the control's
        if (event.key === "Enter") {
            if (!row || !onRow)
                return;
            event.preventDefault();
            // activates the entry, see RendererWrapper's handleClick
            row.dispatchEvent(new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                metaKey: event.metaKey,
            }));
            return;
        }
        if (event.key === " ") {
            if (!onRow)
                return;
            // it would scroll the list
            event.preventDefault();
            if (checkable && !entry.expandLocked)
                hookOnToggleExpanded(entry.id);
            return;
        }
        if (event.ctrlKey || event.metaKey || event.shiftKey)
            return;
        const last = enhancedData.length - 1;
        // the rows in view, less one, so that a row of the last page stays in view
        const page = Math.max(1, visibleRows.current.stopIndex - visibleRows.current.startIndex);
        let next = null;
        switch (event.key) {
            case "ArrowDown":
                next = index + 1;
                break;
            case "ArrowUp":
                next = index - 1;
                break;
            case "PageDown":
                next = index + page;
                break;
            case "PageUp":
                next = index - page;
                break;
            case "Home":
                next = 0;
                break;
            case "End":
                next = last;
                break;
            case "ArrowRight":
                if (!entry.hasChildren)
                    break;
                if (!entry.expanded) {
                    if (!entry.expandLocked)
                        hookOnToggleExpanded(entry.id);
                    break;
                }
                // the first child, if it is shown
                if (enhancedData[index + 1]?.depth === entry.depth + 1)
                    next = index + 1;
                break;
            case "ArrowLeft":
                if (entry.hasChildren && entry.expanded && !entry.expandLocked) {
                    hookOnToggleExpanded(entry.id);
                    break;
                }
                // the parent: the closest row above that is one level up
                for (let i = index - 1; i >= 0 && entry.depth > 0; i--) {
                    if (enhancedData[i].depth === entry.depth - 1) {
                        next = i;
                        break;
                    }
                }
                break;
            default:
                return;
        }
        // the keys move focus between the rows, they don't scroll the list
        event.preventDefault();
        if (next !== null)
            moveTo(Math.min(Math.max(next, 0), last));
    }, [
        activeIndex,
        rowIndexOf,
        enhancedData,
        Renderer,
        hookOnToggleExpanded,
        moveTo,
    ]);
    const itemData = useMemo(() => ({
        renderer: Renderer,
        data: enhancedData,
        rendererProps: { onToggleExpanded: hookOnToggleExpanded },
        activeIndex,
        registerRow,
    }), [Renderer, enhancedData, hookOnToggleExpanded, activeIndex, registerRow]);
    // rows keyed by their entry, not by their index: when rows are inserted or
    // removed above, focus and a renderer's state stay with their entry
    const rowKeys = useMemo(() => getRowKeys(enhancedData), [enhancedData]);
    const rowKey = useCallback((index) => rowKeys[index], [rowKeys]);
    // controlled scrolling: a request waits until its entry is visible and
    // react-window has measured the list, which it does in a ResizeObserver after
    // the first render. Before that it would align the row to a 0px high list.
    const [scrollToId, setScrollToId] = useState(null);
    const [measured, setMeasured] = useState(false);
    const handleResize = useCallback((size) => {
        // 0px high: not laid out yet, or hidden (display: none)
        setMeasured(size.height > 0);
    }, []);
    useEffect(() => {
        if (scrollToId === null || !measured)
            return;
        const list = listRef.current;
        if (!list)
            return;
        const entry = enhancedData.find((entry) => entry.id === scrollToId);
        if (!entry)
            return;
        setScrollToId(null);
        list.scrollToRow({ index: entry.index });
    }, [scrollToId, measured, enhancedData]);
    // ref
    useImperativeHandle(ref, () => ({
        scrollTo: (id) => {
            setScrollToId(id);
        },
    }), []);
    return (_jsx(TreeList, { id: id, className: className, sx: sx, 
        // react-window spreads these after its own role="list"
        role: "tree", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, "aria-multiselectable": Renderer.checkableLeaves || undefined, 
        // focusable, to hold focus while a row is waited for; the tab stop only
        // while the active row is scrolled out of the rendered range
        tabIndex: enhancedData.length === 0 ? undefined : activeRendered ? -1 : 0, onFocus: handleListFocus, onBlur: handleListBlur, onKeyDown: handleListKeyDown, listRef: listRef, rowComponent: RendererWrapper, rowHeight: itemHeight, rowCount: enhancedData.length, rowProps: itemData, rowKey: rowKey, onResize: handleResize, onRowsRendered: handleRowsRendered }));
});
export default React.memo(TreeView);
