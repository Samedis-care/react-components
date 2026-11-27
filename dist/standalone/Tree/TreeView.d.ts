import React from "react";
import { SxProps, Theme } from "@mui/material";
export interface TreeData {
    /**
     * Unique record id
     */
    id: string;
    /**
     * The icon of the entry
     */
    icon: React.ReactNode;
    /**
     * The label of the entry
     */
    label: string;
    /**
     * Called when the user activates the entry. The built-in renderers call it
     * for a click on the icon or the label.
     *
     * Enter on the entry's focused row calls it too, with a click event that
     * TreeView dispatches on the row element (`role="treeitem"`, the event's
     * `currentTarget`), which carries the entry's id in `data-id`. The event's
     * `detail` is 0, and its `ctrlKey`, `shiftKey` and `metaKey` are those of
     * the key press. A click that assistive technology sends to the row element
     * calls it the same way.
     */
    onClick?: React.MouseEventHandler;
    /**
     * Aux click handler
     */
    onAuxClick?: React.MouseEventHandler;
    /**
     * Entry expanded?
     */
    expanded: boolean;
    /**
     * When true, the user cannot expand or collapse the entry, nor select a leaf
     * whose checkbox shows `expanded` (`TreeViewCheckboxSelectionRenderer`). The
     * keys TreeView handles leave it alone; for clicks, the renderer has to check
     * it, as the built-in ones do.
     * @default false
     */
    expandLocked?: boolean;
    /**
     * Has the record children?
     * If true and children is not defined lazy load of children may be requested
     */
    hasChildren: boolean;
    /**
     * Mark this entry as focused
     */
    focus?: boolean;
    /**
     * Tree view children. May be null to support lazy load
     */
    children?: TreeData[] | null;
}
export interface TreeDataFlat extends Omit<TreeData, "children"> {
    /**
     * The parent record ID (or null for root node)
     */
    parentId: string | null;
    /**
     * Optional: all parent IDs for eager load in case the data is needed
     */
    parentIds?: string[];
}
export interface TreeDataForRenderer extends Omit<TreeData, "children"> {
    /**
     * The list offset
     */
    index: number;
    /**
     * The depth of the entry
     */
    depth: number;
    /**
     * Has previous entry on the same depth
     */
    hasPrev: boolean;
    /**
     * Has another entry on the same depth
     */
    hasNext: boolean;
    /**
     * The position of the entry among its siblings (the children of its parent,
     * or the roots), starting at 0. TreeView sets `aria-posinset` from it.
     */
    siblingIndex: number;
    /**
     * The number of siblings, the entry included. TreeView sets `aria-setsize`
     * from it.
     */
    siblingCount: number;
    /**
     * The vertical connector lanes to draw in front of this entry, outermost first.
     * Draw one lane per element; a `true` element means a spine passes through this
     * row at that lane and gets a vertical line, a `false` one means the lane stays
     * blank and only reserves the indent.
     *
     * A set of siblings shares one spine, and that spine sits one lane in front of
     * the siblings themselves — which is the lane {@link hasConnector} draws. So the
     * lanes here belong to the ancestors that still have a following sibling below
     * this row. Length is `depth - 1` in a single root tree and `depth` in a forest,
     * where the roots have a spine of their own.
     */
    ancestorLanes: boolean[];
    /**
     * Does this entry sit on a sibling spine, i.e. should the renderer draw the
     * connector (the elbow joining this row to its siblings) in front of it?
     *
     * True for every entry that has a parent, and for root entries of a forest,
     * which are siblings of each other. False only for the lone root of a
     * single root tree, which has no spine to join.
     */
    hasConnector: boolean;
    /**
     * Are children currently being loaded?
     */
    childrenLoading: boolean;
    /**
     * Are children loaded or is a call to onLoadChildren required
     */
    childrenLoaded: boolean;
}
export interface TreeViewRendererProps extends TreeDataForRenderer {
    /**
     * Toggle the expanded state of the given record
     * @param id The record ID
     */
    onToggleExpanded: (id: string) => void;
}
/**
 * A component that draws the content of one TreeView row.
 *
 * TreeView wraps each row in its own `treeitem` element, which carries the
 * entry's level, position among its siblings and, for an entry with
 * `hasChildren`, its expanded state. The renderer draws only what is inside
 * that element and must not add tree roles of its own.
 *
 * That element is also the row's keyboard focus target, and TreeView handles
 * the tree's keys on it (see {@link TreeViewProps}). So a renderer's own
 * controls should stay out of the Tab order (`tabIndex={-1}`), as
 * `TreeViewCheckboxSelectionRenderer`'s checkboxes do. The arrow, Home, End
 * and page keys also work while such a control has focus, unless it is a text
 * field or another control that uses them itself; Enter and Space are left to
 * the control.
 *
 * TreeView keys the rows by the entry's `id`, so a renderer instance keeps
 * its state when an update inserts or removes rows above its entry. As in any
 * virtualized list, an instance unmounts when its row leaves the rendered
 * range, and starts with fresh state when the row is rendered again. That
 * includes a row that an update pushes past the last rendered row: the list
 * renders the rows it gained one commit later.
 */
export type TreeViewRenderer = React.ComponentType<TreeViewRendererProps> & {
    /**
     * Set as a static property on a renderer whose leaves (entries without
     * `hasChildren`) are selected with a checkbox that shows the leaf's
     * `expanded` flag, as `TreeViewCheckboxSelectionRenderer` does. TreeView then
     * marks the tree `aria-multiselectable` and gives every leaf's `treeitem`
     * `aria-checked` with that flag.
     * @default false
     */
    checkableLeaves?: boolean;
};
export type TreeViewRendererCallbacks = Pick<TreeViewRendererProps, "onToggleExpanded">;
/**
 * Props of {@link TreeView}.
 *
 * The tree is one tab stop, and its keys follow the WAI-ARIA Authoring
 * Practices tree pattern. Only one row is in the Tab order: the row focused
 * last, at first the first row. While that row is scrolled out of the rendered
 * range, the list element takes its place, and Tab into it focuses the row.
 * On a focused row:
 *
 * - ArrowDown and ArrowUp move focus to the next and the previous row, PageDown
 *   and PageUp by the rows in view, Home and End to the first and the last row.
 *   The list scrolls the focused row into view.
 * - ArrowRight expands a collapsed entry with `hasChildren` (through
 *   `onLoadChildren` first, where its children are not in `data`), and moves
 *   from an expanded one to its first child.
 * - ArrowLeft collapses an expanded entry, and moves from any other entry to
 *   its parent.
 * - Enter activates the entry: it calls the entry's `onClick` (see
 *   {@link TreeData.onClick}), and without one expands or collapses an entry
 *   with `hasChildren`, or selects or deselects a leaf of a renderer with
 *   `checkableLeaves`.
 * - Space selects or deselects a leaf of a renderer with `checkableLeaves`,
 *   such as `TreeViewCheckboxSelectionRenderer`.
 *
 * None of them expands, collapses or selects an entry with `expandLocked`.
 * Expanding, collapsing, selecting and deselecting call `onToggleExpanded`.
 *
 * Focus stays with its entry when an update to `data` inserts or removes rows
 * above it. When an update removes the focused entry, or hides it under a
 * collapsed ancestor, focus moves to the row in its place.
 */
export interface TreeViewProps extends TreeViewRendererCallbacks {
    /**
     * The tree view contents: a single root node or a forest of them.
     *
     * Nested (`TreeData`, `TreeData[]`) and flat (`TreeDataFlat[]`) input are both
     * accepted, but an array must not mix the two forms. In flat input every entry
     * with `parentId === null` is a root.
     *
     * Roots render in the order they are given, as do the children of a node, so the
     * caller controls the display order. An empty array renders an empty tree.
     *
     * A forest indents by one extra lane compared to a single root tree: its roots
     * are siblings and get a spine of their own. See {@link TreeDataForRenderer.ancestorLanes}.
     */
    data: TreeData | TreeData[] | TreeDataFlat[];
    /**
     * The tree renderer, see {@link TreeViewRenderer}
     * @default TreeViewDefaultRenderer
     */
    renderer?: TreeViewRenderer;
    /**
     * Renderer item height
     */
    rendererItemHeight?: number;
    /**
     * Loads the children of the given record. TreeView calls it when the user
     * toggles an entry that has `hasChildren` and no children in `data`, marks
     * the entry `childrenLoading` until the load ends, and calls
     * `onToggleExpanded(id)` once it succeeded. Add the children to `data`
     * before the returned promise resolves.
     *
     * If it throws or its promise rejects, TreeView ends the entry's loading
     * state without toggling it, so the next toggle loads again, and passes the
     * error to the error reporter (see `configureErrorReporting`, source
     * `"TreeView.onLoadChildren"`). It shows the user nothing: to tell them,
     * show the error yourself, then rethrow it to keep the entry collapsed.
     * @param id The record ID
     * @returns A promise that resolves once the children are in `data`, or
     * nothing for a synchronous load
     */
    onLoadChildren: (id: string) => Promise<void> | void;
    /**
     * The tree's accessible name, set as `aria-label` on the list element
     * (`role="tree"`). A tree needs a name: pass this, or `aria-labelledby`
     * where a visible heading or label names the tree.
     * @default undefined (no name)
     */
    "aria-label"?: string;
    /**
     * The id of the element that names the tree, such as its visible heading,
     * or several ids separated by spaces. Set as `aria-labelledby` on the list
     * element; it takes precedence over `aria-label`.
     * @default undefined
     */
    "aria-labelledby"?: string;
    /**
     * The id of the element that describes the tree, such as a help text, or
     * several ids separated by spaces. Set as `aria-describedby` on the list
     * element.
     * @default undefined
     */
    "aria-describedby"?: string;
    /**
     * The id of the list element (`role="tree"`)
     * @default undefined
     */
    id?: string;
    /**
     * A class name for the list element (`role="tree"`), the scroll container
     * that holds the rows
     * @default undefined
     */
    className?: string;
    /**
     * Styles for the list element (`role="tree"`), the scroll container that
     * holds the rows. See MUI's `sx` prop.
     * @default undefined
     */
    sx?: SxProps<Theme>;
}
export interface TreeViewContextType {
    renderer: TreeViewRenderer;
    rendererProps: TreeViewRendererCallbacks;
    data: TreeDataForRenderer[];
    /**
     * The index of the row that is the tree's tab stop, -1 without rows
     */
    activeIndex: number;
    /**
     * Called with a row's element once it is rendered, and with null when it
     * is unrendered
     */
    registerRow: (index: number, element: HTMLElement | null) => void;
}
/**
 * Imperative handle of {@link TreeView}, received through its `ref`
 */
export interface TreeViewDispatch {
    /**
     * Scrolls the list until the row of the given entry is in view, with the
     * smallest scroll that gets it there (react-window's `align: "auto"`).
     *
     * The request waits until the entry is visible, that is in `data` and not
     * under a collapsed ancestor, and until the list is on screen and has been
     * measured. So it can be made right after TreeView mounted, while the
     * entry's data is still loading, or before its ancestors are expanded. It
     * scrolls once; a later call replaces a request that is still waiting.
     * @param id The record ID
     */
    scrollTo: (id: string) => void;
}
declare const _default: React.NamedExoticComponent<TreeViewProps & React.RefAttributes<TreeViewDispatch>>;
export default _default;
