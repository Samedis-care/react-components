import React, { useCallback } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@mui/icons-material";
import useCCTranslations from "../../utils/useCCTranslations";
const useStyles = makeStyles((theme) => ({
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
        height: `calc(100% - ${theme.spacing(2)})`,
        width: `calc(100% - ${theme.spacing(2)})`,
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
}), { name: "CcSignPad" });
const SignPad = (props) => {
    const { signature, disabled, openInfo, openSignPad } = props;
    const { t } = useCCTranslations();
    const classes = useStyles(props);
    const handelOpenInfo = useCallback((event) => {
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
            React.createElement(IconButton, { onClick: handelOpenInfo, size: "large" },
                React.createElement(InfoIcon, { color: "disabled" })))))));
};
export default React.memo(SignPad);
