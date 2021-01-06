import React, { useState, useCallback, useRef } from "react";
import { SelectorData, SelectorPropsSingleSelect } from "./Selector";
import SingleSelect from "./Selector";
import {
	TextField,
	TextFieldProps,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import { SmallIconButton, SmallListItemIcon } from "../Small/List";
import { Search as SearchIcon, Info as InfoIcon } from "@material-ui/icons";
import { RemoveIcon } from "../../standalone";
import { Autocomplete } from "@material-ui/lab";
import { GenericWithStyles } from "../../utils";
import { uniqueArray } from "../../utils/arrayFunctions";

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
	setData?: (values: Data[]) => void;
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
}));

const MultiSelectWithTags = <Data extends MultiSelectData>(
	props: MultiSelectWithTagsProps<Data> & WithStyles
) => {
	const {
		title,
		searchInputLabel,
		onSelect,
		selected,
		filteredData,
		setData,
		onGroupLoad,
		onGroupSelect,
		selectedGroup,
		enableIcons,
		disable,
		classes,
	} = props;
	const [selectedValues, setSelectedValue] = useState<Data[]>([]);
	const input = useRef<TextFieldProps>();
	const array = [...selected, ...selectedValues].flat();
	const allSelected = uniqueArray(array.map((item) => item.value)).map(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(value) => array.find((e) => e.value === value)!
	);

	const handleGroupSelect = useCallback(
		(selectedGroup: SelectorData | null) => {
			if (onGroupSelect) onGroupSelect(selectedGroup);
			if (selectedGroup !== null) {
				const records = filteredData.filter(
					(option: Data) =>
						option.type?.toLowerCase() === selectedGroup.value.toLowerCase()
				);
				const recordValues = records.map((record) => record.value);
				const filteredOptions = filteredData.filter(
					(entry) => !recordValues.includes(entry.value)
				);
				if (setData) setData(filteredOptions);
				const selectedValues = [selected, ...records].flat() as Data[];
				if (onSelect) onSelect(selectedValues);
			}
		},
		[filteredData, onGroupSelect, onSelect, selected, setData]
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

	const handleDelete = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			let canSelectedDelete = true;
			let canSelectedValuesDelete = true;
			const selectedEntry: Data | null | undefined = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			const selectedValuesEntry: Data | null | undefined = selectedValues.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!selectedEntry && !selectedValuesEntry) {
				throw new Error(
					"[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute"
				);
			}
			void (async () => {
				if (selectedEntry?.canUnselect) {
					canSelectedDelete = await selectedEntry.canUnselect(selectedEntry);
				}
				if (selectedValuesEntry?.canUnselect) {
					canSelectedValuesDelete = await selectedValuesEntry.canUnselect(
						selectedValuesEntry
					);
				}
				if (canSelectedDelete && onSelect) {
					onSelect(selected.filter((s) => s.value !== selectedEntry?.value));
					if (selectedEntry) {
						const filteredDataSelected = filteredData.find(
							(option) => option.value === selectedEntry.value
						);
						if (!filteredDataSelected) {
							filteredData.push(selectedEntry);
							if (setData) setData(filteredData);
						}
					}
				}
				if (canSelectedValuesDelete) {
					setSelectedValue(
						selectedValues.filter((s) => s.value !== selectedValuesEntry?.value)
					);
					if (selectedValuesEntry) {
						const filteredDataSelectedValues = filteredData.find(
							(option) => option.value === selectedValuesEntry.value
						);
						if (!filteredDataSelectedValues) {
							filteredData.push(selectedValuesEntry);
							if (setData) setData(filteredData);
						}
					}
				}
			})();
		},
		[selected, selectedValues, onSelect, filteredData, setData]
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
				if (setData) {
					setData(
						filteredData.filter((data) => data.value !== selectedValue.value)
					);
				}
				selectedValues.push(selectedValue);
				selected.push(selectedValue);
				if (onSelect) onSelect(selected);
				setSelectedValue(selectedValues);
				if (input.current) input.current.value = "";
			}
		},
		[setData, selectedValues, onSelect, selected, filteredData]
	);

	return (
		<div>
			<Typography>{title}</Typography>
			<SingleSelect
				selected={selectedGroup}
				onSelect={handleGroupSelect}
				onLoad={groupSelectLoadHandler}
				clearable={true}
				disable={disable}
				multiSelect={false}
			/>
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
						label={searchInputLabel || "Search input"}
						margin="normal"
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
		</div>
	);
};

const StylesMultiSelectWithTags = withStyles(styles)(
	React.memo(MultiSelectWithTags)
) as <Data extends MultiSelectData>(
	props: GenericWithStyles<MultiSelectWithTagsProps<Data> & WithStyles>
) => React.ReactElement;

export default StylesMultiSelectWithTags;
