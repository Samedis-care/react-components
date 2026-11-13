import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import TreeView from "../../src/standalone/Tree/TreeView";
import TreeViewCheckboxSelectionRenderer from "../../src/standalone/Tree/TreeViewCheckboxSelectionRenderer";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";
import type {
	TreeData,
	TreeDataFlat,
	TreeViewDispatch,
	TreeViewRendererProps,
} from "../../src/standalone/Tree/TreeView";

// react-window List uses ResizeObserver — must be a real class constructor
beforeAll(() => {
	class ResizeObserverStub {
		private readonly callback: ResizeObserverCallback;
		constructor(callback: ResizeObserverCallback) {
			this.callback = callback;
		}
		observe(target: Element) {
			// react-window measures its viewport through the observer, and jsdom reports
			// zero for everything — without a size it virtualizes all but the first few
			// rows out of the DOM. Row elements are measured by a second observer that
			// reads different fields, so only report for the list itself.
			if (target.hasAttribute("data-react-window-index")) return;
			this.callback(
				[
					{
						target,
						contentRect: { height: 1000, width: 500 },
					} as unknown as ResizeObserverEntry,
				],
				this,
			);
		}
		unobserve = vi.fn();
		disconnect = vi.fn();
	}
	globalThis.ResizeObserver = ResizeObserverStub;
});

// ─── Sample data ──────────────────────────────────────────────────────────────

const SIMPLE_TREE: TreeData = {
	id: "root",
	label: "Root",
	icon: null,
	hasChildren: true,
	expanded: true,
	children: [
		{
			id: "child-1",
			label: "Child 1",
			icon: null,
			hasChildren: false,
			expanded: false,
		},
		{
			id: "child-2",
			label: "Child 2",
			icon: null,
			hasChildren: true,
			expanded: true,
			children: [
				{
					id: "grandchild-1",
					label: "Grandchild 1",
					icon: null,
					hasChildren: false,
					expanded: false,
				},
			],
		},
	],
};

const COLLAPSED_TREE: TreeData = {
	id: "root",
	label: "Root",
	icon: null,
	hasChildren: true,
	expanded: false,
	children: [
		{
			id: "child-1",
			label: "Child 1",
			icon: null,
			hasChildren: false,
			expanded: false,
		},
	],
};

const FLAT_DATA: TreeDataFlat[] = [
	{
		id: "root",
		label: "Root",
		icon: null,
		hasChildren: true,
		expanded: true,
		parentId: null,
	},
	{
		id: "a",
		label: "Node A",
		icon: null,
		hasChildren: false,
		expanded: false,
		parentId: "root",
	},
	{
		id: "b",
		label: "Node B",
		icon: null,
		hasChildren: false,
		expanded: false,
		parentId: "root",
	},
];

/**
 * Two roots, the first one with a nested child, the second one lazy (children not
 * loaded yet). Roots are deliberately not adjacent in input order, so that a build
 * that reparents entries shows up.
 */
const FOREST_FLAT: TreeDataFlat[] = [
	{
		id: "root-a",
		label: "Root A",
		icon: null,
		hasChildren: true,
		expanded: true,
		parentId: null,
	},
	{
		id: "a-1",
		label: "A 1",
		icon: null,
		hasChildren: false,
		expanded: false,
		parentId: "root-a",
	},
	{
		id: "a-2",
		label: "A 2",
		icon: null,
		hasChildren: true,
		expanded: true,
		parentId: "root-a",
	},
	{
		id: "a-2-1",
		label: "A 2 1",
		icon: null,
		hasChildren: false,
		expanded: false,
		parentId: "a-2",
	},
	{
		id: "root-b",
		label: "Root B",
		icon: null,
		hasChildren: true,
		expanded: false,
		parentId: null,
	},
];

const noop = vi.fn();

const noopAsync = async () => {};

// ─── Renderer capture helper ─────────────────────────────────────────────────

interface RendererCapture {
	renderer: React.ComponentType<TreeViewRendererProps>;
	/**
	 * All rendered rows, ordered by their list index
	 */
	rows: () => TreeViewRendererProps[];
	/**
	 * The rendered row with the given ID (throws if it did not render)
	 */
	row: (id: string) => TreeViewRendererProps;
}

const createCapture = (): RendererCapture => {
	const seen = new Map<string, TreeViewRendererProps>();
	const CaptureRenderer = (props: TreeViewRendererProps) => {
		seen.set(props.id, props);
		return <div data-testid={"row"}>{props.label}</div>;
	};
	return {
		renderer: CaptureRenderer,
		rows: () =>
			Array.from(seen.values()).sort((row1, row2) => row1.index - row2.index),
		row: (id: string) => {
			const row = seen.get(id);
			if (!row) throw new Error(`row ${id} did not render`);
			return row;
		},
	};
};

/**
 * The [indent, lane count] of every rendered row, for the checkbox selection
 * renderer. Lanes are its 24px wide cells; the connector's own cells are 12px wide.
 */
const rowGeometry = (container: HTMLElement): [string, number][] =>
	Array.from(container.querySelectorAll("[data-react-window-index]")).map(
		(row) => [
			(row.firstElementChild as HTMLElement).style.marginLeft,
			row.querySelectorAll("div[style*='width: 24px']").length,
		],
	);

const labelsInDom = (container: HTMLElement): string[] =>
	Array.from(container.querySelectorAll("[data-testid='row']")).map(
		(element) => element.textContent ?? "",
	);

afterEach(() => {
	// the unit project has no globals, so RTL does not clean up on its own
	cleanup();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("TreeView smoke tests", () => {
	it("renders without crashing given a tree data object", () => {
		expect(() =>
			render(
				<TreeView
					data={SIMPLE_TREE}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
				/>,
			),
		).not.toThrow();
	});

	it("renders without crashing given flat data array", () => {
		expect(() =>
			render(
				<TreeView
					data={FLAT_DATA}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
				/>,
			),
		).not.toThrow();
	});

	it("renders without crashing with custom renderer", () => {
		expect(() =>
			render(
				<TreeView
					data={SIMPLE_TREE}
					renderer={TreeViewCheckboxSelectionRenderer}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
				/>,
			),
		).not.toThrow();
	});

	it("renders without crashing when root is collapsed (no children visible)", () => {
		expect(() =>
			render(
				<TreeView
					data={COLLAPSED_TREE}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
				/>,
			),
		).not.toThrow();
	});

	it("accepts a custom rendererItemHeight", () => {
		expect(() =>
			render(
				<TreeView
					data={SIMPLE_TREE}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
					rendererItemHeight={32}
				/>,
			),
		).not.toThrow();
	});
});

describe("buildTreeFromFlat (via TreeView)", () => {
	it("throws if flat data has no root node (no parentId: null)", () => {
		const badData: TreeDataFlat[] = [
			{
				id: "a",
				label: "A",
				icon: null,
				hasChildren: false,
				expanded: false,
				parentId: "missing-parent",
			},
		];
		expect(() =>
			render(
				<TreeView
					data={badData}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
				/>,
			),
		).toThrow("No root node found");
	});
});

// ─── Forests ─────────────────────────────────────────────────────────────────

describe("TreeView forests", () => {
	it("renders every root of flat data, in input order", () => {
		const capture = createCapture();
		const { container } = render(
			<TreeView
				data={FOREST_FLAT}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(labelsInDom(container)).toEqual([
			"Root A",
			"A 1",
			"A 2",
			"A 2 1",
			"Root B",
		]);
	});

	it("keeps each root's children under their own root", () => {
		const capture = createCapture();
		render(
			<TreeView
				data={FOREST_FLAT}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(capture.rows().map((row) => [row.id, row.depth])).toEqual([
			["root-a", 0],
			["a-1", 1],
			["a-2", 1],
			["a-2-1", 2],
			["root-b", 0],
		]);
	});

	it("reports sibling roots via hasPrev / hasNext at depth 0", () => {
		const capture = createCapture();
		render(
			<TreeView
				data={FOREST_FLAT}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(capture.row("root-a").hasPrev).toBe(false);
		expect(capture.row("root-a").hasNext).toBe(true);
		expect(capture.row("root-b").hasPrev).toBe(true);
		expect(capture.row("root-b").hasNext).toBe(false);
	});

	it("keeps the list index counter running across roots (scrollTo target)", () => {
		const capture = createCapture();
		const ref = React.createRef<TreeViewDispatch>();
		render(
			<TreeView
				ref={ref}
				data={FOREST_FLAT}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		// scrollTo(id) resolves the row by ID and scrolls to its index, so the index of
		// a row in the second root has to account for the whole first subtree
		expect(capture.row("root-b").index).toBe(4);
		expect(capture.rows().map((row) => row.index)).toEqual([0, 1, 2, 3, 4]);
		expect(() => act(() => ref.current?.scrollTo("root-b"))).not.toThrow();
	});

	it("lazy loads children of a node in a later root", async () => {
		const capture = createCapture();
		const onLoadChildren = vi.fn(() => Promise.resolve());
		const onToggleExpanded = vi.fn();
		render(
			<TreeView
				data={FOREST_FLAT}
				renderer={capture.renderer}
				onToggleExpanded={onToggleExpanded}
				onLoadChildren={onLoadChildren}
			/>,
		);
		act(() => {
			capture.row("root-b").onToggleExpanded("root-b");
		});
		await waitFor(() => {
			expect(onToggleExpanded).toHaveBeenCalledWith("root-b");
		});
		expect(onLoadChildren).toHaveBeenCalledTimes(1);
		expect(onLoadChildren).toHaveBeenCalledWith("root-b");
	});

	it("renders an empty tree for empty data instead of throwing", () => {
		const capture = createCapture();
		const { container } = render(
			<TreeView
				data={[]}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(labelsInDom(container)).toEqual([]);
	});

	it("accepts nested data as an array of roots", () => {
		const capture = createCapture();
		const { container } = render(
			<TreeView
				data={[
					SIMPLE_TREE,
					{
						id: "root-2",
						label: "Root 2",
						icon: null,
						hasChildren: false,
						expanded: false,
					},
				]}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(labelsInDom(container)).toEqual([
			"Root",
			"Child 1",
			"Child 2",
			"Grandchild 1",
			"Root 2",
		]);
	});

	it("throws for an array mixing nested and flat entries", () => {
		expect(() =>
			render(
				// TreeDataFlat is structurally a TreeData, so a mixed array type checks —
				// which is exactly why the mix has to be caught at runtime
				<TreeView
					data={[SIMPLE_TREE, FLAT_DATA[0]]}
					onToggleExpanded={noop}
					onLoadChildren={noopAsync}
				/>,
			),
		).toThrow("Mixed tree data");
	});
});

// ─── Connector lanes ─────────────────────────────────────────────────────────

describe("TreeView connector lanes", () => {
	it("gives a single root tree no root lane and no root connector", () => {
		const capture = createCapture();
		render(
			<TreeView
				data={SIMPLE_TREE}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(capture.row("root").hasConnector).toBe(false);
		expect(capture.row("root").ancestorLanes).toEqual([]);
		// depth 1 joins the root's connector directly, without an indent lane
		expect(capture.row("child-1").hasConnector).toBe(true);
		expect(capture.row("child-1").ancestorLanes).toEqual([]);
		// depth 2 gets one lane, for the depth 1 parent ("Child 2", which is last)
		expect(capture.row("grandchild-1").ancestorLanes).toEqual([false]);
	});

	it("gives a forest a root lane that carries the trunk to the next root", () => {
		const capture = createCapture();
		render(
			<TreeView
				data={FOREST_FLAT}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		// roots are siblings of each other, so they sit on a spine of their own
		expect(capture.row("root-a").hasConnector).toBe(true);
		expect(capture.row("root-a").ancestorLanes).toEqual([]);
		// root A has root B below it, so its trunk continues through its whole subtree
		expect(capture.row("a-1").ancestorLanes).toEqual([true]);
		expect(capture.row("a-2").ancestorLanes).toEqual([true]);
		expect(capture.row("a-2-1").ancestorLanes).toEqual([true, false]);
		expect(capture.row("root-b").ancestorLanes).toEqual([]);
	});

	it("indents the checkbox renderer's forest by one lane, roots included", () => {
		const { container } = render(
			<TreeView
				data={FOREST_FLAT}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		// every row is offset by the connector, so a child's connector still lines up
		// with the column its parent's icon sits in
		expect(rowGeometry(container)).toEqual([
			["12px", 0], // root A
			["12px", 1], // A 1
			["12px", 1], // A 2
			["12px", 2], // A 2 1
			["12px", 0], // root B
		]);
	});

	it("keeps the checkbox renderer's indent unchanged for a single root tree", () => {
		const { container } = render(
			<TreeView
				data={SIMPLE_TREE}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		// the lone root has no connector, and no depth gains an indent lane it did
		// not have before the forest support
		expect(rowGeometry(container)).toEqual([
			["0px", 0], // root
			["12px", 0], // child 1
			["12px", 0], // child 2
			["12px", 1], // grandchild 1
		]);
	});
});

// ─── Malformed flat data ─────────────────────────────────────────────────────

describe("TreeView flat data edge cases", () => {
	it("drops entries whose parent is not in the data", () => {
		const capture = createCapture();
		const { container } = render(
			<TreeView
				data={[
					...FLAT_DATA,
					{
						id: "orphan",
						label: "Orphan",
						icon: null,
						hasChildren: false,
						expanded: false,
						parentId: "gone",
					},
				]}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(labelsInDom(container)).toEqual(["Root", "Node A", "Node B"]);
	});

	it("warns about dropped orphans in development", () => {
		vi.stubEnv("NODE_ENV", "development");
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		render(
			<TreeView
				data={[
					...FLAT_DATA,
					{
						id: "orphan",
						label: "Orphan",
						icon: null,
						hasChildren: false,
						expanded: false,
						parentId: "gone",
					},
				]}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining("parentId"), [
			"gone",
		]);
	});

	it("does not recurse forever when an entry is its own parent", () => {
		const capture = createCapture();
		const { container } = render(
			<TreeView
				data={[
					...FLAT_DATA,
					// same ID as an entry that is reachable from the root — without a
					// cycle guard this builds "a" as a child of itself, forever
					{
						id: "a",
						label: "Node A (cycle)",
						icon: null,
						hasChildren: false,
						expanded: true,
						parentId: "a",
					},
				]}
				renderer={capture.renderer}
				onToggleExpanded={noop}
				onLoadChildren={noopAsync}
			/>,
		);
		expect(labelsInDom(container)).toEqual(["Root", "Node A", "Node B"]);
	});
});

// ─── Helpers for the behavior tests below ────────────────────────────────────

const node = (id: string, extra?: Partial<TreeData>): TreeData => ({
	id,
	label: id,
	icon: null,
	hasChildren: false,
	expanded: false,
	...extra,
});

// jsdom has no Element.prototype.scrollTo, and react-window skips the call when it is missing
const stubScrollTo = (fn: (options: ScrollToOptions) => void) => {
	Object.defineProperty(HTMLElement.prototype, "scrollTo", {
		value: fn,
		configurable: true,
		writable: true,
	});
};

/** A root with the children n1..n<count>, all visible */
const manyRows = (count: number) =>
	node("root", {
		hasChildren: true,
		expanded: true,
		children: Array.from({ length: count }, (_, i) => node(`n${i + 1}`)),
	});

describe("TreeView accessibility bugs", () => {
	const TREE = node("root", {
		hasChildren: true,
		expanded: true,
		children: [
			node("folder", { hasChildren: true, children: [node("x")] }),
			node("leaf"),
			node("locked-leaf", { expandLocked: true }),
		],
	});

	it("[ISSUE-3476-ITEM-12] names every checkbox after its entry's label", () => {
		render(
			<TreeView
				data={TREE}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		const boxes = screen.getAllByRole("checkbox");
		// precondition: only the two leaves have a checkbox
		expect(boxes).toHaveLength(2);
		expect(boxes[0]).toHaveAccessibleName("leaf");
		expect(boxes[1]).toHaveAccessibleName("locked-leaf");
	});

	it("[ISSUE-3476-ITEM-13] disables the checkbox of an expandLocked leaf", () => {
		const onToggleExpanded = vi.fn();
		render(
			<TreeView
				data={TREE}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={onToggleExpanded}
				onLoadChildren={vi.fn()}
			/>,
		);
		const locked = screen.getAllByRole("checkbox")[1];
		// precondition: clicking the locked checkbox does nothing
		fireEvent.click(locked);
		expect(onToggleExpanded).not.toHaveBeenCalled();
		expect(locked).toBeDisabled();
	});
});

/** Runs fn inside an async act, so the toggle's promise chain settles before the asserts */
const settle = (fn: () => void) =>
	act(async () => {
		fn();
		await Promise.resolve();
	});

/** The part of Node's process this file uses (the test config has no Node types) */
interface RejectionEvents {
	listeners(event: "unhandledRejection"): ((reason: unknown) => void)[];
	removeAllListeners(event: "unhandledRejection"): void;
	on(event: "unhandledRejection", listener: (reason: unknown) => void): void;
	off(event: "unhandledRejection", listener: (reason: unknown) => void): void;
}

const nodeProcess = (globalThis as unknown as { process: RejectionEvents })
	.process;

describe("TreeView lazy loading bugs", () => {
	it("[ISSUE-3476-ITEM-1] clears the loading state after onLoadChildren rejects, so that a retry loads again", async () => {
		const capture = createCapture();
		const onLoadChildren = vi
			.fn<(id: string) => Promise<void>>()
			.mockRejectedValueOnce(new Error("network"))
			.mockResolvedValue(undefined);
		render(
			<TreeView
				data={node("a", { hasChildren: true })}
				renderer={capture.renderer}
				onToggleExpanded={vi.fn()}
				onLoadChildren={onLoadChildren}
			/>,
		);
		await settle(() => capture.row("a").onToggleExpanded("a"));
		await waitFor(() => expect(capture.row("a").childrenLoading).toBe(false));
		await settle(() => capture.row("a").onToggleExpanded("a"));
		expect(onLoadChildren).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3476-ITEM-1] clears the loading state after onLoadChildren throws", async () => {
		const capture = createCapture();
		const onLoadChildren = vi.fn(() => {
			throw new Error("sync");
		});
		render(
			<TreeView
				data={node("a", { hasChildren: true })}
				renderer={capture.renderer}
				onToggleExpanded={vi.fn()}
				onLoadChildren={onLoadChildren}
			/>,
		);
		await settle(() => capture.row("a").onToggleExpanded("a"));
		await waitFor(() => expect(capture.row("a").childrenLoading).toBe(false));
	});

	it("[ISSUE-3476-ITEM-1] reports a failed load instead of leaving it unhandled, and does not toggle the entry", async () => {
		const before = { ...getErrorReportingConfig() };
		const report = vi.fn();
		configureErrorReporting({ report, shouldReport: () => true });
		const unhandled = vi.fn();
		nodeProcess.on("unhandledRejection", unhandled);
		try {
			const capture = createCapture();
			const failure = new Error("network");
			const onToggleExpanded = vi.fn();
			render(
				<TreeView
					data={node("a", { hasChildren: true })}
					renderer={capture.renderer}
					onToggleExpanded={onToggleExpanded}
					onLoadChildren={() => Promise.reject(failure)}
				/>,
			);
			await settle(() => capture.row("a").onToggleExpanded("a"));
			await waitFor(() => expect(capture.row("a").childrenLoading).toBe(false));
			// Node reports unhandled rejections once the microtask queue is empty
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(report).toHaveBeenCalledExactlyOnceWith(failure, {
				source: "TreeView.onLoadChildren",
				extra: { id: "a" },
			});
			expect(unhandled).not.toHaveBeenCalled();
			expect(onToggleExpanded).not.toHaveBeenCalled();
		} finally {
			nodeProcess.off("unhandledRejection", unhandled);
			configureErrorReporting(before);
		}
	});
});

describe("TreeView data and rendering bugs", () => {
	afterEach(() => {
		delete (HTMLElement.prototype as Partial<HTMLElement>).scrollTo;
	});

	it("[ISSUE-3476-ITEM-7] scrolls to an entry once it appears, when scrollTo was called before", () => {
		const scrollTo = vi.fn();
		stubScrollTo(scrollTo);
		const ref = React.createRef<TreeViewDispatch>();
		const { rerender } = render(
			<TreeView
				ref={ref}
				data={manyRows(99)}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		// n120 is not loaded yet
		act(() => ref.current?.scrollTo("n120"));
		rerender(
			<TreeView
				ref={ref}
				data={manyRows(150)}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
			behavior: "auto",
			top: 121 * 24 - 1000,
		});
	});

	it("[ISSUE-3476-ITEM-7] waits until the list has been measured, also while it is 0px high", () => {
		// react-window measures the list in a ResizeObserver callback, which the
		// browser runs after the first render; this one reports only on demand
		const observed: { callback: ResizeObserverCallback; target: Element }[] =
			[];
		class DeferredResizeObserver {
			private readonly callback: ResizeObserverCallback;
			constructor(callback: ResizeObserverCallback) {
				this.callback = callback;
			}
			observe(target: Element) {
				observed.push({ callback: this.callback, target });
			}
			unobserve = vi.fn();
			disconnect = vi.fn();
		}
		const resize = (height: number) =>
			act(() => {
				for (const { callback, target } of observed) {
					callback(
						[
							{
								target,
								contentRect: { height, width: 500 },
							} as unknown as ResizeObserverEntry,
						],
						{} as ResizeObserver,
					);
				}
			});
		const instantResizeObserver = globalThis.ResizeObserver;
		globalThis.ResizeObserver = DeferredResizeObserver;
		try {
			const scrollTo = vi.fn();
			stubScrollTo(scrollTo);
			const ref = React.createRef<TreeViewDispatch>();
			render(
				<TreeView
					ref={ref}
					data={manyRows(99)}
					onToggleExpanded={vi.fn()}
					onLoadChildren={vi.fn()}
				/>,
			);
			act(() => ref.current?.scrollTo("n80"));
			expect(scrollTo).not.toHaveBeenCalled();
			// laid out, but hidden (display: none)
			resize(0);
			expect(scrollTo).not.toHaveBeenCalled();
			resize(200);
			expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
				behavior: "auto",
				top: 81 * 24 - 200,
			});
		} finally {
			globalThis.ResizeObserver = instantResizeObserver;
		}
	});

	it("[ISSUE-3476-ITEM-7] scrolls to an entry under a collapsed ancestor once the ancestor expands", () => {
		const scrollTo = vi.fn();
		stubScrollTo(scrollTo);
		const ref = React.createRef<TreeViewDispatch>();
		const withFolder = (expanded: boolean) =>
			node("root", {
				hasChildren: true,
				expanded: true,
				children: [
					...(manyRows(99).children ?? []),
					node("folder", {
						hasChildren: true,
						expanded,
						children: Array.from({ length: 30 }, (_, i) => node(`f${i + 1}`)),
					}),
				],
			});
		const { rerender } = render(
			<TreeView
				ref={ref}
				data={withFolder(false)}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		act(() => ref.current?.scrollTo("f20"));
		expect(scrollTo).not.toHaveBeenCalled();
		rerender(
			<TreeView
				ref={ref}
				data={withFolder(true)}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		// root, n1..n99, folder, then f20 at index 120
		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
			behavior: "auto",
			top: 121 * 24 - 1000,
		});
	});

	it("[ISSUE-3476-ITEM-7] scrolls once per call, and a later call replaces a waiting one", () => {
		const scrollTo = vi.fn();
		stubScrollTo(scrollTo);
		const ref = React.createRef<TreeViewDispatch>();
		const { rerender } = render(
			<TreeView
				ref={ref}
				data={manyRows(99)}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		act(() => ref.current?.scrollTo("n120"));
		act(() => ref.current?.scrollTo("n50"));
		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
			behavior: "auto",
			top: 51 * 24 - 1000,
		});
		// n120 appears, and the data changes after the scroll: nothing scrolls again
		rerender(
			<TreeView
				ref={ref}
				data={manyRows(150)}
				onToggleExpanded={vi.fn()}
				onLoadChildren={vi.fn()}
			/>,
		);
		expect(scrollTo).toHaveBeenCalledTimes(1);
		// the same id again is a new request
		act(() => ref.current?.scrollTo("n50"));
		expect(scrollTo).toHaveBeenCalledTimes(2);
	});
});
