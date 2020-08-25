import React, { CSSProperties } from "react";
import Selector, { SelectorData, SelectorProps } from "./Selector";
import { Grid, Paper, Theme, useTheme, WithStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MultiSelectEntry, { IMultiSelectEntryProps } from "./MultiSelectEntry";
import { ControlProps } from "react-select/src/components/Control";

export interface MultiSelectorData extends SelectorData {
	/**
	 * Item click handler
	 */
	onClick?: () => void;
	/**
	 * Can the entry be unselected?
	 * @param data The data entry to be unselected
	 */
	canUnselect?: (data: any) => Promise<boolean>;
}

export interface MultiSelectProps<Data extends MultiSelectorData>
	extends Omit<
		SelectorProps<Data>,
		"onSelect" | "selected" | "multiSelect" | "clearable"
	> {
	/**
	 * Simple selection change handler
	 * @param value The selected value
	 */
	onSelect?: (value: Data[]) => void;
	/**
	 * The currently selected value
	 */
	selected: Data[];
	/**
	 * Specify a custom component for displaying multi select items
	 */
	selectedEntryRenderer?: React.ComponentType<IMultiSelectEntryProps>;
}

const useStyles = makeStyles((theme: Theme) => ({
	paperWrapper: {
		boxShadow: "none",
		border: `1px solid ${theme.palette.divider}`,
	},
	selectedEntries: {},
}));

const MultiSelect = (props: MultiSelectProps<any> & WithStyles) => {
	const {
		onLoad,
		onSelect,
		selected,
		enableIcons,
		customStyles,
		selectedEntryRenderer,
		disable,
	} = props;
	const classes = useStyles();
	const theme = useTheme();

	const EntryRender = selectedEntryRenderer || MultiSelectEntry;

	const multiSelectHandler = React.useCallback(
		(data: any) => {
			if (onSelect) onSelect([...selected, data]);
		},
		[onSelect, selected]
	);

	const multiSelectLoadHandler = React.useCallback(
		async (query: string) => {
			const results = await onLoad(query);
			return results.filter(
				(val: SelectorData) => !selected.map((s) => s.value).includes(val.value)
			);
		},
		[onLoad, selected]
	);

	const handleDelete = React.useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			let canDelete = true;
			const entry: MultiSelectorData = selected.find(
				(s) => s.value === evt.currentTarget.name
			)!;
			(async () => {
				if (entry.canUnselect) {
					canDelete = await entry.canUnselect(entry);
				}
				if (canDelete && onSelect)
					onSelect(selected.filter((s) => s.value !== entry.value));
			})();
		},
		[onSelect, selected]
	);

	const selectorStyles = React.useMemo(() => {
		const { control, ...otherCustomStyles } = customStyles || {};
		return {
			control: (
				base: CSSProperties,
				selectProps: ControlProps<{}>
			): CSSProperties => {
				let multiSelectStyles: CSSProperties = {
					...base,
					borderRadius: 0,
					border: "none",
					borderBottom: `1px solid ${theme.palette.divider}`,
					boxShadow: "none",
					backgroundColor: "transparent",
				};

				if (control)
					multiSelectStyles = control(multiSelectStyles, selectProps);

				return multiSelectStyles;
			},
			...otherCustomStyles,
		};
	}, [customStyles, theme]);

	return (
		<Paper elevation={0} className={classes.paperWrapper}>
			<Grid container>
				<Grid item xs={12}>
					<Selector
						{...props}
						onLoad={multiSelectLoadHandler}
						selected={null}
						onSelect={multiSelectHandler}
						multiSelect={false}
						customStyles={selectorStyles}
						refreshToken={selected.length.toString()}
					/>
				</Grid>
				<Grid item xs={12} className={classes.selectedEntries}>
					{props.selected.map((data: MultiSelectorData, index: number) => (
						<EntryRender
							key={data.value}
							enableDivider={props.selected.length === index - 1}
							enableIcons={enableIcons}
							handleDelete={disable ? undefined : handleDelete}
							data={data}
						/>
					))}
				</Grid>
			</Grid>
		</Paper>
	);
};

export default React.memo(MultiSelect);
