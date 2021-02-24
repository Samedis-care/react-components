import React, { useCallback, useEffect, useState } from "react";
import {
	Typography,
	Switch,
	Grid,
	Theme,
	withStyles,
	makeStyles,
} from "@material-ui/core";
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

export interface MultiSelectWithTagsProps<
	DataT extends MultiSelectorData,
	GroupT extends BaseSelectorData
> extends Pick<
			BaseSelectorProps<GroupT>,
			"disabled" | "noOptionsText" | "loadingText"
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
	 * Custom styles
	 */
	classes?: Partial<keyof ReturnType<typeof useStyles>>;
	/**
	 * Custom styles for multi select without groups
	 */
	subClasses?: {
		dataSelector: MultiSelectWithoutGroupProps<DataT>["classes"];
	};
	/**
	 * Label for switch control (only used if displaySwitch is truthy)
	 */
	switchLabel?: React.ReactNode;
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

const useStyles = makeStyles(
	(theme: Theme) => ({
		paperWrapper: {
			boxShadow: "none",
			border: `1px solid ${theme.palette.divider}`,
		},
		outlined: {
			float: "left",
			backgroundColor: "#cce1f6",
			padding: "0px 20px",
			borderRadius: 20,
			borderColor: "#cce1f6",
			margin: "5px",
			lineHeight: "30px",
		},
		labelWithSwitch: {
			marginTop: 15,
		},
		searchLabel: {
			lineHeight: "30px",
			float: "left",
		},
		switch: {
			lineHeight: "30px",
			float: "right",
		},
	}),
	{ name: "CcMultiSelectWithTags" }
);

const AntSwitch = withStyles((theme: Theme) => ({
	root: {
		width: 35,
		height: 16,
		padding: 0,
		display: "flex",
	},
	switchBase: {
		padding: 2,
		color: theme.palette.grey[500],
		"&$checked": {
			transform: "translateX(18px)",
			color: theme.palette.common.white,
			"& + $track": {
				opacity: 1,
				backgroundColor: theme.palette.primary.main,
				borderColor: theme.palette.primary.main,
			},
		},
	},
	thumb: {
		width: 12,
		height: 12,
		boxShadow: "none",
	},
	track: {
		border: `1px solid ${theme.palette.grey[500]}`,
		borderRadius: 16 / 2,
		opacity: 1,
		backgroundColor: theme.palette.common.white,
	},
	checked: {},
}))(Switch);

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
		loadGroupEntries,
		loadGroupOptions,
		loadDataOptions,
		onChange,
		openInfo,
		getIdOfData,
	} = props;
	const classes = useStyles(props);
	const defaultSwitchValue = props.displaySwitch
		? props.defaultSwitchValue ?? false
		: false;
	const [selectedGroups, setSelectedGroups] = useState<SelectedGroup[]>([]);
	const [switchValue, setSwitchValue] = useState(defaultSwitchValue);

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

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSwitchValue(event.target.checked);
		},
		[setSwitchValue]
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
		<Typography component="div">
			<Typography component="label">{title}</Typography>
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
			/>
			<Typography component="div" className={classes.labelWithSwitch}>
				{props.displaySwitch && (
					<Typography component="div" className={classes.switch}>
						<Grid component="label" container alignItems="center" spacing={1}>
							<Grid item>
								<AntSwitch
									checked={switchValue}
									onChange={handleSwitchChange}
								/>
							</Grid>
							<Grid item>{props.switchLabel}</Grid>
						</Grid>
					</Typography>
				)}
				<MultiSelectWithoutGroup<DataT>
					autocompleteId={autocompleteId}
					selected={selected}
					disabled={disabled}
					searchInputLabel={searchInputLabel}
					enableIcons={enableIcons}
					defaultSwitchValue={props.defaultSwitchValue}
					displaySwitch={props.displaySwitch}
					loadDataOptions={loadDataOptions}
					openInfo={openInfo}
					onChange={onChange}
					refreshToken={selected.map(getId).join(",")}
				/>
			</Typography>
		</Typography>
	);
};

export default React.memo(MultiSelectWithTags) as typeof MultiSelectWithTags;
