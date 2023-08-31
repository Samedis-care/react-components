import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Box, Grid, InputAdornment } from "@mui/material";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import supportedLanguages from "../../assets/data/supported-languages.json";
import countryLanguages from "../../assets/data/country-languages.json";
import LanguageSelectorEntry from "./LanguageSelectorEntry";
import { Search as SearchIcon } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations, { useCCLocaleSwitcherTranslations, } from "../../utils/useCCTranslations";
import sortByLocaleRelevance from "../../utils/sortByLocaleRelevance";
import TextFieldWithHelp from "../../standalone/UIKit/TextFieldWithHelp";
import Loader from "../../standalone/Loader";
const useStyles = makeStyles({
    localeList: {
        height: "calc(75vh - 128px)",
        width: 200,
    },
    noLocalesMessage: {
        textAlign: "center",
        width: "100%",
    },
}, { name: "CcLanguageSelectorDialogContent" });
const SearchInputProps = {
    startAdornment: (React.createElement(InputAdornment, { position: "start" },
        React.createElement(SearchIcon, null))),
};
const LanguageSelectorDialogContent = (props) => {
    const { supportedLocales: appSupportedLocales } = props;
    const [filter, setFilter] = useState("");
    const lowercaseFilter = filter.toLowerCase();
    const { i18n, t } = useCCTranslations();
    const { t: tLocale } = useCCLocaleSwitcherTranslations();
    const currentLang = i18n.language.substring(0, 2);
    const classes = useStyles();
    const handleFilterChange = useCallback((evt) => {
        setFilter(evt.target.value);
    }, [setFilter]);
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
    const LocaleEntryRenderer = useCallback((entryProps) => {
        const locale = filteredData[entryProps.index];
        return (React.createElement("div", { style: entryProps.style },
            React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
                React.createElement(LanguageSelectorEntry, { locale: locale, currentLanguage: currentLang, close: props.close, key: locale.locale }))));
    }, [currentLang, filteredData, props.close]);
    return (React.createElement(Grid, { container: true },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Box, { px: 2, pb: 1 },
                React.createElement(TextFieldWithHelp, { value: filter, onChange: handleFilterChange, fullWidth: true, InputProps: SearchInputProps }))),
        React.createElement(Grid, { item: true, xs: 12, className: classes.localeList }, filteredData.length === 0 ? (React.createElement("div", { className: classes.noLocalesMessage }, t("non-standalone.language-switcher.no-locales"))) : (React.createElement(AutoSizer, null, ({ width, height }) => (React.createElement(FixedSizeList, { width: width, height: height, overscanCount: 2, itemCount: filteredData.length, itemSize: 70 }, LocaleEntryRenderer)))))));
};
export default React.memo(LanguageSelectorDialogContent);
