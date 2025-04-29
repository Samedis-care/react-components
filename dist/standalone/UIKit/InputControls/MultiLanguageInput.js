import React, { useCallback, useState } from "react";
import { Grid, IconButton, InputAdornment, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { useCCLanguagesTranslations } from "../../../utils/useCCTranslations";
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
    const { t, i18n } = useCCLanguagesTranslations();
    // determine default language
    let defaultLanguage = i18n.language.split("-")[0];
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
        onChange({
            ...values,
            [lang]: evt.target.value,
        });
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
    const renderLanguage = (lang) => (React.createElement(TextFieldCC, { ...textFieldProps, warning: warning, fullWidth: true, label: textFieldProps.multiline ? (React.createElement("span", null,
            label,
            " -",
            " ",
            [
                defaultLanguage,
                ...enabledLanguages.filter((lang) => lang !== defaultLanguage),
            ].map((lang) => (React.createElement("span", { key: lang },
                React.createElement(Tooltip, { title: getLanguageName(lang) },
                    React.createElement(LanguageLabel, { ownerState: { active: activeLanguage === lang }, "data-lang": lang, onClick: handleActiveLangSelect }, lang)),
                " "))))) : lang === defaultLanguage ? (label) : undefined, required: defaultLanguage === lang && activeLanguage === defaultLanguage
            ? required
            : undefined, value: values[lang] ?? "", onChange: handleChange, name: `${name ?? "mli"}-${lang}`, slotProps: {
            inputLabel: {
                ...textFieldProps.slotProps?.inputLabel,
                shrink: textFieldProps.multiline
                    ? true
                    : textFieldProps.InputLabelProps?.shrink,
            },
            input: {
                startAdornment: !textFieldProps.multiline ? (React.createElement(InputAdornment, { position: "start" },
                    React.createElement(Tooltip, { title: getLanguageName(lang) },
                        React.createElement(LanguageLabelInputAdornment, { variant: "caption", color: "textSecondary" }, lang)))) : undefined,
                endAdornment: defaultLanguage === lang && !textFieldProps.multiline ? (React.createElement(InputAdornment, { position: "end" },
                    React.createElement(IconButton, { onClick: toggleExpanded, size: "large" },
                        React.createElement(Translate, { color: expanded ? "primary" : incomplete ? "error" : undefined })))) : undefined,
            },
        } }));
    return (React.createElement(Grid, { container: true, spacing: 2, "data-name": name, onBlur: onBlur },
        React.createElement(Grid, { size: 12 }, renderLanguage(textFieldProps.multiline ? activeLanguage : defaultLanguage)),
        expanded &&
            !textFieldProps.multiline &&
            enabledLanguages
                .filter((lang) => lang !== defaultLanguage)
                .map((lang) => (React.createElement(Grid, { key: lang, size: 12 }, renderLanguage(lang))))));
};
export default React.memo(MultiLanguageInput);
