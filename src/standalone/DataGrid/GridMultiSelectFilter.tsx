import React, { useCallback, useEffect, useMemo } from "react";
import {
	Checkbox,
	Divider,
	FormControlLabel,
	Grid,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid/Grid";
import compareArrayContent from "../../utils/compareArrayContent";
import { MultiSelectorData } from "../Selector";
import BaseSelector from "../Selector/BaseSelector";

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

const GridMultiSelectFilter = (inProps: GridMultiSelectFilterProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridMultiSelectFilter",
	});
	const {
		label,
		options,
		onSelect,
		dialog,
		dialogBreakpoints,
		barBreakpoints,
	} = props;
	const { classes } = useDataGridProps();
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

	const getOptions = useCallback(() => options, [options]);

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
				item
				xs={12}
				md={6}
				lg={3}
				{...dialogBreakpoints}
			>
				<Grid container>
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
			</GridMultiSelectFilterDialogRoot>
		);
	} else {
		return (
			<GridMultiSelectFilterBarRoot item xs={4} {...barBreakpoints}>
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
