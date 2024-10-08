import React, { useCallback, useEffect, useState } from "react";
import { Box, styled, Typography, useThemeProps } from "@mui/material";
import SingleSelect from "../../standalone/Selector/SingleSelect";
import MultiSelectWithoutGroup, {
	MultiSelectWithoutGroupProps,
} from "./MultiSelectWithoutGroup";
import {
	BaseSelectorData,
	BaseSelectorProps,
	SelectorLruOptions,
} from "./BaseSelector";
import uniqueArray from "../../utils/uniqueArray";
import Loader from "../Loader";
import { MultiSelectorData } from "./MultiSelect";
import combineClassNames from "../../utils/combineClassNames";

export interface MultiSelectWithTagsProps<
	DataT extends MultiSelectorData,
	GroupT extends BaseSelectorData,
> extends Pick<
			BaseSelectorProps<GroupT, false>,
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
			"classes" | "onChange" | "dataOptions" | "setDataOptions" | "label"
		> {
	// UI Props
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * Label above search bar
	 */
	searchInputLabel?: string;
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
		switchValue: boolean,
	) => DataT[] | Promise<DataT[]>;
	/**
	 * Search callback which is called to load available group entries
	 * @param query The search string
	 * @param switchValue The value of the switch or false if switch is disabled
	 */
	loadGroupOptions: (
		query: string,
		switchValue: boolean,
	) => GroupT[] | Promise<GroupT[]>;
	/**
	 * LRU options for group
	 */
	lruGroup?: SelectorLruOptions<GroupT>;
	/**
	 * LRU options for data
	 */
	lruData?: SelectorLruOptions<DataT>;
	/**
	 * custom CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<MultiSelectWithTagsClassKey, string>>;
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

const Root = styled("div", { name: "CcMultiSelectWithTags", slot: "root" })({
	position: "relative",
});

const LoadOverlay = styled("div", {
	name: "CcMultiSelectWithTags",
	slot: "loadOverlay",
})({
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	zIndex: 9999,
	backgroundColor: "rgba(255,255,255,.3)",
	transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 500ms",
});

export type MultiSelectWithTagsClassKey = "root" | "loadOverlay";

const MultiSelectWithTags = <
	DataT extends MultiSelectorData,
	GroupT extends BaseSelectorData,
>(
	inProps: MultiSelectWithTagsProps<DataT, GroupT>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcMultiSelectWithTags",
	});
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
		lruGroup,
		lruData,
		sortCompareFn,
		className,
		classes,
	} = props;

	const defaultSwitchValue = props.displaySwitch
		? (props.defaultSwitchValue ?? false)
		: false;
	const [selectedGroups, setSelectedGroups] = useState<SelectedGroup[]>([]);
	const [switchValue, setSwitchValue] = useState<boolean>(defaultSwitchValue);
	const [loadingGroupRecords, setLoadingGroupRecords] = useState(false);
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
				(group) => !group.items.find((item) => !selectedIds.includes(item)),
			),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

	const handleGroupSelect = useCallback(
		async (selectedGroup: GroupT | null) => {
			if (!selectedGroup || !onChange) return;
			try {
				setLoadingGroupRecords(true);
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
									combinedArray.find(
										(entry) => getId(entry) === value,
									) as DataT,
							),
					),
				);
			} finally {
				setLoadingGroupRecords(false);
			}
		},
		[onChange, loadGroupEntries, getId, selected],
	);

	const loadGroupOptionsAndProcess = useCallback(
		async (query: string) => {
			const selectedGroupIds = selectedGroups.map((group) => group.group);
			return (await loadGroupOptions(query, switchValue)).filter(
				(group) => !selectedGroupIds.includes(group.value),
			);
		},
		[loadGroupOptions, selectedGroups, switchValue],
	);

	return (
		<Root className={combineClassNames([className, classes?.root])}>
			<LoadOverlay
				className={classes?.loadOverlay}
				style={
					loadingGroupRecords
						? { visibility: "visible", opacity: 1 }
						: { visibility: "hidden", opacity: 0 }
				}
			>
				<Loader />
			</LoadOverlay>
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
				disabled={disabled || loadingGroupRecords}
				enableIcons={enableIcons}
				noOptionsText={noOptionsText}
				loadingText={loadingText}
				openText={openText}
				closeText={closeText}
				lru={lruGroup}
			/>
			<Box pt={3}>
				<MultiSelectWithoutGroup<DataT>
					autocompleteId={autocompleteId}
					selected={selected}
					disabled={disabled}
					label={searchInputLabel}
					enableIcons={enableIcons}
					switchValue={switchValue}
					setSwitchValue={setSwitchValue}
					switchLabel={switchLabel}
					displaySwitch={props.displaySwitch}
					loadDataOptions={loadDataOptions}
					openInfo={openInfo}
					onSelect={onChange}
					getIdOfData={getId}
					noOptionsText={noOptionsText}
					loadingText={loadingText}
					lru={lruData}
					sortCompareFn={sortCompareFn}
				/>
			</Box>
		</Root>
	);
};

export default React.memo(MultiSelectWithTags) as typeof MultiSelectWithTags;
