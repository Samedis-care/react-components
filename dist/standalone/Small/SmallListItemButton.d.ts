import { ListItemButton, ListItemButtonProps } from "@mui/material";
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
/**
 * MUI `ListItemButton` with 8px left and right gutters instead of MUI's
 * 16px; `disableGutters` removes them. Renders a `div[role=button]`, so inside
 * a `List` wrap it in `<ListItem disablePadding>`. Takes all `ListItemButton`
 * props and a `ref` (the button); `selected` only changes the look, so add the
 * ARIA state yourself.
 *
 * Theme: `components.CcSmallListItemButton.defaultProps` ({@link SmallListItemButtonProps}),
 * `styleOverrides.root` (see {@link SmallListItemButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItemButton` padding.
 */
declare const _default: typeof ListItemButton;
export default _default;
