import React from "react";
import { ListItem, ListItemProps, styled, useThemeProps } from "@mui/material";
import { itemGutters } from "./listGutters";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";

/**
 * Props of {@link SelectorSmallListItem}, also the type of the theme's
 * `components.CcSelectorSmallListItem.defaultProps`: MUI's `ListItemProps`
 */
export type SelectorSmallListItemProps = ListItemProps;

/**
 * Theme style slots of {@link SelectorSmallListItem}
 * (`components.CcSelectorSmallListItem.styleOverrides.<slot>`): `root` is the MUI
 * `ListItem`
 */
export type SelectorSmallListItemClassKey = "root";

const SelectorSmallListItemRoot = styled(ListItem, {
	name: "CcSelectorSmallListItem",
	slot: "root",
	shouldForwardProp: wrapperRootShouldForwardProp,
})(itemGutters(0, 8));

const SelectorSmallListItem = React.forwardRef(function SelectorSmallListItem(
	inProps: SelectorSmallListItemProps,
	ref: React.ForwardedRef<HTMLLIElement>,
) {
	const props = useThemeProps({
		props: inProps,
		name: "CcSelectorSmallListItem",
	});
	return <SelectorSmallListItemRoot {...props} ref={ref} />;
});

/**
 * MUI `ListItem` with no left and an 8px right gutter, for rows whose icon
 * provides the left inset. `disableGutters` removes the gutters,
 * `disablePadding` all padding. With `secondaryAction` the right padding stays
 * MUI's 48px. Takes all `ListItem` props and a `ref` (the `li`).
 *
 * Theme: `components.CcSelectorSmallListItem.defaultProps` ({@link SelectorSmallListItemProps}),
 * `styleOverrides.root` (see {@link SelectorSmallListItemClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItem` padding.
 */
export default React.memo(SelectorSmallListItem) as typeof ListItem;
