import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor } from "storybook/test";
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
					"ISSUE-3476-ITEM-13: the checkbox of a leaf with `expandLocked` is disabled, keeps its checked state and is skipped by Tab.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvas, userEvent }) => {
		const pump = await canvas.findByRole(
			"checkbox",
			{ name: "Infusion pump" },
			{ timeout: 5000 },
		);
		const defibrillator = canvas.getByRole("checkbox", {
			name: "Defibrillator (locked)",
		});
		const monitor = canvas.getByRole("checkbox", { name: "Monitor (locked)" });
		const ventilator = canvas.getByRole("checkbox", { name: "Ventilator" });
		await expect(defibrillator).toBeDisabled();
		await expect(defibrillator).toBeChecked();
		await expect(monitor).toBeDisabled();
		await expect(monitor).not.toBeChecked();
		await expect(pump).toBeEnabled();
		// Tab goes from one unlocked leaf to the next, past the locked one
		pump.focus();
		await userEvent.tab();
		await expect(ventilator).toHaveFocus();
	},
};
