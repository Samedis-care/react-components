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
const ListItem = styled("li", { name: "CcHowToBox", slot: "li" })({});
const HowToBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcHowToBox" });
    const { titleLabel, labels, className, classes } = props;
    const { t } = useCCTranslations();
    if (!labels)
        return _jsx(_Fragment, {});
    return (_jsx(GroupBoxStyled, { label: titleLabel ?? t("standalone.how-it-works.title"), className: combineClassNames([className, classes?.root]), children: _jsx(UnorderedList, { className: classes?.ul, children: Array.isArray(labels) ? (labels.map((label, i) => (_jsx(ListItem, { className: classes?.li, children: label }, i)))) : (_jsx(ListItem, { className: classes?.li, children: labels })) }) }));
};
/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export const HowToBoxTranslate = (props) => {
    const { t, titleLabel, labels, ...other } = props;
    // memo content because it's an array which gets re-created every render
    const content = useMemo(() => t(labels, { returnObjects: true }), [t, labels]);
    return (_jsx(HowToBox, { ...other, titleLabel: titleLabel ? t(titleLabel) : undefined, labels: content }));
};
export default React.memo(HowToBox);
