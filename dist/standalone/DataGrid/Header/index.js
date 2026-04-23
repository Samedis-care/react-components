import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar from "./FilterBar";
import { useDataGridState, } from "../DataGrid";
const Header = () => {
    const [state] = useDataGridState();
    const { showSettings } = state;
    return useMemo(() => (_jsx(Box, { sx: { mx: 1 }, children: _jsxs(Grid, { container: true, sx: { justifyContent: "space-between", alignItems: "center" }, wrap: "nowrap", children: [_jsx(Grid, { children: _jsx(Search, {}) }), _jsx(Grid, { size: "grow", sx: showSettings ? { display: "none" } : undefined, children: _jsx(FilterBar, {}) }), _jsx(Grid, { sx: showSettings ? { display: "none" } : undefined, children: _jsx(ActionBar, {}) })] }) })), [showSettings]);
};
export default React.memo(Header);
