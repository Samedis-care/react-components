import React, { useMemo } from "react";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from "react-window";

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

export type TreeViewRendererCallbacks = Pick<
	TreeViewRendererProps,
	"onLoadChildren" | "onToggleExpanded"
>;
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

const enhanceData = (
	data: TreeData[],
	index: number,
	depth: number
): TreeDataForRenderer[] => {
	return data
		.map((entry): TreeDataForRenderer[] => [
			{
				...entry,
				index: index++,
				depth: depth,
			},
			...(entry.children && entry.expanded
				? (() => {
						const data = enhanceData(entry.children, index, depth + 1);
						index += data.length;
						return data;
				  })()
				: []),
		])
		.flat();
};

const buildTreeFromFlat = (data: TreeDataFlat[]): TreeData => {
	const rootNode = data.find((record) => record.parentId === null);
	if (!rootNode) {
		throw new Error("No root node found (set parentId to null for root node)");
	}
	const buildNode = (node: TreeDataFlat): TreeData => {
		return {
			...node,
			children: data
				.filter((record) => record.parentId === node.id)
				.map(buildNode),
		};
	};
	return buildNode(rootNode);
};

export interface TreeViewContextType {
	renderer: React.ComponentType<TreeViewRendererProps>;
	rendererProps: TreeViewRendererCallbacks;
	data: TreeDataForRenderer[];
}

const RendererWrapper = (
	props: ListChildComponentProps<TreeViewContextType>
) => {
	const { index, data, style } = props;
	const { renderer: Renderer, rendererProps, data: itemData } = data;
	return (
		<div style={style}>
			<Renderer {...rendererProps} {...itemData[index]} />
		</div>
	);
};

const TreeView = (props: TreeViewProps) => {
	const { data, renderer, rendererItemHeight, ...rendererProps } = props;
	const itemHeight = rendererItemHeight ?? 24;
	const enhancedData = useMemo((): TreeDataForRenderer[] => {
		let processingTarget: TreeData;
		if (Array.isArray(data)) {
			processingTarget = buildTreeFromFlat(data);
		} else {
			processingTarget = data;
		}
		return enhanceData([processingTarget], 0, 0);
	}, [data]);
	const itemData = useMemo(
		(): TreeViewContextType => ({
			renderer: renderer ?? TreeViewDefaultRenderer,
			data: enhancedData,
			rendererProps,
		}),
		[renderer, enhancedData, rendererProps]
	);

	return (
		<AutoSizer>
			{({ width, height }) => (
				<FixedSizeList
					itemSize={itemHeight}
					height={height}
					width={width}
					itemCount={enhancedData.length}
					itemData={itemData}
				>
					{RendererWrapper}
				</FixedSizeList>
			)}
		</AutoSizer>
	);
};

export default React.memo(TreeView);
