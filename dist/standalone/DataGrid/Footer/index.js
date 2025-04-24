import React from "react";
import { Grid2 as Grid } from "@mui/material";
import Pagination from "./Pagination";
import StatusBar from "./DataActionBar";
const Footer = () => {
    return (React.createElement(Grid, { container: true, justifyContent: "space-between", wrap: "nowrap" },
        React.createElement(Grid, null,
            React.createElement(StatusBar, null)),
        React.createElement(Grid, null,
            React.createElement(Pagination, null))));
};
export default React.memo(Footer);
