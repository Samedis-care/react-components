import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import GroupBox from "../GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
/**
 * What MUI keeps off a root slot, plus HowToBox's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "titleLabel",
    "labels",
    "ownerState",
    "theme",
    "sx",
    "as",
    "classes",
]);
const GroupBoxStyled = styled(GroupBox, {
    name: "CcHowToBox",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})({});
const UnorderedList = styled("ul", { name: "CcHowToBox", slot: "ul" })({
    paddingLeft: "1.5rem",
});
const ListItem = styled("li", { name: "CcHowToBox", slot: "li" })({
    whiteSpace: "pre-line",
});
/** whether React renders the entry as nothing */
const isEmptyEntry = (entry) => entry == null || typeof entry === "boolean" || entry === "";
const HowToBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcHowToBox" });
    const { titleLabel, labels, className, classes } = props;
    const { t } = useCCTranslations();
    const entries = (Array.isArray(labels) ? labels : [labels]).filter((entry) => !isEmptyEntry(entry));
    if (entries.length === 0)
        return _jsx(_Fragment, {});
    return (_jsx(GroupBoxStyled, { titleLabel: titleLabel, labels: labels, label: titleLabel ?? t("standalone.how-it-works.title"), className: combineClassNames([className, classes?.root]), children: _jsx(UnorderedList, { className: classes?.ul, children: entries.map((entry, i) => (_jsx(ListItem, { className: classes?.li, children: entry }, i))) }) }));
};
/** whether a value from the translation resources can be shown as an entry */
const isTranslatedEntry = (value) => typeof value === "string" || typeof value === "number";
/**
 * The entries in what `t(key, { returnObjects: true })` returned: the strings
 * and numbers of an array, or of an object's values, in order; a string or
 * number is one entry. Nested groups and anything else are skipped, as React
 * cannot render a plain object.
 */
const translatedEntries = (value) => {
    if (isTranslatedEntry(value))
        return [value];
    if (value == null || typeof value !== "object")
        return [];
    return (Array.isArray(value) ? value : Object.values(value)).filter(isTranslatedEntry);
};
/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export const HowToBoxTranslate = (props) => {
    const { t, titleLabel, labels, ...other } = props;
    // memo content because it's an array which gets re-created every render
    const content = useMemo(() => translatedEntries(t(labels, { returnObjects: true })), [t, labels]);
    return (_jsx(HowToBox, { ...other, titleLabel: titleLabel ? t(titleLabel) : undefined, labels: content }));
};
/**
 * Instructions in a frame: a {@link GroupBox} titled "How it works" (or
 * `titleLabel`) around a bulleted list with one item per entry of `labels`.
 *
 * Theme: `components.CcHowToBox.defaultProps` ({@link HowToBoxProps}),
 * `styleOverrides` per {@link HowToBoxClassKey} slot, and `variants`, which
 * apply to the frame. A variant's `props` match `titleLabel` and `labels` as
 * HowToBox gets them, after the theme's default props; from
 * {@link HowToBoxTranslate} these are the translated title and entries. A
 * `props` function gets these props directly: there is no `ownerState`. A
 * variant reaches the list and its entries through nested selectors.
 *
 * @example
 * // a theme that sets the entries of boxes with their own title in bold
 * createTheme({ components: { CcHowToBox: { variants: [{
 *   props: ({ titleLabel }) => titleLabel != null,
 *   style: { "& li": { fontWeight: "bold" } },
 * }] } } });
 */
export default React.memo(HowToBox);
