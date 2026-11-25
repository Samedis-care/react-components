import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useId } from "react";
import { Grid, IconButton, Typography, } from "@mui/material";
/**
 * A large IconButton with a caption below it, which names the button
 */
const IconButtonWithText = (props) => {
    const generatedId = useId();
    const captionId = props.TypographyProps?.id ?? generatedId;
    const namedByCaption = !props.IconButtonProps?.["aria-label"] &&
        !props.IconButtonProps?.["aria-labelledby"];
    return (_jsxs(Grid, { container: true, sx: { flexDirection: "column", alignItems: "center" }, children: [_jsx(Grid, { children: _jsx(IconButton, { onClick: props.onClick, "aria-labelledby": namedByCaption ? captionId : undefined, ...props.IconButtonProps, size: "large", children: props.icon }) }), _jsx(Grid, { children: _jsx(Typography, { variant: "caption", color: "textSecondary", onClick: props.onClick, "aria-hidden": namedByCaption ? true : undefined, ...props.TypographyProps, id: captionId, children: props.text }) })] }));
};
export default React.memo(IconButtonWithText);
