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
import { getReactLabel, MultiSelectorData } from "../Selector";
import BaseSelector from "../Selector/BaseSelector";
import useFilterPanelLists from "./CustomFilterDialog/useFilterPanelLists";

/**
 * Props of GridMultiSelectFilter
 */
export interface GridMultiSelectFilterProps {
	/**
	 * The filter's label: the select's label in the bar (and in the panel on a
	 * phone), a text above the checkboxes in the panel
	 */
	label?: string;
	/**
	 * All available options. The bar and the panel treat them alike, as
	 * BaseSelector does: an entry with hidden is not listed, one with
	 * isDisabled is shown but cannot be ticked or unticked, a `[text, node]`
	 * label shows its node, an isDivider entry is drawn as a separator and an
	 * isSmallLabel entry as a text between the others. A selected hidden or
	 * disabled value stays selected while the user changes the others.
	 */
	options: MultiSelectorData[];
	/**
	 * The key of the grid's custom data this filter edits. Its value in
	 * DataGridProps.defaultCustomData is the filter's default: shown while
	 * selected is unset, and restored by "Reset filter" and by the filter
	 * panel's "Reset". While the selection has other entries
	 * (isDataGridCustomFilterActive: in any order, undefined, null and [] count
	 * as unset), the select is outlined, in the bar and in the panel on a
	 * phone.
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
	 * Whether the filter is in the filter panel: pass
	 * IDataGridFilterBarProps.inDialog. The panel lists the options as
	 * checkboxes, so one click ticks one. On a phone (the theme's xs
	 * breakpoint) it shows the bar's multi-select instead, one row instead of
	 * every option. Both are sized by dialogBreakpoints.
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
 * panel, and the bar's dropdown in the panel on a phone (the theme's xs
 * breakpoint). It edits the custom data key `field` and takes its default
 * from DataGridProps.defaultCustomData; while its selection differs from that
 * default, the dropdown is outlined. Only inside a DataGrid (it reads the
 * grid's props context). Theme name CcGridMultiSelectFilter.
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
	const showList = useFilterPanelLists(dialog);

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
	// the panel's checkboxes: hidden entries are left out, as in the bar's list
	const shownOptions = useMemo(
		() => options.filter((option) => !option.hidden),
		[options],
	);

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

	if (showList) {
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
					{shownOptions.map((option) => (
						<Grid key={option.value} size={12}>
							{option.isDivider ? (
								<Divider />
							) : option.isSmallLabel ? (
								<Typography>{getReactLabel(option)}</Typography>
							) : (
								<FormControlLabel
									control={
										<Checkbox
											name={option.value}
											checked={selected.includes(option.value)}
											onChange={handleDialogCheckboxToggle}
										/>
									}
									label={getReactLabel(option)}
									disabled={option.isDisabled}
								/>
							)}
						</Grid>
					))}
				</Grid>
			</GridMultiSelectFilterDialogRoot>
		);
	}

	// the bar's select, also in the panel on a phone
	const selector = (
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
	);

	return dialog ? (
		<GridMultiSelectFilterDialogRoot
			size={{ xs: 12, md: 6, lg: 3, ...dialogBreakpoints }}
		>
			{selector}
		</GridMultiSelectFilterDialogRoot>
	) : (
		<GridMultiSelectFilterBarRoot size={{ xs: 4, ...barBreakpoints }}>
			{selector}
		</GridMultiSelectFilterBarRoot>
	);
};

export default React.memo(GridMultiSelectFilter);
