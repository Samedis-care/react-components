import React, { useState } from "react";
import "../../../i18n";
import {
	MultiSelectWithTags,
	MultiSelectorData,
	SelectorData,
} from "../../../standalone/Selector";
import { colourOptions, colourTypeOptions } from "./Data";
import { action, withActions } from "@storybook/addon-actions";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
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
	return (colourOptions.filter((e) => e !== undefined) as SelectorData[]).map(
		enhanceData
	);
};

export const SelectorMultiWithTags = (): React.ReactElement => {
	const [selectedGroups, setGroupSelected] = useState<SelectorData | null>(
		null
	);
	const [selected, setSelected] = useState<MySelectorData[]>([]);
	const [data, setData] = useState<MySelectorData[]>(getDefaultData);
	const loadGroupDataAction = action("onGroupLoad");
	const loadDataAction = action("onLoad");
	const onGroupSelectAction = action("onGroupSelect");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const title = text("Title", "Multi Selector");
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
			return data
				.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				)
				.map(enhanceData);
		},
		[data, loadDataAction]
	);
	const onSelect = React.useCallback(
		(data: MySelectorData[]) => {
			onSelectAction(data);
			setSelected(data);
		},
		[onSelectAction, setSelected]
	);

	const loadGroupData = React.useCallback(
		(query: string): MySelectorData[] => {
			loadGroupDataAction(query);
			return colourTypeOptions
				.filter((option) =>
					option.value.toLowerCase().includes(query.toLowerCase())
				)
				.map(enhanceData);
		},
		[loadGroupDataAction]
	);
	const onGroupSelect = React.useCallback(
		(data: SelectorData | null) => {
			onGroupSelectAction(data);
			setGroupSelected(data);
			if (data !== null) {
				const records = colourOptions
					.filter(
						(option) => option.type.toLowerCase() === data.value.toLowerCase()
					)
					.map(enhanceData);
				setSelected(records);
			}
			loadData;
		},
		[loadData, onGroupSelectAction]
	);

	return (
		<>
			<CssBaseline />
			<Box m={2}>
				<MultiSelectWithTags<MySelectorData>
					title={title}
					selectedGroup={selectedGroups}
					onGroupSelect={onGroupSelect}
					onGroupLoad={loadGroupData}
					selected={selected}
					filteredData={data}
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

SelectorMultiWithTags.storyName = "MultiWithTags";
SelectorMultiWithTags.decorators = [withActions, withKnobs];
