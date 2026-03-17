import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import TreeView from "../../src/standalone/Tree/TreeView";
import TreeViewCheckboxSelectionRenderer from "../../src/standalone/Tree/TreeViewCheckboxSelectionRenderer";
import type {
	TreeData,
	TreeDataFlat,
} from "../../src/standalone/Tree/TreeView";

// react-window List uses ResizeObserver — must be a real class constructor
beforeAll(() => {
	class ResizeObserverStub {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
		constructor(_callback: ResizeObserverCallback) {
			void _callback;
		}
	}
	global.ResizeObserver =
		ResizeObserverStub as unknown as typeof ResizeObserver;
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

const noop = vi.fn();
const noopAsync = async () => {};

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
