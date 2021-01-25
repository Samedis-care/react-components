import React, { useState, useCallback } from "react";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorProps,
} from "./BaseSelector";
import { makeStyles, Grid, Paper } from "@material-ui/core";
import MultiSelectEntry, { IMultiSelectEntryProps } from "./MultiSelectEntry";
import { combineClassMaps } from "../../utils";
import { AutocompleteClassKey } from "@material-ui/lab/Autocomplete/Autocomplete";

export interface MultiSelectorData extends BaseSelectorData {
	/**
	 * Item click handler
	 */
	onClick?: () => void;
	/**
	 * Can the entry be unselected?
	 * @param data The data entry to be unselected
	 */
	canUnselect?: (data: MultiSelectorData) => boolean | Promise<boolean>;
}

export interface MultiSelectProps
	extends Omit<BaseSelectorProps, "onSelect" | "selected"> {
	/**
	 * Extended selection change handler
	 * @param data The selected data entry/entries
	 */
	onSelect?: (value: MultiSelectorData[]) => void;
	/**
	 * The currently selected values
	 */
	selected: MultiSelectorData[];
	/**
	 * Specify a custom component for displaying multi select items
	 */
	selectedEntryRenderer?: React.ComponentType<IMultiSelectEntryProps>;
}

const useSelectorStyles = makeStyles({
	inputRoot: {
		borderRadius: "4px 4px 0px 0px",
	},
});

const useStyles = makeStyles({
	paperWrapper: {
		boxShadow: "none",
	},
	selectedEntries: {
		border: `1px solid rgba(0, 0, 0, 0.23)`,
		borderTop: 0,
		borderRadius: "0px 0px 4px 4px",
	},
});

const MultiSelect = (props: MultiSelectProps) => {
	const {
		onLoad,
		onSelect,
		selected,
		enableIcons,
		selectedEntryRenderer,
		disabled,
		defaultOptions,
		classes,
	} = props;
	const multiSelectClasses = useStyles();
	const defaultMultiSelectClasses = useSelectorStyles();
	const multiSelectStyles = classes
		? combineClassMaps<AutocompleteClassKey>(defaultMultiSelectClasses, classes)
		: defaultMultiSelectClasses;
	const getFilteredOptions = useCallback(
		(selectedOptions: MultiSelectorData[]) => {
			let options = defaultOptions || [];
			if (selectedOptions && selectedOptions.length > 0) {
				selectedOptions.forEach((s) => {
					options = options.filter((option) => option.value !== s.value);
				});
			}
			return options;
		},
		[defaultOptions]
	);
	const [filteredOptions, setFilteredOptions] = useState(
		getFilteredOptions(selected)
	);

	const EntryRender = selectedEntryRenderer || MultiSelectEntry;

	const multiSelectHandler = useCallback(
		(data: MultiSelectorData | null) => {
			if (!data) return;
			const selectedOptions = [...selected, data];
			if (onSelect) onSelect(selectedOptions);
			setFilteredOptions(getFilteredOptions(selectedOptions));
		},
		[getFilteredOptions, onSelect, selected]
	);

	const multiSelectLoadHandler = useCallback(
		async (query: string) => {
			const results = await onLoad(query);
			return results.filter(
				(val: BaseSelectorData) =>
					!selected.map((s) => s.value).includes(val.value)
			);
		},
		[onLoad, selected]
	);

	const handleDelete = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			let canDelete = true;
			const entry: MultiSelectorData | null | undefined = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!entry) {
				throw new Error(
					"[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute"
				);
			}
			void (async () => {
				if (entry.canUnselect) {
					canDelete = await entry.canUnselect(entry);
				}
				if (canDelete && onSelect) {
					const selectedOptions = selected.filter(
						(s) => s.value !== entry.value
					);
					onSelect(selectedOptions);
					setFilteredOptions(getFilteredOptions(selectedOptions));
				}
			})();
		},
		[onSelect, selected, getFilteredOptions]
	);

	return (
		<Paper elevation={0} className={multiSelectClasses.paperWrapper}>
			<Grid container>
				<Grid item xs={12}>
					<BaseSelector
						{...props}
						classes={multiSelectStyles}
						onLoad={multiSelectLoadHandler}
						selected={null}
						onSelect={multiSelectHandler}
						refreshToken={selected.length.toString()}
						defaultOptions={filteredOptions}
					/>
				</Grid>
				<Grid item xs={12} className={multiSelectClasses.selectedEntries}>
					{props.selected.map((data: MultiSelectorData, index: number) => (
						<EntryRender
							key={data.value}
							enableDivider={props.selected.length === index - 1}
							enableIcons={enableIcons}
							handleDelete={disabled ? undefined : handleDelete}
							data={data}
						/>
					))}
				</Grid>
			</Grid>
		</Paper>
	);
};

export default React.memo(MultiSelect);
