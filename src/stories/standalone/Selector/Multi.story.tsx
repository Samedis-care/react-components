import React, { useState } from "react";
import "../../../i18n";
import {
	MultiSelect,
	MultiSelectorData,
	SelectorData,
} from "../../../standalone/Selector";
import { colourOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { Box, CssBaseline } from "@material-ui/core";
import CustomMultiSelectEntry from "./CustomMultiSelectEntry";

interface MySelectorData extends MultiSelectorData {
	id: string;
}

const enhanceData = (entry: SelectorData): MySelectorData => ({
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
		.filter((e) => e !== undefined) as SelectorData[]).map(enhanceData);
};

export const SelectorMulti = (): React.ReactElement => {
	const [selected, setSelected] = useState<MySelectorData[]>(getDefaultData);
	const loadDataAction = action("onLoad");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const enableAddNew = boolean("Enable Add New", false);
	const icons = boolean("Enable Icons", false);
	const disable = boolean("Disable", false);
	const customSelectedRenderer = boolean(
		"Enable Custom Selected Renderer",
		false
	);
	const addNewLabel = text("Add new label", "");
	const loadingLabel = text("Loading Label", "");
	const noDataLabel = text("No data Label", "");
	const placeholderLabel = text("Placeholder Label", "");

	const loadData = React.useCallback(
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
	const onSelect = React.useCallback(
		(data: MySelectorData[]) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	return (
		<>
			<CssBaseline />
			<Box m={2}>
				<MultiSelect<MySelectorData>
					selected={selected}
					onSelect={onSelect}
					onLoad={loadData}
					onAddNew={enableAddNew ? onAddNewAction : undefined}
					enableIcons={icons}
					selectedEntryRenderer={
						customSelectedRenderer ? CustomMultiSelectEntry : undefined
					}
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

SelectorMulti.storyName = "Multi";
