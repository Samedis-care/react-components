import React, { useCallback, useMemo } from "react";
import { BaseSelectorData } from "../../standalone/Selector";
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

/**
 * Props of GridSingleSelectFilter
 */
export interface GridSingleSelectFilterProps {
	/**
	 * The filter's label: the selector's label in the bar, a text above the
	 * radios in the panel
	 */
	label?: string;
	/**
	 * All available options. There is no built-in "no filter" choice: add an
	 * option for it (for example with the value "")
	 */
	options: BaseSelectorData[];
	/**
	 * The key of the grid's custom data this filter edits. Its value in
	 * DataGridProps.defaultCustomData is the filter's default: shown while
	 * selected is unset, and restored by "Reset filter". While the selection
	 * differs from it (isDataGridCustomFilterActive: undefined, null and ""
	 * count as unset), the bar outlines the filter.
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
	 * Renders the filter panel's variant: pass IDataGridFilterBarProps.inDialog
	 */
	dialog: boolean;
	/**
	 * The id of the bar's input (SingleSelect autocompleteId); unused in the
	 * panel
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
 * panel. It edits the custom data key `field` and takes its default from
 * DataGridProps.defaultCustomData; while its selection differs from that
 * default, the bar outlines it. Only inside a DataGrid (it reads the grid's
 * props context). Theme name CcGridSingleSelectFilter.
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
	const selectorStyles = useMemo(
		() => ({
			autocomplete: isActive ? "Mui-active" : undefined,
		}),
		[isActive],
	);

	if (dialog) {
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
							{options.map((option) => (
								<Grid key={option.value} size={12}>
									{option.isDivider ? (
										<Divider />
									) : option.isSmallLabel ? (
										<Typography>{option.label}</Typography>
									) : (
										<FormControlLabel
											control={<Radio />}
											value={option.value}
											label={option.label}
										/>
									)}
								</Grid>
							))}
						</Grid>
					</RadioGroup>
				</FormControl>
			</GridSingleSelectFilterDialogRoot>
		);
	} else {
		return (
			<GridSingleSelectFilterBarRoot size={{ xs: 4, ...barBreakpoints }}>
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
						autocompleteId={autocompleteId}
						classes={selectorStyles}
						className={classes?.customFilterSingle}
					/>
				</FormControl>
			</GridSingleSelectFilterBarRoot>
		);
	}
};

export default React.memo(GridSingleSelectFilter);
