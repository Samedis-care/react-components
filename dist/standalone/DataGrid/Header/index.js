import React from "react";
import { Box, Grid } from "@material-ui/core";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar from "./FilterBar";
var Header = function () {
    return (React.createElement(Box, { mx: 1 },
        React.createElement(Grid, { item: true, container: true, justify: "space-between", alignItems: "center", wrap: "nowrap" },
            React.createElement(Grid, { item: true },
                React.createElement(Search, null)),
            React.createElement(Grid, { item: true, xs: true },
                React.createElement(FilterBar, null)),
            React.createElement(Grid, { item: true },
                React.createElement(ActionBar, null)))));
};
export default React.memo(Header);
