import { jsxs as _jsxs, Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useId, useMemo, useState } from "react";
import { Grid, IconButton, InputAdornment, styled, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useThemeProps, } from "@mui/material";
import useCCTranslations, { useCCLanguagesTranslations, } from "../../../utils/useCCTranslations";
import { useCurrentLanguage } from "../../../utils/useCurrentLocale";
import { Translate } from "@mui/icons-material";
import { TextFieldCC } from "../MuiFieldState";
import focusRing from "../../../utils/internal/focusRing";
import visuallyHidden from "../../../utils/internal/visuallyHidden";
import uniqueArray from "../../../utils/uniqueArray";
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
/**
 * The translate button of a single-line field. MUI shows its keyboard focus
 * only as a faint ripple, which forced colors drop, so it draws the library's
 * focus ring (MUI's own when the theme sets `focusVisible`).
 */
const TranslateButton = styled(IconButton)(({ theme }) => ({
    "&.Mui-focusVisible": focusRing(theme, 0),
}));
/**
 * Whether a language's text is more than whitespace
 * @param text The language's entry in `values`
 */
const hasText = (text) => !!text?.trim();
/** The field's language name, read with its label but not shown */
const LabelLanguageName = styled("span")(visuallyHidden);
const LanguageLabelInputAdornment = styled(Typography, {
    name: "CcMultiLanguageInput",
    slot: "languageLabelInputAdornment",
})({});
/**
 * Groups the other languages' fields for the toggle's `aria-controls`.
 * `display: contents` keeps the fields the grid items of the container, so
 * the wrapper takes no space of its own while it is empty and the expanded
 * fields keep the spacing they have.
 */
const OtherLanguages = styled("div")({
    display: "contents",
});
const MultiLanguageInput = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiLanguageInput" });
    const { enabledLanguages, values, onChange, name, onBlur, label, disableIncompleteMarker, required, defaultLanguage: recordLanguage, ignoreI18nLocale, warning, dirty, autoFocus, ...textFieldProps } = props;
    const { t } = useCCLanguagesTranslations();
    const { t: tCC } = useCCTranslations();
    const language = useCurrentLanguage();
    // a language listed twice gets one field (and one button)
    const languages = useMemo(() => uniqueArray(enabledLanguages), [enabledLanguages]);
    // determine default language: the record's, the UI's, the first enabled;
    // null while no language is enabled, which shows a disabled field
    const i18nLang = language;
    const defaultLanguage = recordLanguage && languages.includes(recordLanguage)
        ? recordLanguage
        : !ignoreI18nLocale && languages.includes(i18nLang)
            ? i18nLang
            : (languages[0] ?? null);
    // single-line: whether the other languages' fields are shown, fixed once
    // the user presses the translate button or types; null before that
    const [userExpanded, setUserExpanded] = useState(null);
    // until then they are shown while only other languages have text, so a
    // text kept in another language is not hidden behind the toggle
    const onlyOthersFilled = !hasText(defaultLanguage && values[defaultLanguage]) &&
        languages.some((lng) => lng !== defaultLanguage && hasText(values[lng]));
    const expanded = userExpanded ?? onlyOthersFilled;
    // the language code clicked in the multiline label, null until one is
    const [pickedLanguage, setPickedLanguage] = useState(null);
    // the language the multiline textarea edits: the picked one while it is
    // enabled, otherwise (and in single-line mode) the default language
    const activeLanguage = textFieldProps.multiline &&
        pickedLanguage &&
        languages.includes(pickedLanguage)
        ? pickedLanguage
        : defaultLanguage;
    const toggleExpanded = useCallback(() => setUserExpanded((prev) => !(prev ?? onlyOthersFilled)), [onlyOthersFilled]);
    // names the fields the toggle shows, for its aria-controls; unique per
    // instance, so two fields on a form don't claim the same id
    const otherLanguagesId = useId();
    // the toggle says which field it belongs to: a form with a localized title
    // and description has two buttons that would otherwise read the same
    const toggleLabel = label
        ? tCC("standalone.uikit.multi-language-input.show-translations-of", {
            label,
        })
        : tCC("standalone.uikit.multi-language-input.toggle-languages");
    const incomplete = !textFieldProps.disabled &&
        !disableIncompleteMarker &&
        languages.map((lng) => (values[lng] ?? "").trim()).find((e) => !e) != null;
    const handleChange = useCallback((evt) => {
        const nameSplit = evt.target.name.split("-");
        const lang = nameSplit[nameSplit.length - 1];
        if (!languages.includes(lang)) {
            throw new Error("Language not supported");
        }
        const newValue = {
            ...values,
            [lang]: evt.target.value,
        };
        if (!evt.target.value)
            delete newValue[lang];
        // the fields stay as they are while the user types: emptying the
        // default language does not show the others, filling it does not
        // hide them
        setUserExpanded((prev) => prev ?? onlyOthersFilled);
        onChange(newValue);
    }, [languages, onChange, values, onlyOthersFilled]);
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
    const getFieldLanguageName = (lang) => (lang ? t(lang, { defaultValue: lang }) : "");
    // the default language's field and the textarea show the label; the other
    // languages' fields show only their code, so their name is an aria-label
    const showsLabel = (lang) => !!label && (!!textFieldProps.multiline || lang === defaultLanguage);
    // lang null: no language is enabled, so the field is shown disabled, with
    // nothing to name it after, save to or switch to
    const renderLanguage = (lang, focus) => (_jsx(TextFieldCC, { ...textFieldProps, disabled: lang ? textFieldProps.disabled : true, warning: warning, dirty: dirty, autoFocus: focus, fullWidth: true, label: showsLabel(lang) ? (_jsxs(_Fragment, { children: [label, lang && (_jsxs(LabelLanguageName, { children: [" ", "(", getFieldLanguageName(lang), ")"] }))] })) : undefined, required: defaultLanguage === lang && activeLanguage === defaultLanguage
            ? required
            : undefined, value: (lang && values[lang]) ?? "", onChange: lang ? handleChange : undefined, name: lang ? `${name ?? "mli"}-${lang}` : undefined, slotProps: {
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
                startAdornment: lang && !textFieldProps.multiline ? (_jsx(InputAdornment, { position: "start", children: _jsx(Tooltip, { title: getLanguageName(lang), children: _jsx(LanguageLabelInputAdornment, { variant: "caption", color: "textSecondary", children: lang }) }) })) : undefined,
                endAdornment: lang && lang === defaultLanguage && !textFieldProps.multiline ? (_jsx(InputAdornment, { position: "end", children: _jsx(Tooltip, { title: toggleLabel, children: _jsx(TranslateButton, { onClick: toggleExpanded, size: "large", "aria-label": toggleLabel, "aria-expanded": expanded, "aria-controls": otherLanguagesId, children: _jsx(Translate, { color: expanded ? "primary" : incomplete ? "error" : undefined }) }) }) })) : undefined,
            },
        } }));
    return (_jsxs(Grid, { container: true, spacing: 2, "data-name": name, onBlur: onBlur, role: "group", "aria-label": label || undefined, children: [_jsxs(Grid, { size: 12, children: [renderLanguage(textFieldProps.multiline ? activeLanguage : defaultLanguage, !!autoFocus), textFieldProps.multiline && defaultLanguage && (_jsx(LanguageSwitcher, { exclusive: true, size: "small", value: activeLanguage, onChange: handleLanguageSwitch, "aria-label": label
                            ? tCC("standalone.uikit.multi-language-input.language-of", {
                                label,
                            })
                            : tCC("standalone.uikit.multi-language-input.language"), children: [
                            defaultLanguage,
                            ...languages.filter((lang) => lang !== defaultLanguage),
                        ].map((lang) => (_jsx(Tooltip, { title: getLanguageName(lang), children: _jsx(LanguageLabel, { value: lang, "data-lang": lang, ownerState: { active: activeLanguage === lang }, children: lang }) }, lang))) }))] }), !textFieldProps.multiline && (_jsx(OtherLanguages, { id: otherLanguagesId, children: expanded &&
                    languages
                        .filter((lang) => lang !== defaultLanguage)
                        .map((lang) => (_jsx(Grid, { size: 12, children: renderLanguage(lang, false) }, lang))) }))] }));
};
export default React.memo(MultiLanguageInput);
