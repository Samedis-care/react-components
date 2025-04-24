import React, { useEffect, useMemo } from "react";
import {
	FormControl,
	Grid2 as Grid,
	styled,
	useThemeProps,
} from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import { GridSize } from "@mui/material/Grid2";
import { Breakpoint } from "@mui/material/styles";
import BackendSingleSelect, {
	BackendSingleSelectProps,
} from "../../backend-components/Selector/BackendSingleSelect";
import { ModelFieldName, PageVisibility } from "../../backend-integration";

export interface GridSingleSelectFilterBackendProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
> extends Omit<
		BackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
		"classes" | "className" | "disableClearable"
	> {
	/**
	 * Optional label for the filter
	 */
	label?: string;
	/**
	 * Non-optional selection handler
	 */
	onSelect: NonNullable<
		BackendSingleSelectProps<KeyT, VisibilityT, CustomT>["onSelect"]
	>;
	/**
	 * Is the grid filter rendered in a dialog?
	 */
	dialog: boolean;
	/**
	 * Autocomplete ID passed to selector
	 */
	autocompleteId?: string;
	/**
	 * Breakpoints used in dialog
	 */
	dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
	/**
	 * Breakpoints used in filter bar
	 */
	barBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
}

const GridSingleSelectFilterBackendDialogRoot = styled(Grid, {
	name: "CcGridSingleSelectFilterBackend",
	slot: "dialogRoot",
})({});
const GridSingleSelectFilterBackendBarRoot = styled(Grid, {
	name: "CcGridSingleSelectFilterBackend",
	slot: "barRoot",
})({});
export type GridSingleSelectFilterBackendClassKey = "dialogRoot" | "barRoot";

export const DataGridCustomFilterSingleBackend = styled(BackendSingleSelect, {
	name: "CcDataGrid",
	slot: "customFilterSingleBackend",
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
})) as typeof BackendSingleSelect;

const GridSingleSelectFilterBackend = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	inProps: GridSingleSelectFilterBackendProps<KeyT, VisibilityT, CustomT>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcGridSingleSelectFilterBackend",
	});
	const { label, dialog, dialogBreakpoints, barBreakpoints, ...selectorProps } =
		props;
	const { selected } = selectorProps;
	const { classes } = useDataGridProps();
	const isActive = !!selected;

	const [, setActiveFilter] = useCustomFilterActiveContext();

	useEffect(() => {
		if (!isActive) return;
		setActiveFilter((prev) => prev + 1);
		return () => {
			setActiveFilter((prev) => prev - 1);
		};
	}, [setActiveFilter, isActive]);

	const selectorStyles = useMemo(
		() => ({
			autocomplete: isActive ? "Mui-active" : undefined,
		}),
		[isActive],
	);

	if (dialog) {
		return (
			<GridSingleSelectFilterBackendDialogRoot
				size={{ xs: 12, md: 6, lg: 3, ...dialogBreakpoints }}
			>
				<FormControl component={"fieldset"} fullWidth>
					<DataGridCustomFilterSingleBackend
						label={label}
						{...selectorProps}
						disableClearable
						classes={selectorStyles}
						className={classes?.customFilterSingle}
					/>
				</FormControl>
			</GridSingleSelectFilterBackendDialogRoot>
		);
	} else {
		return (
			<GridSingleSelectFilterBackendBarRoot size={{ xs: 4, ...barBreakpoints }}>
				<FormControl component={"fieldset"} fullWidth>
					<DataGridCustomFilterSingleBackend
						label={label}
						{...selectorProps}
						disableClearable
						classes={selectorStyles}
						className={classes?.customFilterSingle}
					/>
				</FormControl>
			</GridSingleSelectFilterBackendBarRoot>
		);
	}
};

export default React.memo(
	GridSingleSelectFilterBackend,
) as typeof GridSingleSelectFilterBackend;
