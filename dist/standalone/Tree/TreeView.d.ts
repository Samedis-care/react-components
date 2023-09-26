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
     * List of parent hasNext flags. Elements contained start at root node.
     */
    parentHasNext: boolean[];
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
export declare type TreeViewRendererCallbacks = Pick<TreeViewRendererProps, "onToggleExpanded">;
export interface TreeViewProps extends TreeViewRendererCallbacks {
    /**
     * The tree view root node
     */
    data: TreeData | TreeDataFlat[];
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
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<TreeViewProps & React.RefAttributes<TreeViewDispatch>>>;
export default _default;
