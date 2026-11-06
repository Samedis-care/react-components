import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Box, Grid, InputAdornment, styled, useThemeProps, } from "@mui/material";
import { List, useDynamicRowHeight } from "react-window";
import ccI18n from "../../i18n";
import supportedLanguages from "../../assets/data/supported-languages.json";
import countryLanguages from "../../assets/data/country-languages.json";
import LocaleSelectorEntry from "./LocaleSelectorEntry";
import { Search as SearchIcon } from "@mui/icons-material";
import useCCTranslations, { useCCLocaleSwitcherTranslations, } from "../../utils/useCCTranslations";
import { useCurrentLanguage } from "../../utils/useCurrentLocale";
import sortByLocaleRelevance from "../../utils/sortByLocaleRelevance";
import TextFieldWithHelp from "../../standalone/UIKit/TextFieldWithHelp";
import Loader from "../../standalone/Loader";
import { useDialogContext } from "../../framework";
import { showErrorDialog } from "../Dialog";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
const LocaleList = styled(Grid, {
    name: "CcLocaleSelectorDialogContent",
    slot: "localeList",
})(({ theme }) => ({
    height: "calc(75vh - 128px)",
    width: "100%",
    // the dialog is full screen below sm: fill it
    [theme.breakpoints.down("sm")]: {
        height: "auto",
        flex: "1 1 auto",
        minHeight: 70,
    },
}));
const NoLocalesMessage = styled("div", {
    name: "CcLocaleSelectorDialogContent",
    slot: "noLocalesMessage",
})({
    textAlign: "center",
    width: "100%",
});
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
const SearchInputProps = {
    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
};
const LocaleSelectorDialogContent = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocaleSelectorDialogContent",
    });
    const { supportedLocales: appSupportedLocales, className, close } = props;
    const [filter, setFilter] = useState("");
    const lowercaseFilter = filter.toLowerCase();
    const { t } = useCCTranslations();
    const { t: tLocale } = useCCLocaleSwitcherTranslations();
    const currentLang = useCurrentLanguage();
    const handleFilterChange = useCallback((evt) => {
        setFilter(evt.target.value);
    }, [setFilter]);
    const [switchingLanguage, setSwitchingLanguage] = useState(false);
    const [pushDialog] = useDialogContext();
    const supportedLangs = supportedLanguages;
    const countryLanguageMapping = countryLanguages;
    const data = useMemo(() => Object.entries(countryLanguageMapping)
        .map(([country, langs]) => [
        country,
        langs.filter((lang) => supportedLangs.includes(lang)),
    ])
        .map(([country, langs]) => langs.map((lang) => lang + "-" + country))
        .flat()
        .filter((locale) => !appSupportedLocales ||
        appSupportedLocales.includes(locale) ||
        appSupportedLocales.includes(locale.split("-")[0]))
        .map((locale) => ({
        locale: locale,
        language_short: locale.split("-")[0],
        country_short: locale.split("-")[1],
        country: tLocale(locale + ".country"),
        language: tLocale(locale + ".language"),
        native_country: tLocale(locale + ".native_country"),
        native_language: tLocale(locale + ".native_language"),
    }))
        .map((entry) => ({
        ...entry,
        locale_lower: entry.locale.toLowerCase(),
        country_lower: entry.country.toLowerCase(),
        language_lower: entry.language.toLowerCase(),
        native_country_lower: entry.native_country.toLowerCase(),
        native_language_lower: entry.native_language.toLowerCase(),
    }))
        .sort((a, b) => sortByLocaleRelevance(a.locale, b.locale)), [countryLanguageMapping, appSupportedLocales, supportedLangs, tLocale]);
    const filteredData = useMemo(() => data.filter((entry) => entry.locale_lower.includes(lowercaseFilter) ||
        entry.country_lower.includes(lowercaseFilter) ||
        entry.language_lower.includes(lowercaseFilter) ||
        entry.native_country_lower.includes(lowercaseFilter) ||
        entry.native_language_lower.includes(lowercaseFilter)), [data, lowercaseFilter]);
    const handleSwitch = useCallback(async (lang) => {
        // the instance itself: the hook's i18n is a snapshot of the render
        const previousLang = ccI18n.language;
        setSwitchingLanguage(true);
        try {
            await ccI18n.changeLanguage(lang);
            // i18next applies a language whose texts failed to load (offline, or
            // chunks gone after a deploy) and never retries the load: switch back
            if (ccI18n.language === lang && !hasTexts(lang)) {
                if (previousLang)
                    await ccI18n.changeLanguage(previousLang);
                throw new Error(ccI18n.t("non-standalone.language-switcher.load-error"));
            }
            close();
        }
        catch (e) {
            await showErrorDialog(pushDialog, e);
        }
        finally {
            setSwitchingLanguage(false);
        }
    }, [close, pushDialog]);
    const LocaleEntryRenderer = useCallback((entryProps) => {
        const locale = entryProps.filteredData[entryProps.index];
        return (_jsx("div", { style: entryProps.style, ...entryProps.ariaAttributes, children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: _jsx(LocaleSelectorEntry, { locale: locale, currentLanguage: currentLang, handleSwitch: handleSwitch, disabled: switchingLanguage }, locale.locale) }) }));
    }, [currentLang, handleSwitch, switchingLanguage]);
    // names wrap, so each row is as tall as its text: react-window measures the
    // rendered rows (70px until then). It caches the heights by index, so the
    // cache starts over when other rows or other names fill the list
    const rowHeightKey = useMemo(() => currentLang + ":" + filteredData.map((e) => e.locale).join(","), [currentLang, filteredData]);
    const rowHeight = useDynamicRowHeight({
        defaultRowHeight: 70,
        key: rowHeightKey,
    });
    return (_jsxs(Grid, { container: true, className: className, children: [_jsx(Grid, { size: 12, children: _jsx(Box, { sx: { px: 2, pb: 1 }, children: _jsx(TextFieldWithHelp, { value: filter, onChange: handleFilterChange, fullWidth: true, slotProps: { input: SearchInputProps } }) }) }), _jsxs(LocaleList, { size: 12, children: [_jsx(FormLoaderOverlay, { visible: switchingLanguage }), filteredData.length === 0 ? (_jsx(NoLocalesMessage, { children: t("non-standalone.language-switcher.no-locales") })) : (_jsx(List, { overscanCount: 2, rowCount: filteredData.length, rowHeight: rowHeight, rowComponent: LocaleEntryRenderer, rowProps: { filteredData } }))] })] }));
};
export default React.memo(LocaleSelectorDialogContent);
