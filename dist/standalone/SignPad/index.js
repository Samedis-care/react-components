import React, { useCallback } from "react";
import { makeStyles, InputAdornment, IconButton } from "@material-ui/core";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@material-ui/icons";
import useCCTranslations from "../../utils/useCCTranslations";
var useStyles = makeStyles(function (theme) { return ({
    signPadDiv: {
        position: "relative",
        cursor: "pointer",
        borderBottom: "1px dotted",
        height: "100%",
        width: "100%",
        minHeight: "100px",
        color: theme.palette.grey[700],
        display: "inline-block",
        backgroundColor: theme.palette.action.hover,
    },
    imageDiv: {
        height: "calc(100% - ".concat(theme.spacing(2), "px)"),
        width: "calc(100% - ".concat(theme.spacing(2), "px)"),
    },
    signPreview: {
        height: "100%",
        width: "100%",
        objectFit: "contain",
    },
    signTextDiv: {
        position: "absolute",
        left: 5,
        bottom: 5,
        alignItems: "center",
        display: "flex",
        color: theme.palette.text.secondary,
    },
    infoDiv: {
        position: "absolute",
        right: 5,
        bottom: 20,
    },
}); }, { name: "CcSignPad" });
var SignPad = function (props) {
    var signature = props.signature, disabled = props.disabled, openInfo = props.openInfo, openSignPad = props.openSignPad;
    var t = useCCTranslations().t;
    var classes = useStyles(props);
    var handelOpenInfo = useCallback(function (event) {
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
    return (React.createElement("div", { className: classes.signPadDiv, onClick: openSignPad },
        React.createElement("div", { className: classes.signTextDiv },
            React.createElement(SignIcon, { color: disabled ? "disabled" : "primary" }),
            !signature && React.createElement("span", null, t("standalone.signature-pad.sign-here"))),
        React.createElement("div", { className: classes.imageDiv }, signature && (React.createElement("img", { className: classes.signPreview, src: signature, alt: "" }))),
        React.createElement("div", { className: classes.infoDiv }, openInfo && (React.createElement(InputAdornment, { position: "end" },
            React.createElement(IconButton, { onClick: handelOpenInfo },
                React.createElement(InfoIcon, { color: "disabled" })))))));
};
export default React.memo(SignPad);
