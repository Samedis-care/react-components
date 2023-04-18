import React from "react";
import { Grid } from "@mui/material";
import Pagination from "./Pagination";
import StatusBar from "./DataActionBar";
var Footer = function () {
    return (React.createElement(Grid, { container: true, justifyContent: "space-between", wrap: "nowrap" },
        React.createElement(Grid, { item: true },
            React.createElement(StatusBar, null)),
        React.createElement(Grid, { item: true },
            React.createElement(Pagination, null))));
};
export default React.memo(Footer);
