import React from "react";
import {
	buttonBaseClasses,
	IconButton,
	IconButtonProps,
	styled,
	useThemeProps,
} from "@mui/material";
import focusRing from "../../utils/internal/focusRing";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";

/**
 * Props of {@link SmallestIconButton}, also the type of the theme's
 * `components.CcSmallestIconButton.defaultProps`: MUI's `IconButtonProps`
 */
export type SmallestIconButtonProps = IconButtonProps;

/**
 * Theme style slots of {@link SmallestIconButton}
 * (`components.CcSmallestIconButton.styleOverrides.<slot>`): `root` is the MUI
 * `IconButton`
 */
export type SmallestIconButtonClassKey = "root";

// without padding the button is the icon's box, so the ring keeps clear of the glyph;
// a smaller icon sits centered in the 24x24 minimum target (WCAG 2.5.8)
const SmallestIconButtonRoot = styled(IconButton, {
	name: "CcSmallestIconButton",
	slot: "root",
	shouldForwardProp: wrapperRootShouldForwardProp,
})(({ theme }) => ({
	padding: 0,
	minWidth: 24,
	minHeight: 24,
	// MUI shows keyboard focus on an IconButton only as a faint ripple (unless the
	// theme sets its focusVisible ring), which forced colors drop
	[`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, 2),
}));

const SmallestIconButton = React.forwardRef(function SmallestIconButton(
	inProps: SmallestIconButtonProps,
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const props = useThemeProps({ props: inProps, name: "CcSmallestIconButton" });
	return <SmallestIconButtonRoot {...props} ref={ref} />;
});

/**
 * MUI `IconButton` without padding: the clickable area is the icon itself,
 * 24x24 with a default icon; a smaller icon sits centered in a 24x24 minimum
 * target. The padding ignores `size`. Takes all `IconButton` props and a
 * `ref` (the button), and needs an `aria-label`. Keyboard focus shows a 2px
 * outline in `theme.palette.primary.main`, 2px outside the button, or the
 * ring of the theme's `focusVisible` option when the theme sets one.
 *
 * Theme: `components.CcSmallestIconButton.defaultProps` ({@link SmallestIconButtonProps}),
 * `styleOverrides.root` (see {@link SmallestIconButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. A theme's
 * `MuiIconButton` overrides apply as on every `IconButton`, except for the
 * padding, the minimum size and the focus outline, which `CcSmallestIconButton`
 * sets.
 */
export default React.memo(SmallestIconButton) as typeof IconButton;
