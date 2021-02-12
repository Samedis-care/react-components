import React, { useCallback, useEffect, useState } from "react";
import {
	TextFieldProps,
	Typography,
	Switch,
	Grid,
	createStyles,
	makeStyles,
	Theme,
	IconButton,
	withStyles,
	makeStyles,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
	Search as SearchIcon,
	Info as InfoIcon,
	Cancel as RemoveIcon,
} from "@material-ui/icons";
import {
	BaseSelectorProps,
	MultiSelectorData,
	SingleSelect,
} from "../../standalone/Selector";
import { BaseSelectorData } from "./BaseSelector";

import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../UIKit/TextFieldWithHelp";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import { uniqueArray } from "../../utils";

export interface MultiSelectWithTagsProps<
	DataT extends MultiSelectorData,
	GroupT extends BaseSelectorData
> extends Pick<
			BaseSelectorProps<GroupT>,
			| "disabled"
			| "autocompleteId"
			| "enableIcons"
			| "noOptionsText"
			| "loadingText"
		>,
		TextFieldWithHelpProps {
	// UI Props
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * Label for search input control
	 */
	searchInputLabel?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<keyof ReturnType<typeof useStyles>>;
	/**
	 * Display switch control?
	 */
	displaySwitch?: boolean;
	/**
	 * Label for switch control (only used if displaySwitch is truthy)
	 */
	switchLabel?: React.ReactNode;
	/**
	 * Default state of switch control (only used if displaySwitch is truthy)
	 */
	defaultSwitchValue?: boolean;
	// Data management props
	/**
	 * The currently selected values
	 */
	selected: DataT[];
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

const themingStyles = makeStyles((theme: Theme) => ({
	selectorLabel: {
		display: theme.componentsCare?.selector?.label?.display || "inline-block",
		color: theme.componentsCare?.selector?.label?.color,
		fontWeight: theme.componentsCare?.selector?.label?.fontWeight,
		fontSize: theme.componentsCare?.selector?.label?.fontSize,
		margin: theme.componentsCare?.selector?.label?.margin,
		...theme.componentsCare?.selector?.label?.style,
	},
}));

const styles = createStyles((theme: Theme) => ({
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
		fontStyle: "italic",
	},
	switch: {
		lineHeight: "30px",
		float: "right",
	},
}));

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
				borderColor: "5px dotted blue", //theme.palette.primary.main,
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
		loadGroupEntries,
		loadGroupOptions,
		loadDataOptions,
		onChange,
		disabled,
		autocompleteId,
		enableIcons,
		noOptionsText,
		loadingText,
		openInfo,
	} = props;
	const classes = useStyles(props);
	const defaultSwitchValue = props.displaySwitch
		? props.defaultSwitchValue ?? false
		: false;
	const [selectedGroups, setSelectedGroups] = useState<SelectedGroup[]>([]);
	const [dataOptions, setDataOptions] = useState<DataT[]>([]);
	const [switchValue, setSwitchValue] = useState(defaultSwitchValue);
	const [dataQuery, setDataQuery] = useState("");

	useEffect(() => {
		setSwitchValue(defaultSwitchValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [!!props.displaySwitch]);

	const handleGroupSelect = useCallback(
		async (selectedGroup: GroupT | null) => {
			if (!selectedGroup || !onChange) return;
			const groupEntries = await loadGroupEntries(selectedGroup);
			const groupEntryIds = groupEntries.map((entry) => entry.value);
			const combinedArray = [...selected, ...groupEntries];
			setSelectedGroups((prevState) => [
				...prevState,
				{
					group: selectedGroup.value,
					items: groupEntryIds,
				},
			]);
			setDataOptions((prevState) =>
				prevState.filter((entry) => !groupEntryIds.includes(entry.value))
			);
			onChange(
				uniqueArray(combinedArray.map((entry) => entry.value)).map(
					(value) =>
						combinedArray.find((entry) => entry.value === value) as DataT
				)
			);
		},
		[loadGroupEntries, selected, onChange]
	);

	const handleSwitchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSwitchValue(event.target.checked);
		},
		[setSwitchValue]
	);

	const handleDelete = useCallback(
		async (evt: React.MouseEvent<HTMLButtonElement>) => {
			if (!onChange) return;

			// find the item
			const entryToDelete = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!entryToDelete) {
				throw new Error(
					"[Components-Care] [MultiSelectWithTags] Entry couldn't be found. entry.value is not set"
				);
			}

			// check that we can delete the item
			if (
				entryToDelete.canUnselect &&
				!(await entryToDelete.canUnselect(entryToDelete))
			) {
				return;
			}

			// remove any selected group that contained this entry so it can be selected again
			setSelectedGroups((selectedGroups) =>
				selectedGroups.filter(
					(group) => !group.items.includes(entryToDelete.value)
				)
			);
			setDataOptions((oldOptions) => oldOptions.concat([entryToDelete]));
			onChange(selected.filter((entry) => entry !== entryToDelete));
		},
		[onChange, selected]
	);

	const handleOptionSelect = useCallback(
		(selectedValue: DataT) => {
			if (
				!selectedValue ||
				typeof selectedValue !== "object" ||
				!("value" in selectedValue) ||
				!onChange
			) {
				if (selectedValue) {
					// eslint-disable-next-line no-console
					console.warn(
						"[Components-Care] [MultiSelectWithTags] Unexpected value passed to handleOptionSelect:",
						selectedValue
					);
				}
				return;
			}

			setDataQuery("");
			setDataOptions((oldOptions) =>
				oldOptions.filter((old) => old.value !== selectedValue.value)
			);
			onChange([...selected, selectedValue]);
		},
		[onChange, selected]
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

	const onSearchData = useCallback(
		async (query: string) => {
			const selectedIds = selected.map((item) => item.value);
			setDataOptions(
				(await loadDataOptions(query, switchValue)).filter(
					(option) => !selectedIds.includes(option.value)
				)
			);
		},
		[loadDataOptions, selected, switchValue]
	);

	const themingClasses = themingStyles();

	useEffect(() => {
		void onSearchData(dataQuery);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataQuery]);

	return (
		<Typography component="div">
			<Typography component="label" className={themingClasses.selectorLabel}>
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
				<Typography component="div" className={classes.searchLabel}>
					<Typography component="label">
						{searchInputLabel || "Search input"}
					</Typography>
				</Typography>
			</Typography>
			<Autocomplete<DataT, false, true, true>
				id={autocompleteId}
				freeSolo
				autoComplete
				disableClearable
				disabled={disabled}
				options={dataOptions}
				value={""}
				getOptionSelected={(option, value) => option.value === value.value}
				getOptionLabel={(option: string | DataT) =>
					typeof option === "string" ? option : option.label
				}
				onChange={(_event, selectedValue) =>
					handleOptionSelect(selectedValue as DataT)
				}
				inputValue={dataQuery}
				onInputChange={(evt, value) => setDataQuery(value)}
				renderInput={(params: TextFieldProps) => (
					<TextFieldWithHelp
						{...params}
						InputProps={{
							...params.InputProps,
							startAdornment: <SearchIcon color={"primary"} />,
							type: "search",
							endAdornment: openInfo && (
								<IconButton onClick={openInfo}>
									<InfoIcon color={"disabled"} />
								</IconButton>
							),
						}}
					/>
				)}
			/>
			{selected.map((data: MultiSelectorData, index: number) => {
				return (
					<div key={index} className={classes.outlined}>
						{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
						<span>{data.label}</span>
						{!disabled && (
							<SmallIconButton
								edge={"end"}
								name={data.value}
								disabled={disabled}
								onClick={handleDelete}
							>
								<RemoveIcon />
							</SmallIconButton>
						)}
					</div>
				);
			})}
		</Typography>
	);
};

export default React.memo(MultiSelectWithTags) as typeof MultiSelectWithTags;
