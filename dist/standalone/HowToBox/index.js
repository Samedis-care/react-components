import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import GroupBox from "../GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";
const useStyles = makeStyles({
    groupBox: {
        paddingLeft: "1.5rem",
    },
}, { name: "CcHowToBox" });
const HowToBox = (props) => {
    const { titleLabel, labels } = props;
    const { t } = useCCTranslations();
    const classes = useStyles(props);
    if (!labels)
        return React.createElement(React.Fragment, null);
    return (React.createElement(GroupBox, { label: titleLabel ?? t("standalone.how-it-works.title") },
        React.createElement("ul", { className: classes.groupBox }, Array.isArray(labels) ? (labels.map((label, i) => (React.createElement("li", { key: i.toString(16) }, label)))) : (React.createElement("li", null, labels)))));
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
