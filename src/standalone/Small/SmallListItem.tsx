import React from "react";
import { ListItem, ListItemProps, styled, useThemeProps } from "@mui/material";
import { itemGutters } from "./listGutters";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";

/**
 * Props of {@link SmallListItem}, also the type of the theme's
 * `components.CcSmallListItem.defaultProps`: MUI's `ListItemProps`
 */
export type SmallListItemProps = ListItemProps;

/**
 * Theme style slots of {@link SmallListItem}
 * (`components.CcSmallListItem.styleOverrides.<slot>`): `root` is the MUI
 * `ListItem`
 */
export type SmallListItemClassKey = "root";

const SmallListItemRoot = styled(ListItem, {
	name: "CcSmallListItem",
	slot: "root",
	shouldForwardProp: wrapperRootShouldForwardProp,
})(itemGutters(8, 8));

const SmallListItem = React.forwardRef(function SmallListItem(
	inProps: SmallListItemProps,
	ref: React.ForwardedRef<HTMLLIElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcSmallListItem" });
	return <SmallListItemRoot {...props} ref={ref} />;
});

/**
 * MUI `ListItem` with 8px left and right gutters instead of MUI's 16px.
 * Vertical padding is MUI's (`dense` reduces it); `disableGutters` removes
 * the gutters, `disablePadding` all padding. With `secondaryAction` the right
 * padding stays MUI's 48px. Takes all `ListItem` props and a `ref` (the
 * `li`).
 *
 * Theme: `components.CcSmallListItem.defaultProps` ({@link SmallListItemProps}),
 * `styleOverrides.root` (see {@link SmallListItemClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItem` padding.
 */
export default React.memo(SmallListItem) as typeof ListItem;
