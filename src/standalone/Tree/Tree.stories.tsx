import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import { Box } from "@mui/material";
import { FolderOpen, Folder, InsertDriveFile } from "@mui/icons-material";
import TreeView from "./TreeView";
import type { TreeData, TreeDataFlat } from "./TreeView";
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
