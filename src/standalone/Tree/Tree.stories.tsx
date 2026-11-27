import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { Box } from "@mui/material";
import { Folder, FolderOpen, InsertDriveFile } from "@mui/icons-material";
import TreeView from "./TreeView";
import type {
	TreeData,
	TreeDataFlat,
	TreeViewDispatch,
	TreeViewRendererProps,
} from "./TreeView";
import TreeViewCheckboxSelectionRenderer from "./TreeViewCheckboxSelectionRenderer";

// ─── Sample tree data ─────────────────────────────────────────────────────────

const buildSampleTree = (expanded: Set<string>): TreeData => ({
	id: "root",
	label: "Project root",
	icon: expanded.has("root") ? <FolderOpen /> : <Folder />,
	hasChildren: true,
	expanded: expanded.has("root"),
	children: [
		{
			id: "src",
			label: "src",
			icon: expanded.has("src") ? <FolderOpen /> : <Folder />,
			hasChildren: true,
			expanded: expanded.has("src"),
			children: [
				{
					id: "components",
					label: "components",
					icon: expanded.has("components") ? <FolderOpen /> : <Folder />,
					hasChildren: true,
					expanded: expanded.has("components"),
					children: [
						{
							id: "Button.tsx",
							label: "Button.tsx",
							icon: <InsertDriveFile />,
							hasChildren: false,
							expanded: false,
						},
						{
							id: "Input.tsx",
							label: "Input.tsx",
							icon: <InsertDriveFile />,
							hasChildren: false,
							expanded: false,
						},
					],
				},
				{
					id: "utils",
					label: "utils",
					icon: expanded.has("utils") ? <FolderOpen /> : <Folder />,
					hasChildren: true,
					expanded: expanded.has("utils"),
					children: [
						{
							id: "helpers.ts",
							label: "helpers.ts",
							icon: <InsertDriveFile />,
							hasChildren: false,
							expanded: false,
						},
					],
				},
			],
		},
		{
			id: "public",
			label: "public",
			icon: expanded.has("public") ? <FolderOpen /> : <Folder />,
			hasChildren: true,
			expanded: expanded.has("public"),
			children: [
				{
					id: "index.html",
					label: "index.html",
					icon: <InsertDriveFile />,
					hasChildren: false,
					expanded: false,
				},
			],
		},
		{
			id: "package.json",
			label: "package.json",
			icon: <InsertDriveFile />,
			hasChildren: false,
			expanded: false,
		},
	],
});

const EMPTY_FOREST: TreeDataFlat[] = [];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TreeView> = {
	title: "standalone/Tree/TreeView",
	component: TreeView,
	parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof TreeView>;

// ─── Helpers for the interaction stories ─────────────────────────────────────

/** Expanded ids, toggled per id */
const useToggleSet = (initial: string[]) => {
	const [set, setSet] = useState(() => new Set(initial));
	const toggle = useCallback((id: string) => {
		setSet((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);
	return [set, toggle] as const;
};

const leaf = (id: string, extra?: Partial<TreeData>): TreeData => ({
	id,
	label: id,
	icon: <InsertDriveFile />,
	hasChildren: false,
	expanded: false,
	...extra,
});

const folder = (
	id: string,
	children: TreeData[] | null,
	extra?: Partial<TreeData>,
): TreeData => ({
	id,
	label: id,
	icon: <Folder />,
	hasChildren: true,
	expanded: false,
	children,
	...extra,
});

/**
 * The tree with every `expanded` taken from the set. For leaves this is the
 * checkbox renderer's selection.
 */
const applyExpanded = (entry: TreeData, expanded: Set<string>): TreeData => ({
	...entry,
	expanded: expanded.has(entry.id),
	children: entry.children?.map((child) => applyExpanded(child, expanded)),
});

/** The scroll container of the tree (react-window's List element) */
const scrollerOf = (canvasElement: HTMLElement): HTMLElement => {
	const scroller = canvasElement.querySelector(
		"[data-react-window-index]",
	)?.parentElement;
	if (!scroller) throw new Error("no scroller");
	return scroller;
};

/** root (expanded) > src (collapsed) > [main.ts], public (collapsed) > [index.html], package.json */
const SMALL_TREE = folder("root", [
	folder("src", [leaf("main.ts")]),
	folder("public", [leaf("index.html")]),
	leaf("package.json"),
]);

/** root > leaf 0 … leaf 99 */
const LONG_TREE = folder(
	"root",
	Array.from({ length: 100 }, (_, i) => leaf(`leaf ${i}`)),
);

interface HarnessProps {
	tree: TreeData;
	initial: string[];
	renderer?: React.ComponentType<TreeViewRendererProps>;
	width?: number | string;
	height?: number;
	onToggleExpanded?: (id: string) => void;
	/** Buttons before and after the tree, for Tab order checks */
	withButtons?: boolean;
	treeRef?: React.Ref<TreeViewDispatch>;
}

/** A controlled tree: the set of expanded (or, for checkbox leaves, selected) ids */
const Harness = ({
	tree,
	initial,
	renderer,
	width = 320,
	height = 300,
	onToggleExpanded,
	withButtons,
	treeRef,
}: HarnessProps) => {
	const [expanded, toggle] = useToggleSet(initial);
	const handleToggle = useCallback(
		(id: string) => {
			onToggleExpanded?.(id);
			toggle(id);
		},
		[onToggleExpanded, toggle],
	);
	const handleLoad = useCallback(() => undefined, []);
	const data = useMemo(() => applyExpanded(tree, expanded), [tree, expanded]);
	return (
		<div>
			{withButtons && <button>Before the tree</button>}
			<Box sx={{ width, height, border: "1px solid #ccc" }}>
				<TreeView
					ref={treeRef}
					data={data}
					renderer={renderer}
					onToggleExpanded={handleToggle}
					onLoadChildren={handleLoad}
				/>
			</Box>
			{withButtons && <button>After the tree</button>}
		</div>
	);
};

// ─── Stories ──────────────────────────────────────────────────────────────────

const DefaultTreeStory = () => {
	const [expanded, setExpanded] = useState<Set<string>>(
		new Set(["root", "src"]),
	);

	const tree = buildSampleTree(expanded);

	const handleToggle = useCallback((id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleLoadChildren = useCallback(async () => {
		// children are already inline in this example
	}, []);

	return (
		<Box
			sx={{
				width: 300,
				height: 400,
				border: "1px solid #ccc",
				overflow: "hidden",
			}}
		>
			<TreeView
				data={tree}
				onToggleExpanded={handleToggle}
				onLoadChildren={handleLoadChildren}
				aria-label={"Project files"}
			/>
		</Box>
	);
};

export const Default: StoryObj<typeof TreeView> = {
	render: () => <DefaultTreeStory />,
	play: async ({ canvas }) => {
		// Root and src are expanded by default — verify nested items are visible
		await expect(
			await canvas.findByText("Project root", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("src", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("components", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("utils", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("public", {}, { timeout: 5000 }),
		).toBeVisible();
	},
};

// ─── Collapsed tree ───────────────────────────────────────────────────────────

const CollapsedTreeStory = () => {
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));
	const tree = buildSampleTree(expanded);

	const handleToggle = useCallback((id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleLoadChildren = useCallback(async () => {}, []);

	return (
		<Box
			sx={{
				width: 300,
				height: 300,
				border: "1px solid #ccc",
				overflow: "hidden",
			}}
		>
			<TreeView
				data={tree}
				onToggleExpanded={handleToggle}
				onLoadChildren={handleLoadChildren}
			/>
		</Box>
	);
};

export const RootOnlyExpanded: StoryObj<typeof TreeView> = {
	render: () => <CollapsedTreeStory />,
};

// ─── Checkbox selection renderer ─────────────────────────────────────────────

const CheckboxTreeStory = () => {
	const [expanded, setExpanded] = useState<Set<string>>(
		new Set(["root", "src"]),
	);
	const tree = buildSampleTree(expanded);

	const handleToggle = useCallback((id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleLoadChildren = useCallback(async () => {}, []);

	return (
		<Box
			sx={{
				width: 320,
				height: 400,
				border: "1px solid #ccc",
				overflow: "hidden",
			}}
		>
			<TreeView
				data={tree}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={handleToggle}
				onLoadChildren={handleLoadChildren}
			/>
		</Box>
	);
};

export const CheckboxSelection: StoryObj<typeof TreeView> = {
	render: () => <CheckboxTreeStory />,
	parameters: { layout: "centered" },
};

// ─── Forest (multiple roots) ─────────────────────────────────────────────────

const buildSampleForest = (expanded: Set<string>): TreeDataFlat[] => {
	const folder = (
		id: string,
		label: string,
		parentId: string | null,
	): TreeDataFlat => ({
		id,
		label,
		icon: expanded.has(id) ? <FolderOpen /> : <Folder />,
		hasChildren: true,
		expanded: expanded.has(id),
		parentId,
	});
	const file = (id: string, label: string, parentId: string): TreeDataFlat => ({
		id,
		label,
		icon: <InsertDriveFile />,
		hasChildren: false,
		expanded: false,
		parentId,
	});
	// roots render in input order, so the order below is the display order
	return [
		folder("workspace-a", "Workspace A", null),
		folder("a-src", "src", "workspace-a"),
		file("a-index", "index.ts", "a-src"),
		file("a-readme", "README.md", "workspace-a"),
		folder("workspace-b", "Workspace B", null),
		file("b-readme", "README.md", "workspace-b"),
		folder("workspace-c", "Workspace C", null),
	];
};

const ForestStory = () => {
	const [expanded, setExpanded] = useState<Set<string>>(
		new Set(["workspace-a", "a-src", "workspace-b"]),
	);

	const forest = buildSampleForest(expanded);

	const handleToggle = useCallback((id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleLoadChildren = useCallback(async () => {}, []);

	return (
		<Box
			sx={{
				width: 320,
				height: 400,
				border: "1px solid #ccc",
				overflow: "hidden",
			}}
		>
			<TreeView
				data={forest}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={handleToggle}
				onLoadChildren={handleLoadChildren}
			/>
		</Box>
	);
};

export const Forest: StoryObj<typeof TreeView> = {
	render: () => <ForestStory />,
	play: async ({ canvas }) => {
		// all three roots render side by side, each keeping its own children
		await expect(
			await canvas.findByText("Workspace A", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("Workspace B", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("Workspace C", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(
			await canvas.findByText("index.ts", {}, { timeout: 5000 }),
		).toBeVisible();
	},
};

// ─── Empty tree ──────────────────────────────────────────────────────────────

const EmptyTreeStory = () => {
	const handleToggle = useCallback(() => {}, []);
	const handleLoadChildren = useCallback(async () => {}, []);

	return (
		<Box
			sx={{
				width: 320,
				height: 120,
				border: "1px solid #ccc",
				overflow: "hidden",
			}}
		>
			<TreeView
				data={EMPTY_FOREST}
				onToggleExpanded={handleToggle}
				onLoadChildren={handleLoadChildren}
			/>
		</Box>
	);
};

export const Empty: StoryObj<typeof TreeView> = {
	render: () => <EmptyTreeStory />,
};

export const Issue3476Item12CheckboxesHaveNames: Story = {
	render: () => <CheckboxTreeStory />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-12: the leaf checkboxes of `TreeViewCheckboxSelectionRenderer` have no accessible name; the label next to them is not associated. Fails the axe rule `label`.",
			},
		},
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["label"] } },
		},
	},
	play: async ({ canvas }) => {
		// the last row holds the checkbox; axe has to see it
		await expect(
			await canvas.findByText("package.json", {}, { timeout: 5000 }),
		).toBeVisible();
		await expect(canvas.getAllByRole("checkbox")).toHaveLength(1);
	},
};

const ScrollOnMountStory = () => {
	const ref = useRef<TreeViewDispatch>(null);
	// as an app does to reveal the selected entry when the tree appears
	React.useEffect(() => {
		ref.current?.scrollTo("leaf 80");
	}, []);
	return (
		<Harness tree={LONG_TREE} initial={["root"]} height={200} treeRef={ref} />
	);
};

export const Issue3476Item7ScrollToRightAfterMount: Story = {
	render: () => <ScrollOnMountStory />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-7: `scrollTo` from an effect that runs when the tree mounts happens before react-window has measured the list. It aligns the row as if the list were 0px high, so the target ends up just above the visible area.",
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		const target = await canvas.findByText("leaf 80", {}, { timeout: 5000 });
		const scroller = scrollerOf(canvasElement);
		await waitFor(async () => {
			const box = scroller.getBoundingClientRect();
			const row = target.getBoundingClientRect();
			await expect(row.top, "row top vs list top").toBeGreaterThanOrEqual(
				box.top - 0.5,
			);
			await expect(row.bottom, "row bottom vs list bottom").toBeLessThanOrEqual(
				box.bottom + 0.5,
			);
		});
	},
};

export const Issue3476Item11ExpandsWithKeyboard: Story = {
	args: { onToggleExpanded: fn() },
	render: (args) => (
		<Harness
			tree={SMALL_TREE}
			initial={["root"]}
			onToggleExpanded={args.onToggleExpanded}
			withButtons
		/>
	),
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-11: nothing in the default renderer's rows is focusable, so Tab reaches no row (in Chromium at most the scroll container itself) and no key expands an entry. Expected (WAI-ARIA tree pattern): Tab moves focus to a row, ArrowDown moves to the next row, and ArrowRight expands a collapsed folder.",
			},
		},
	},
	play: async ({ args, canvas, canvasElement }) => {
		await canvas.findByText("package.json", {}, { timeout: 5000 });
		canvas.getByRole("button", { name: "Before the tree" }).focus();
		await userEvent.tab();
		const focused = document.activeElement;
		await expect(
			focused instanceof HTMLElement &&
				focused.closest("[data-react-window-index]") !== null &&
				canvasElement.contains(focused),
			"Tab moves focus to a row of the tree",
		).toBe(true);
		await userEvent.keyboard("{ArrowDown}");
		await userEvent.keyboard("{ArrowRight}");
		await expect(args.onToggleExpanded).toHaveBeenCalledTimes(1);
		await expect(args.onToggleExpanded).toHaveBeenCalledWith("src");
	},
};

export const Issue3476Item11ScrollerReachableByKeyboard: Story = {
	render: () => <Harness tree={LONG_TREE} initial={["root"]} height={200} />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-11: with the default renderer, a tree that scrolls contains nothing focusable, so keyboard users cannot scroll it in browsers that do not make scroll containers focusable. Fails the axe rule `scrollable-region-focusable`.",
			},
		},
		a11y: {
			test: "error",
			options: {
				runOnly: { type: "rule", values: ["scrollable-region-focusable"] },
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		// Wait for a row beyond the overscan: it renders only once react-window
		// has measured the list. Before that every rendered row fits the box,
		// axe sees no hidden content and skips the rule, and the story would pass.
		await canvas.findByText("leaf 10", {}, { timeout: 5000 });
		// precondition: the tree overflows its box
		const scroller = scrollerOf(canvasElement);
		await expect(scroller.scrollHeight).toBeGreaterThan(
			scroller.clientHeight + 24,
		);
	},
};

/** The row element (treeitem) of the entry with the given id */
const rowById = (canvasElement: HTMLElement, id: string): HTMLElement => {
	const row = canvasElement.querySelector<HTMLElement>(
		`[role="treeitem"][data-id="${id}"]`,
	);
	if (!row) throw new Error(`no row for ${id}`);
	return row;
};

/** The ids of the tree's rows in the Tab order, and "tree" for the list itself */
const tabStopsOf = (canvasElement: HTMLElement): string[] => {
	const tree = canvasElement.querySelector<HTMLElement>('[role="tree"]');
	if (!tree) throw new Error("no tree");
	return [
		...(tree.tabIndex === 0 ? ["tree"] : []),
		...Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'))
			.filter((row) => row.tabIndex === 0)
			.map((row) => row.dataset.id ?? ""),
	];
};

/** Expects the row to be fully inside the scroll container's box */
const expectInView = async (scroller: HTMLElement, row: HTMLElement) => {
	const box = scroller.getBoundingClientRect();
	const rect = row.getBoundingClientRect();
	await expect(rect.top, "row top vs list top").toBeGreaterThanOrEqual(
		box.top - 0.5,
	);
	await expect(rect.bottom, "row bottom vs list bottom").toBeLessThanOrEqual(
		box.bottom + 0.5,
	);
};

export const Issue3476Item11ArrowKeys: Story = {
	args: { onToggleExpanded: fn() },
	render: (args) => (
		<Harness
			tree={SMALL_TREE}
			initial={["root"]}
			onToggleExpanded={args.onToggleExpanded}
			withButtons
		/>
	),
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-11: the tree is one tab stop, the row focused last (at first the first row), with a focus ring. ArrowRight moves from an expanded entry to its first child and expands a collapsed one, ArrowLeft collapses an expanded entry and moves from any other to its parent, ArrowDown, ArrowUp, Home and End move between the rows. Tab leaves the tree, Shift+Tab comes back to the same row.",
			},
		},
	},
	play: async ({ args, canvas, canvasElement }) => {
		await canvas.findByText("package.json", {}, { timeout: 5000 });
		const row = (id: string) => rowById(canvasElement, id);
		await waitFor(() => expect(tabStopsOf(canvasElement)).toEqual(["root"]));
		canvas.getByRole("button", { name: "Before the tree" }).focus();
		await userEvent.tab();
		await expect(row("root")).toHaveFocus();
		const ring = getComputedStyle(row("root"));
		await expect(`${ring.outlineStyle} ${ring.outlineWidth}`).toBe("solid 2px");
		// an expanded entry: to its first child
		await userEvent.keyboard("{ArrowRight}");
		await expect(row("src")).toHaveFocus();
		// a collapsed entry: expanded, focus stays
		await userEvent.keyboard("{ArrowRight}");
		await expect(args.onToggleExpanded).toHaveBeenCalledTimes(1);
		await expect(args.onToggleExpanded).toHaveBeenLastCalledWith("src");
		await waitFor(() =>
			expect(row("src")).toHaveAttribute("aria-expanded", "true"),
		);
		await expect(row("src")).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(row("main.ts")).toHaveFocus();
		// a leaf: nothing
		await userEvent.keyboard("{ArrowRight}");
		await expect(row("main.ts")).toHaveFocus();
		// a leaf: to its parent; an expanded entry: collapsed, focus stays
		await userEvent.keyboard("{ArrowLeft}");
		await expect(row("src")).toHaveFocus();
		await userEvent.keyboard("{ArrowLeft}");
		await expect(args.onToggleExpanded).toHaveBeenCalledTimes(2);
		await expect(args.onToggleExpanded).toHaveBeenLastCalledWith("src");
		await waitFor(() =>
			expect(row("src")).toHaveAttribute("aria-expanded", "false"),
		);
		await expect(row("src")).toHaveFocus();
		// a collapsed entry: to its parent
		await userEvent.keyboard("{ArrowLeft}");
		await expect(row("root")).toHaveFocus();
		await userEvent.keyboard("{End}");
		await expect(row("package.json")).toHaveFocus();
		// no wrapping
		await userEvent.keyboard("{ArrowDown}");
		await expect(row("package.json")).toHaveFocus();
		await userEvent.keyboard("{ArrowUp}");
		await expect(row("public")).toHaveFocus();
		await userEvent.keyboard("{Home}");
		await expect(row("root")).toHaveFocus();
		await userEvent.keyboard("{ArrowUp}");
		await expect(row("root")).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await expect(row("public")).toHaveFocus();
		await waitFor(() => expect(tabStopsOf(canvasElement)).toEqual(["public"]));
		// one tab stop: Tab leaves the tree, Shift+Tab comes back to the same row
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "After the tree" }),
		).toHaveFocus();
		await userEvent.tab({ shift: true });
		await expect(row("public")).toHaveFocus();
		await expect(args.onToggleExpanded).toHaveBeenCalledTimes(2);
	},
};

export const Issue3476Item11CheckboxRendererKeys: Story = {
	args: { onToggleExpanded: fn() },
	render: (args) => (
		<Harness
			tree={folder("root", [
				folder("src", [leaf("main.ts")]),
				leaf("README.md"),
			])}
			initial={["root"]}
			renderer={TreeViewCheckboxSelectionRenderer}
			onToggleExpanded={args.onToggleExpanded}
			withButtons
		/>
	),
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-11: with `TreeViewCheckboxSelectionRenderer`, the rows are the tab stop as well, and the checkboxes are not. A leaf under a collapsed folder is reached with ArrowRight and selected with Space; Enter selects a leaf without `onClick` too.",
			},
		},
	},
	play: async ({ args, canvas, canvasElement }) => {
		await canvas.findByText("README.md", {}, { timeout: 5000 });
		const row = (id: string) => rowById(canvasElement, id);
		canvas.getByRole("button", { name: "Before the tree" }).focus();
		await userEvent.tab();
		await expect(row("root")).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}{ArrowRight}");
		await expect(args.onToggleExpanded).toHaveBeenLastCalledWith("src");
		await canvas.findByText("main.ts");
		await userEvent.keyboard("{ArrowRight}");
		await expect(row("main.ts")).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(args.onToggleExpanded).toHaveBeenLastCalledWith("main.ts");
		await waitFor(() =>
			expect(row("main.ts")).toHaveAttribute("aria-checked", "true"),
		);
		await expect(
			canvas.getByRole("checkbox", { name: "main.ts" }),
		).toBeChecked();
		await userEvent.keyboard("{ArrowDown}{Enter}");
		await expect(row("README.md")).toHaveFocus();
		await expect(args.onToggleExpanded).toHaveBeenLastCalledWith("README.md");
		await waitFor(() =>
			expect(row("README.md")).toHaveAttribute("aria-checked", "true"),
		);
		await expect(args.onToggleExpanded).toHaveBeenCalledTimes(3);
		// the checkboxes are no tab stops: Tab leaves the tree
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "After the tree" }),
		).toHaveFocus();
	},
};

export const Issue3476Item11KeepsFocusedRowInView: Story = {
	render: () => (
		<Harness tree={LONG_TREE} initial={["root"]} height={200} withButtons />
	),
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-11: in a tree that scrolls, End, Home, PageDown and PageUp move focus to rows that are not rendered yet and scroll them into view. While the row focused last is scrolled away, the list itself is the tab stop, and Shift+Tab into it focuses that row again, scrolled into view.",
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await canvas.findByText("leaf 10", {}, { timeout: 5000 });
		const scroller = scrollerOf(canvasElement);
		const focused = () => {
			const element = document.activeElement;
			if (!(element instanceof HTMLElement)) throw new Error("no focus");
			return element;
		};
		canvas.getByRole("button", { name: "Before the tree" }).focus();
		await userEvent.tab();
		await expect(rowById(canvasElement, "root")).toHaveFocus();
		await userEvent.keyboard("{End}");
		await waitFor(() =>
			expect(rowById(canvasElement, "leaf 99")).toHaveFocus(),
		);
		await waitFor(() => expectInView(scroller, focused()));
		await userEvent.keyboard("{Home}");
		await waitFor(() => expect(rowById(canvasElement, "root")).toHaveFocus());
		await waitFor(() => expectInView(scroller, focused()));
		// PageDown and PageUp: by the rows in view, less one (8 of 8.3 in 200px)
		await userEvent.keyboard("{PageDown}");
		await waitFor(() => expect(rowById(canvasElement, "leaf 7")).toHaveFocus());
		await userEvent.keyboard("{PageDown}");
		await waitFor(() =>
			expect(rowById(canvasElement, "leaf 15")).toHaveFocus(),
		);
		await waitFor(() => expectInView(scroller, focused()));
		await userEvent.keyboard("{PageUp}");
		await waitFor(() => expect(rowById(canvasElement, "leaf 7")).toHaveFocus());
		await waitFor(() => expectInView(scroller, focused()));
		// the row focused last scrolled away: the list is the tab stop
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "After the tree" }),
		).toHaveFocus();
		scroller.scrollTop = 2000;
		await waitFor(() => expect(canvas.queryByText("leaf 7")).toBeNull());
		await waitFor(() => expect(tabStopsOf(canvasElement)).toEqual(["tree"]));
		await userEvent.tab({ shift: true });
		await waitFor(() => expect(rowById(canvasElement, "leaf 7")).toHaveFocus());
		await waitFor(() => expectInView(scroller, focused()));
		// the list stops being a tab stop once react-window reports the rows it
		// rendered, an effect after the row got focus
		await waitFor(() => expect(tabStopsOf(canvasElement)).toEqual(["leaf 7"]));
	},
};

const LockedLeafTreeStory = () => {
	const [selected, setSelected] = useState<Set<string>>(
		new Set(["defibrillator"]),
	);

	const handleToggle = useCallback((id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const handleLoadChildren = useCallback(async () => {}, []);

	const leaf = (id: string, label: string, locked?: boolean): TreeData => ({
		id,
		label,
		icon: <InsertDriveFile />,
		hasChildren: false,
		expanded: selected.has(id),
		expandLocked: locked,
	});

	return (
		<Box
			sx={{
				width: 320,
				height: 160,
				border: "1px solid #ccc",
				overflow: "hidden",
			}}
		>
			<TreeView
				data={{
					id: "devices",
					label: "Devices",
					icon: <FolderOpen />,
					hasChildren: true,
					expanded: true,
					children: [
						leaf("pump", "Infusion pump"),
						leaf("defibrillator", "Defibrillator (locked)", true),
						leaf("ventilator", "Ventilator"),
						leaf("monitor", "Monitor (locked)", true),
					],
				}}
				renderer={TreeViewCheckboxSelectionRenderer}
				onToggleExpanded={handleToggle}
				onLoadChildren={handleLoadChildren}
			/>
		</Box>
	);
};

export const Issue3476Item13LockedLeafCheckboxDisabled: Story = {
	render: () => <LockedLeafTreeStory />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-13: the checkbox of a leaf with `expandLocked` is disabled and keeps its checked state, also when Space is pressed on its row (ISSUE-3476-ITEM-11: the rows are the tree's focus targets).",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvas, userEvent }) => {
		// the virtualized list draws the rows that fit its first size estimate and
		// the rest once it has measured itself, so wait for the last row
		const monitor = await canvas.findByRole(
			"checkbox",
			{ name: "Monitor (locked)" },
			{ timeout: 5000 },
		);
		const pump = canvas.getByRole("checkbox", { name: "Infusion pump" });
		const defibrillator = canvas.getByRole("checkbox", {
			name: "Defibrillator (locked)",
		});
		const ventilator = canvas.getByRole("checkbox", { name: "Ventilator" });
		await expect(defibrillator).toBeDisabled();
		await expect(defibrillator).toBeChecked();
		await expect(monitor).toBeDisabled();
		await expect(monitor).not.toBeChecked();
		await expect(pump).toBeEnabled();
		// Space on a locked leaf's row leaves it as it is, on the next leaf's row
		// it toggles that one
		const rowOf = (checkbox: HTMLElement) => {
			const row = checkbox.closest<HTMLElement>('[role="treeitem"]');
			if (!row) throw new Error("no row");
			return row;
		};
		rowOf(pump).focus();
		await userEvent.keyboard("{ArrowDown}");
		await expect(rowOf(defibrillator)).toHaveFocus();
		await userEvent.keyboard(" ");
		await userEvent.keyboard("{ArrowDown}");
		await expect(rowOf(ventilator)).toHaveFocus();
		await userEvent.keyboard(" ");
		await waitFor(() => expect(ventilator).toBeChecked());
		await expect(defibrillator).toBeChecked();
	},
};

export const Issue3476Item10ExposesATree: Story = {
	render: () => <DefaultTreeStory />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3476-ITEM-10: the list is a `tree` and every row a `treeitem` with its level, its position among its siblings and, for a folder, whether it is expanded.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvas }) => {
		// the last row: react-window renders every row once it has measured the list
		await canvas.findByRole(
			"treeitem",
			{ name: "package.json" },
			{ timeout: 5000 },
		);
		await expect(canvas.getByRole("tree")).not.toHaveAttribute(
			"aria-multiselectable",
		);
		const aria = (name: string) => {
			const item = canvas.getByRole("treeitem", { name });
			return [
				item.getAttribute("aria-level"),
				item.getAttribute("aria-posinset"),
				item.getAttribute("aria-setsize"),
				item.getAttribute("aria-expanded"),
			];
		};
		await expect(aria("Project root")).toEqual(["1", "1", "1", "true"]);
		await expect(aria("src")).toEqual(["2", "1", "3", "true"]);
		await expect(aria("utils")).toEqual(["3", "2", "2", "false"]);
		await expect(aria("public")).toEqual(["2", "2", "3", "false"]);
		await expect(aria("package.json")).toEqual(["2", "3", "3", null]);
	},
};
