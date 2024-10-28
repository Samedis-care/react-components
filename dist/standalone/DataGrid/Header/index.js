import React from "react";
import { Box, Grid2 } from "@mui/material";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar from "./FilterBar";
const Header = () => {
    return (React.createElement(Box, { mx: 1 },
        React.createElement(Grid2, { container: true, justifyContent: "space-between", alignItems: "center", wrap: "nowrap" },
            React.createElement(Grid2, null,
                React.createElement(Search, null)),
            React.createElement(Grid2, { size: "grow" },
                React.createElement(FilterBar, null)),
            React.createElement(Grid2, null,
                React.createElement(ActionBar, null)))));
};
export default React.memo(Header);
