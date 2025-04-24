import React, { useEffect, useMemo } from "react";
import { Grid2 as Grid, styled, useThemeProps } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid2";
import { MultiSelectorData } from "../Selector";
import BackendMultipleSelect, {
	BackendMultipleSelectProps,
} from "../../backend-components/Selector/BackendMultipleSelect";
import BackendMultiSelect from "../../backend-components/Selector/BackendMultiSelect";
import { ModelFieldName, PageVisibility } from "../../backend-integration";

export interface GridMultiSelectFilterBackendProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData,
> extends Omit<
		BackendMultipleSelectProps<KeyT, VisibilityT, CustomT, DataT>,
		"classes"
	> {
	/**
	 * Is the grid filter rendered in a dialog?
	 */
	dialog: boolean;
	/**
	 * Breakpoints used in dialog
	 */
	dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
	/**
	 * Breakpoints used in filter bar
	 */
	barBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
}

export const DataGridCustomFilterMultiBackend = styled(BackendMultipleSelect, {
	name: "CcDataGrid",
	slot: "customFilterMultiBackend",
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
})) as typeof BackendMultipleSelect;

const GridMultiSelectFilterDialogRoot = styled(Grid, {
	name: "CcGridMultiSelectFilter",
	slot: "dialogRoot",
})({});
const GridMultiSelectFilterBarRoot = styled(Grid, {
	name: "CcGridMultiSelectFilter",
	slot: "barRoot",
})({});
export type GridMultiSelectFilterBackendClassKey = "dialogRoot" | "barRoot";

const EMPTY_STRING_ARRAY: string[] = [];
const GridMultiSelectFilterBackend = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	DataT extends MultiSelectorData,
>(
	inProps: GridMultiSelectFilterBackendProps<KeyT, VisibilityT, CustomT, DataT>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridMultiSelectFilterBackend",
	});
	const { dialog, dialogBreakpoints, barBreakpoints, ...selectorProps } = props;
	const selected = selectorProps.selected ?? EMPTY_STRING_ARRAY;
	const { classes } = useDataGridProps();
	const isActive = selected.length > 0;
	const [, setActiveFilter] = useCustomFilterActiveContext();

	useEffect(() => {
		if (!isActive) return;
		setActiveFilter((prev) => prev + 1);
		return () => {
			setActiveFilter((prev) => prev - 1);
		};
	}, [setActiveFilter, isActive]);

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
					<BackendMultiSelect
						confirmDelete={false}
						{...selectorProps}
						selected={selected}
					/>
				</Grid>
			</GridMultiSelectFilterDialogRoot>
		);
	} else {
		return (
			<GridMultiSelectFilterBarRoot size={{ xs: 4, ...barBreakpoints }}>
				<DataGridCustomFilterMultiBackend
					{...selectorProps}
					classes={selectorClasses}
					className={classes?.customFilterMulti}
					selected={selected}
				/>
			</GridMultiSelectFilterBarRoot>
		);
	}
};

export default React.memo(
	GridMultiSelectFilterBackend,
) as typeof GridMultiSelectFilterBackend;
