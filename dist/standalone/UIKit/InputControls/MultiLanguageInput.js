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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useCallback, useState } from "react";
import { Grid, IconButton, InputAdornment, TextField, Tooltip, Typography, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useCCLanguagesTranslations } from "../../../utils/useCCTranslations";
import { Translate } from "@mui/icons-material";
import combineClassNames from "../../../utils/combineClassNames";
import { useMuiWarningStyles } from "../MuiWarning";
var useStyles = makeStyles({
    langSelect: {
        cursor: "pointer",
        pointerEvents: "auto",
    },
    activeLang: {
        fontWeight: "bold",
    },
}, { name: "CcMultiLanguageInput" });
var MultiLanguageInput = function (props) {
    var enabledLanguages = props.enabledLanguages, values = props.values, onChange = props.onChange, name = props.name, onBlur = props.onBlur, label = props.label, disableIncompleteMarker = props.disableIncompleteMarker, required = props.required, ignoreI18nLocale = props.ignoreI18nLocale, warning = props.warning, textFieldProps = __rest(props, ["enabledLanguages", "values", "onChange", "name", "onBlur", "label", "disableIncompleteMarker", "required", "ignoreI18nLocale", "warning"]);
    var _a = useCCLanguagesTranslations(), t = _a.t, i18n = _a.i18n;
    var classes = useStyles();
    var warningClasses = useMuiWarningStyles();
    // determine default language
    var defaultLanguage = i18n.language.split("-")[0];
    var i18nLang = defaultLanguage;
    if (ignoreI18nLocale || !enabledLanguages.includes(defaultLanguage)) {
        defaultLanguage = enabledLanguages[0];
    }
    var _b = useState(false), expanded = _b[0], setExpanded = _b[1]; // if normal text field
    var _c = useState(defaultLanguage), activeLanguage = _c[0], setActiveLanguage = _c[1]; // if multi line text area
    var toggleExpanded = useCallback(function () { return setExpanded(function (prev) { return !prev; }); }, []);
    var incomplete = !textFieldProps.disabled &&
        !disableIncompleteMarker &&
        enabledLanguages.map(function (lng) { var _a; return ((_a = values[lng]) !== null && _a !== void 0 ? _a : "").trim(); }).find(function (e) { return !e; }) !=
            null;
    var handleChange = useCallback(function (evt) {
        var _a;
        var nameSplit = evt.target.name.split("-");
        var lang = nameSplit[nameSplit.length - 1];
        if (!enabledLanguages.includes(lang)) {
            throw new Error("Language not supported");
        }
        onChange(__assign(__assign({}, values), (_a = {}, _a[lang] = evt.target.value, _a)));
    }, [enabledLanguages, onChange, values]);
    var getLanguageName = function (lang) {
        return [
            t(lang, {
                defaultValue: "",
            }),
            lang !== i18nLang && t(lang + "-native", { defaultValue: "" }),
        ]
            .filter(function (e) { return e; })
            .join(" ");
    };
    var handleActiveLangSelect = useCallback(function (evt) {
        setActiveLanguage(evt.currentTarget.getAttribute("data-lang"));
    }, []);
    var renderLanguage = function (lang) {
        var _a, _b;
        return (React.createElement(TextField, __assign({}, textFieldProps, { className: combineClassNames([
                warning && warningClasses.warning,
                textFieldProps.className,
            ]), fullWidth: true, label: textFieldProps.multiline ? (React.createElement("span", null,
                label,
                " -",
                " ",
                __spreadArray([
                    defaultLanguage
                ], enabledLanguages.filter(function (lang) { return lang !== defaultLanguage; }), true).map(function (lang) { return (React.createElement("span", { key: lang },
                    React.createElement(Tooltip, { title: getLanguageName(lang) },
                        React.createElement("span", { className: combineClassNames([
                                classes.langSelect,
                                activeLanguage === lang && classes.activeLang,
                            ]), "data-lang": lang, onClick: handleActiveLangSelect }, lang)),
                    " ")); }))) : lang === defaultLanguage ? (label) : undefined, required: defaultLanguage === lang && activeLanguage === defaultLanguage
                ? required
                : undefined, value: (_a = values[lang]) !== null && _a !== void 0 ? _a : "", onChange: handleChange, name: "".concat(name !== null && name !== void 0 ? name : "mli", "-").concat(lang), InputLabelProps: __assign(__assign({}, textFieldProps.InputLabelProps), { shrink: textFieldProps.multiline
                    ? true
                    : (_b = textFieldProps.InputLabelProps) === null || _b === void 0 ? void 0 : _b.shrink }), InputProps: {
                startAdornment: !textFieldProps.multiline ? (React.createElement(InputAdornment, { position: "start" },
                    React.createElement(Tooltip, { title: getLanguageName(lang) },
                        React.createElement(Typography, { variant: "caption", color: "textSecondary" }, lang)))) : undefined,
                endAdornment: defaultLanguage === lang && !textFieldProps.multiline ? (React.createElement(InputAdornment, { position: "end" },
                    React.createElement(IconButton, { onClick: toggleExpanded, size: "large" },
                        React.createElement(Translate, { color: expanded ? "primary" : incomplete ? "error" : undefined })))) : undefined,
            } })));
    };
    return (React.createElement(Grid, { container: true, spacing: 2, "data-name": name, onBlur: onBlur },
        React.createElement(Grid, { item: true, xs: 12 }, renderLanguage(textFieldProps.multiline ? activeLanguage : defaultLanguage)),
        expanded &&
            !textFieldProps.multiline &&
            enabledLanguages
                .filter(function (lang) { return lang !== defaultLanguage; })
                .map(function (lang) { return (React.createElement(Grid, { item: true, xs: 12, key: lang }, renderLanguage(lang))); })));
};
export default React.memo(MultiLanguageInput);
