import { SvgIcon } from "@mui/material";
/**
 * Sets MUI's `muiName` (`SvgIcon.muiName`) on an icon's render function, where
 * MUI's `createSvgIcon` sets it for every Material icon. Together with typing the
 * `React.memo(React.forwardRef(...))` export as `SvgIconComponent`, the type
 * `createSvgIcon` declares for its result, this makes an icon of this folder
 * interchangeable with a Material icon.
 * @param render The icon's render function, as passed to `React.forwardRef`
 * @returns `render`, with `muiName` set
 */
const withMuiName = (render) => Object.assign(render, { muiName: SvgIcon.muiName });
export default withMuiName;
