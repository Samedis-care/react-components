import React, { useState, useCallback } from "react";
import "../../../i18n";
import {
	MultiSelect,
	MultiSelectorData,
	BaseSelectorData,
} from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text, select } from "@storybook/addon-knobs";
import { Box, FormControl } from "@material-ui/core";
import CustomMultiSelectEntry from "./CustomMultiSelectEntry";

interface MySelectorData extends MultiSelectorData {
	id: string;
}

const enhanceData = (entry: BaseSelectorData): MySelectorData => ({
	...entry,
	onClick: action("onClick: " + entry.label),
	canUnselect: (evtEntry: MultiSelectorData) => {
		action("canUnselect: " + evtEntry.label)(evtEntry);
		return true;
	},
	id: entry.value,
});

const getDefaultData = (): MySelectorData[] => {
	return (["ocean"]
		.map((entry) => colourOptions.find((color) => color.value === entry))
		.filter((e) => e !== undefined) as BaseSelectorData[]).map(enhanceData);
};

export const SelectorMulti = (): React.ReactElement => {
	const [selected, setSelected] = useState<BaseSelectorData[]>(getDefaultData);
	const varientMode = select(
		"TextField mode",
		{
			outlined: "outlined",
			standard: "standard",
		},
		"outlined"
	);
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const label = text("Label", "Example multi select");
	const enableAddNew = boolean("Enable Add New", false);
	const icons = boolean("Enable Icons", false);
	const disabled = boolean("Disable", false);
	const customSelectedRenderer = boolean(
		"Enable Custom Selected Renderer",
		false
	);
	const addNewLabel = text("Add new label", "Add");
	const loadingText = text("Loading Text", "Loading..");
	const noOptionsText = text("No data Label", "No option");
	const placeholderLabel = text("Placeholder Label", "Select..");

	const loadData = useCallback(
		(query: string): MySelectorData[] => {
			loadDataAction(query);
			return colourOptions
				.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				)
				.map(enhanceData);
		},
		[loadDataAction]
	);

	const onSelect = useCallback(
		(data: BaseSelectorData[]) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	return (
		<Box m={2}>
			{/* form control is required to correctly position label */}
			<FormControl component={"fieldset"} fullWidth>
				<MultiSelect
					label={label}
					varient={varientMode}
					selected={selected}
					onSelect={onSelect}
					onLoad={loadData}
					onAddNew={enableAddNew ? onAddNewAction : undefined}
					enableIcons={icons}
					selectedEntryRenderer={
						customSelectedRenderer ? CustomMultiSelectEntry : undefined
					}
					disabled={disabled}
					addNewLabel={addNewLabel}
					loadingText={loadingText}
					noOptionsText={noOptionsText}
					placeholder={placeholderLabel}
					autocompleteId={"multi-select"}
				/>
			</FormControl>
		</Box>
	);
};

SelectorMulti.storyName = "Multi";
