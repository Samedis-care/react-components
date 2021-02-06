import React, { useCallback, useRef } from "react";
import {
	TextFieldProps,
	Typography,
	Switch,
	Grid,
	createStyles,
	Theme,
	withStyles,
	WithStyles,
	IconButton,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
	Search as SearchIcon,
	Info as InfoIcon,
	Cancel as RemoveIcon,
} from "@material-ui/icons";
import { SingleSelect } from "../../standalone/Selector";
import { BaseSelectorData, BaseSelectorProps } from "./BaseSelector";

import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../UIKit/TextFieldWithHelp";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import { GenericWithStyles } from "../../utils";
import { uniqueArray } from "../../utils";

export interface MultiSelectData extends BaseSelectorData {
	/**
	 * Item type value
	 */
	type?: string;
	/**
	 * Item click handler
	 */
	onClick?: () => void;
	/**
	 * Can the entry be unselected?
	 * @param data The data entry to be unselected
	 */
	canUnselect?: (data: MultiSelectData) => boolean | Promise<boolean>;
}

export interface MultiSelectWithTagsSwitchPropsOn {
	/**
	 * Display switch control
	 */
	displaySwitch: true;
	/**
	 * Label for switch control
	 */
	switchLabel: string;
	/**
	 * switch control value
	 */
	switchValue: boolean;
	/**
	 * Callback method to set switch value
	 */
	handleSwitch: (switchValue: boolean) => void;
}

export interface MultiSelectWithTagsSwitchPropsOff {
	/**
	 * Display switch control
	 */
	displaySwitch?: false;
}

export type MultiSelectWithTagsSwitchProps =
	| MultiSelectWithTagsSwitchPropsOn
	| MultiSelectWithTagsSwitchPropsOff;

export interface MultiSelectWithTagsProps<Data extends MultiSelectData>
	extends Omit<
		BaseSelectorProps,
		"multiSelect" | "clearable" | "onSelect" | "selected"
	> {
	/**
	 * Extended selection change handler
	 * @param data The selected data entries
	 */
	onSelect?: (value: Data[]) => void;
	/**
	 * Extended group selection change handler
	 * @param data The selected data entry
	 */
	onGroupSelect?: (value: BaseSelectorData | null) => void;
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * Data for autocomplete selector
	 */
	defaultData: Data[];
	/**
	 * The currently selected values
	 */
	selected: Data[];
	/**
	 * The filtered data after selected dropdown value
	 */
	filteredData: Data[];
	/**
	 * Callback method to return selected data
	 */
	setFilteredData?: (values: Data[]) => void;
	/**
	 * Callback method to handle data for autocomplete
	 */
	handleFilteredData?: (value: Data) => void;
	/**
	 * The currently selected groups
	 */
	selectedGroup: BaseSelectorData | null;
	/**
	 * Callback method on group selection load
	 */
	onGroupLoad: (search: string) => Data[] | Promise<Data[]>;
	/**
	 * Label for search input control
	 */
	searchInputLabel?: string;
	/**
	 * Callback method to handle selected value from autocomplete component
	 */
	handleAutoComplete?: (selectedValue: Data) => void;
	/**
	 * String used for the Autocomplete component
	 */
	autocompleteId?: string;
}

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

const MultiSelectWithTags = <Data extends MultiSelectData>(
	props: MultiSelectWithTagsProps<Data> &
		WithStyles &
		MultiSelectWithTagsSwitchProps &
		TextFieldWithHelpProps
) => {
	const {
		title,
		searchInputLabel,
		onSelect,
		selected,
		defaultData,
		filteredData,
		setFilteredData,
		handleFilteredData,
		onGroupLoad,
		onGroupSelect,
		selectedGroup,
		enableIcons,
		disabled,
		classes,
		displaySwitch,
		handleAutoComplete,
		openInfo,
	} = props;
	const switchLabel = props.displaySwitch ? props.switchLabel : undefined;
	const switchValue = props.displaySwitch ? props.switchValue : undefined;
	const handleSwitch = props.displaySwitch ? props.handleSwitch : undefined;
	const input = useRef<TextFieldProps>();
	const allSelected = uniqueArray(selected.map((item) => item.value)).map(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(value) => selected.find((e) => e.value === value)!
	) as Data[];

	const handleGroupSelect = useCallback(
		(selectedGroup: BaseSelectorData | null) => {
			if (onGroupSelect) onGroupSelect(selectedGroup);
			if (selectedGroup !== null) {
				const records = defaultData.filter(
					(option: Data) =>
						option.type?.toLowerCase() === selectedGroup.value.toLowerCase()
				);
				const recordValues = records.map((record) => record.value);
				const filteredOptions = filteredData.filter(
					(entry) => !recordValues.includes(entry.value)
				);
				if (setFilteredData) setFilteredData(filteredOptions);
				const selectedDatas = [selected, ...records].flat() as Data[];
				if (onSelect) onSelect(selectedDatas);
			}
		},
		[
			defaultData,
			filteredData,
			onGroupSelect,
			onSelect,
			selected,
			setFilteredData,
		]
	);

	const groupSelectLoadHandler = useCallback(
		async (query: string) => {
			const results = await onGroupLoad(query);
			return results.filter((option) =>
				option.label.toLowerCase().includes(query.toLowerCase())
			);
		},
		[onGroupLoad]
	);

	const handleChangeSwitch = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (handleSwitch) handleSwitch(event.target.checked);
		},
		[handleSwitch]
	);

	const handleDelete = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			let canSelectedDelete = true;
			const deletedEntry: Data | null | undefined = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!deletedEntry) {
				throw new Error(
					"[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute"
				);
			} else {
				void (async () => {
					if (deletedEntry.canUnselect)
						canSelectedDelete = await deletedEntry.canUnselect(deletedEntry);
					if (canSelectedDelete) {
						if (onSelect)
							onSelect(selected.filter((s) => s.value !== deletedEntry.value));
						const filteredDataSelected = filteredData.find(
							(option) => option.value === deletedEntry.value
						);
						if (!filteredDataSelected && handleFilteredData)
							handleFilteredData(deletedEntry);
					}
				})();
			}
		},
		[selected, onSelect, filteredData, handleFilteredData]
	);

	const handleChangeAutocomplete = useCallback(
		(selectedValue: Data) => {
			if (
				!selectedValue ||
				typeof selectedValue !== "object" ||
				!("value" in selectedValue)
			)
				return;
			else {
				if (handleAutoComplete) handleAutoComplete(selectedValue);
				if (input.current) input.current.value = "";
			}
		},
		[handleAutoComplete]
	);

	return (
		<Typography component="div">
			<Typography component="label">{title}</Typography>
			<SingleSelect
				autocompleteId={
					props.autocompleteId
						? props.autocompleteId + "-single-select"
						: undefined
				}
				selected={selectedGroup}
				onSelect={handleGroupSelect}
				onLoad={groupSelectLoadHandler}
				disabled={disabled}
			/>
			<Typography component="div" className={classes.labelWithSwitch}>
				{displaySwitch && (
					<Typography component="div" className={classes.switch}>
						<Grid component="label" container alignItems="center" spacing={1}>
							<Grid item>
								<AntSwitch
									checked={switchValue || false}
									onChange={handleChangeSwitch}
								/>
							</Grid>
							<Grid item>{switchLabel || "All"}</Grid>
						</Grid>
					</Typography>
				)}
				<Typography component="div" className={classes.searchLabel}>
					<Typography component="label">
						{searchInputLabel || "Search input"}
					</Typography>
				</Typography>
			</Typography>
			<Autocomplete
				key={filteredData.length}
				id={props.autocompleteId}
				freeSolo
				autoComplete
				disableClearable
				disabled={disabled}
				options={filteredData}
				getOptionLabel={(option: Data) => option.label}
				onChange={(_event, selectedValue) =>
					handleChangeAutocomplete(selectedValue as Data)
				}
				renderInput={(params: TextFieldProps) => (
					<TextFieldWithHelp
						{...params}
						inputRef={input}
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
			{allSelected?.length > 0 &&
				allSelected.map((data: MultiSelectData, index: number) => {
					return (
						<div key={index} className={classes.outlined}>
							{enableIcons && (
								<SmallListItemIcon>{data.icon}</SmallListItemIcon>
							)}
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

const StylesMultiSelectWithTags = withStyles(styles)(
	React.memo(MultiSelectWithTags)
) as <Data extends MultiSelectData>(
	props: GenericWithStyles<MultiSelectWithTagsProps<Data> & WithStyles>
) => React.ReactElement;

export default StylesMultiSelectWithTags;
