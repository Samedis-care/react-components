import React, { useMemo } from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import { useDataGridProps } from "./DataGrid";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid";
import { MultiSelectorData } from "../Selector";
import BackendMultipleSelect, {
	BackendMultipleSelectProps,
} from "../../backend-components/Selector/BackendMultipleSelect";
import BackendMultiSelect from "../../backend-components/Selector/BackendMultiSelect";
import { ModelUnknown } from "../../backend-integration";
import { DistributiveOmit } from "../../utils/distributiveOmit";
import useFilterPanelLists from "./CustomFilterDialog/useFilterPanelLists";

export type GridMultiSelectFilterBackendProps<
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
> = DistributiveOmit<BackendMultipleSelectProps<M, DataT>, "classes"> & {
	/**
	 * Whether the filter is in the filter panel: pass
	 * IDataGridFilterBarProps.inDialog. The panel shows a selector with the
	 * picked records listed below it (BackendMultiSelect). On a phone (the
	 * theme's xs breakpoint) it shows the bar's selector instead
	 * (BackendMultipleSelect). Both are sized by dialogBreakpoints.
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
};

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
	M extends ModelUnknown,
	DataT extends MultiSelectorData,
>(
	inProps: GridMultiSelectFilterBackendProps<M, DataT>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridMultiSelectFilterBackend",
	});
	const { dialog, dialogBreakpoints, barBreakpoints, ...selectorProps } = props;
	const selected = selectorProps.selected ?? EMPTY_STRING_ARRAY;
	const { classes } = useDataGridProps();
	const isActive = selected.length > 0;
	const showList = useFilterPanelLists(dialog);
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
					<BackendMultiSelect
						confirmDelete={false}
						{...selectorProps}
						selected={selected}
					/>
				</Grid>
			</GridMultiSelectFilterDialogRoot>
		);
	}

	// the bar's selector, also in the panel on a phone
	const selector = (
		<DataGridCustomFilterMultiBackend
			{...selectorProps}
			classes={selectorClasses}
			className={classes?.customFilterMulti}
			selected={selected}
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

export default React.memo(
	GridMultiSelectFilterBackend,
) as typeof GridMultiSelectFilterBackend;
