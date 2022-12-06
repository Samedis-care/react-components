import React, { useCallback, useState } from "react";
import TreeView, { TreeDataFlat } from "../../../standalone/Tree/TreeView";
import { action } from "@storybook/addon-actions";

export const TreeViewStory = (): React.ReactElement => {
	const [data, setData] = useState<TreeDataFlat[]>([
		{
			parentId: null,
			id: "root",
			expanded: true,
			hasChildren: true,
			icon: null,
			label: "Root",
		},
		{
			parentId: "root",
			id: "child-1",
			expanded: false,
			hasChildren: false,
			icon: null,
			label: "Child 1",
		},
		{
			parentId: "root",
			id: "child-2",
			expanded: false,
			hasChildren: false,
			icon: null,
			label: `Child 2 has some extremely ${new Array(250)
				.fill("long")
				.join(" ")} label`,
		},
	]);

	const loadChildren = useCallback((id: string) => {
		action("loadChildren")(id);
	}, []);

	const toggleExpanded = useCallback((id: string) => {
		setData((prev) =>
			prev.map((entry) =>
				entry.id === id ? { ...entry, expanded: !entry.expanded } : entry
			)
		);
	}, []);

	return (
		<div style={{ width: "calc(100vw - 32px)", height: "calc(100vh - 32px)" }}>
			<TreeView
				data={data}
				onLoadChildren={loadChildren}
				onToggleExpanded={toggleExpanded}
			/>
		</div>
	);
};

TreeViewStory.storyName = "TreeView";
