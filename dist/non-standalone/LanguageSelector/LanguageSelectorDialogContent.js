var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var useStyles = makeStyles({
    localeList: {
        height: "calc(75vh - 128px)",
        width: 200,
    },
    noLocalesMessage: {
        textAlign: "center",
        width: "100%",
    },
}, { name: "CcLanguageSelectorDialogContent" });
var SearchInputProps = {
    startAdornment: (React.createElement(InputAdornment, { position: "start" },
        React.createElement(SearchIcon, null))),
};
var LanguageSelectorDialogContent = function (props) {
    var appSupportedLocales = props.supportedLocales;
    var _a = useState(""), filter = _a[0], setFilter = _a[1];
    var lowercaseFilter = filter.toLowerCase();
    var _b = useCCTranslations(), i18n = _b.i18n, t = _b.t;
    var tLocale = useCCLocaleSwitcherTranslations().t;
    var currentLang = i18n.language.substring(0, 2);
    var classes = useStyles();
    var handleFilterChange = useCallback(function (evt) {
        setFilter(evt.target.value);
    }, [setFilter]);
    var supportedLangs = supportedLanguages;
    var countryLanguageMapping = countryLanguages;
    var data = useMemo(function () {
        return Object.entries(countryLanguageMapping)
            .map(function (_a) {
            var country = _a[0], langs = _a[1];
            return [
                country,
                langs.filter(function (lang) { return supportedLangs.includes(lang); }),
            ];
        })
            .map(function (_a) {
            var country = _a[0], langs = _a[1];
            return langs.map(function (lang) { return lang + "-" + country; });
        })
            .flat()
            .filter(function (locale) {
            return !appSupportedLocales ||
                appSupportedLocales.includes(locale) ||
                appSupportedLocales.includes(locale.split("-")[0]);
        })
            .map(function (locale) {
            return ({
                locale: locale,
                language_short: locale.split("-")[0],
                country_short: locale.split("-")[1],
                country: tLocale(locale + ".country"),
                language: tLocale(locale + ".language"),
                native_country: tLocale(locale + ".native_country"),
                native_language: tLocale(locale + ".native_language"),
            });
        })
            .map(function (entry) {
            return (__assign(__assign({}, entry), { locale_lower: entry.locale.toLowerCase(), country_lower: entry.country.toLowerCase(), language_lower: entry.language.toLowerCase(), native_country_lower: entry.native_country.toLowerCase(), native_language_lower: entry.native_language.toLowerCase() }));
        })
            .sort(function (a, b) { return sortByLocaleRelevance(a.locale, b.locale); });
    }, [countryLanguageMapping, appSupportedLocales, supportedLangs, tLocale]);
    var filteredData = useMemo(function () {
        return data.filter(function (entry) {
            return entry.locale_lower.includes(lowercaseFilter) ||
                entry.country_lower.includes(lowercaseFilter) ||
                entry.language_lower.includes(lowercaseFilter) ||
                entry.native_country_lower.includes(lowercaseFilter) ||
                entry.native_language_lower.includes(lowercaseFilter);
        });
    }, [data, lowercaseFilter]);
    var LocaleEntryRenderer = useCallback(function (entryProps) {
        var locale = filteredData[entryProps.index];
        return (React.createElement("div", { style: entryProps.style },
            React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
                React.createElement(LanguageSelectorEntry, { locale: locale, currentLanguage: currentLang, close: props.close, key: locale.locale }))));
    }, [currentLang, filteredData, props.close]);
    return (React.createElement(Grid, { container: true },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Box, { px: 2, pb: 1 },
                React.createElement(TextFieldWithHelp, { value: filter, onChange: handleFilterChange, fullWidth: true, InputProps: SearchInputProps }))),
        React.createElement(Grid, { item: true, xs: 12, className: classes.localeList }, filteredData.length === 0 ? (React.createElement("div", { className: classes.noLocalesMessage }, t("non-standalone.language-switcher.no-locales"))) : (React.createElement(AutoSizer, null, function (_a) {
            var width = _a.width, height = _a.height;
            return (React.createElement(FixedSizeList, { width: width, height: height, overscanCount: 2, itemCount: filteredData.length, itemSize: 70 }, LocaleEntryRenderer));
        })))));
};
export default React.memo(LanguageSelectorDialogContent);
