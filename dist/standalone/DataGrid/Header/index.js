import React, { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar from "./FilterBar";
import { useDataGridState, } from "../DataGrid";
const Header = () => {
    const [state] = useDataGridState();
    const { showSettings } = state;
    return useMemo(() => (React.createElement(Box, { mx: 1 },
        React.createElement(Grid, { container: true, justifyContent: "space-between", alignItems: "center", wrap: "nowrap" },
            React.createElement(Grid, null,
                React.createElement(Search, null)),
            React.createElement(Grid, { size: "grow", display: showSettings ? "none" : undefined },
                React.createElement(FilterBar, null)),
            React.createElement(Grid, { display: showSettings ? "none" : undefined },
                React.createElement(ActionBar, null))))), [showSettings]);
};
export default React.memo(Header);
