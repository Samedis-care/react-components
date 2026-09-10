import React from "react";
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
     * Click event handler
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
     * Entry expanded toggleable?
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
export type TreeViewRendererCallbacks = Pick<TreeViewRendererProps, "onToggleExpanded">;
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
     * The tree renderer
     * @default TreeViewDefaultRenderer
     */
    renderer?: React.ComponentType<TreeViewRendererProps>;
    /**
     * Renderer item height
     */
    rendererItemHeight?: number;
    /**
     * Load children of a specific record
     * @param id The record ID
     */
    onLoadChildren: (id: string) => Promise<void> | void;
}
export interface TreeViewContextType {
    renderer: React.ComponentType<TreeViewRendererProps>;
    rendererProps: TreeViewRendererCallbacks;
    data: TreeDataForRenderer[];
}
export interface TreeViewDispatch {
    scrollTo: (id: string) => void;
}
declare const _default: React.NamedExoticComponent<TreeViewProps & React.RefAttributes<TreeViewDispatch>>;
export default _default;
