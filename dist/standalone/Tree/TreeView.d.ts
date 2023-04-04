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
     * Entry expanded?
     */
    expanded: boolean;
    /**
     * Has the record children?
     * If true and children is not defined lazy load of children may be requested
     */
    hasChildren: boolean;
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
}
export interface TreeViewRendererProps extends TreeDataForRenderer {
    /**
     * Load children of a specific record
     * @param id The record ID
     */
    onLoadChildren: (id: string) => Promise<void> | void;
    /**
     * Toggle the expanded state of the given record
     * @param id The record ID
     */
    onToggleExpanded: (id: string) => void;
}
export declare type TreeViewRendererCallbacks = Pick<TreeViewRendererProps, "onLoadChildren" | "onToggleExpanded">;
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
}
export interface TreeViewContextType {
    renderer: React.ComponentType<TreeViewRendererProps>;
    rendererProps: TreeViewRendererCallbacks;
    data: TreeDataForRenderer[];
}
declare const _default: React.MemoExoticComponent<(props: TreeViewProps) => JSX.Element>;
export default _default;
