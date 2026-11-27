import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { styled } from "@mui/material";
import TreeViewDefaultRenderer from "./TreeViewDefaultRenderer";
import { List, ListImperativeAPI, RowComponentProps } from "react-window";
import { captureError } from "../../framework/ErrorReporting";

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

export type TreeViewRendererCallbacks = Pick<
	TreeViewRendererProps,
	"onToggleExpanded"
>;
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
					siblingIndex: idx,
					siblingCount: data.length,
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

const TreeItem = styled("div")(({ theme }) => ({
	// inside the row: the rows touch each other, and the list clips the first
	// and the last one
	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
	},
}));

const RendererWrapper = (props: RowComponentProps<TreeViewContextType>) => {
	const {
		index,
		style,
		renderer: Renderer,
		rendererProps,
		data: itemData,
		activeIndex,
		registerRow,
	} = props;
	const entry = itemData[index];
	const { onToggleExpanded } = rendererProps;
	const checkable = !!Renderer.checkableLeaves && !entry.hasChildren;

	const ref = useCallback(
		(element: HTMLElement | null) => registerRow(index, element),
		[registerRow, index],
	);

	// Enter (TreeView dispatches a click on the row element) and assistive
	// technology activate the entry. A click on what the renderer draws is the
	// renderer's, and so is a click a pointer made (detail >= 1).
	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			if (event.target !== event.currentTarget || event.detail !== 0) return;
			if (entry.onClick) {
				entry.onClick(event);
				return;
			}
			if (entry.expandLocked || !(entry.hasChildren || checkable)) return;
			onToggleExpanded(entry.id);
		},
		[entry, checkable, onToggleExpanded],
	);

	// a treeitem instead of react-window's listitem (its `ariaAttributes`), whose
	// position and set size count all visible rows instead of the siblings
	return (
		<TreeItem
			ref={ref}
			style={style}
			role="treeitem"
			data-id={entry.id}
			// a roving tabindex: the tree is one tab stop
			tabIndex={index === activeIndex ? 0 : -1}
			onClick={handleClick}
			aria-level={entry.depth + 1}
			aria-posinset={entry.siblingIndex + 1}
			aria-setsize={entry.siblingCount}
			aria-expanded={entry.hasChildren ? entry.expanded : undefined}
			aria-checked={checkable ? entry.expanded : undefined}
		>
			<Renderer {...rendererProps} {...entry} />
		</TreeItem>
	);
};

/**
 * Whether the element uses keys TreeView would otherwise handle: a text field,
 * a select, a slider and the like. The tree's keys leave such a control in a
 * row alone.
 */
const usesOwnKeys = (element: Element) => {
	if (element instanceof HTMLInputElement)
		return !["button", "checkbox", "image", "reset", "submit"].includes(
			element.type,
		);
	return (
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement ||
		(element instanceof HTMLElement && element.isContentEditable) ||
		["slider", "spinbutton", "radio", "combobox", "listbox"].includes(
			element.getAttribute("role") ?? "",
		)
	);
};

/**
 * Whether the element shows a keyboard focus ring, that is it got focus from
 * the keyboard rather than from a click
 */
const isFocusVisible = (element: HTMLElement) => {
	try {
		return element.matches(":focus-visible");
	} catch {
		// a browser without :focus-visible
		return true;
	}
};

interface RowRange {
	startIndex: number;
	stopIndex: number;
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
					try {
						await onLoadChildren(id);
					} catch (e) {
						// nothing was loaded: leave the entry as it is, so that the next
						// toggle loads again
						captureError(e, {
							source: "TreeView.onLoadChildren",
							extra: { id },
						});
						return;
					} finally {
						setLoading((prev) => prev.filter((entry) => entry !== id));
					}
				}
				onToggleExpanded(id);
			})();
		},
		[enhancedData, onLoadChildren, onToggleExpanded],
	);
	const Renderer: TreeViewRenderer = renderer ?? TreeViewDefaultRenderer;

	// keyboard focus: the row of the active entry is the tree's one tab stop (a
	// roving tabindex). It is the row focused last, at first the first row.
	const [active, setActive] = useState<{ id: string; index: number } | null>(
		null,
	);
	const activeIndex = useMemo(() => {
		if (enhancedData.length === 0) return -1;
		if (active === null) return 0;
		if (enhancedData[active.index]?.id === active.id) return active.index;
		const index = enhancedData.findIndex((entry) => entry.id === active.id);
		// gone (removed, or under a collapsed parent): the row in its place
		return index >= 0 ? index : Math.min(active.index, enhancedData.length - 1);
	}, [active, enhancedData]);

	// the rendered rows' elements by index, and the row that is to get focus
	// once it is rendered
	const rowElements = useRef(new Map<number, HTMLElement>());
	const wantedRow = useRef<number | null>(null);
	const focusRow = useCallback((element: HTMLElement) => {
		wantedRow.current = null;
		const doc = element.ownerDocument;
		const focused = doc.activeElement;
		// focus moved on meanwhile, out of the tree
		const list = listRef.current?.element;
		if (focused && focused !== doc.body && !list?.contains(focused)) return;
		element.focus({ preventScroll: true });
	}, []);
	const registerRow = useCallback(
		(index: number, element: HTMLElement | null) => {
			if (!element) {
				rowElements.current.delete(index);
				return;
			}
			rowElements.current.set(index, element);
			if (wantedRow.current === index) focusRow(element);
		},
		[focusRow],
	);
	const rowIndexOf = useCallback((target: EventTarget) => {
		if (!(target instanceof Node)) return -1;
		for (const [index, element] of rowElements.current)
			if (element.contains(target)) return index;
		return -1;
	}, []);

	// the rows react-window renders (with the overscan), and the ones in view
	const [renderedRows, setRenderedRows] = useState<RowRange | null>(null);
	const visibleRows = useRef<RowRange>({ startIndex: 0, stopIndex: 0 });
	const handleRowsRendered = useCallback((visible: RowRange, all: RowRange) => {
		visibleRows.current = visible;
		setRenderedRows((prev) =>
			prev?.startIndex === all.startIndex && prev.stopIndex === all.stopIndex
				? prev
				: all,
		);
	}, []);
	// while the active row is scrolled out of the rendered range, the list is
	// the tab stop and passes focus on to the row
	const activeRendered =
		renderedRows !== null &&
		activeIndex >= renderedRows.startIndex &&
		activeIndex <= renderedRows.stopIndex;

	/**
	 * Makes the row the active one, scrolls it into view and focuses it, at once
	 * or once it is rendered. Until then, the list holds focus.
	 */
	const moveTo = useCallback(
		(index: number) => {
			const entry = enhancedData[index];
			const list = listRef.current;
			if (!entry || !list) return;
			setActive({ id: entry.id, index });
			list.scrollToRow({ index, align: "auto" });
			const element = rowElements.current.get(index);
			if (element) {
				focusRow(element);
				return;
			}
			wantedRow.current = index;
			list.element?.focus({ preventScroll: true });
		},
		[enhancedData, focusRow],
	);

	const handleListFocus = useCallback(
		(event: React.FocusEvent<HTMLElement>) => {
			const index = rowIndexOf(event.target);
			if (index >= 0) {
				// a row or a control in it got focus (the keys, a click): it is the
				// active one
				wantedRow.current = null;
				const id = enhancedData[index]?.id;
				if (id === undefined) return;
				setActive((prev) =>
					prev?.id === id && prev.index === index ? prev : { id, index },
				);
				return;
			}
			if (event.target !== event.currentTarget) return;
			// the list itself, the tab stop while the active row is scrolled away,
			// was reached with Tab or Shift+Tab: the active row takes focus. Not
			// when TreeView focused it (from a row) or a window got focus back
			// (from nothing), nor for a click on its empty part or its scrollbar
			const from = event.relatedTarget;
			if (!(from instanceof Node) || event.currentTarget.contains(from)) return;
			if (!isFocusVisible(event.currentTarget)) return;
			moveTo(activeIndex);
		},
		[rowIndexOf, enhancedData, moveTo, activeIndex],
	);
	// focus left the tree: no row waits for it anymore
	const handleListBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
		const next = event.relatedTarget;
		if (next instanceof Node && !event.currentTarget.contains(next))
			wantedRow.current = null;
	}, []);

	// the keys of the WAI-ARIA tree pattern, see TreeViewProps
	const handleListKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			if (event.defaultPrevented || event.altKey) return;
			const target = event.target;
			if (!(target instanceof Element)) return;
			// the list itself has focus while a row is waited for, and after a click
			// on its empty part: the keys act on the active row
			const onList = target === event.currentTarget;
			const index = onList ? activeIndex : rowIndexOf(target);
			const entry = enhancedData[index];
			if (!entry) return;
			const row = onList ? null : rowElements.current.get(index);
			const onRow = row != null && target === row;
			if (!onList && !onRow && usesOwnKeys(target)) return;
			const checkable = !!Renderer.checkableLeaves && !entry.hasChildren;

			// Enter and Space on a control in the row are the control's
			if (event.key === "Enter") {
				if (!row || !onRow) return;
				event.preventDefault();
				// activates the entry, see RendererWrapper's handleClick
				row.dispatchEvent(
					new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
						ctrlKey: event.ctrlKey,
						shiftKey: event.shiftKey,
						metaKey: event.metaKey,
					}),
				);
				return;
			}
			if (event.key === " ") {
				if (!onRow) return;
				// it would scroll the list
				event.preventDefault();
				if (checkable && !entry.expandLocked) hookOnToggleExpanded(entry.id);
				return;
			}

			if (event.ctrlKey || event.metaKey || event.shiftKey) return;
			const last = enhancedData.length - 1;
			// the rows in view, less one, so that a row of the last page stays in view
			const page = Math.max(
				1,
				visibleRows.current.stopIndex - visibleRows.current.startIndex,
			);
			let next: number | null = null;
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
					if (!entry.hasChildren) break;
					if (!entry.expanded) {
						if (!entry.expandLocked) hookOnToggleExpanded(entry.id);
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
			if (next !== null) moveTo(Math.min(Math.max(next, 0), last));
		},
		[
			activeIndex,
			rowIndexOf,
			enhancedData,
			Renderer,
			hookOnToggleExpanded,
			moveTo,
		],
	);

	const itemData = useMemo(
		(): TreeViewContextType => ({
			renderer: Renderer,
			data: enhancedData,
			rendererProps: {
				...rendererProps,
				onToggleExpanded: hookOnToggleExpanded,
			},
			activeIndex,
			registerRow,
		}),
		[
			Renderer,
			enhancedData,
			rendererProps,
			hookOnToggleExpanded,
			activeIndex,
			registerRow,
		],
	);

	// controlled scrolling: a request waits until its entry is visible and
	// react-window has measured the list, which it does in a ResizeObserver after
	// the first render. Before that it would align the row to a 0px high list.
	const [scrollToId, setScrollToId] = useState<string | null>(null);
	const [measured, setMeasured] = useState(false);
	const handleResize = useCallback((size: { height: number }) => {
		// 0px high: not laid out yet, or hidden (display: none)
		setMeasured(size.height > 0);
	}, []);
	useEffect(() => {
		if (scrollToId === null || !measured) return;
		const list = listRef.current;
		if (!list) return;
		const entry = enhancedData.find((entry) => entry.id === scrollToId);
		if (!entry) return;
		setScrollToId(null);
		list.scrollToRow({ index: entry.index });
	}, [scrollToId, measured, enhancedData]);

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
			// react-window spreads these after its own role="list"
			role="tree"
			aria-multiselectable={Renderer.checkableLeaves || undefined}
			// focusable, to hold focus while a row is waited for; the tab stop only
			// while the active row is scrolled out of the rendered range
			tabIndex={enhancedData.length === 0 ? undefined : activeRendered ? -1 : 0}
			onFocus={handleListFocus}
			onBlur={handleListBlur}
			onKeyDown={handleListKeyDown}
			listRef={listRef}
			rowComponent={RendererWrapper}
			rowHeight={itemHeight}
			rowCount={enhancedData.length}
			rowProps={itemData}
			onResize={handleResize}
			onRowsRendered={handleRowsRendered}
		/>
	);
});

export default React.memo(TreeView);
