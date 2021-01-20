import React from "react";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorProps,
} from "./BaseSelector";
import {
	createStyles,
	Grid,
	Paper,
	Theme,
	withStyles,
	WithStyles,
} from "@material-ui/core";
import MultiSelectEntry, { IMultiSelectEntryProps } from "./MultiSelectEntry";
import { GenericWithStyles } from "../../utils";

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
	extends Omit<
		BaseSelectorProps,
		"multiSelect" | "clearable" | "onSelect" | "selected"
	> {
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

const styles = createStyles((theme: Theme) => ({
	paperWrapper: {
		boxShadow: "none",
		border: `1px solid ${theme.palette.divider}`,
	},
	selectedEntries: {},
}));

const MultiSelect = (props: MultiSelectProps & WithStyles) => {
	const {
		onLoad,
		onSelect,
		selected,
		enableIcons,
		selectedEntryRenderer,
		disabled,
		classes,
		defaultOptions,
	} = props;

	const EntryRender = selectedEntryRenderer || MultiSelectEntry;

	const multiSelectHandler = React.useCallback(
		(data: MultiSelectorData | null) => {
			if (!data) return;
			if (onSelect) onSelect([...selected, data]);
		},
		[onSelect, selected]
	);

	const multiSelectLoadHandler = React.useCallback(
		async (query: string) => {
			const results = await onLoad(query);
			return results.filter(
				(val: BaseSelectorData) =>
					!selected.map((s) => s.value).includes(val.value)
			);
		},
		[onLoad, selected]
	);

	const handleDelete = React.useCallback(
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
				if (canDelete && onSelect)
					onSelect(selected.filter((s) => s.value !== entry.value));
			})();
		},
		[onSelect, selected]
	);

	return (
		<Paper elevation={0} className={classes.paperWrapper}>
			<Grid container>
				<Grid item xs={12}>
					<BaseSelector
						{...props}
						onLoad={multiSelectLoadHandler}
						selected={null}
						onSelect={multiSelectHandler}
						refreshToken={selected.length.toString()}
						defaultOptions={defaultOptions}
					/>
				</Grid>
				<Grid item xs={12} className={classes.selectedEntries}>
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

const StylesMultiSelect = withStyles(styles)(React.memo(MultiSelect)) as (
	props: GenericWithStyles<MultiSelectProps & WithStyles>
) => React.ReactElement;

export default StylesMultiSelect;
