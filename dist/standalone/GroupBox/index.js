import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import combineClassNames from "../../utils/combineClassNames";
import { makeThemeStyles, useMultipleStyles } from "../../utils";
var useStylesBase = makeStyles(function (theme) { return ({
    fieldSetRoot: {
        padding: "8px",
        borderStyle: "solid",
        borderColor: "lightgrey",
        borderRadius: theme.shape.borderRadius,
        borderWidth: 1,
        position: "relative",
        maxHeight: "inherit",
        height: "100%",
        marginLeft: 0,
        marginRight: 0,
        minWidth: 0,
        width: "100%",
    },
    legend: {
        paddingInlineStart: 5,
        paddingInlineEnd: 5,
    },
    smallLabel: {
        fontSize: "0.75em",
    },
}); }, { name: "CcGroupBox" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a; return (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.groupBox; }, "CcGroupBox");
var useStyles = function (props) {
    return useMultipleStyles(props, useThemeStyles, useStylesBase);
};
var GroupBox = function (props) {
    var id = props.id, label = props.label, children = props.children, smallLabel = props.smallLabel;
    var classes = useStyles(props);
    return (React.createElement("fieldset", { id: id, className: classes.fieldSetRoot },
        label && (React.createElement("legend", { className: combineClassNames([
                classes.legend,
                smallLabel && classes.smallLabel,
            ]) }, label)),
        children));
};
export default React.memo(GroupBox);
