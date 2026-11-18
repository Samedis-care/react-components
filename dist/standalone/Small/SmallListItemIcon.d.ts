import { ListItemIcon, ListItemIconProps } from "@mui/material";
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
declare const _default: typeof ListItemIcon;
export default _default;
