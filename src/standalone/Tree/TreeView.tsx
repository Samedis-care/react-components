import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import { List, ListImperativeAPI, RowComponentProps } from "react-window";

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

export type TreeViewRendererCallbacks = Pick<
	TreeViewRendererProps,
	"onToggleExpanded"
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
	/**
	 * Load children of a specific record
	 * @param id The record ID
	 */
	onLoadChildren: (id: string) => Promise<void> | void;
}

const enhanceData = (
	data: TreeData[],
	loading: string[],
	parentHasNext: boolean[],
	index: number,
	depth: number,
): TreeDataForRenderer[] => {
	return data
		.map((entry, idx): TreeDataForRenderer[] => {
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
							const data = enhanceData(
								entry.children,
								loading,
								[...parentHasNext, hasNext],
								index,
								depth + 1,
							);
							index += data.length;
							return data;
						})()
					: []),
			];
		})
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

const RendererWrapper = (props: RowComponentProps<TreeViewContextType>) => {
	const {
		index,
		style,
		ariaAttributes,
		renderer: Renderer,
		rendererProps,
		data: itemData,
	} = props;
	return (
		<div style={style} {...ariaAttributes}>
			<Renderer {...rendererProps} {...itemData[index]} />
		</div>
	);
};

export interface TreeViewDispatch {
	scrollTo: (id: string) => void;
}

const TreeView = React.forwardRef(function TreeView(
	props: TreeViewProps,
	ref: React.ForwardedRef<TreeViewDispatch>,
) {
	const {
		data,
		renderer,
		rendererItemHeight,
		onLoadChildren,
		onToggleExpanded,
		...rendererProps
	} = props;
	const listRef = useRef<ListImperativeAPI>(null);
	const itemHeight = rendererItemHeight ?? 24;
	const [loading, setLoading] = useState<string[]>([]);
	const enhancedData = useMemo((): TreeDataForRenderer[] => {
		let processingTarget: TreeData;
		if (Array.isArray(data)) {
			processingTarget = buildTreeFromFlat(data);
		} else {
			processingTarget = data;
		}
		return enhanceData([processingTarget], loading, [], 0, 0);
	}, [data, loading]);
	const hookOnToggleExpanded = useCallback(
		(id: string) => {
			void (async () => {
				const toggleRecord = enhancedData.find((record) => record.id === id);
				if (
					toggleRecord &&
					toggleRecord.hasChildren &&
					!toggleRecord.childrenLoaded
				) {
					if (toggleRecord.childrenLoading) return;
					setLoading((prev) => [...prev, id]);
					await onLoadChildren(id);
					setLoading((prev) => prev.filter((entry) => entry !== id));
				}
				onToggleExpanded(id);
			})();
		},
		[enhancedData, onLoadChildren, onToggleExpanded],
	);
	const itemData = useMemo(
		(): TreeViewContextType => ({
			renderer: renderer ?? TreeViewDefaultRenderer,
			data: enhancedData,
			rendererProps: {
				...rendererProps,
				onToggleExpanded: hookOnToggleExpanded,
			},
		}),
		[renderer, enhancedData, rendererProps, hookOnToggleExpanded],
	);

	// controlled scrolling
	const [scrollToId, setScrollToId] = useState<string | null>(null);
	useEffect(() => {
		if (!scrollToId) return;
		const list = listRef.current;
		if (!list) return;
		setScrollToId(null);
		const entry = enhancedData.find((entry) => entry.id === scrollToId);
		if (!entry) return;
		list.scrollToRow({ index: entry.index });
	}, [scrollToId, enhancedData]);

	// ref
	useImperativeHandle(
		ref,
		() => ({
			scrollTo: (id: string) => {
				setScrollToId(id);
			},
		}),
		[],
	);

	return (
		<List<TreeViewContextType>
			listRef={listRef}
			rowComponent={RendererWrapper}
			rowHeight={itemHeight}
			rowCount={enhancedData.length}
			rowProps={itemData}
		/>
	);
});

export default React.memo(TreeView);
