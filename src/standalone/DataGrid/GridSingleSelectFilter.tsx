import React, { useCallback, useEffect, useMemo } from "react";
import { BaseSelectorData } from "../../standalone/Selector";
import {
	Divider,
	FormControl,
	FormControlLabel,
	Grid2 as Grid,
	Radio,
	RadioGroup,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import { GridSize } from "@mui/material/Grid2";
import { Breakpoint } from "@mui/material/styles";
import SingleSelect from "../Selector/SingleSelect";

export interface GridSingleSelectFilterProps {
	/**
	 * Optional label for the filter
	 */
	label?: string;
	/**
	 * All available options
	 */
	options: BaseSelectorData[];
	/**
	 * The currently selected option
	 */
	selected: string | undefined;
	/**
	 * Updates the currently selected options
	 * @param selected The selected options
	 */
	onSelect: (selected: string) => void;
	/**
	 * Is the grid filter rendered in a dialog?
	 */
	dialog: boolean;
	/**
	 * Autocomplete ID passed to selector
	 */
	autocompleteId?: string;
	/**
	 * Default selection
	 */
	defaultSelection: string;
	/**
	 * Breakpoints used in dialog
	 */
	dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
	/**
	 * Breakpoints used in filter bar
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

const GridSingleSelectFilter = (inProps: GridSingleSelectFilterProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridSingleSelectFilter",
	});
	const {
		label,
		options,
		onSelect,
		dialog,
		autocompleteId,
		dialogBreakpoints,
		barBreakpoints,
	} = props;
	const { classes } = useDataGridProps();
	const selected = props.selected ?? props.defaultSelection;
	const isActive = selected !== props.defaultSelection;

	const [, setActiveFilter] = useCustomFilterActiveContext();

	useEffect(() => {
		if (!isActive) return;
		setActiveFilter((prev) => prev + 1);
		return () => {
			setActiveFilter((prev) => prev - 1);
		};
	}, [setActiveFilter, isActive]);

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

	const getOptions = useCallback(() => options, [options]);
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
											name={option.value}
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
