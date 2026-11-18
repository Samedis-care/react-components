import { ListItem, ListItemProps } from "@mui/material";
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
declare const _default: typeof ListItem;
export default _default;
