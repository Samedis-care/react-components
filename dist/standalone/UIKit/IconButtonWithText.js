import React from "react";
import { Grid, IconButton, Typography, } from "@mui/material";
const IconButtonWithText = (props) => (React.createElement(Grid, { container: true, direction: "column", alignItems: "center" },
    React.createElement(Grid, null,
        React.createElement(IconButton, { onClick: props.onClick, ...props.IconButtonProps, size: "large" }, props.icon)),
    React.createElement(Grid, null,
        React.createElement(Typography, { variant: "caption", color: "textSecondary", onClick: props.onClick, ...props.TypographyProps }, props.text))));
export default React.memo(IconButtonWithText);
