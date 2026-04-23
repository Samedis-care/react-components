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
    const { signature, disabled, openInfo, openSignPad, className, classes } = props;
    const { t } = useCCTranslations();
    const handelOpenInfo = useCallback((event) => {
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
    return (_jsxs(SignPadDiv, { className: combineClassNames([className, classes?.root]), onClick: openSignPad, children: [_jsxs(SignTextDiv, { className: classes?.signTextDiv, children: [_jsx(SignIcon, { color: disabled ? "disabled" : "primary" }), !signature && _jsx("span", { children: t("standalone.signature-pad.sign-here") })] }), _jsx(ImageDiv, { className: classes?.imageDiv, children: signature && (_jsx(SignPreview, { className: classes?.signPreview, src: signature, alt: "" })) }), _jsx(InfoDiv, { className: classes?.infoDiv, children: openInfo && (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: handelOpenInfo, size: "large", "aria-label": t("standalone.uikit.info"), children: _jsx(InfoIcon, { color: "disabled" }) }) })) })] }));
};
export default React.memo(SignPad);
