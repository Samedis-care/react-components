import React, { useCallback, useEffect, useMemo } from "react";
import {
	Checkbox,
	Divider,
	FormControlLabel,
	Grid,
	Typography,
} from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridStyles } from "./DataGrid";
import { SelectProps } from "@mui/material/Select/Select";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid/Grid";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";
import compareArrayContent from "../../utils/compareArrayContent";
import { MultiSelectorData } from "../Selector";
import MultiSelectWithCheckBox from "../Selector/MultiSelectWithCheckBox";

export interface GridMultiSelectFilterProps {
	/**
	 * Optional label for the filter
	 */
	label?: string;
	/**
	 * All available options
	 */
	options: MultiSelectorData[];
	/**
	 * The currently selected options
	 */
	selected: string[] | undefined;
	/**
	 * Updates the currently selected options
	 * @param selected The selected options
	 */
	onSelect: (selected: string[]) => void;
	/**
	 * Is the grid filter rendered in a dialog?
	 */
	dialog: boolean;
	/**
	 * Default selection
	 */
	defaultSelection: string[];
	/**
	 * Breakpoints used in dialog
	 */
	dialogBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
	/**
	 * Breakpoints used in filter bar
	 */
	barBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
}

const GridMultiSelectFilter = (props: GridMultiSelectFilterProps) => {
	const {
		label,
		options,
		onSelect,
		dialog,
		dialogBreakpoints,
		barBreakpoints,
	} = props;
	const classes = useDataGridStyles();
	const selected = props.selected ?? props.defaultSelection;
	const isActive = !compareArrayContent(selected, props.defaultSelection);
	const [, setActiveFilter] = useCustomFilterActiveContext();

	useEffect(() => {
		if (!isActive) return;
		setActiveFilter((prev) => prev + 1);
		return () => {
			setActiveFilter((prev) => prev - 1);
		};
	}, [setActiveFilter, isActive]);

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

	const getSelected = useCallback(
		(values: string[]): string => {
			return values
				.map(
					(selected) =>
						options.find((option) => option.value === selected)?.label,
				)
				.filter((selected) => selected)
				.join(", ");
		},
		[options],
	);

	const handleSelectorChange = useCallback(
		(event: SelectChangeEvent<string[]>) => {
			onSelect(event.target.value as string[]);
		},
		[onSelect],
	);

	const selectorClasses = useMemo(
		() => ({
			select: isActive ? classes.customFilterBorder : undefined,
		}),
		[isActive, classes.customFilterBorder],
	);

	if (dialog) {
		return (
			<Grid item xs={12} md={6} lg={3} {...dialogBreakpoints} container>
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
		);
	} else {
		return (
			<Grid item xs={4} {...barBreakpoints}>
				<MultiSelectWithCheckBox
					variant={"outlined"}
					label={label}
					options={options}
					values={selected}
					onChange={handleSelectorChange}
					renderValue={getSelected as SelectProps["renderValue"]}
					fullWidth
					classes={selectorClasses}
				/>
			</Grid>
		);
	}
};

export default React.memo(GridMultiSelectFilter);
