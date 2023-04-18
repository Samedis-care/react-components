import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Loader from "../Loader";
var useStyles = makeStyles({
    root: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(255,255,255,.3)",
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) 1000ms",
    },
}, { name: "CcFormLoaderOverlay" });
var FormLoaderOverlay = function (props) {
    var classes = useStyles();
    return (React.createElement("div", { className: classes.root, style: props.visible
            ? { visibility: "visible", opacity: 1 }
            : { visibility: "hidden", opacity: 0 } }, props.visible && React.createElement(Loader, null)));
};
export default React.memo(FormLoaderOverlay);
