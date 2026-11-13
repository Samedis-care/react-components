import { jsxs as _jsxs, Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Grid, IconButton, InputAdornment, styled, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useThemeProps, } from "@mui/material";
import useCCTranslations, { useCCLanguagesTranslations, } from "../../../utils/useCCTranslations";
import { useCurrentLanguage } from "../../../utils/useCurrentLocale";
import { Translate } from "@mui/icons-material";
import { TextFieldCC } from "../MuiFieldState";
import focusRing from "../../../utils/internal/focusRing";
/** The language buttons below a multiline field */
const LanguageSwitcher = styled(ToggleButtonGroup, {
    name: "CcMultiLanguageInput",
    slot: "languageSwitcher",
})(({ theme }) => ({
    flexWrap: "wrap",
    marginTop: theme.spacing(0.5),
}));
/** One language button of the multiline switcher, showing the language code */
const LanguageLabel = styled(ToggleButton, {
    name: "CcMultiLanguageInput",
    slot: "languageLabel",
})(({ theme }) => ({
    // compact (about 29px high), the codes in the case they are written in
    padding: theme.spacing(0.25, 1),
    minWidth: 32,
    textTransform: "none",
    // inside the button: its neighbours overlap its border
    "&.Mui-focusVisible": focusRing(theme, -2),
}));
/** The field's language name, read with its label but not shown */
const LabelLanguageName = styled("span")({
    // visually hidden, as MUI's visuallyHidden
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
});
const LanguageLabelInputAdornment = styled(Typography, {
    name: "CcMultiLanguageInput",
    slot: "languageLabelInputAdornment",
})({});
const MultiLanguageInput = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiLanguageInput" });
    const { enabledLanguages, values, onChange, name, onBlur, label, disableIncompleteMarker, required, ignoreI18nLocale, warning, dirty, autoFocus, ...textFieldProps } = props;
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
    // the language code clicked in the multiline label, null until one is
    const [pickedLanguage, setPickedLanguage] = useState(null);
    // the language the multiline textarea edits: the picked one while it is
    // enabled, otherwise (and in single-line mode) the default language
    const activeLanguage = textFieldProps.multiline &&
        pickedLanguage &&
        enabledLanguages.includes(pickedLanguage)
        ? pickedLanguage
        : defaultLanguage;
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
    const handleLanguageSwitch = useCallback((_evt, lang) => {
        // null: the pressed button was pressed again, which keeps its language
        if (lang)
            setPickedLanguage(lang);
    }, []);
    // a field's language in the UI language, e.g. "German"
    const getFieldLanguageName = (lang) => lang ? t(lang, { defaultValue: lang }) : "";
    // the default language's field and the textarea show the label; the other
    // languages' fields show only their code, so their name is an aria-label
    const showsLabel = (lang) => !!label && (!!textFieldProps.multiline || lang === defaultLanguage);
    const renderLanguage = (lang, focus) => (_jsx(TextFieldCC, { ...textFieldProps, warning: warning, dirty: dirty, autoFocus: focus, fullWidth: true, label: showsLabel(lang) ? (_jsxs(_Fragment, { children: [label, lang && (_jsxs(LabelLanguageName, { children: [" ", "(", getFieldLanguageName(lang), ")"] }))] })) : undefined, required: defaultLanguage === lang && activeLanguage === defaultLanguage
            ? required
            : undefined, value: values[lang] ?? "", onChange: handleChange, name: `${name ?? "mli"}-${lang}`, slotProps: {
            inputLabel: {
                ...textFieldProps.slotProps?.inputLabel,
                shrink: textFieldProps.multiline
                    ? true
                    : textFieldProps.slotProps?.inputLabel
                        ?.shrink,
            },
            htmlInput: showsLabel(lang)
                ? undefined
                : {
                    "aria-label": label
                        ? `${label} (${getFieldLanguageName(lang)})`
                        : getFieldLanguageName(lang) || undefined,
                },
            input: {
                startAdornment: !textFieldProps.multiline ? (_jsx(InputAdornment, { position: "start", children: _jsx(Tooltip, { title: getLanguageName(lang), children: _jsx(LanguageLabelInputAdornment, { variant: "caption", color: "textSecondary", children: lang }) }) })) : undefined,
                endAdornment: defaultLanguage === lang && !textFieldProps.multiline ? (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: toggleExpanded, size: "large", "aria-label": tCC("standalone.uikit.multi-language-input.toggle-languages"), children: _jsx(Translate, { color: expanded ? "primary" : incomplete ? "error" : undefined }) }) })) : undefined,
            },
        } }));
    return (_jsxs(Grid, { container: true, spacing: 2, "data-name": name, onBlur: onBlur, role: "group", "aria-label": label || undefined, children: [_jsxs(Grid, { size: 12, children: [renderLanguage(textFieldProps.multiline ? activeLanguage : defaultLanguage, !!autoFocus), textFieldProps.multiline && (_jsx(LanguageSwitcher, { exclusive: true, size: "small", value: activeLanguage, onChange: handleLanguageSwitch, "aria-label": label
                            ? tCC("standalone.uikit.multi-language-input.language-of", {
                                label,
                            })
                            : tCC("standalone.uikit.multi-language-input.language"), children: [
                            defaultLanguage,
                            ...enabledLanguages.filter((lang) => lang !== defaultLanguage),
                        ].map((lang) => (_jsx(Tooltip, { title: getLanguageName(lang), children: _jsx(LanguageLabel, { value: lang, "data-lang": lang, ownerState: { active: activeLanguage === lang }, children: lang }) }, lang))) }))] }), expanded &&
                !textFieldProps.multiline &&
                enabledLanguages
                    .filter((lang) => lang !== defaultLanguage)
                    .map((lang) => (_jsx(Grid, { size: 12, children: renderLanguage(lang, false) }, lang)))] }));
};
export default React.memo(MultiLanguageInput);
