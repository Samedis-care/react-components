import React, { useCallback, useEffect, useMemo } from "react";
import { BaseSelectorData, SingleSelect } from "../..";
import {
	Divider,
	FormControl,
	FormControlLabel,
	Grid,
	Radio,
	RadioGroup,
	Typography,
} from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridStyles } from "./DataGrid";
import { GridSize } from "@mui/material/Grid/Grid";
import { Breakpoint } from "@mui/material/styles";

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
	dialogBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
	/**
	 * Breakpoints used in filter bar
	 */
	barBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
}

const GridSingleSelectFilter = (props: GridSingleSelectFilterProps) => {
	const {
		label,
		options,
		onSelect,
		dialog,
		autocompleteId,
		dialogBreakpoints,
		barBreakpoints,
	} = props;
	const classes = useDataGridStyles();
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
		(_, value: string) => {
			onSelect(value);
		},
		[onSelect]
	);

	const handleSelectorChange = useCallback(
		(value: BaseSelectorData | null) => {
			onSelect(value?.value ?? "");
		},
		[onSelect]
	);

	const getOptions = useCallback(() => options, [options]);
	const selectorStyles = useMemo(
		() => ({
			inputRoot: isActive ? classes.customFilterBorder : undefined,
		}),
		[isActive, classes.customFilterBorder]
	);

	if (dialog) {
		return (
			<Grid item xs={12} md={6} lg={3} {...dialogBreakpoints}>
				<FormControl component={"fieldset"}>
					<RadioGroup value={selected} onChange={handleDialogRadioToggle}>
						<Grid item xs={12} container spacing={2}>
							{label && (
								<Grid item xs={12}>
									<Typography>{label}</Typography>
								</Grid>
							)}
							{options.map((option) => (
								<Grid item xs={12} key={option.value}>
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
			</Grid>
		);
	} else {
		return (
			<Grid item xs={4} {...barBreakpoints}>
				<FormControl component={"fieldset"} fullWidth>
					<SingleSelect
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
					/>
				</FormControl>
			</Grid>
		);
	}
};

export default React.memo(GridSingleSelectFilter);
