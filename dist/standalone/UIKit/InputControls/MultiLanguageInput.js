import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Grid, IconButton, InputAdornment, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import useCCTranslations, { useCCLanguagesTranslations, } from "../../../utils/useCCTranslations";
import { useCurrentLanguage } from "../../../utils/useCurrentLocale";
import { Translate } from "@mui/icons-material";
import { TextFieldCC } from "../MuiWarning";
const LanguageLabel = styled("span", {
    name: "CcMultiLanguageInput",
    slot: "languageLabel",
})(({ ownerState }) => ({
    cursor: "pointer",
    pointerEvents: "auto",
    ...(ownerState.active && {
        fontWeight: "bold",
    }),
}));
const LanguageLabelInputAdornment = styled(Typography, {
    name: "CcMultiLanguageInput",
    slot: "languageLabelInputAdornment",
})({});
const MultiLanguageInput = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiLanguageInput" });
    const { enabledLanguages, values, onChange, name, onBlur, label, disableIncompleteMarker, required, ignoreI18nLocale, warning, ...textFieldProps } = props;
    const { t } = useCCLanguagesTranslations();
    const { t: tCC } = useCCTranslations();
    const language = useCurrentLanguage();
    // determine default language
    let defaultLanguage = language;
    const i18nLang = defaultLanguage;
    if (ignoreI18nLocale || !enabledLanguages.includes(defaultLanguage)) {
        defaultLanguage = enabledLanguages[0];
    }
    const [expanded, setExpanded] = useState(false); // if normal text field
    const [activeLanguage, setActiveLanguage] = useState(defaultLanguage); // if multi line text area
    const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);
    const incomplete = !textFieldProps.disabled &&
        !disableIncompleteMarker &&
        enabledLanguages.map((lng) => (values[lng] ?? "").trim()).find((e) => !e) !=
            null;
    const handleChange = useCallback((evt) => {
        const nameSplit = evt.target.name.split("-");
        const lang = nameSplit[nameSplit.length - 1];
        if (!enabledLanguages.includes(lang)) {
            throw new Error("Language not supported");
        }
        const newValue = {
            ...values,
            [lang]: evt.target.value,
        };
        if (!evt.target.value)
            delete newValue[lang];
        onChange(newValue);
    }, [enabledLanguages, onChange, values]);
    const getLanguageName = (lang) => [
        t(lang, {
            defaultValue: "",
        }),
        lang !== i18nLang && t(lang + "-native", { defaultValue: "" }),
    ]
        .filter((e) => e)
        .join(" ");
    const handleActiveLangSelect = useCallback((evt) => {
        setActiveLanguage(evt.currentTarget.getAttribute("data-lang"));
    }, []);
    const renderLanguage = (lang) => (_jsx(TextFieldCC, { ...textFieldProps, warning: warning, fullWidth: true, label: textFieldProps.multiline ? (_jsxs("span", { children: [label, " -", " ", [
                    defaultLanguage,
                    ...enabledLanguages.filter((lang) => lang !== defaultLanguage),
                ].map((lang) => (_jsxs("span", { children: [_jsx(Tooltip, { title: getLanguageName(lang), children: _jsx(LanguageLabel, { ownerState: { active: activeLanguage === lang }, "data-lang": lang, onClick: handleActiveLangSelect, children: lang }) }), " "] }, lang)))] })) : lang === defaultLanguage ? (label) : undefined, required: defaultLanguage === lang && activeLanguage === defaultLanguage
            ? required
            : undefined, value: values[lang], onChange: handleChange, name: `${name ?? "mli"}-${lang}`, slotProps: {
            inputLabel: {
                ...textFieldProps.slotProps?.inputLabel,
                shrink: textFieldProps.multiline
                    ? true
                    : textFieldProps.slotProps?.inputLabel
                        ?.shrink,
            },
            input: {
                startAdornment: !textFieldProps.multiline ? (_jsx(InputAdornment, { position: "start", children: _jsx(Tooltip, { title: getLanguageName(lang), children: _jsx(LanguageLabelInputAdornment, { variant: "caption", color: "textSecondary", children: lang }) }) })) : undefined,
                endAdornment: defaultLanguage === lang && !textFieldProps.multiline ? (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: toggleExpanded, size: "large", "aria-label": tCC("standalone.uikit.multi-language-input.toggle-languages"), children: _jsx(Translate, { color: expanded ? "primary" : incomplete ? "error" : undefined }) }) })) : undefined,
            },
        } }));
    return (_jsxs(Grid, { container: true, spacing: 2, "data-name": name, onBlur: onBlur, children: [_jsx(Grid, { size: 12, children: renderLanguage(textFieldProps.multiline ? activeLanguage : defaultLanguage) }), expanded &&
                !textFieldProps.multiline &&
                enabledLanguages
                    .filter((lang) => lang !== defaultLanguage)
                    .map((lang) => (_jsx(Grid, { size: 12, children: renderLanguage(lang) }, lang)))] }));
};
export default React.memo(MultiLanguageInput);
