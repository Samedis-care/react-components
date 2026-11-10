import type { SvgIconComponent } from "@mui/icons-material";
/**
 * A spreadsheet (Excel) file, a page with an "X". The DataGrid action bar
 * shows it on its Export button and its Export menu entry, whatever formats
 * the grid exports. For the icon of a file type, see the FileUpload file icons
 * (`ExcelFileIcon` and the others).
 *
 * Takes MUI `SvgIconProps`, like a Material icon. Size it with `fontSize`
 * (`"small"` 20px, `"medium"` 24px, the default, `"large"` 35px, `"inherit"`
 * 1em of the parent's font size) or `sx`, and color it with `color` (a palette
 * key such as `"primary"`; default `"inherit"`, the parent's text color) or
 * `htmlColor` (any CSS color, used when `color` is `"inherit"`). The glyph is
 * drawn on Material's 24-unit grid, so it looks as large as a Material icon of
 * the same `fontSize`. `viewBox` defaults to that padded box; a caller's
 * `viewBox` replaces it, as on a Material icon. `children` are ignored.
 *
 * Accessibility: decorative by default, like every MUI icon: the `<svg>` has
 * `aria-hidden="true"` and is not focusable. To use it as a control, put it
 * inside an `IconButton` with an `aria-label` (and a `Tooltip` for sighted
 * users, if the icon alone is not clear): the button is the tab stop, carries
 * the name and is activated by Enter and Space. An `onClick`, `aria-label` or
 * `Tooltip` on the icon itself is neither announced by screen readers nor
 * reachable by keyboard: the `<svg>` stays hidden, and a Tooltip writes its
 * title onto that hidden `<svg>`. For an icon that carries meaning on its own,
 * pass `titleAccess`: it adds `role="img"` and a `<title>` as its name.
 *
 * `ref` reaches the `<svg>`. There is no `Cc*` theme slot: style it with `sx`
 * or `className`, or app-wide through `components.MuiSvgIcon`, which also
 * affects every MUI icon.
 */
declare const _default: SvgIconComponent;
export default _default;
