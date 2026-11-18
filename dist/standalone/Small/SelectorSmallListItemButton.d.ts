import { ListItemButton, ListItemButtonProps } from "@mui/material";
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
declare const _default: typeof ListItemButton;
export default _default;
