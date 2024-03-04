import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import combineClassNames from "../../utils/combineClassNames";
import makeThemeStyles from "../../utils/makeThemeStyles";
import useMultipleStyles from "../../utils/useMultipleStyles";
const useStylesBase = makeStyles((theme) => ({
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
}), { name: "CcGroupBox" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.groupBox, "CcGroupBox");
const useStyles = (props) => {
    return useMultipleStyles(props, useThemeStyles, useStylesBase);
};
const GroupBox = (props) => {
    const { id, label, children, smallLabel } = props;
    const classes = useStyles(props);
    return (React.createElement("fieldset", { id: id, className: classes.fieldSetRoot },
        label && (React.createElement("legend", { className: combineClassNames([
                classes.legend,
                smallLabel && classes.smallLabel,
            ]) }, label)),
        children));
};
export default React.memo(GroupBox);
