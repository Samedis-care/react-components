import React from "react";
import { makeStyles } from "@material-ui/core/styles";
var useStyles = makeStyles(function (theme) { return ({
    root: {
        display: "inline-block",
        borderRight: "1px solid ".concat(theme.palette.divider),
        height: "100%",
        padding: "0",
        margin: "0 4px",
    },
}); }, { name: "CcVerticalDivider" });
var VerticalDivider = function (props) {
    var classes = useStyles(props);
    return React.createElement("div", { className: classes.root });
};
export default React.memo(VerticalDivider);
