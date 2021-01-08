import React, { useCallback, useRef } from "react";
import { SelectorData, SelectorPropsSingleSelect } from "./Selector";
import SingleSelect from "./Selector";
import {
	TextField,
	TextFieldProps,
	Tooltip,
	Typography,
	Switch,
	SwitchClassKey,
	SwitchProps,
	Grid,
} from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import { SmallIconButton, SmallListItemIcon } from "../Small/List";
import {
	Search as SearchIcon,
	Info as InfoIcon,
	Cancel as RemoveIcon,
} from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { GenericWithStyles } from "../../utils";
import { uniqueArray } from "../../utils";

export interface MultiSelectData extends SelectorData {
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

export interface Styles extends Partial<Record<SwitchClassKey, string>> {
	focusVisible?: string;
}

export interface Props extends SwitchProps {
	classes: Styles;
}

export interface MultiSelectWithTagsProps<Data extends MultiSelectData>
	extends Omit<
		SelectorPropsSingleSelect<Data>,
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
	onGroupSelect?: (value: SelectorData | null) => void;
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * Data for group selector
	 */
	defaultData: Data[];
	/**
	 * The currently selected values
	 */
	selected: Data[];
	/**
	 * Callback to set selected values
	 */
	setSelected?: (selectedValues: Data[]) => void;
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
	selectedGroup: SelectorData | null;
	/**
	 * Callback method on group selection load
	 */
	onGroupLoad: (search: string) => Data[] | Promise<Data[]>;
	/**
	 * Label for search input control
	 */
	searchInputLabel?: string;
	/**
	 * Display switch control
	 */
	displaySwitch?: boolean;
	/**
	 * Label for switch control
	 */
	switchLabel?: string;
	/**
	 * switch control value
	 */
	switchValue?: boolean;
	/**
	 * Callback method to set switch value
	 */
	handleSwitch?: (switchValue: boolean) => void;
	/**
	 * Callback method to handle selected value from autocomplete component
	 */
	handleAutoComplete?: (selectedValue: Data) => void;
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

const AntSwitch = withStyles((theme: Theme) =>
	createStyles({
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
	})
)(Switch);

const MultiSelectWithTags = <Data extends MultiSelectData>(
	props: MultiSelectWithTagsProps<Data> & WithStyles
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
		disable,
		classes,
		displaySwitch,
		switchLabel,
		switchValue,
		handleSwitch,
		handleAutoComplete,
	} = props;
	const input = useRef<TextFieldProps>();
	const allSelected = uniqueArray(selected.map((item) => item.value)).map(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(value) => selected.find((e) => e.value === value)!
	) as Data[];

	const handleGroupSelect = useCallback(
		(selectedGroup: SelectorData | null) => {
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
				selected={selectedGroup}
				onSelect={handleGroupSelect}
				onLoad={groupSelectLoadHandler}
				clearable={true}
				disable={disable}
				multiSelect={false}
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
				freeSolo
				autoComplete
				disableClearable
				disabled={disable}
				options={filteredData}
				getOptionLabel={(option: Data) => option.label}
				onChange={(_event, selectedValue) =>
					handleChangeAutocomplete(selectedValue as Data)
				}
				renderInput={(params: TextFieldProps) => (
					<TextField
						{...params}
						inputRef={input}
						InputProps={{
							...params.InputProps,
							startAdornment: <SearchIcon color={"primary"} />,
							type: "search",
							endAdornment: (
								<Tooltip title="infoText">
									<InfoIcon color={"disabled"} />
								</Tooltip>
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
							{!disable && (
								<SmallIconButton
									edge={"end"}
									name={data.value}
									disabled={disable}
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
