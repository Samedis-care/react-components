import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Grid, IconButton, Typography, } from "@mui/material";
const IconButtonWithText = (props) => (_jsxs(Grid, { container: true, sx: { flexDirection: "column", alignItems: "center" }, children: [_jsx(Grid, { children: _jsx(IconButton, { onClick: props.onClick, "aria-label": typeof props.text === "string" ? props.text : undefined, ...props.IconButtonProps, size: "large", children: props.icon }) }), _jsx(Grid, { children: _jsx(Typography, { variant: "caption", color: "textSecondary", onClick: props.onClick, ...props.TypographyProps, children: props.text }) })] }));
export default React.memo(IconButtonWithText);
