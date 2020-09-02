import React, { useState } from "react";
import "../../../i18n";
import { SelectorData, SingleSelect } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import { Box, CssBaseline } from "@material-ui/core";

const Settings = {
	title: "Standalone/Selector",
	component: SingleSelect,
	decorators: [withKnobs],
};
export default Settings;

export const SelectorSingle = () => {
	const [selected, setSelected] = useState<SelectorData | null>(null);
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const enableAddNew = boolean("Enable Add New", false);
	const clearable = boolean("Clearable?", false);
	const icons = boolean("Enable Icons", false);
	const disable = boolean("Disable", false);
	const addNewLabel = text("Add new label", "");
	const loadingLabel = text("Loading Label", "");
	const noDataLabel = text("No data Label", "");
	const placeholderLabel = text("Placeholder Label", "");

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
		<>
			<CssBaseline />
			<Box m={2}>
				<SingleSelect
					selected={selected}
					onSelect={onSelect}
					onLoad={loadData}
					onAddNew={enableAddNew ? onAddNewAction : undefined}
					enableIcons={icons}
					clearable={clearable}
					disable={disable}
					addNewLabel={addNewLabel}
					loadingLabel={loadingLabel}
					noDataLabel={noDataLabel}
					placeholderLabel={placeholderLabel}
				/>
			</Box>
		</>
	);
};

SelectorSingle.story = {
	name: "Single",
};
