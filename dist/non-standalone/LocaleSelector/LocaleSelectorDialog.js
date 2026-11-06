import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext } from "react";
import { Dialog, DialogContent, styled, useMediaQuery, useTheme, useThemeProps, } from "@mui/material";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import { DialogTitle } from "../Dialog";
import Loader from "../../standalone/Loader";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
const LocaleSelectorDialogContent = React.lazy(() => import("./LocaleSelectorDialogContent"));
const StyledDialog = styled(Dialog, {
    name: "CcLocaleSelectorDialog",
    slot: "root",
})(({ theme }) => ({
    // below sm the dialog is full screen
    [theme.breakpoints.up("sm")]: {
        "& .MuiPaper-root": {
            width: 400,
        },
    },
}));
const StyledDialogTitle = styled(DialogTitle, {
    name: "CcLocaleSelectorDialog",
    slot: "title",
})({});
const StyledDialogContent = styled(DialogContent, {
    name: "CcLocaleSelectorDialog",
    slot: "contentWrapper",
})({
    paddingLeft: 0,
    paddingRight: 0,
});
const StyledLocaleSelectorDialogContent = styled(LocaleSelectorDialogContent, {
    name: "CcLocaleSelectorDialog",
    slot: "content",
})(({ theme }) => ({
    // full screen: the list fills the height below the search box
    [theme.breakpoints.down("sm")]: {
        height: "100%",
        flexDirection: "column",
        flexWrap: "nowrap",
    },
}));
/**
 * Locale selector dialog. Below the theme's `sm` breakpoint it is full screen,
 * from `sm` up 400px wide; names that don't fit their column wrap.
 * @usage `pushDialog(<LocaleSelectorDialog \>)`
 * @remarks You should add the following code snipped into your app entry point to enable locale synchronization.
 * ```ts
 * // Components-Care i18n locale sync
 * ComponentsCareI18n.on("languageChanged", (language) => {
 *   moment.locale(language);
 *   i18n.changeLanguage(language);
 * });
 * ```
 */
const LocaleSelectorDialog = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocaleSelectorDialog",
    });
    const { className, classes, ...contentProps } = props;
    // not useCloseThisDialog, which throws: rendered without pushDialog, there is no dialog
    // to close (LocaleSelectorDialog has no onClose)
    const pushedClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
    // closes this dialog, and only this one, also when it was closed already (Escape while
    // the picked language loads) or a dialog was pushed after it
    const close = useCallback(() => closeThisDialog?.(), [closeThisDialog]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), {
        noSsr: true,
    });
    const { t } = useCCTranslations();
    return (_jsxs(StyledDialog, { open: true, fullScreen: fullScreen, onClose: close, className: combineClassNames([className, classes?.root]), children: [_jsx(StyledDialogTitle, { onClose: close, className: classes?.title, children: t("non-standalone.language-switcher.title") }), _jsx(StyledDialogContent, { className: classes?.contentWrapper, children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(StyledLocaleSelectorDialogContent, { ...contentProps, className: classes?.content, close: close }) }) })] }));
};
export default React.memo(LocaleSelectorDialog);
