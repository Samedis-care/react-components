import React, { useState } from "react";
import "../../../i18n";
import { MultiSelect, SelectorData } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, withKnobs } from "@storybook/addon-knobs";

export default {
	title: "Standalone/Selector",
	component: MultiSelect,
	decorators: [withKnobs],
};

const getDefaultData = (): SelectorData[] => {
	return ["ocean"]
		.map((entry) => colourOptions.find((color) => color.value === entry))
		.filter((e) => e !== undefined) as SelectorData[];
};

export const SelectorMulti = () => {
	const [selected, setSelected] = useState<SelectorData[]>(getDefaultData);
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
		(data: SelectorData[]) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	return (
		<MultiSelect
			selected={selected}
			onSelect={onSelect}
			onLoad={loadData}
			onAddNew={enableAddNew ? onAddNewAction : undefined}
			enableIcons={icons}
		/>
	);
};

SelectorMulti.story = {
	name: "Multi",
};
