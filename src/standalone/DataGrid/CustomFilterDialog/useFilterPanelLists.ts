import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Whether a filter helper (GridSingleSelectFilter, GridMultiSelectFilter,
 * GridMultiSelectFilterBackend) shows its list in the filter panel: the
 * options as radio buttons or checkboxes, or the picked records below the
 * selector, so they are picked with one click. On a phone (the theme's xs
 * breakpoint) the panel shows the bar's select instead: one row per filter,
 * not every option. Follows the viewport while mounted.
 * @param dialog The helper's dialog prop: whether it is in the panel
 * @returns true for the panel's list, false for the bar's select
 */
const useFilterPanelLists = (dialog: boolean): boolean => {
	const theme = useTheme();
	const isPhone = useMediaQuery(theme.breakpoints.only("xs"));
	return dialog && !isPhone;
};

export default useFilterPanelLists;
