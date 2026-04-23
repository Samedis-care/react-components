import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Grid } from "@mui/material";
import Pagination from "./Pagination";
import StatusBar from "./DataActionBar";
const Footer = () => {
    return (_jsxs(Grid, { container: true, sx: { justifyContent: "space-between" }, wrap: "nowrap", children: [_jsx(Grid, { children: _jsx(StatusBar, {}) }), _jsx(Grid, { children: _jsx(Pagination, {}) })] }));
};
export default React.memo(Footer);
