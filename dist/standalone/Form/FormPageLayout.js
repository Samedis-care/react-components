import { Box, useMediaQuery, useTheme } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { makeThemeStyles } from "../../utils";
var useStyles = makeStyles({
    wrapper: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    box: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    body: {
        paddingBottom: 150,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    footer: {
        position: "absolute",
        bottom: 36,
        transform: "translateX(36px)",
        padding: 0,
    },
}, { name: "CcFormPageLayout" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a, _b, _c; return (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.formPage) === null || _c === void 0 ? void 0 : _c.layout; }, "CcFormPageLayout", useStyles);
var FormPageLayout = function (props) {
    var theme = useTheme();
    var isXs = useMediaQuery(theme.breakpoints.only("xs"));
    var classes = useThemeStyles(props);
    return (React.createElement(Box, { p: isXs ? 2 : 0, className: classes.box },
        React.createElement("div", { className: classes.wrapper },
            React.createElement("div", { className: classes.body }, props.body),
            React.createElement("div", { className: classes.footer }, props.footer)),
        props.other));
};
export default React.memo(FormPageLayout);
