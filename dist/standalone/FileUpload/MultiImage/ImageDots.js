import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { combineClassNames, makeThemeStyles } from "../../../utils";
var useStyles = makeStyles(function (theme) { return ({
    activeImageDot: {
        backgroundColor: theme.palette.text.primary,
    },
    imageDot: {
        border: "1px solid ".concat(theme.palette.text.primary),
        borderRadius: "100%",
        height: 12,
        width: 12,
        display: "inline-block",
        flex: "0 0 12px",
        marginRight: 12,
        cursor: "pointer",
    },
    imageDotContainerContainer: {
        overflow: "hidden",
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 16,
    },
    imageDotContainer: {
        marginRight: 12,
        marginLeft: 12,
        width: "100%",
        height: "100%",
        position: "absolute",
        whiteSpace: "nowrap",
    },
}); }, { name: "CcImageDots" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a, _b, _c; return (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.fileUpload) === null || _b === void 0 ? void 0 : _b.multiImage) === null || _c === void 0 ? void 0 : _c.dots; }, "CcImageDots", useStyles);
var ImageDots = function (props) {
    var total = props.total, active = props.active, setActive = props.setActive;
    var classes = useThemeStyles(props);
    return (React.createElement(React.Fragment, null, total > 1 && (React.createElement("div", { className: classes.imageDotContainerContainer },
        React.createElement("div", { className: classes.imageDotContainer }, Array.from(Array(total).keys()).map(function (img, idx) { return (React.createElement("div", { key: idx, className: combineClassNames([
                active === idx && classes.activeImageDot,
                classes.imageDot,
            ]), onClick: function () { return setActive(idx); } })); }))))));
};
export default React.memo(ImageDots);
