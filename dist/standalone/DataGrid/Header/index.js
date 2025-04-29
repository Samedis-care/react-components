import React from "react";
import { Box, Grid } from "@mui/material";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar from "./FilterBar";
const Header = () => {
    return (React.createElement(Box, { mx: 1 },
        React.createElement(Grid, { container: true, justifyContent: "space-between", alignItems: "center", wrap: "nowrap" },
            React.createElement(Grid, null,
                React.createElement(Search, null)),
            React.createElement(Grid, { size: "grow" },
                React.createElement(FilterBar, null)),
            React.createElement(Grid, null,
                React.createElement(ActionBar, null)))));
};
export default React.memo(Header);
