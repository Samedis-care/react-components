import React, { useState } from "react";
import "../../../i18n";
import {
	MultiSelectWithTags,
	MultiSelectorData,
	SelectorData,
} from "../../../standalone/Selector";
import { colourOptions, colourTypeOptions } from "./Data";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";

interface MySelectorData extends MultiSelectorData {
	id: string;
	type?: string;
	isFixed?: boolean;
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
	const defaultData = getDefaultData();
	const [switchValue, setSwitchValue] = useState<boolean>(false);
	const loadGroupDataAction = action("onGroupLoad");
	const loadDataAction = action("onLoad");
	const onGroupSelectAction = action("onGroupSelect");
	const onSelectAction = action("onSelect");
	const onAddNewAction = action("onAddNew");
	const title = text("Title", "Multi Selector");
	const enableAddNew = boolean("Enable Add New", false);
	const icons = boolean("Enable Icons", false);
	const disable = boolean("Disable", false);
	const addNewLabel = text("Add new label", "");
	const loadingLabel = text("Loading Label", "");
	const noDataLabel = text("No data Label", "");
	const placeholderLabel = text("Placeholder Label", "");
	const displaySwitch = boolean("Enable Switch", false);
	const switchLabel = text("Switch Label Text", "Select from all");
	const searchInputLabel = text("Search Label", "Search");

	const loadFilteredData = React.useCallback(() => {
		return displaySwitch && !switchValue
			? defaultData.filter((option) => !option.isFixed)
			: defaultData;
	}, [defaultData, displaySwitch, switchValue]);

	const [filteredData, setFilteredData] = useState<MySelectorData[]>(
		loadFilteredData
	);

	const loadData = React.useCallback(
		(query: string): MySelectorData[] => {
			loadDataAction(query);
			return filteredData
				.filter((option) =>
					option.label.toLowerCase().includes(query.toLowerCase())
				)
				.map(enhanceData);
		},
		[filteredData, loadDataAction]
	);

	const onSelect = React.useCallback(
		(selectorDatas: MySelectorData[]) => {
			onSelectAction(selectorDatas);
			setSelected(selectorDatas);
		},
		[onSelectAction]
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
		(selectedGroup: SelectorData | null) => {
			onGroupSelectAction(selectedGroup);
			setGroupSelected(selectedGroup);
		},
		[onGroupSelectAction]
	);

	const handleAutoComplete = React.useCallback(
		(selectedValue: MySelectorData) => {
			selected.push(selectedValue);
			onSelect(selected);
			setFilteredData(
				filteredData.filter((d) => d.value !== selectedValue.value)
			);
		},
		[selected, onSelect, filteredData]
	);

	const handleFilteredData = React.useCallback(
		(selectorValue: MySelectorData) => {
			if (!displaySwitch || switchValue) {
				filteredData.push(selectorValue);
			} else {
				if (!selectorValue.isFixed) filteredData.push(selectorValue);
			}
			setFilteredData(filteredData);
		},
		[displaySwitch, filteredData, switchValue]
	);

	const handleSwitch = React.useCallback(
		(switchValue: boolean) => {
			let switchedData = defaultData;
			selected.forEach((s) => {
				switchedData = switchedData.filter((d) => d.value !== s.value);
			});
			if (!switchValue) {
				switchedData = switchedData.filter((option) => !option.isFixed);
			}
			setSwitchValue(switchValue);
			setFilteredData(switchedData);
		},
		[defaultData, selected]
	);

	return (
		<MultiSelectWithTags<MySelectorData>
			key={filteredData.length}
			title={title}
			autocompleteId={"multi-select-with-tags"}
			displaySwitch={displaySwitch}
			switchLabel={switchLabel}
			switchValue={switchValue}
			handleSwitch={handleSwitch}
			selectedGroup={selectedGroups}
			onGroupSelect={onGroupSelect}
			onGroupLoad={loadGroupData}
			selected={selected}
			setSelected={setSelected}
			defaultData={defaultData}
			filteredData={filteredData}
			setFilteredData={setFilteredData}
			handleFilteredData={handleFilteredData}
			onSelect={onSelect}
			onLoad={loadData}
			handleAutoComplete={handleAutoComplete}
			onAddNew={enableAddNew ? onAddNewAction : undefined}
			enableIcons={icons}
			disable={disable}
			addNewLabel={addNewLabel}
			loadingLabel={loadingLabel}
			noDataLabel={noDataLabel}
			placeholderLabel={placeholderLabel}
			searchInputLabel={searchInputLabel}
			infoText={
				<div
					dangerouslySetInnerHTML={{
						__html: text(
							"Info Text",
							"This is a pretty long info text which supports html. It really is."
						),
					}}
				/>
			}
		/>
	);
};

SelectorMultiWithTags.storyName = "MultiWithTags";
