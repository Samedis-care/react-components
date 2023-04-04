import React, { useRef, useEffect } from "react";
import { makeStyles, InputLabel } from "@material-ui/core";
var useStyles = makeStyles(function (theme) { return ({
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
        maxWidth: "100%",
        whiteSpace: "nowrap",
    },
}); }, { name: "CcGroupBox" });
var GroupBox = function (props) {
    var id = props.id, label = props.label, children = props.children, smallLabel = props.smallLabel;
    var classes = useStyles(props);
    var inputLabelRef = useRef(null);
    useEffect(function () {
        if (!smallLabel)
            return;
        if (inputLabelRef.current) {
            var elem = inputLabelRef.current;
            var parentElem = elem.parentElement;
            if (parentElem) {
                parentElem.style.maxWidth =
                    (elem.getBoundingClientRect().width + 5).toString() + "px";
            }
        }
    }, [smallLabel]);
    return (React.createElement("fieldset", { id: id, className: classes.fieldSetRoot },
        smallLabel
            ? label && (React.createElement("legend", { className: classes.smallLabel },
                React.createElement(InputLabel, { shrink: true, ref: inputLabelRef }, label)))
            : label && React.createElement("legend", { className: classes.legend }, label),
        children));
};
export default React.memo(GroupBox);
