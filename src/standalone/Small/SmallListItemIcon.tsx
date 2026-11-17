import React from "react";
import {
	ListItemIcon,
	ListItemIconProps,
	styled,
	useThemeProps,
} from "@mui/material";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";

/**
 * Props of {@link SmallListItemIcon}, also the type of the theme's
 * `components.CcSmallListItemIcon.defaultProps`: MUI's `ListItemIconProps`
 */
export type SmallListItemIconProps = ListItemIconProps;

/**
 * Theme style slots of {@link SmallListItemIcon}
 * (`components.CcSmallListItemIcon.styleOverrides.<slot>`): `root` is the MUI
 * `ListItemIcon`
 */
export type SmallListItemIconClassKey = "root";

const SmallListItemIconRoot = styled(ListItemIcon, {
	name: "CcSmallListItemIcon",
	slot: "root",
	shouldForwardProp: wrapperRootShouldForwardProp,
})({
	minWidth: 0,
	paddingRight: 8,
});

const SmallListItemIcon = React.forwardRef(function SmallListItemIcon(
	inProps: SmallListItemIconProps,
	ref: React.ForwardedRef<HTMLDivElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcSmallListItemIcon" });
	return <SmallListItemIconRoot {...props} ref={ref} />;
});

/**
 * MUI `ListItemIcon` without MUI's 56px `min-width`, with an 8px gap
 * (`padding-right`) before the text. Takes all `ListItemIcon` props and a
 * `ref` (its `div`).
 *
 * Theme: `components.CcSmallListItemIcon.defaultProps` ({@link SmallListItemIconProps}),
 * `styleOverrides.root` (see {@link SmallListItemIconClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * `min-width` and padding, which in turn win over a theme's `MuiListItemIcon`
 * overrides of those.
 */
export default React.memo(SmallListItemIcon) as typeof ListItemIcon;
