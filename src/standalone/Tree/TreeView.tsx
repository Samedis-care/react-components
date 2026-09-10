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

export type TreeViewRendererCallbacks = Pick<
	TreeViewRendererProps,
	"onToggleExpanded"
>;
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

const enhanceData = (
	data: TreeData[],
	loading: string[],
	ancestorLanes: boolean[],
	index: number,
	depth: number,
	forest: boolean,
): TreeDataForRenderer[] => {
	// the root level of a single root tree has no spine: the lone root has no sibling
	// to connect to, so descending past it must not open a lane. Every other level
	// does, and so does the root level of a forest, whose roots are siblings.
	const levelHasSpine = forest || depth !== 0;
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
					ancestorLanes,
					hasConnector: levelHasSpine,
				},
				...(entry.children && entry.expanded
					? (() => {
							const data = enhanceData(
								entry.children,
								loading,
								levelHasSpine ? [...ancestorLanes, hasNext] : ancestorLanes,
								index,
								depth + 1,
								forest,
							);
							index += data.length;
							return data;
						})()
					: []),
			];
		})
		.flat();
};

const buildTreeFromFlat = (data: TreeDataFlat[]): TreeData[] => {
	const roots = data.filter((record) => record.parentId === null);
	if (roots.length === 0) {
		throw new Error("No root node found (set parentId to null for root node)");
	}
	const childrenByParent = new Map<string, TreeDataFlat[]>();
	data.forEach((record) => {
		const parentId = record.parentId;
		if (parentId === null) return;
		const siblings = childrenByParent.get(parentId);
		if (siblings) siblings.push(record);
		else childrenByParent.set(parentId, [record]);
	});
	if (process.env.NODE_ENV === "development") {
		const ids = new Set(data.map((record) => record.id));
		const unknownParents = Array.from(childrenByParent.keys()).filter(
			(parentId) => !ids.has(parentId),
		);
		if (unknownParents.length > 0) {
			// orphans are unreachable from any root, so they simply never render
			// eslint-disable-next-line no-console
			console.warn(
				"[Components-Care] [TreeView] Dropping entries whose parentId is not present in data. Unknown parent IDs:",
				unknownParents,
			);
		}
	}
	const buildNode = (node: TreeDataFlat, ancestors: Set<string>): TreeData => {
		const withSelf = new Set(ancestors).add(node.id);
		return {
			...node,
			children: (childrenByParent.get(node.id) ?? [])
				.filter((child) => {
					// a node that is its own (grand)parent would recurse forever
					if (!withSelf.has(child.id)) return true;
					if (process.env.NODE_ENV === "development") {
						// eslint-disable-next-line no-console
						console.warn(
							`[Components-Care] [TreeView] Dropping cyclic parent-child relation ${node.id} -> ${child.id}`,
						);
					}
					return false;
				})
				.map((child) => buildNode(child, withSelf)),
		};
	};
	return roots.map((root) => buildNode(root, new Set<string>()));
};

const isFlatEntry = (entry: TreeData | TreeDataFlat): entry is TreeDataFlat =>
	"parentId" in entry;

/**
 * Normalizes the data prop into the list of root nodes
 * @param data The data prop
 * @returns The root nodes, in the order they were passed in
 */
const getRoots = (data: TreeViewProps["data"]): TreeData[] => {
	if (!Array.isArray(data)) return [data];
	const entries: (TreeData | TreeDataFlat)[] = data;
	if (entries.length === 0) return [];
	const flat = entries.filter(isFlatEntry);
	if (flat.length === entries.length) return buildTreeFromFlat(flat);
	if (flat.length !== 0) {
		throw new Error(
			"Mixed tree data: pass either nested (TreeData) or flat (TreeDataFlat, with parentId) entries, not both",
		);
	}
	return entries;
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
		const roots = getRoots(data);
		return enhanceData(roots, loading, [], 0, 0, roots.length > 1);
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
