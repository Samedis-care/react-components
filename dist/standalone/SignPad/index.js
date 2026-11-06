import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { IconButton, InputAdornment, styled, useThemeProps, } from "@mui/material";
import { SignIcon } from "../../standalone";
import { Info as InfoIcon } from "@mui/icons-material";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
const SignPadDiv = styled("div", { name: "CcSignPad", slot: "root" })(({ theme }) => ({
    position: "relative",
    cursor: "pointer",
    borderBottom: "1px dotted",
    height: "100%",
    width: "100%",
    minHeight: "100px",
    color: theme.palette.grey[700],
    display: "inline-block",
    backgroundColor: theme.palette.action.hover,
}));
// the tile's activator: fills the tile and resets the native button look,
// the tile itself draws the field
const SignPadButton = styled("button", { name: "CcSignPad", slot: "button" })(({ theme }) => ({
    // flex, not block: a block button centers its content vertically
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    minHeight: "inherit",
    margin: 0,
    padding: 0,
    border: 0,
    appearance: "none",
    background: "none",
    color: "inherit",
    // a button does not inherit text styles by default
    font: "inherit",
    letterSpacing: "inherit",
    wordSpacing: "inherit",
    textTransform: "inherit",
    textAlign: "inherit",
    cursor: "inherit",
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
const SignTextDiv = styled("div", { name: "CcSignPad", slot: "signTextDiv" })(({ theme }) => ({
    position: "absolute",
    left: 5,
    bottom: 5,
    alignItems: "center",
    display: "flex",
    color: theme.palette.text.secondary,
}));
const ImageDiv = styled("div", { name: "CcSignPad", slot: "imageDiv" })(({ theme }) => ({
    height: `calc(100% - ${theme.spacing(2)})`,
    width: `calc(100% - ${theme.spacing(2)})`,
}));
const SignPreview = styled("img", { name: "CcSignPad", slot: "signPreview" })({
    height: "100%",
    width: "100%",
    objectFit: "contain",
});
const InfoDiv = styled("div", { name: "CcSignPad", slot: "infoDiv" })({
    position: "absolute",
    right: 5,
    bottom: 20,
});
const SignPad = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignPad" });
    const { signature, signerName: signerNameUntrim, disabled, openInfo, openSignPad, className, classes, } = props;
    const { t } = useCCTranslations();
    const signerName = signerNameUntrim?.trim();
    const prompt = t("standalone.signature-pad.sign-here");
    // what the tile holds (it starts with the visible prompt while unsigned),
    // then whose signature it is
    const state = signature
        ? t("standalone.signature-pad.dialog.signature")
        : prompt;
    const label = signerName
        ? t("standalone.signature-pad.with-signer", {
            LABEL: state,
            NAME: signerName,
        })
        : state;
    const handelOpenInfo = useCallback((event) => {
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
    return (_jsxs(SignPadDiv, { className: combineClassNames([className, classes?.root]), 
        // also gets the button's clicks, Enter and Space included
        onClick: openSignPad, children: [_jsxs(SignPadButton, { type: "button", "aria-label": label, "aria-disabled": disabled || undefined, className: classes?.button, children: [_jsxs(SignTextDiv, { className: classes?.signTextDiv, children: [_jsx(SignIcon, { color: disabled ? "disabled" : "primary" }), !signature && _jsx("span", { children: prompt })] }), _jsx(ImageDiv, { className: classes?.imageDiv, children: signature && (_jsx(SignPreview, { className: classes?.signPreview, src: signature, alt: "" })) })] }), _jsx(InfoDiv, { className: classes?.infoDiv, children: openInfo && (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: handelOpenInfo, size: "large", "aria-label": t("standalone.uikit.info"), children: _jsx(InfoIcon, { color: "disabled" }) }) })) })] }));
};
export default React.memo(SignPad);
