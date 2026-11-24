import React, { useCallback, useMemo } from "react";
import { BaseSelectorData, getReactLabel } from "../../standalone/Selector";
import {
	Divider,
	FormControl,
	FormControlLabel,
	Grid,
	Radio,
	RadioGroup,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { useDataGridProps } from "./DataGrid";
import { isDataGridCustomFilterActive } from "./DataGridUtils";
import { GridSize } from "@mui/material/Grid";
import { Breakpoint } from "@mui/material/styles";
import SingleSelect from "../Selector/SingleSelect";
import useFilterPanelLists from "./CustomFilterDialog/useFilterPanelLists";

/**
 * Props of GridSingleSelectFilter
 */
export interface GridSingleSelectFilterProps {
	/**
	 * The filter's label: the select's label in the bar (and in the panel on a
	 * phone), a text above the radios in the panel
	 */
	label?: string;
	/**
	 * All available options. There is no built-in "no filter" choice: add an
	 * option for it (for example with the value ""). The bar and the panel
	 * treat them alike, as BaseSelector does: an entry with hidden is not
	 * listed, one with isDisabled is shown but cannot be picked, a
	 * `[text, node]` label shows its node, an isDivider entry is drawn as a
	 * separator and an isSmallLabel entry as a text between the others.
	 */
	options: BaseSelectorData[];
	/**
	 * The key of the grid's custom data this filter edits. Its value in
	 * DataGridProps.defaultCustomData is the filter's default: shown while
	 * selected is unset, and restored by "Reset filter" and by the filter
	 * panel's "Reset". While the selection differs from it
	 * (isDataGridCustomFilterActive: undefined, null and "" count as unset),
	 * the select is outlined, in the bar and in the panel on a phone.
	 */
	field: string;
	/**
	 * The selected option's value: the custom data's value of field.
	 * undefined (and null) show the value of field in
	 * DataGridProps.defaultCustomData, or no option if it has none.
	 */
	selected: string | undefined;
	/**
	 * Called with the picked option's value
	 * @param selected The picked option's value
	 */
	onSelect: (selected: string) => void;
	/**
	 * Whether the filter is in the filter panel: pass
	 * IDataGridFilterBarProps.inDialog. The panel lists the options as radio
	 * buttons, so one click picks one. On a phone (the theme's xs breakpoint)
	 * it shows the bar's select instead, one row instead of every option. Both
	 * are sized by dialogBreakpoints.
	 */
	dialog: boolean;
	/**
	 * The id of the bar's input (SingleSelect autocompleteId); unused in the
	 * panel, also by its select on a phone
	 */
	autocompleteId?: string;
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

export const DataGridCustomFilterSingle = styled(SingleSelect, {
	name: "CcDataGrid",
	slot: "customFilterSingle",
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
})) as typeof SingleSelect;

const GridSingleSelectFilterDialogRoot = styled(Grid, {
	name: "CcGridSingleSelectFilter",
	slot: "dialogRoot",
})({});
const GridSingleSelectFilterBarRoot = styled(Grid, {
	name: "CcGridSingleSelectFilter",
	slot: "barRoot",
})({});
export type GridSingleSelectFilterClassKey = "dialogRoot" | "barRoot";

/**
 * A single select for a DataGrid filter bar (DataGridProps.filterBar): a
 * dropdown without search in the header's bar, a radio list in the filter
 * panel, and the bar's dropdown in the panel on a phone (the theme's xs
 * breakpoint). It edits the custom data key `field` and takes its default
 * from DataGridProps.defaultCustomData; while its selection differs from that
 * default, the dropdown is outlined. Only inside a DataGrid (it reads the
 * grid's props context). Theme name CcGridSingleSelectFilter.
 */
const GridSingleSelectFilter = (inProps: GridSingleSelectFilterProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridSingleSelectFilter",
	});
	const {
		label,
		options,
		field,
		onSelect,
		dialog,
		autocompleteId,
		dialogBreakpoints,
		barBreakpoints,
	} = props;
	const { classes, defaultCustomData } = useDataGridProps();
	const defaultValue = defaultCustomData?.[field];
	const selected =
		props.selected ?? (typeof defaultValue === "string" ? defaultValue : "");
	const isActive = isDataGridCustomFilterActive(selected, defaultValue);
	const showList = useFilterPanelLists(dialog);

	const handleDialogRadioToggle = useCallback(
		(_evt: React.ChangeEvent<HTMLInputElement>, value: string) => {
			onSelect(value);
		},
		[onSelect],
	);

	const handleSelectorChange = useCallback(
		(value: BaseSelectorData | null) => {
			onSelect(value?.value ?? "");
		},
		[onSelect],
	);

	const getOptions = useCallback(() => ({ options }), [options]);
	// the panel's radios: hidden entries are left out, as in the bar's list
	const shownOptions = useMemo(
		() => options.filter((option) => !option.hidden),
		[options],
	);
	const selectorStyles = useMemo(
		() => ({
			autocomplete: isActive ? "Mui-active" : undefined,
		}),
		[isActive],
	);

	if (showList) {
		return (
			<GridSingleSelectFilterDialogRoot
				size={{ xs: 12, md: 6, lg: 3, ...dialogBreakpoints }}
			>
				<FormControl component={"fieldset"}>
					<RadioGroup value={selected} onChange={handleDialogRadioToggle}>
						<Grid container size={12}>
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
											control={<Radio />}
											value={option.value}
											label={getReactLabel(option)}
											disabled={option.isDisabled}
										/>
									)}
								</Grid>
							))}
						</Grid>
					</RadioGroup>
				</FormControl>
			</GridSingleSelectFilterDialogRoot>
		);
	}

	// the bar's select, also in the panel on a phone
	const selector = (
		<FormControl component={"fieldset"} fullWidth>
			<DataGridCustomFilterSingle
				label={label}
				disableSearch
				disableClearable
				onLoad={getOptions}
				selected={
					options.find((option) => option.value === selected) ?? options[0]
				}
				onSelect={handleSelectorChange}
				// the panel stays mounted once opened, also after the grid has
				// switched back to the bar: an id there would occur twice
				autocompleteId={dialog ? undefined : autocompleteId}
				classes={selectorStyles}
				className={classes?.customFilterSingle}
			/>
		</FormControl>
	);

	return dialog ? (
		<GridSingleSelectFilterDialogRoot
			size={{ xs: 12, md: 6, lg: 3, ...dialogBreakpoints }}
		>
			{selector}
		</GridSingleSelectFilterDialogRoot>
	) : (
		<GridSingleSelectFilterBarRoot size={{ xs: 4, ...barBreakpoints }}>
			{selector}
		</GridSingleSelectFilterBarRoot>
	);
};

export default React.memo(GridSingleSelectFilter);
