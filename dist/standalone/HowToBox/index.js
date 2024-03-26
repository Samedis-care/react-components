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
        return React.createElement(React.Fragment, null);
    return (React.createElement(GroupBoxStyled, { label: titleLabel ?? t("standalone.how-it-works.title"), className: combineClassNames([className, classes?.root]) },
        React.createElement(UnorderedList, { className: classes?.ul }, Array.isArray(labels) ? (labels.map((label, i) => (React.createElement(ListItem, { key: i, className: classes?.li }, label)))) : (React.createElement(ListItem, { className: classes?.li }, labels)))));
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
    return (React.createElement(HowToBox, { ...other, titleLabel: titleLabel ? t(titleLabel) : undefined, labels: content }));
};
export default React.memo(HowToBox);
