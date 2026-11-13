import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useEffect, useRef, } from "react";
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
 * Dialog that switches the Components-Care UI language (`ComponentsCareI18n`).
 *
 * @usage `pushDialog(<LocaleSelectorDialog supportedLocales={["de", "en"]} />)`,
 * with `pushDialog` from `useDialogContext()`; it then closes itself. Rendered
 * without `pushDialog`, e.g. `{open && <LocaleSelectorDialog onClose={() =>
 * setOpen(false)} />}`, it is open while it is rendered and closes through
 * `onClose`. Either way it needs the Framework (or a `DialogContextProvider`)
 * around it: it shows errors with `showErrorDialog`.
 *
 * Below the theme's `sm` breakpoint it is full screen, from `sm` up 400px wide;
 * names that don't fit their column wrap.
 *
 * Rows: one per country and each of its official languages that Components-Care
 * ships (`de-AT`, `en-IN`, …), restricted by `supportedLocales`. Rows whose locale
 * (or else whose language) is in the browser's `navigator.languages` come first, in
 * the order of that list, then the rest by number of speakers. A search box filters
 * the rows by their names and locale code, ignoring case.
 *
 * Picking a row calls `ComponentsCareI18n.changeLanguage("<lang>-<COUNTRY>")`
 * (regional: the country also decides date and number formats), disables the rows
 * while the language loads and closes the dialog once it is applied. A language
 * whose texts fail to load is not applied: an error dialog shows, and the previous
 * language stays. Closing the dialog while the language loads does not stop the
 * switch. The i18next language detector stores the choice in
 * `localStorage.i18nextLng`.
 *
 * The dialog reports no result: `onClose` does not say whether or which locale was
 * picked. To react to a change (sync your own i18next instance, save the choice to
 * the user's profile), listen to `ComponentsCareI18n`'s `languageChanged` event,
 * which also fires when the language is detected at start-up, for any other
 * `changeLanguage` call, and when the current locale is picked again. Inside the
 * Framework, `CCI18nProvider` already loads and sets the moment locale and
 * `<html lang>`.
 *
 * @remarks Add something like this to your app entry point to keep your own i18next
 * instance in sync. It works one way: to change the language from code (e.g. to the
 * language of the user's profile after login), call
 * `ComponentsCareI18n.changeLanguage`, and your instance follows. Changing only your
 * own instance leaves the Components-Care widgets, moment and `<html lang>` in the
 * old language.
 * ```ts
 * // Components-Care i18n locale sync
 * ComponentsCareI18n.on("languageChanged", () => {
 *   void i18n.changeLanguage(getCurrentLocale(ComponentsCareI18n));
 * });
 * ```
 */
const LocaleSelectorDialog = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocaleSelectorDialog",
    });
    const { className, classes, onClose, ...contentProps } = props;
    // not useCloseThisDialog, which throws: rendered without pushDialog, the dialog closes
    // through onClose
    const pushedClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    // false once the dialog is gone: a pick that finishes loading after the dialog was
    // closed (Escape while the language loads) neither closes nor reports anything
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    // closes this dialog, and only this one, also when a dialog was pushed after it
    const close = useCallback(() => {
        if (!mounted.current)
            return;
        closeThisDialog?.();
        onCloseRef.current?.();
    }, [closeThisDialog]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), {
        noSsr: true,
    });
    const { t } = useCCTranslations();
    return (_jsxs(StyledDialog, { open: true, fullScreen: fullScreen, onClose: close, className: combineClassNames([className, classes?.root]), children: [_jsx(StyledDialogTitle, { onClose: close, className: classes?.title, children: t("non-standalone.language-switcher.title") }), _jsx(StyledDialogContent, { className: classes?.contentWrapper, children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(StyledLocaleSelectorDialogContent, { ...contentProps, className: classes?.content, close: close }) }) })] }));
};
export default React.memo(LocaleSelectorDialog);
