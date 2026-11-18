import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, } from "react";
import { Dialog, DialogContent, styled, useMediaQuery, useTheme, useThemeProps, } from "@mui/material";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { DialogTitle, showErrorDialog } from "../Dialog";
import Loader from "../../standalone/Loader";
import ccI18n from "../../i18n";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
import useRefState from "../../utils/useRefState";
const LocaleSelectorDialogContent = React.lazy(() => import("./LocaleSelectorDialogContent"));
const StyledDialog = styled(Dialog, {
    name: "CcLocaleSelectorDialog",
    slot: "root",
})({});
// the visible box: MUI's Dialog paper renders as this element (Paper's `component`), so it
// keeps MUI's paper styles and gets these, the theme's `paper` overrides and `classes.paper`.
// MUI's styles come after these: below sm, its full-screen paper keeps the screen's width,
// also when a theme sets another width here
const PaperSlot = styled("div", {
    name: "CcLocaleSelectorDialog",
    slot: "paper",
})({
    width: 400,
});
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
 * Whether every namespace loaded so far has its texts for the locale or its
 * language, i.e. the UI can show the locale without falling back to English
 */
const hasTexts = (locale) => {
    const codes = [locale, locale.split("-")[0]];
    return []
        .concat(ccI18n.options.ns ?? [])
        .every((ns) => codes.some((code) => ccI18n.hasResourceBundle(code, ns)));
};
/**
 * Dialog that switches the Components-Care UI language (`ComponentsCareI18n`).
 *
 * @usage `showLocaleSelectorDialog(pushDialog, { supportedLocales: ["de", "en"] })`,
 * with `pushDialog` from `useDialogContext()`, resolves to the picked locale, or
 * `null` when the dialog is dismissed. `pushDialog(<LocaleSelectorDialog
 * supportedLocales={["de", "en"]} />)` shows it too; it then closes itself.
 * Rendered without `pushDialog`, e.g. `{open && <LocaleSelectorDialog onClose={() =>
 * setOpen(false)} />}`, it is open while it is rendered and closes through
 * `onClose`. Either way it needs the Framework (or a `DialogContextProvider`) around
 * it: it shows errors with `showErrorDialog`.
 *
 * Below the theme's `sm` breakpoint it is full screen, from `sm` up 400px wide (the
 * `paper` slot); names that don't fit their column wrap.
 *
 * Rows: one per country and each of its official languages that Components-Care
 * ships (`de-AT`, `en-IN`, …), restricted by `supportedLocales`. Rows whose locale
 * (or else whose language) is in the browser's `navigator.languages` come first, in
 * the order of that list, then the rest by number of speakers. A search box filters
 * the rows by their names and locale code, ignoring case.
 *
 * Picking a row calls `ComponentsCareI18n.changeLanguage("<lang>-<COUNTRY>")`
 * (regional: the country also decides date and number formats). While the language
 * loads, the rows are disabled, and the close button, Escape and a backdrop click
 * are ignored. Once it is applied, the dialog calls `onChange` with the locale and
 * closes. A language whose texts fail to load is not applied: an error dialog shows,
 * the previous language stays, and the dialog stays open. The i18next language
 * detector stores the choice in `localStorage.i18nextLng`.
 *
 * `onChange` (and the promise of `showLocaleSelectorDialog`) reports a pick in this
 * dialog, e.g. to save it to the user's profile. `ComponentsCareI18n`'s
 * `languageChanged` event reports every language change, also the detection at
 * start-up and any other `changeLanguage` call: keep your own i18next instance in
 * sync with that. Inside the Framework, `CCI18nProvider` already loads and sets the
 * moment locale and `<html lang>`.
 *
 * @remarks `ComponentsCareI18n` leads the UI language, and your app's own i18next
 * instance follows it. To change the language from code (e.g. to the language of
 * the user's profile after login), call `ComponentsCareI18n.changeLanguage`, never
 * only your own instance's `changeLanguage`: that leaves the Components-Care widgets,
 * moment and `<html lang>` in the old language. Add something like this to your app
 * entry point, so your instance follows:
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
    const { className, classes, onChange, onClose, ...contentProps } = props;
    // not useCloseThisDialog, which throws: rendered without pushDialog, the dialog closes
    // through onClose
    const pushedClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
    const [pushDialog] = useDialogContext();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // false once the dialog is gone: a pick that finishes loading after the dialog was
    // removed neither closes nor reports anything
    const mounted = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    // a picked language loads. The ref part guards against a dismissal or a second pick
    // landing before the re-render that disables the rows
    const { get: getSwitching, set: setSwitching, state: switching, } = useRefState(false);
    // closes this dialog, and only this one, also when a dialog was pushed after it
    const close = useCallback(() => {
        if (!mounted.current)
            return;
        closeThisDialog?.();
        onCloseRef.current?.();
    }, [closeThisDialog]);
    // the close button, Escape and a backdrop click: ignored while a picked language loads,
    // so the dialog closes once the language is applied, or stays for the error
    const dismiss = useCallback(() => {
        if (getSwitching())
            return;
        close();
    }, [close, getSwitching]);
    const handleSwitch = useCallback(async (locale) => {
        if (getSwitching())
            return;
        // the instance itself: the hook's i18n is a snapshot of the render
        const previousLang = ccI18n.language;
        setSwitching(true);
        try {
            await ccI18n.changeLanguage(locale);
            // i18next applies a language whose texts failed to load (offline, or
            // chunks gone after a deploy) and never retries the load: switch back
            if (ccI18n.language === locale && !hasTexts(locale)) {
                if (previousLang)
                    await ccI18n.changeLanguage(previousLang);
                throw new Error(ccI18n.t("non-standalone.language-switcher.load-error"));
            }
            if (!mounted.current)
                return;
            onChangeRef.current?.(locale);
            close();
        }
        catch (e) {
            await showErrorDialog(pushDialog, e);
        }
        finally {
            if (mounted.current)
                setSwitching(false);
        }
    }, [close, getSwitching, pushDialog, setSwitching]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), {
        noSsr: true,
    });
    const paperClassName = classes?.paper;
    const slotProps = useMemo(() => ({ paper: { component: PaperSlot, className: paperClassName } }), [paperClassName]);
    const { t } = useCCTranslations();
    return (_jsxs(StyledDialog, { open: true, fullScreen: fullScreen, onClose: dismiss, className: combineClassNames([className, classes?.root]), slotProps: slotProps, children: [_jsx(StyledDialogTitle, { onClose: dismiss, className: classes?.title, children: t("non-standalone.language-switcher.title") }), _jsx(StyledDialogContent, { className: classes?.contentWrapper, children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(StyledLocaleSelectorDialogContent, { ...contentProps, className: classes?.content, switching: switching, handleSwitch: handleSwitch }) }) })] }));
};
export default React.memo(LocaleSelectorDialog);
