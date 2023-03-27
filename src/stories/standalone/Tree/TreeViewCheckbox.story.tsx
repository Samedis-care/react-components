import React, { useCallback, useState } from "react";
import TreeView, { TreeDataFlat } from "../../../standalone/Tree/TreeView";
import { action } from "@storybook/addon-actions";
import TreeViewCheckboxSelectionRenderer from "../../../standalone/Tree/TreeViewCheckboxSelectionRenderer";
import { initialTreeData } from "./TreeView.story";

export const TreeViewCheckboxStory = (): React.ReactElement => {
	const [data, setData] = useState<TreeDataFlat[]>(initialTreeData);

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
				renderer={TreeViewCheckboxSelectionRenderer}
			/>
		</div>
	);
};

TreeViewCheckboxStory.storyName = "TreeView (Checkbox)";
