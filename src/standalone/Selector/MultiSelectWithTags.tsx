import React, { useState, useCallback } from "react";
import { SelectorData, SelectorPropsSingleSelect } from "./Selector";
import SingleSelect from "./Selector";
import { TextField, TextFieldProps, Tooltip } from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import { SmallIconButton, SmallListItemIcon } from "../Small/List";
import { Search as SearchIcon, Info as InfoIcon } from "@material-ui/icons";
import RemoveIcon from "./Icons/RemoveIcon";
import { Autocomplete } from "@material-ui/lab";
import { GenericWithStyles } from "../../utils";

export interface MultiSelectData extends SelectorData {
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
	 * @param data The selected data entry/entries
	 */
	onSelect?: (value: Data[]) => void;
	onGroupSelect?: (value: SelectorData | null) => void;
	/**
	 * The title of control
	 */
	title: string;
	/**
	 * The currently selected values
	 */
	selected: Data[];
	filteredData: Data[];
	/**
	 * The currently selected groups
	 */
	selectedGroup: SelectorData | null;
	onGroupLoad: (search: string) => Data[] | Promise<Data[]>;
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
	},
	selectedEntries: {},
}));

const MultiSelectWithTags = <Data extends MultiSelectData>(
	props: MultiSelectWithTagsProps<Data> & WithStyles
) => {
	const {
		title,
		onSelect,
		selected,
		filteredData,
		onGroupLoad,
		onGroupSelect,
		selectedGroup,
		enableIcons,
		disable,
		classes,
	} = props;
	const [selectedValues, setSelectedValue] = useState<Data[]>([]);
	const [autoCompleteOptions, setautoCompleteOptions] = useState(filteredData);
	const array = [...selected, ...selectedValues].flat();
	const allSelected: Data[] = [];
	const map = new Map();
	for (const item of array) {
		if (!map.has(item.value)) {
			map.set(item.value, true);
			allSelected.push({ ...(item as Data) });
		}
	}

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
						autoCompleteOptions.push(selectedEntry);
						setautoCompleteOptions(autoCompleteOptions);
					}
				}
				if (canSelectedValuesDelete) {
					setSelectedValue(
						selectedValues.filter((s) => s.value !== selectedValuesEntry?.value)
					);
					if (selectedValuesEntry) {
						autoCompleteOptions.push(selectedValuesEntry);
						setautoCompleteOptions(autoCompleteOptions);
					}
				}
			})();
		},
		[onSelect, selected, selectedValues, autoCompleteOptions]
	);

	const handleChangeAutocomplete = useCallback(
		(selectedValue: Data) => {
			if (!selectedValue) return;
			else {
				setautoCompleteOptions(
					autoCompleteOptions.filter(
						(data) => data.value !== selectedValue.value
					)
				);
				selectedValues.push(selectedValue);
				setSelectedValue(selectedValues);
			}
		},
		[selectedValues, autoCompleteOptions]
	);

	return (
		<div>
			<h3>{title}</h3>
			<SingleSelect
				selected={selectedGroup}
				onSelect={onGroupSelect}
				onLoad={groupSelectLoadHandler}
				clearable={true}
				disable={disable}
				multiSelect={false}
			/>
			<Autocomplete
				key={autoCompleteOptions.length}
				freeSolo
				id="cc-search-input"
				disableClearable={true}
				options={autoCompleteOptions}
				getOptionLabel={(option) => option.label}
				inputValue=""
				onChange={(_event, selectedValue) =>
					handleChangeAutocomplete(selectedValue as Data)
				}
				renderInput={(params: TextFieldProps) => (
					<TextField
						{...params}
						label="Search input"
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
