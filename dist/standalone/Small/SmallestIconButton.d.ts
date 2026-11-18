import { IconButton, IconButtonProps } from "@mui/material";
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
declare const _default: typeof IconButton;
export default _default;
