import React, { useState } from "react";
import "../../../i18n";
import { SelectorData, SingleSelect } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, withKnobs } from "@storybook/addon-knobs";

export default {
	title: "Standalone/Selector",
	component: SingleSelect,
	decorators: [withKnobs],
};

export const SelectorSingle = () => {
	const [selected, setSelected] = useState<SelectorData | null>(null);
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const enableAddNew = boolean("Enable Add New", false);
	const icons = boolean("Enable Icons", false);

	const loadData = React.useCallback(
		async (query: string) => {
			loadDataAction(query);
			return colourOptions.filter((option) =>
				option.label.toLowerCase().includes(query.toLowerCase())
			);
		},
		[loadDataAction]
	);
	const onSelect = React.useCallback(
		(data: SelectorData | null) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	return (
		<SingleSelect
			selected={selected}
			onSelect={onSelect}
			onLoad={loadData}
			onAddNew={enableAddNew ? onAddNewAction : undefined}
			enableIcons={icons}
		/>
	);
};

SelectorSingle.story = {
	name: "Single",
};
