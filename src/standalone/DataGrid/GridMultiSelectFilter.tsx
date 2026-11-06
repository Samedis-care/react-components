import React, { useCallback, useMemo } from "react";
import {
	Checkbox,
	Divider,
	FormControlLabel,
	Grid,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { useDataGridProps } from "./DataGrid";
import { isDataGridCustomFilterActive } from "./DataGridUtils";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid";
import { MultiSelectorData } from "../Selector";
import BaseSelector from "../Selector/BaseSelector";

/**
 * Props of GridMultiSelectFilter
 */
export interface GridMultiSelectFilterProps {
	/**
	 * The filter's label: the selector's label in the bar, a text above the
	 * checkboxes in the panel
	 */
	label?: string;
	/**
	 * All available options
	 */
	options: MultiSelectorData[];
	/**
	 * The key of the grid's custom data this filter edits. Its value in
	 * DataGridProps.defaultCustomData is the filter's default: shown while
	 * selected is unset, and restored by "Reset filter". While the selection
	 * has other entries (isDataGridCustomFilterActive: in any order, undefined,
	 * null and [] count as unset), the bar outlines the filter.
	 */
	field: string;
	/**
	 * The selected option values: the custom data's value of field.
	 * undefined (and null) show the value of field in
	 * DataGridProps.defaultCustomData, or no selection if it has none.
	 */
	selected: string[] | undefined;
	/**
	 * Called with the complete new selection when the user adds or removes a
	 * value
	 * @param selected The selected option values
	 */
	onSelect: (selected: string[]) => void;
	/**
	 * Renders the filter panel's variant: pass IDataGridFilterBarProps.inDialog
	 */
	dialog: boolean;
	/**
	 * Grid sizes of the root in the filter panel, merged over
	 * `{ xs: 12, md: 6, lg: 3 }`
	 */
	dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
	/**
	 * Grid sizes of the root in the header's filter bar, merged over
	 * `{ xs: 4 }`
	 */
	barBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
}

export const DataGridCustomFilterMulti = styled(BaseSelector, {
	name: "CcDataGrid",
	slot: "customFilterMulti",
})(({ theme }) => ({
	"& .MuiAutocomplete-root.Mui-active": {
		borderColor: theme.palette.secondary.main,
		"& > fieldset": {
			borderColor: theme.palette.secondary.main,
		},
		"& .MuiAutocomplete-inputRoot": {
			borderColor: theme.palette.secondary.main,
			"& > fieldset": {
				borderColor: theme.palette.secondary.main,
			},
		},
	},
})) as typeof BaseSelector;

const GridMultiSelectFilterDialogRoot = styled(Grid, {
	name: "CcGridMultiSelectFilter",
	slot: "dialogRoot",
})({});
const GridMultiSelectFilterBarRoot = styled(Grid, {
	name: "CcGridMultiSelectFilter",
	slot: "barRoot",
})({});
export type GridMultiSelectFilterClassKey = "dialogRoot" | "barRoot";

const EMPTY_SELECTION: string[] = [];

/**
 * A multi-select for a DataGrid filter bar (DataGridProps.filterBar): a
 * dropdown without search in the header's bar, a checkbox list in the filter
 * panel. It edits the custom data key `field` and takes its default from
 * DataGridProps.defaultCustomData; while its selection differs from that
 * default, the bar outlines it. Only inside a DataGrid (it reads the grid's
 * props context). Theme name CcGridMultiSelectFilter.
 */
const GridMultiSelectFilter = (inProps: GridMultiSelectFilterProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridMultiSelectFilter",
	});
	const {
		label,
		options,
		field,
		onSelect,
		dialog,
		dialogBreakpoints,
		barBreakpoints,
	} = props;
	const { classes, defaultCustomData } = useDataGridProps();
	const defaultValue = defaultCustomData?.[field];
	const selected =
		props.selected ??
		(Array.isArray(defaultValue)
			? (defaultValue as string[])
			: EMPTY_SELECTION);
	const isActive = isDataGridCustomFilterActive(selected, defaultValue);

	const handleDialogCheckboxToggle = useCallback(
		(evt: React.ChangeEvent<{ name: string }>, checked: boolean) => {
			onSelect(
				checked
					? selected.concat([evt.target.name])
					: selected.filter((entry) => entry !== evt.target.name),
			);
		},
		[selected, onSelect],
	);

	const getOptions = useCallback(() => ({ options }), [options]);

	const selectedData = useMemo(
		(): MultiSelectorData[] =>
			selected
				.map((value) => options.find((opt) => opt.value === value)!)
				.filter(Boolean),
		[selected, options],
	);

	const handleSelectorChange = useCallback(
		(data: MultiSelectorData[]) => {
			onSelect(data.map((entry) => entry.value));
		},
		[onSelect],
	);

	const selectorClasses = useMemo(
		() => ({
			autocomplete: isActive ? "Mui-active" : undefined,
		}),
		[isActive],
	);

	if (dialog) {
		return (
			<GridMultiSelectFilterDialogRoot
				size={{ xs: 12, md: 6, lg: 3, ...dialogBreakpoints }}
			>
				<Grid container>
					{label && (
						<Grid size={12}>
							<Typography>{label}</Typography>
						</Grid>
					)}
					{options.map((option) => (
						<Grid key={option.value} size={12}>
							{option.isDivider ? (
								<Divider />
							) : option.isSmallLabel ? (
								<Typography>{option.label}</Typography>
							) : (
								<FormControlLabel
									control={
										<Checkbox
											name={option.value}
											checked={selected.includes(option.value)}
											onChange={handleDialogCheckboxToggle}
										/>
									}
									label={option.label}
								/>
							)}
						</Grid>
					))}
				</Grid>
			</GridMultiSelectFilterDialogRoot>
		);
	} else {
		return (
			<GridMultiSelectFilterBarRoot size={{ xs: 4, ...barBreakpoints }}>
				<DataGridCustomFilterMulti<MultiSelectorData, true>
					multiple
					label={label}
					disableSearch
					disableClearable
					onLoad={getOptions}
					selected={selectedData}
					onSelect={handleSelectorChange}
					classes={selectorClasses}
					className={classes?.customFilterMulti}
				/>
			</GridMultiSelectFilterBarRoot>
		);
	}
};

export default React.memo(GridMultiSelectFilter);
