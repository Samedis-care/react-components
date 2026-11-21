import React from "react";
import {
	ListItemButton,
	listItemButtonClasses,
	ListItemButtonProps,
	styled,
	useThemeProps,
} from "@mui/material";
import { buttonGutters } from "./listGutters";
import focusRing from "../../utils/internal/focusRing";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";

/**
 * Props of {@link SmallListItemButton}, also the type of the theme's
 * `components.CcSmallListItemButton.defaultProps`: MUI's `ListItemButtonProps`
 */
export type SmallListItemButtonProps = ListItemButtonProps;

/**
 * Theme style slots of {@link SmallListItemButton}
 * (`components.CcSmallListItemButton.styleOverrides.<slot>`): `root` is the MUI
 * `ListItemButton`
 */
export type SmallListItemButtonClassKey = "root";

const SmallListItemButtonRoot = styled(ListItemButton, {
	name: "CcSmallListItemButton",
	slot: "root",
	shouldForwardProp: wrapperRootShouldForwardProp,
})(buttonGutters(8, 8), ({ theme }) => ({
	// MUI shows keyboard focus on a ListItemButton only as a faint tint (unless the
	// theme sets its focusVisible ring), which forced colors drop; inside the
	// button, where MUI insets its own ring too, as a scrolling list clips its sides
	[`&.${listItemButtonClasses.focusVisible}`]: focusRing(theme, -2),
}));

const SmallListItemButton = React.forwardRef(function SmallListItemButton(
	inProps: SmallListItemButtonProps,
	ref: React.ForwardedRef<HTMLDivElement>,
) {
	const props = useThemeProps({
		props: inProps,
		name: "CcSmallListItemButton",
	});
	return <SmallListItemButtonRoot {...props} ref={ref} />;
});

/**
 * MUI `ListItemButton` with 8px left and right gutters instead of MUI's
 * 16px; `disableGutters` removes them. Renders a `div[role=button]`, so inside
 * a `List` wrap it in `<ListItem disablePadding>`. Takes all `ListItemButton`
 * props and a `ref` (the button); `selected` only changes the look, so add the
 * ARIA state yourself. Keyboard focus shows a 2px outline in
 * `theme.palette.primary.main` just inside the button's edges, over MUI's
 * `action.focus` background, or the ring of the theme's `focusVisible` option
 * when the theme sets one.
 *
 * Theme: `components.CcSmallListItemButton.defaultProps` ({@link SmallListItemButtonProps}),
 * `styleOverrides.root` (see {@link SmallListItemButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters and its focus outline, which in turn win over a theme's
 * `MuiListItemButton` padding and outline.
 */
export default React.memo(SmallListItemButton) as typeof ListItemButton;
