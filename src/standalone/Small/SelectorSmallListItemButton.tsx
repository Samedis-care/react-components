import React from "react";
import {
	ListItemButton,
	ListItemButtonProps,
	styled,
	useThemeProps,
} from "@mui/material";
import { buttonGutters } from "./listGutters";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";

/**
 * Props of {@link SelectorSmallListItemButton}, also the type of the theme's
 * `components.CcSelectorSmallListItemButton.defaultProps`: MUI's `ListItemButtonProps`
 */
export type SelectorSmallListItemButtonProps = ListItemButtonProps;

/**
 * Theme style slots of {@link SelectorSmallListItemButton}
 * (`components.CcSelectorSmallListItemButton.styleOverrides.<slot>`): `root` is the MUI
 * `ListItemButton`
 */
export type SelectorSmallListItemButtonClassKey = "root";

const SelectorSmallListItemButtonRoot = styled(ListItemButton, {
	name: "CcSelectorSmallListItemButton",
	slot: "root",
	shouldForwardProp: wrapperRootShouldForwardProp,
})(buttonGutters(0, 8));

const SelectorSmallListItemButton = React.forwardRef(
	function SelectorSmallListItemButton(
		inProps: SelectorSmallListItemButtonProps,
		ref: React.ForwardedRef<HTMLDivElement>,
	) {
		const props = useThemeProps({
			props: inProps,
			name: "CcSelectorSmallListItemButton",
		});
		return <SelectorSmallListItemButtonRoot {...props} ref={ref} />;
	},
);

/**
 * MUI `ListItemButton` with no left and an 8px right gutter; `disableGutters`
 * removes them. The Selector's option rows are built on it and set their own
 * 16px gutters. Takes all `ListItemButton` props and a `ref` (the button).
 *
 * Theme: `components.CcSelectorSmallListItemButton.defaultProps` ({@link SelectorSmallListItemButtonProps}),
 * `styleOverrides.root` (see {@link SelectorSmallListItemButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItemButton` padding.
 */
export default React.memo(SelectorSmallListItemButton) as typeof ListItemButton;
