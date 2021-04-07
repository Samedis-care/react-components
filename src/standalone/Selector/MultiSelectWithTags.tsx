import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import {
	BaseSelectorProps,
	MultiSelectorData,
	SingleSelect,
} from "../../standalone/Selector";
import MultiSelectWithoutGroup, {
	MultiSelectWithoutGroupProps,
} from "./MultiSelectWithoutGroup";
import { BaseSelectorData } from "./BaseSelector";
import { uniqueArray } from "../../utils";
import InlineSwitch from "../InlineSwitch";

export interface MultiSelectWithTagsProps<
	DataT extends MultiSelectorData,
	GroupT extends BaseSelectorData
> extends Pick<
			BaseSelectorProps<GroupT>,
			| "disabled"
			| "noOptionsText"
			| "loadingText"
			| "closeText"
			| "openText"
			| "displaySwitch"
			| "defaultSwitchValue"
			| "switchLabel"
		>,
		Omit<
			MultiSelectWithoutGroupProps<DataT>,
			"classes" | "onChange" | "dataOptions" | "setDataOptions"
		> {
	// UI Props
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * Custom styles for multi select without groups
	 */
	subClasses?: {
		dataSelector: MultiSelectWithoutGroupProps<DataT>["classes"];
	};
	/**
	 * Change event callback
	 * @param data The currently selected entries. This should be feed back to selected prop
	 */
	onChange?: (data: DataT[]) => void;
	// Required callbacks
	/**
	 * Callback which loads the data entries for the given group
	 * @param group The group which was selected
	 * @returns The data entries to add for this group
	 */
	loadGroupEntries: (group: GroupT) => DataT[] | Promise<DataT[]>;
	/**
	 * Search callback which is called to load available data entries
	 * @param query The search string
	 * @param switchValue The value of the switch or false if switch is disabled
	 */
	loadDataOptions: (
		query: string,
		switchValue: boolean
	) => DataT[] | Promise<DataT[]>;
	/**
	 * Search callback which is called to load available group entries
	 * @param query The search string
	 * @param switchValue The value of the switch or false if switch is disabled
	 */
	loadGroupOptions: (
		query: string,
		switchValue: boolean
	) => GroupT[] | Promise<GroupT[]>;
}

interface SelectedGroup {
	/**
	 * ID of the Group
	 */
	group: string;
	/**
	 * IDs of the selected items
	 */
	items: string[];
}

const useStyles = makeStyles({
	switch: {
		position: "absolute",
		marginTop: 75,
		right: 20,
		direction: "rtl",
	},
});

const MultiSelectWithTags = <
	DataT extends MultiSelectorData,
	GroupT extends BaseSelectorData
>(
	props: MultiSelectWithTagsProps<DataT, GroupT>
) => {
	const {
		title,
		searchInputLabel,
		selected,
		disabled,
		autocompleteId,
		enableIcons,
		noOptionsText,
		loadingText,
		openText,
		closeText,
		loadGroupEntries,
		loadGroupOptions,
		loadDataOptions,
		onChange,
		openInfo,
		getIdOfData,
		switchLabel,
	} = props;

	const defaultSwitchValue = props.displaySwitch
		? props.defaultSwitchValue ?? false
		: false;
	const classes = useStyles();
	const [selectedGroups, setSelectedGroups] = useState<SelectedGroup[]>([]);
	const [switchValue, setSwitchValue] = useState<boolean>(defaultSwitchValue);
	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	// set switch value if switch visibility is toggled
	useEffect(() => {
		setSwitchValue(defaultSwitchValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [!!props.displaySwitch]);

	// remove selected groups if an item has been unselected
	useEffect(() => {
		const selectedIds = selected.map(getId);
		setSelectedGroups((oldSelectedGroups) =>
			oldSelectedGroups.filter(
				(group) => !group.items.find((item) => !selectedIds.includes(item))
			)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	const handleGroupSelect = useCallback(
		async (selectedGroup: GroupT | null) => {
			if (!selectedGroup || !onChange) return;
			const groupEntries = await loadGroupEntries(selectedGroup);
			const groupEntryIds = groupEntries.map(getId);
			const combinedArray = [...selected, ...groupEntries];
			setSelectedGroups((prevState) => [
				...prevState,
				{
					group: selectedGroup.value,
					items: groupEntryIds,
				},
			]);
			onChange(
				uniqueArray(
					combinedArray
						.map(getId)
						.map(
							(value) =>
								combinedArray.find((entry) => getId(entry) === value) as DataT
						)
				)
			);
		},
		[onChange, loadGroupEntries, getId, selected]
	);

	const loadGroupOptionsAndProcess = useCallback(
		async (query: string) => {
			const selectedGroupIds = selectedGroups.map((group) => group.group);
			return (await loadGroupOptions(query, switchValue)).filter(
				(group) => !selectedGroupIds.includes(group.value)
			);
		},
		[loadGroupOptions, selectedGroups, switchValue]
	);

	return (
		<div>
			<Typography component="label" variant={"caption"} color={"textSecondary"}>
				{title}
			</Typography>
			<SingleSelect
				autocompleteId={
					autocompleteId ? autocompleteId + "-group-select" : undefined
				}
				selected={null}
				onSelect={handleGroupSelect}
				refreshToken={selectedGroups.length.toString()}
				onLoad={loadGroupOptionsAndProcess}
				disabled={disabled}
				enableIcons={enableIcons}
				noOptionsText={noOptionsText}
				loadingText={loadingText}
				openText={openText}
				closeText={closeText}
			/>{" "}
			<InlineSwitch
				visible={!!props.displaySwitch}
				value={switchValue}
				onChange={setSwitchValue}
				label={switchLabel}
				classes={classes}
			>
				<MultiSelectWithoutGroup<DataT>
					autocompleteId={autocompleteId}
					selected={selected}
					disabled={disabled}
					searchInputLabel={searchInputLabel}
					enableIcons={enableIcons}
					switchValue={switchValue}
					loadDataOptions={loadDataOptions}
					openInfo={openInfo}
					onChange={onChange}
					refreshToken={selected.map(getId).join(",")}
					getIdOfData={getId}
					noOptionsText={noOptionsText}
					loadingText={loadingText}
				/>
			</InlineSwitch>
		</div>
	);
};

export default React.memo(MultiSelectWithTags) as typeof MultiSelectWithTags;
