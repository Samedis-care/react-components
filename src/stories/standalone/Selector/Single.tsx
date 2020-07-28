import React, { useState } from "react";
import "../../../i18n";
import { SelectorData, SingleSelect } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";

export default {
	title: "Standalone/Selector",
	component: SingleSelect,
};

export const SelectorSingle = () => {
	const [selected, setSelected] = useState<SelectorData | null>(null);
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");

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
		<SingleSelect selected={selected} onSelect={onSelect} onLoad={loadData} />
	);
};

SelectorSingle.story = {
	name: "Single",
};
