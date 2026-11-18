import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import GroupBox from "../GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const GroupBoxStyled = styled(GroupBox, { name: "CcHowToBox", slot: "root" })({});
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
    return (_jsx(GroupBoxStyled, { label: titleLabel ?? t("standalone.how-it-works.title"), className: combineClassNames([className, classes?.root]), children: _jsx(UnorderedList, { className: classes?.ul, children: entries.map((entry, i) => (_jsx(ListItem, { className: classes?.li, children: entry }, i))) }) }));
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
export default React.memo(HowToBox);
