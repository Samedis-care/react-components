import React from "react";
import "../../../i18n";
import { BaseSelectorData, SingleSelect } from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { Box, CssBaseline } from "@material-ui/core";

export const SelectorSingle = (): React.ReactElement => {
	const [selected, setSelected] = React.useState<BaseSelectorData | null>(null);
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const enableAddNew = boolean("Enable Add New", false);
	const disableClearable = boolean("Disable clearable?", false);
	const icons = boolean("Enable Icons", false);
	const disabled = boolean("Disable", false);
	const addNewLabel = text("Add new label", "Add");
	const loadingText = text("Loading Text", "Loading..");
	const noOptionsText = text("No options Label", "No Option");
	const placeholderLabel = text("Placeholder Label", "Select..");

	const loadData = React.useCallback(
		(query: string): BaseSelectorData[] => {
			loadDataAction(query);
			if (query) {
				return colourOptions.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				);
			} else return [];
		},
		[loadDataAction]
	);
	const onSelect = React.useCallback(
		(data: BaseSelectorData | null) => {
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
					disableClearable={disableClearable}
					disabled={disabled}
					addNewLabel={addNewLabel}
					loadingText={loadingText}
					noOptionsText={noOptionsText}
					placeholder={placeholderLabel}
					defaultOptions={colourOptions}
				/>
			</Box>
		</>
	);
};

SelectorSingle.storyName = "Single";
