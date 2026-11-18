import { IconButton, IconButtonProps } from "@mui/material";
/**
 * Props of {@link SmallIconButton}, also the type of the theme's
 * `components.CcSmallIconButton.defaultProps`: MUI's `IconButtonProps`
 */
export type SmallIconButtonProps = IconButtonProps;
/**
 * Theme style slots of {@link SmallIconButton}
 * (`components.CcSmallIconButton.styleOverrides.<slot>`): `root` is the MUI
 * `IconButton`
 */
export type SmallIconButtonClassKey = "root";
/**
 * MUI `IconButton` with a fixed 4px padding instead of MUI's 8px (5px with
 * `size="small"`): 32x32 with a default 24px icon, and at least 24x24 with an
 * icon smaller than 16px, which sits centered. The padding ignores `size`; set
 * the icon's own `fontSize` to change the icon. Takes all `IconButton` props
 * and a `ref` (the button), and like every `IconButton` needs an
 * `aria-label`. Keyboard focus shows a 2px outline in
 * `theme.palette.primary.main` around the button, or the ring of the theme's
 * `focusVisible` option when the theme sets one.
 *
 * Theme: `components.CcSmallIconButton.defaultProps` ({@link SmallIconButtonProps}),
 * `styleOverrides.root` (see {@link SmallIconButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. A theme's
 * `MuiIconButton` overrides apply as on every `IconButton`, except for the
 * padding, the minimum size and the focus outline, which `CcSmallIconButton`
 * sets.
 */
declare const _default: typeof IconButton;
export default _default;
